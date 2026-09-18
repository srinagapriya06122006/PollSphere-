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
	GetUserVoteHistory(ctx context.Context, userID bson.ObjectID, limit int) ([]*model.UserVoteHistoryItem, error)
	CountByUser(ctx context.Context, userID bson.ObjectID) (int64, error)
	CountVotesReceivedByUser(ctx context.Context, userID bson.ObjectID) (int64, error)
	Count(ctx context.Context) (int64, error)
	DeleteByPollID(ctx context.Context, pollID bson.ObjectID) error
}

type mongoVoteRepository struct {
	collection     *mongo.Collection
	pollCollection *mongo.Collection
}

// NewVoteRepository creates a new mongo-backed VoteRepository
func NewVoteRepository(db *mongo.Database) VoteRepository {
	return &mongoVoteRepository{
		collection:     db.Collection("votes"),
		pollCollection: db.Collection("polls"),
	}
}

// EnsureIndexes creates a unique compound index on (poll_id, user_id) to enforce one vote per user per poll
func (r *mongoVoteRepository) EnsureIndexes(ctx context.Context) error {
	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "poll_id", Value: 1},
				{Key: "user_id", Value: 1},
			},
			Options: options.Index().SetUnique(true).SetName("unique_user_poll_vote"),
		},
		{
			Keys: bson.D{
				{Key: "poll_id", Value: 1},
				{Key: "option_id", Value: 1},
			},
			Options: options.Index().SetName("idx_votes_poll_option"),
		},
		{
			Keys:    bson.D{{Key: "user_id", Value: 1}},
			Options: options.Index().SetName("idx_votes_user_id"),
		},
	}

	_, err := r.collection.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		return fmt.Errorf("failed to create indexes on votes collection: %w", err)
	}

	slog.Info("MongoDB indexes verified", "collection", "votes", "indexes", "unique_user_poll_vote, idx_votes_poll_option, idx_votes_user_id")
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

// GetUserVoteHistory retrieves the list of votes cast by a specific user joined with poll info
func (r *mongoVoteRepository) GetUserVoteHistory(ctx context.Context, userID bson.ObjectID, limit int) ([]*model.UserVoteHistoryItem, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: bson.M{"user_id": userID}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "created_at", Value: -1}}}},
		bson.D{{Key: "$limit", Value: limit}},
		bson.D{{Key: "$lookup", Value: bson.M{
			"from":         "polls",
			"localField":   "poll_id",
			"foreignField": "_id",
			"as":           "poll",
		}}},
		bson.D{{Key: "$unwind", Value: "$poll"}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	type voteWithPoll struct {
		ID        bson.ObjectID `bson:"_id"`
		PollID    bson.ObjectID `bson:"poll_id"`
		OptionID  string        `bson:"option_id"`
		CreatedAt time.Time     `bson:"created_at"`
		Poll      model.Poll    `bson:"poll"`
	}

	var items []*model.UserVoteHistoryItem
	for cursor.Next(ctx) {
		var res voteWithPoll
		if err := cursor.Decode(&res); err != nil {
			continue
		}

		optText := res.OptionID
		for _, opt := range res.Poll.Options {
			if opt.ID == res.OptionID {
				optText = opt.Text
				break
			}
		}

		category := res.Poll.Category
		if category == "" {
			category = model.CategoryGeneral
		}

		items = append(items, &model.UserVoteHistoryItem{
			VoteID:     res.ID.Hex(),
			PollID:     res.PollID.Hex(),
			Question:   res.Poll.Question,
			Category:   category,
			OptionID:   res.OptionID,
			OptionText: optText,
			PollStatus: res.Poll.Status,
			VotedAt:    res.CreatedAt,
		})
	}

	return items, nil
}

// CountByUser returns total votes cast by a given user
func (r *mongoVoteRepository) CountByUser(ctx context.Context, userID bson.ObjectID) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{"user_id": userID})
}

// CountVotesReceivedByUser counts all votes cast on polls created by the given user
func (r *mongoVoteRepository) CountVotesReceivedByUser(ctx context.Context, userID bson.ObjectID) (int64, error) {
	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: bson.M{"creator_id": userID}}},
		bson.D{{Key: "$lookup", Value: bson.M{
			"from":         "votes",
			"localField":   "_id",
			"foreignField": "poll_id",
			"as":           "votes",
		}}},
		bson.D{{Key: "$project", Value: bson.M{
			"vote_count": bson.M{"$size": "$votes"},
		}}},
		bson.D{{Key: "$group", Value: bson.M{
			"_id":   nil,
			"total": bson.M{"$sum": "$vote_count"},
		}}},
	}

	cursor, err := r.pollCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return 0, err
	}
	defer cursor.Close(ctx)

	type totalRes struct {
		Total int64 `bson:"total"`
	}

	var res []totalRes
	if err := cursor.All(ctx, &res); err != nil {
		return 0, err
	}

	if len(res) == 0 {
		return 0, nil
	}
	return res[0].Total, nil
}

// Count returns total votes across all polls in the platform
func (r *mongoVoteRepository) Count(ctx context.Context) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{})
}

// DeleteByPollID removes all votes associated with a deleted poll
func (r *mongoVoteRepository) DeleteByPollID(ctx context.Context, pollID bson.ObjectID) error {
	_, err := r.collection.DeleteMany(ctx, bson.M{"poll_id": pollID})
	return err
}
