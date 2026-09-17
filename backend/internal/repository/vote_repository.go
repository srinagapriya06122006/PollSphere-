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

// VoteRepository defines database operations for casting and querying votes
type VoteRepository interface {
	EnsureIndexes(ctx context.Context) error
	Create(ctx context.Context, vote *model.Vote) error
	HasUserVoted(ctx context.Context, pollID, userID bson.ObjectID) (bool, *string, error)
	CountVotesByOption(ctx context.Context, pollID bson.ObjectID) (map[string]int64, int64, error)
}

type mongoVoteRepository struct {
	collection *mongo.Collection
}

// NewVoteRepository creates a new mongo-backed VoteRepository
func NewVoteRepository(db *mongo.Database) VoteRepository {
	return &mongoVoteRepository{
		collection: db.Collection("votes"),
	}
}

// EnsureIndexes creates a unique compound index on (poll_id, user_id) to enforce one vote per user per poll
func (r *mongoVoteRepository) EnsureIndexes(ctx context.Context) error {
	indexes := []mongo.IndexModel{
		{
			// Unique compound index: prevents duplicate votes at the database level
			Keys: bson.D{
				{Key: "poll_id", Value: 1},
				{Key: "user_id", Value: 1},
			},
			Options: options.Index().SetUnique(true).SetName("unique_user_poll_vote"),
		},
		{
			// Index for fast aggregation filtering by poll and option
			Keys: bson.D{
				{Key: "poll_id", Value: 1},
				{Key: "option_id", Value: 1},
			},
			Options: options.Index().SetName("idx_votes_poll_option"),
		},
	}

	_, err := r.collection.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		return fmt.Errorf("failed to create indexes on votes collection: %w", err)
	}

	slog.Info("MongoDB indexes verified", "collection", "votes", "indexes", "unique_user_poll_vote, idx_votes_poll_option")
	return nil
}

// Create inserts a new vote document into the database
func (r *mongoVoteRepository) Create(ctx context.Context, vote *model.Vote) error {
	vote.CreatedAt = time.Now().UTC()

	result, err := r.collection.InsertOne(ctx, vote)
	if err != nil {
		return err
	}

	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		vote.ID = oid
	}

	return nil
}

// HasUserVoted checks if the given user has already cast a vote in the specified poll
func (r *mongoVoteRepository) HasUserVoted(ctx context.Context, pollID, userID bson.ObjectID) (bool, *string, error) {
	filter := bson.M{
		"poll_id": pollID,
		"user_id": userID,
	}

	var vote model.Vote
	err := r.collection.FindOne(ctx, filter).Decode(&vote)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return false, nil, nil
		}
		return false, nil, err
	}

	return true, &vote.OptionID, nil
}

// CountVotesByOption performs an aggregation pipeline to group and sum votes by optionId
func (r *mongoVoteRepository) CountVotesByOption(ctx context.Context, pollID bson.ObjectID) (map[string]int64, int64, error) {
	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: bson.M{"poll_id": pollID}}},
		bson.D{{Key: "$group", Value: bson.M{
			"_id":   "$option_id",
			"count": bson.M{"$sum": 1},
		}}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, 0, fmt.Errorf("aggregation failed: %w", err)
	}
	defer cursor.Close(ctx)

	type aggResult struct {
		OptionID string `bson:"_id"`
		Count    int64  `bson:"count"`
	}

	counts := make(map[string]int64)
	var totalVotes int64

	for cursor.Next(ctx) {
		var res aggResult
		if err := cursor.Decode(&res); err != nil {
			return nil, 0, fmt.Errorf("failed to decode aggregation result: %w", err)
		}
		counts[res.OptionID] = res.Count
		totalVotes += res.Count
	}

	if err := cursor.Err(); err != nil {
		return nil, 0, fmt.Errorf("cursor aggregation error: %w", err)
	}

	return counts, totalVotes, nil
}
