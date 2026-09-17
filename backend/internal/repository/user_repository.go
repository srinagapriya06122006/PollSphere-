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

// UserRepository defines the database operations for users
type UserRepository interface {
	EnsureIndexes(ctx context.Context) error
	Create(ctx context.Context, user *model.User) error
	FindByEmail(ctx context.Context, email string) (*model.User, error)
	FindByID(ctx context.Context, id bson.ObjectID) (*model.User, error)
}

type mongoUserRepository struct {
	collection *mongo.Collection
}

// NewUserRepository creates a new mongo-backed UserRepository
func NewUserRepository(db *mongo.Database) UserRepository {
	return &mongoUserRepository{
		collection: db.Collection("users"),
	}
}

// EnsureIndexes creates necessary database indexes, such as a unique index on email
func (r *mongoUserRepository) EnsureIndexes(ctx context.Context) error {
	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true).SetName("unique_user_email"),
	}

	_, err := r.collection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		return fmt.Errorf("failed to create unique index on users.email: %w", err)
	}

	slog.Info("MongoDB index verified", "collection", "users", "index", "unique_user_email")
	return nil
}

// Create inserts a new user document into the database
func (r *mongoUserRepository) Create(ctx context.Context, user *model.User) error {
	now := time.Now().UTC()
	user.CreatedAt = now
	user.UpdatedAt = now

	result, err := r.collection.InsertOne(ctx, user)
	if err != nil {
		return err
	}

	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		user.ID = oid
	}

	return nil
}

// FindByEmail searches for a single user by their email address
func (r *mongoUserRepository) FindByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	filter := bson.M{"email": email}

	err := r.collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil // User not found
		}
		return nil, err
	}

	return &user, nil
}

// FindByID searches for a single user by their ObjectID
func (r *mongoUserRepository) FindByID(ctx context.Context, id bson.ObjectID) (*model.User, error) {
	var user model.User
	filter := bson.M{"_id": id}

	err := r.collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}
