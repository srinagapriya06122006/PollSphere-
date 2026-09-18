package repository

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"guvi-backend/internal/model"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// PollRepository defines database interactions for polls
type PollRepository interface {
	EnsureIndexes(ctx context.Context) error
	Create(ctx context.Context, poll *model.Poll) error
	FindByID(ctx context.Context, id bson.ObjectID) (*model.Poll, error)
	List(ctx context.Context, page, limit int, status string) ([]*model.Poll, int64, error)
	ListWithFilter(ctx context.Context, filter model.PollFilter) ([]*model.Poll, int64, error)
	Update(ctx context.Context, poll *model.Poll) error
	Delete(ctx context.Context, id bson.ObjectID) error
	CloseExpiredPolls(ctx context.Context) ([]*model.Poll, error)
	Count(ctx context.Context) (int64, error)
	CountByStatus(ctx context.Context, status model.PollStatus) (int64, error)
	CountByCreator(ctx context.Context, creatorID bson.ObjectID) (int64, error)
}

type mongoPollRepository struct {
	collection *mongo.Collection
}

// NewPollRepository creates a new mongo-backed PollRepository
func NewPollRepository(db *mongo.Database) PollRepository {
	return &mongoPollRepository{
		collection: db.Collection("polls"),
	}
}

// EnsureIndexes creates performance indexes on creator_id, status, category, and created_at
func (r *mongoPollRepository) EnsureIndexes(ctx context.Context) error {
	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "creator_id", Value: 1}},
			Options: options.Index().SetName("idx_polls_creator_id"),
		},
		{
			Keys:    bson.D{{Key: "status", Value: 1}},
			Options: options.Index().SetName("idx_polls_status"),
		},
		{
			Keys:    bson.D{{Key: "category", Value: 1}},
			Options: options.Index().SetName("idx_polls_category"),
		},
		{
			Keys:    bson.D{{Key: "expires_at", Value: 1}},
			Options: options.Index().SetName("idx_polls_expires_at"),
		},
		{
			Keys:    bson.D{{Key: "created_at", Value: -1}},
			Options: options.Index().SetName("idx_polls_created_at_desc"),
		},
	}

	_, err := r.collection.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		return fmt.Errorf("failed to create indexes on polls collection: %w", err)
	}

	slog.Info("MongoDB indexes verified", "collection", "polls")
	return nil
}

// Create inserts a new poll document
func (r *mongoPollRepository) Create(ctx context.Context, poll *model.Poll) error {
	now := time.Now().UTC()
	poll.CreatedAt = now
	poll.UpdatedAt = now
	if poll.Category == "" {
		poll.Category = model.CategoryGeneral
	}
	if poll.Status == "" {
		poll.Status = model.PollStatusActive
	}

	result, err := r.collection.InsertOne(ctx, poll)
	if err != nil {
		return err
	}

	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		poll.ID = oid
	}

	return nil
}

// FindByID retrieves a single poll document by its ObjectID
func (r *mongoPollRepository) FindByID(ctx context.Context, id bson.ObjectID) (*model.Poll, error) {
	var poll model.Poll
	filter := bson.M{"_id": id}

	err := r.collection.FindOne(ctx, filter).Decode(&poll)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}

	return &poll, nil
}

// List retrieves paginated polls with optional status filtering
func (r *mongoPollRepository) List(ctx context.Context, page, limit int, status string) ([]*model.Poll, int64, error) {
	return r.ListWithFilter(ctx, model.PollFilter{
		Page:   page,
		Limit:  limit,
		Status: status,
	})
}

// ListWithFilter retrieves polls matching extensive search, category, status, and sort criteria
func (r *mongoPollRepository) ListWithFilter(ctx context.Context, f model.PollFilter) ([]*model.Poll, int64, error) {
	filter := bson.M{}

	if f.Status != "" {
		filter["status"] = f.Status
	}
	if f.Category != "" && f.Category != "all" {
		filter["category"] = f.Category
	}
	if f.CreatorID != "" {
		if oid, err := bson.ObjectIDFromHex(f.CreatorID); err == nil {
			filter["creator_id"] = oid
		}
	}
	if f.Search != "" {
		filter["question"] = bson.M{
			"$regex":   f.Search,
			"$options": "i", // case-insensitive
		}
	}

	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count polls: %w", err)
	}

	page := f.Page
	if page < 1 {
		page = 1
	}
	limit := f.Limit
	if limit < 1 || limit > 100 {
		limit = 10
	}

	skip := int64((page - 1) * limit)

	// Determine sort order
	var sortDoc bson.D
	switch f.SortBy {
	case "oldest":
		sortDoc = bson.D{{Key: "created_at", Value: 1}}
	case "expiring_soon":
		sortDoc = bson.D{{Key: "expires_at", Value: 1}}
	case "newest":
		fallthrough
	default:
		sortDoc = bson.D{{Key: "created_at", Value: -1}}
	}

	findOptions := options.Find().
		SetSort(sortDoc).
		SetSkip(skip).
		SetLimit(int64(limit))

	cursor, err := r.collection.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query polls: %w", err)
	}
	defer cursor.Close(ctx)

	var polls []*model.Poll
	for cursor.Next(ctx) {
		var p model.Poll
		if err := cursor.Decode(&p); err != nil {
			return nil, 0, fmt.Errorf("failed to decode poll: %w", err)
		}
		polls = append(polls, &p)
	}

	if err := cursor.Err(); err != nil {
		return nil, 0, fmt.Errorf("cursor iteration error: %w", err)
	}

	return polls, total, nil
}

// Update updates an existing poll document
func (r *mongoPollRepository) Update(ctx context.Context, poll *model.Poll) error {
	poll.UpdatedAt = time.Now().UTC()
	filter := bson.M{"_id": poll.ID}
	setFields := bson.M{
		"question":   poll.Question,
		"status":     poll.Status,
		"updated_at": poll.UpdatedAt,
	}
	if poll.Category != "" {
		setFields["category"] = poll.Category
	}

	update := bson.M{
		"$set": setFields,
	}

	result, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return errors.New("poll not found for update")
	}

	return nil
}

// Delete removes a poll document by its ObjectID
func (r *mongoPollRepository) Delete(ctx context.Context, id bson.ObjectID) error {
	filter := bson.M{"_id": id}
	result, err := r.collection.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return errors.New("poll not found for deletion")
	}
	return nil
}

// CloseExpiredPolls searches for all active polls whose expiration time is in the past and marks them closed
func (r *mongoPollRepository) CloseExpiredPolls(ctx context.Context) ([]*model.Poll, error) {
	now := time.Now().UTC()
	filter := bson.M{
		"status": model.PollStatusActive,
		"expires_at": bson.M{
			"$ne":  nil,
			"$lte": now,
		},
	}

	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var expiredPolls []*model.Poll
	if err := cursor.All(ctx, &expiredPolls); err != nil {
		return nil, err
	}

	if len(expiredPolls) == 0 {
		return nil, nil
	}

	// Bulk update all found polls to closed status
	update := bson.M{
		"$set": bson.M{
			"status":     model.PollStatusClosed,
			"updated_at": now,
		},
	}

	_, err = r.collection.UpdateMany(ctx, filter, update)
	if err != nil {
		return nil, err
	}

	for _, p := range expiredPolls {
		p.Status = model.PollStatusClosed
		p.UpdatedAt = now
	}

	return expiredPolls, nil
}

// Count returns total count of polls
func (r *mongoPollRepository) Count(ctx context.Context) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{})
}

// CountByStatus returns count of polls matching a specific status
func (r *mongoPollRepository) CountByStatus(ctx context.Context, status model.PollStatus) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{"status": status})
}

// CountByCreator returns count of polls created by a user
func (r *mongoPollRepository) CountByCreator(ctx context.Context, creatorID bson.ObjectID) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{"creator_id": creatorID})
}
