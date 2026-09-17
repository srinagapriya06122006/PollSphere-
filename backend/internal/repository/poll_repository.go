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
	Update(ctx context.Context, poll *model.Poll) error
	Delete(ctx context.Context, id bson.ObjectID) error
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

// EnsureIndexes creates performance indexes on creator_id, status, and created_at
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
	filter := bson.M{}
	if status != "" {
		filter["status"] = status
	}

	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count polls: %w", err)
	}

	skip := int64((page - 1) * limit)
	findOptions := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
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
	update := bson.M{
		"$set": bson.M{
			"question":   poll.Question,
			"status":     poll.Status,
			"updated_at": poll.UpdatedAt,
		},
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
