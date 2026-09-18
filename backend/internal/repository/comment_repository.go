package repository

import (
	"context"
	"time"

	"guvi-backend/internal/model"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type CommentRepository interface {
	Create(ctx context.Context, comment *model.PollComment) error
	GetByPollID(ctx context.Context, pollID string) ([]model.PollComment, error)
	CountByPollID(ctx context.Context, pollID string) (int64, error)
}

type commentRepository struct {
	collection *mongo.Collection
}

func NewCommentRepository(db *mongo.Database) CommentRepository {
	return &commentRepository{
		collection: db.Collection("poll_comments"),
	}
}

func (r *commentRepository) Create(ctx context.Context, comment *model.PollComment) error {
	comment.ID = bson.NewObjectID()
	if comment.CreatedAt.IsZero() {
		comment.CreatedAt = time.Now().UTC()
	}

	_, err := r.collection.InsertOne(ctx, comment)
	return err
}

func (r *commentRepository) GetByPollID(ctx context.Context, pollID string) ([]model.PollComment, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(50)
	cursor, err := r.collection.Find(ctx, bson.M{"poll_id": pollID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var comments []model.PollComment
	if err := cursor.All(ctx, &comments); err != nil {
		return nil, err
	}

	if comments == nil {
		comments = []model.PollComment{}
	}

	return comments, nil
}

func (r *commentRepository) CountByPollID(ctx context.Context, pollID string) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{"poll_id": pollID})
}
