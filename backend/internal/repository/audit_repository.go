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

// AuditRepository defines persistence operations for audit logs
type AuditRepository interface {
	EnsureIndexes(ctx context.Context) error
	Log(ctx context.Context, log *model.AuditLog) error
	List(ctx context.Context, page, limit int, action string) ([]*model.AuditLog, int64, error)
}

type mongoAuditRepository struct {
	collection *mongo.Collection
}

// NewAuditRepository creates a new mongo-backed AuditRepository
func NewAuditRepository(db *mongo.Database) AuditRepository {
	return &mongoAuditRepository{
		collection: db.Collection("audit_logs"),
	}
}

// EnsureIndexes creates indexes on created_at, user_id, and action for fast auditing
func (r *mongoAuditRepository) EnsureIndexes(ctx context.Context) error {
	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "created_at", Value: -1}},
			Options: options.Index().SetName("idx_audit_created_at_desc"),
		},
		{
			Keys:    bson.D{{Key: "user_id", Value: 1}},
			Options: options.Index().SetName("idx_audit_user_id"),
		},
		{
			Keys:    bson.D{{Key: "action", Value: 1}},
			Options: options.Index().SetName("idx_audit_action"),
		},
	}

	_, err := r.collection.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		return fmt.Errorf("failed to create indexes on audit_logs: %w", err)
	}

	slog.Info("MongoDB indexes verified", "collection", "audit_logs")
	return nil
}

// Log records a new audit event asynchronously
func (r *mongoAuditRepository) Log(ctx context.Context, log *model.AuditLog) error {
	if log.CreatedAt.IsZero() {
		log.CreatedAt = time.Now().UTC()
	}

	result, err := r.collection.InsertOne(ctx, log)
	if err != nil {
		return err
	}

	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		log.ID = oid
	}

	return nil
}

// List returns a paginated list of audit events
func (r *mongoAuditRepository) List(ctx context.Context, page, limit int, action string) ([]*model.AuditLog, int64, error) {
	filter := bson.M{}
	if action != "" {
		filter["action"] = action
	}

	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	skip := int64((page - 1) * limit)
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetSkip(skip).
		SetLimit(int64(limit))

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var logs []*model.AuditLog
	if err := cursor.All(ctx, &logs); err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}
