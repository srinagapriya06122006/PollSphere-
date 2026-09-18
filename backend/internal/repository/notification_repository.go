package repository

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"guvi-backend/internal/model"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// NotificationRepository defines database operations for user notifications
type NotificationRepository interface {
	EnsureIndexes(ctx context.Context) error
	Create(ctx context.Context, notif *model.Notification) error
	FindByUser(ctx context.Context, userID bson.ObjectID, limit int) ([]*model.Notification, int64, error)
	MarkAsRead(ctx context.Context, notifID, userID bson.ObjectID) error
	MarkAllAsRead(ctx context.Context, userID bson.ObjectID) error
	Delete(ctx context.Context, notifID, userID bson.ObjectID) error
	CountUnread(ctx context.Context, userID bson.ObjectID) (int64, error)
}

type mongoNotificationRepository struct {
	collection *mongo.Collection
}

// NewNotificationRepository creates a new mongo-backed NotificationRepository
func NewNotificationRepository(db *mongo.Database) NotificationRepository {
	return &mongoNotificationRepository{
		collection: db.Collection("notifications"),
	}
}

// EnsureIndexes creates performance indexes on user_id, is_read, and created_at
func (r *mongoNotificationRepository) EnsureIndexes(ctx context.Context) error {
	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "user_id", Value: 1}, {Key: "created_at", Value: -1}},
			Options: options.Index().SetName("idx_notifications_user_created"),
		},
		{
			Keys:    bson.D{{Key: "user_id", Value: 1}, {Key: "is_read", Value: 1}},
			Options: options.Index().SetName("idx_notifications_user_unread"),
		},
	}

	_, err := r.collection.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		return fmt.Errorf("failed to create indexes on notifications: %w", err)
	}

	slog.Info("MongoDB indexes verified", "collection", "notifications")
	return nil
}

// Create inserts a new persistent notification
func (r *mongoNotificationRepository) Create(ctx context.Context, notif *model.Notification) error {
	if notif.CreatedAt.IsZero() {
		notif.CreatedAt = time.Now().UTC()
	}

	result, err := r.collection.InsertOne(ctx, notif)
	if err != nil {
		return err
	}

	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		notif.ID = oid
	}

	return nil
}

// FindByUser retrieves latest notifications for a specific user
func (r *mongoNotificationRepository) FindByUser(ctx context.Context, userID bson.ObjectID, limit int) ([]*model.Notification, int64, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	filter := bson.M{"user_id": userID}
	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetLimit(int64(limit))

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var list []*model.Notification
	if err := cursor.All(ctx, &list); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

// MarkAsRead marks a single notification as read
func (r *mongoNotificationRepository) MarkAsRead(ctx context.Context, notifID, userID bson.ObjectID) error {
	filter := bson.M{"_id": notifID, "user_id": userID}
	update := bson.M{"$set": bson.M{"is_read": true}}

	_, err := r.collection.UpdateOne(ctx, filter, update)
	return err
}

// MarkAllAsRead marks all unread notifications of a user as read
func (r *mongoNotificationRepository) MarkAllAsRead(ctx context.Context, userID bson.ObjectID) error {
	filter := bson.M{"user_id": userID, "is_read": false}
	update := bson.M{"$set": bson.M{"is_read": true}}

	_, err := r.collection.UpdateMany(ctx, filter, update)
	return err
}

// Delete removes a notification for a user
func (r *mongoNotificationRepository) Delete(ctx context.Context, notifID, userID bson.ObjectID) error {
	filter := bson.M{"_id": notifID, "user_id": userID}
	_, err := r.collection.DeleteOne(ctx, filter)
	return err
}

// CountUnread counts unread notifications for a user
func (r *mongoNotificationRepository) CountUnread(ctx context.Context, userID bson.ObjectID) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{
		"user_id": userID,
		"is_read": false,
	})
}
