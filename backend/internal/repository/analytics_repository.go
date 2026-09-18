package repository

import (
	"context"
	"time"

	"guvi-backend/internal/model"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// AnalyticsRepository defines database aggregations for statistical reporting
type AnalyticsRepository interface {
	GetCategoryDistribution(ctx context.Context) ([]model.CategoryCount, error)
	GetPopularPolls(ctx context.Context, limit int) ([]model.PopularPollItem, error)
	GetDailyVoteTrend(ctx context.Context, days int) ([]model.DailyVoteTrend, error)
	GetTopCreators(ctx context.Context, limit int) ([]model.TopUserLeaderboard, error)
	GetTopVoters(ctx context.Context, limit int) ([]model.TopUserLeaderboard, error)
}

type mongoAnalyticsRepository struct {
	pollCollection *mongo.Collection
	voteCollection *mongo.Collection
	userCollection *mongo.Collection
}

// NewAnalyticsRepository creates a new mongo-backed AnalyticsRepository
func NewAnalyticsRepository(db *mongo.Database) AnalyticsRepository {
	return &mongoAnalyticsRepository{
		pollCollection: db.Collection("polls"),
		voteCollection: db.Collection("votes"),
		userCollection: db.Collection("users"),
	}
}

// GetCategoryDistribution groups polls by category and counts them
func (r *mongoAnalyticsRepository) GetCategoryDistribution(ctx context.Context) ([]model.CategoryCount, error) {
	pipeline := mongo.Pipeline{
		bson.D{{Key: "$group", Value: bson.M{
			"_id":   "$category",
			"count": bson.M{"$sum": 1},
		}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "count", Value: -1}}}},
	}

	cursor, err := r.pollCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	type catAgg struct {
		Category string `bson:"_id"`
		Count    int64  `bson:"count"`
	}

	var results []catAgg
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	var dist []model.CategoryCount
	for _, res := range results {
		c := res.Category
		if c == "" {
			c = "general"
		}
		dist = append(dist, model.CategoryCount{
			Category: c,
			Count:    res.Count,
		})
	}

	return dist, nil
}

// GetPopularPolls aggregates polls sorted by total vote count
func (r *mongoAnalyticsRepository) GetPopularPolls(ctx context.Context, limit int) ([]model.PopularPollItem, error) {
	if limit <= 0 {
		limit = 5
	}

	pipeline := mongo.Pipeline{
		bson.D{{Key: "$lookup", Value: bson.M{
			"from":         "votes",
			"localField":   "_id",
			"foreignField": "poll_id",
			"as":           "votes",
		}}},
		bson.D{{Key: "$project", Value: bson.M{
			"_id":          1,
			"question":     1,
			"category":     1,
			"creator_name": 1,
			"status":       1,
			"total_votes":  bson.M{"$size": "$votes"},
		}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "total_votes", Value: -1}}}},
		bson.D{{Key: "$limit", Value: limit}},
	}

	cursor, err := r.pollCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	type popAgg struct {
		ID          bson.ObjectID      `bson:"_id"`
		Question    string             `bson:"question"`
		Category    model.PollCategory `bson:"category"`
		CreatorName string             `bson:"creator_name"`
		Status      model.PollStatus   `bson:"status"`
		TotalVotes  int64              `bson:"total_votes"`
	}

	var results []popAgg
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	var items []model.PopularPollItem
	for _, res := range results {
		cat := res.Category
		if cat == "" {
			cat = model.CategoryGeneral
		}
		items = append(items, model.PopularPollItem{
			ID:          res.ID.Hex(),
			Question:    res.Question,
			Category:    cat,
			TotalVotes:  res.TotalVotes,
			CreatorName: res.CreatorName,
			Status:      res.Status,
		})
	}

	return items, nil
}

// GetDailyVoteTrend counts votes grouped by day for the past N days
func (r *mongoAnalyticsRepository) GetDailyVoteTrend(ctx context.Context, days int) ([]model.DailyVoteTrend, error) {
	if days <= 0 {
		days = 7
	}
	since := time.Now().UTC().AddDate(0, 0, -days)

	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: bson.M{
			"created_at": bson.M{"$gte": since},
		}}},
		bson.D{{Key: "$group", Value: bson.M{
			"_id": bson.M{
				"$dateToString": bson.M{
					"format": "%Y-%m-%d",
					"date":   "$created_at",
				},
			},
			"votes": bson.M{"$sum": 1},
		}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "_id", Value: 1}}}},
	}

	cursor, err := r.voteCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	type trendAgg struct {
		Date  string `bson:"_id"`
		Votes int64  `bson:"votes"`
	}

	var results []trendAgg
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	var trends []model.DailyVoteTrend
	for _, res := range results {
		trends = append(trends, model.DailyVoteTrend{
			Date:  res.Date,
			Votes: res.Votes,
		})
	}

	return trends, nil
}

// GetTopCreators returns the users who have created the most polls
func (r *mongoAnalyticsRepository) GetTopCreators(ctx context.Context, limit int) ([]model.TopUserLeaderboard, error) {
	if limit <= 0 {
		limit = 5
	}

	pipeline := mongo.Pipeline{
		bson.D{{Key: "$group", Value: bson.M{
			"_id":   "$creator_id",
			"score": bson.M{"$sum": 1},
		}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "score", Value: -1}}}},
		bson.D{{Key: "$limit", Value: limit}},
		bson.D{{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "_id",
			"foreignField": "_id",
			"as":           "user",
		}}},
		bson.D{{Key: "$unwind", Value: "$user"}},
	}

	cursor, err := r.pollCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	type userAgg struct {
		ID    bson.ObjectID `bson:"_id"`
		Score int64         `bson:"score"`
		User  model.User    `bson:"user"`
	}

	var results []userAgg
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	var leaders []model.TopUserLeaderboard
	for _, res := range results {
		leaders = append(leaders, model.TopUserLeaderboard{
			UserID:    res.ID.Hex(),
			UserName:  res.User.Name,
			UserEmail: res.User.Email,
			Score:     res.Score,
		})
	}

	return leaders, nil
}

// GetTopVoters returns the users who have cast the most votes
func (r *mongoAnalyticsRepository) GetTopVoters(ctx context.Context, limit int) ([]model.TopUserLeaderboard, error) {
	if limit <= 0 {
		limit = 5
	}

	pipeline := mongo.Pipeline{
		bson.D{{Key: "$group", Value: bson.M{
			"_id":   "$user_id",
			"score": bson.M{"$sum": 1},
		}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "score", Value: -1}}}},
		bson.D{{Key: "$limit", Value: limit}},
		bson.D{{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "_id",
			"foreignField": "_id",
			"as":           "user",
		}}},
		bson.D{{Key: "$unwind", Value: "$user"}},
	}

	cursor, err := r.voteCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	type userAgg struct {
		ID    bson.ObjectID `bson:"_id"`
		Score int64         `bson:"score"`
		User  model.User    `bson:"user"`
	}

	var results []userAgg
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	var leaders []model.TopUserLeaderboard
	for _, res := range results {
		leaders = append(leaders, model.TopUserLeaderboard{
			UserID:    res.ID.Hex(),
			UserName:  res.User.Name,
			UserEmail: res.User.Email,
			Score:     res.Score,
		})
	}

	return leaders, nil
}
