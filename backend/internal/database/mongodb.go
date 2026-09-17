package database

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"guvi-backend/internal/config"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

// MongoDB holds references to the connected client and database
type MongoDB struct {
	Client   *mongo.Client
	Database *mongo.Database
}

// Connect initializes a connection to MongoDB and verifies it via Ping
func Connect(cfg *config.Config) (*MongoDB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	slog.Info("Connecting to MongoDB...", "uri", cfg.MongoURI, "database", cfg.MongoDBName)

	clientOptions := options.Client().ApplyURI(cfg.MongoURI)
	client, err := mongo.Connect(clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to create MongoDB client: %w", err)
	}

	// Ping the primary node to verify the connection is active
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	slog.Info("Successfully connected to MongoDB", "database", cfg.MongoDBName)

	db := client.Database(cfg.MongoDBName)

	return &MongoDB{
		Client:   client,
		Database: db,
	}, nil
}

// Ping checks if the database is reachable
func (m *MongoDB) Ping(ctx context.Context) error {
	if m.Client == nil {
		return fmt.Errorf("mongo client is not initialized")
	}
	return m.Client.Ping(ctx, readpref.Primary())
}

// Disconnect closes the MongoDB connection gracefully
func (m *MongoDB) Disconnect() {
	if m.Client == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	slog.Info("Disconnecting from MongoDB...")
	if err := m.Client.Disconnect(ctx); err != nil {
		slog.Error("Error disconnecting from MongoDB", "error", err)
		return
	}

	slog.Info("MongoDB disconnected gracefully")
}
