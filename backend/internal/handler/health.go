package handler

import (
	"context"
	"net/http"
	"time"

	"guvi-backend/internal/database"

	"github.com/gin-gonic/gin"
)

// HealthHandler handles health check requests
type HealthHandler struct {
	db    *database.MongoDB
	redis *database.RedisClient
}

// NewHealthHandler returns a new instance of HealthHandler
func NewHealthHandler(db *database.MongoDB, redis *database.RedisClient) *HealthHandler {
	return &HealthHandler{
		db:    db,
		redis: redis,
	}
}

// Check responds with the application, database, and cache health status
func (h *HealthHandler) Check(c *gin.Context) {
	dbStatus := "connected"
	redisStatus := "connected"
	statusCode := http.StatusOK

	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	if h.db != nil {
		if err := h.db.Ping(ctx); err != nil {
			dbStatus = "disconnected"
			statusCode = http.StatusServiceUnavailable
		}
	} else {
		dbStatus = "not_configured"
	}

	if h.redis != nil && h.redis.Client != nil {
		if err := h.redis.Ping(ctx); err != nil {
			redisStatus = "disconnected"
			// Note: Redis unavailability degrades cache performance but does not crash app
			if statusCode == http.StatusOK {
				statusCode = http.StatusOK
			}
		}
	} else {
		redisStatus = "disabled"
	}

	responseStatus := "ok"
	if dbStatus != "connected" {
		responseStatus = "degraded"
	}

	c.JSON(statusCode, gin.H{
		"status":   responseStatus,
		"database": dbStatus,
		"redis":    redisStatus,
	})
}
