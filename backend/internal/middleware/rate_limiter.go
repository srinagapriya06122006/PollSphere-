package middleware

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"guvi-backend/internal/database"

	"github.com/gin-gonic/gin"
)

type memoryLimiter struct {
	mu      sync.Mutex
	history map[string][]time.Time
}

var memLimiter = &memoryLimiter{
	history: make(map[string][]time.Time),
}

// RateLimiter creates a rate limiting middleware using Redis sliding window, with memory fallback
func RateLimiter(redisClient *database.RedisClient, maxRequests int, window time.Duration) gin.HandlerFunc {
	if maxRequests <= 0 {
		maxRequests = 100
	}
	if window <= 0 {
		window = 1 * time.Minute
	}

	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		if clientIP == "" {
			clientIP = "unknown"
		}

		// If Redis is enabled and active, use Redis INCR / EXPIRE sliding counter
		if redisClient != nil && redisClient.IsEnabled() {
			key := fmt.Sprintf("rate_limit:%s:%d", clientIP, time.Now().Unix()/(int64(window.Seconds())))
			count, err := redisClient.Incr(c.Request.Context(), key)
			if err == nil {
				if count == 1 {
					_ = redisClient.Expire(c.Request.Context(), key, window+10*time.Second)
				}
				if count > int64(maxRequests) {
					c.Header("Retry-After", fmt.Sprintf("%d", int(window.Seconds())))
					c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
						"error":   "Rate limit exceeded. Please slow down your requests.",
						"limit":   maxRequests,
						"window":  window.String(),
					})
					return
				}
				c.Next()
				return
			}
		}

		// In-Memory Fallback
		memLimiter.mu.Lock()
		now := time.Now()
		cutoff := now.Add(-window)

		// Filter timestamps within window
		var validTimes []time.Time
		for _, t := range memLimiter.history[clientIP] {
			if t.After(cutoff) {
				validTimes = append(validTimes, t)
			}
		}

		if len(validTimes) >= maxRequests {
			memLimiter.mu.Unlock()
			c.Header("Retry-After", fmt.Sprintf("%d", int(window.Seconds())))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":   "Rate limit exceeded. Please slow down your requests.",
				"limit":   maxRequests,
				"window":  window.String(),
			})
			return
		}

		validTimes = append(validTimes, now)
		memLimiter.history[clientIP] = validTimes
		memLimiter.mu.Unlock()

		c.Next()
	}
}
