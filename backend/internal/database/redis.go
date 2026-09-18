package database

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"guvi-backend/internal/config"

	"github.com/redis/go-redis/v9"
)

// RedisClient wraps the official go-redis Client with helper methods
type RedisClient struct {
	Client *redis.Client
}

// ConnectRedis initializes the Redis connection and verifies it using Ping
func ConnectRedis(cfg *config.Config) (*RedisClient, error) {
	if !cfg.RedisEnabled {
		slog.Info("Redis is disabled via configuration")
		return nil, nil
	}

	slog.Info("Connecting to Redis...", "addr", cfg.RedisAddr, "db", cfg.RedisDB)

	rdb := redis.NewClient(&redis.Options{
		Addr:         cfg.RedisAddr,
		Password:     cfg.RedisPassword,
		DB:           cfg.RedisDB,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolSize:     10,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		slog.Warn("Failed to connect to Redis (running in fallback mode without Redis cache)", "error", err)
		return nil, fmt.Errorf("redis ping failed: %w", err)
	}

	slog.Info("Successfully connected to Redis", "addr", cfg.RedisAddr)

	return &RedisClient{
		Client: rdb,
	}, nil
}

// IsEnabled returns true if Redis is initialized and ready
func (r *RedisClient) IsEnabled() bool {
	return r != nil && r.Client != nil
}

// Ping checks if Redis is responsive
func (r *RedisClient) Ping(ctx context.Context) error {
	if !r.IsEnabled() {
		return fmt.Errorf("redis client is not initialized")
	}
	return r.Client.Ping(ctx).Err()
}

// Get retrieves a value by key from Redis
func (r *RedisClient) Get(ctx context.Context, key string) (string, error) {
	if !r.IsEnabled() {
		return "", fmt.Errorf("redis not available")
	}
	return r.Client.Get(ctx, key).Result()
}

// Set stores a key-value pair with an expiration TTL
func (r *RedisClient) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	if !r.IsEnabled() {
		return fmt.Errorf("redis not available")
	}
	return r.Client.Set(ctx, key, value, expiration).Err()
}

// Del deletes one or more keys from Redis
func (r *RedisClient) Del(ctx context.Context, keys ...string) error {
	if !r.IsEnabled() {
		return fmt.Errorf("redis not available")
	}
	return r.Client.Del(ctx, keys...).Err()
}

// Incr increments a key counter in Redis
func (r *RedisClient) Incr(ctx context.Context, key string) (int64, error) {
	if !r.IsEnabled() {
		return 0, fmt.Errorf("redis not available")
	}
	return r.Client.Incr(ctx, key).Result()
}

// Expire sets a key expiration duration
func (r *RedisClient) Expire(ctx context.Context, key string, expiration time.Duration) error {
	if !r.IsEnabled() {
		return fmt.Errorf("redis not available")
	}
	return r.Client.Expire(ctx, key, expiration).Err()
}

// Disconnect gracefully shuts down the Redis connection pool
func (r *RedisClient) Disconnect() {
	if !r.IsEnabled() {
		return
	}

	slog.Info("Disconnecting from Redis...")
	if err := r.Client.Close(); err != nil {
		slog.Error("Error closing Redis connection", "error", err)
		return
	}
	slog.Info("Redis disconnected gracefully")
}
