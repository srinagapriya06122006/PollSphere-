package router

import (
	"time"

	"guvi-backend/internal/config"
	"guvi-backend/internal/database"
	"guvi-backend/internal/handler"
	"guvi-backend/internal/middleware"
	"guvi-backend/internal/model"
	"guvi-backend/internal/service"

	"github.com/gin-gonic/gin"
)

// SetupRouter initializes Gin engine with rate limiting, auth middlewares, and routes
func SetupRouter(
	cfg *config.Config,
	db *database.MongoDB,
	redis *database.RedisClient,
	authHandler *handler.AuthHandler,
	pollHandler *handler.PollHandler,
	voteHandler *handler.VoteHandler,
	wsHandler *handler.WSHandler,
	analyticsHandler *handler.AnalyticsHandler,
	exportHandler *handler.ExportHandler,
	aiHandler *handler.AIHandler,
	adminHandler *handler.AdminHandler,
	notificationHandler *handler.NotificationHandler,
	commentHandler *handler.CommentHandler,
	jwtService service.JWTService,
) *gin.Engine {
	gin.SetMode(cfg.GinMode)

	r := gin.New()

	// Global Middlewares
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.RateLimiter(redis, 120, 1*time.Minute)) // 120 requests/min rate limit

	// Health Handlers
	healthHandler := handler.NewHealthHandler(db, redis)
	r.GET("/health", healthHandler.Check)
	r.GET("/health/mongo", healthHandler.CheckMongo)
	r.GET("/health/redis", healthHandler.CheckRedis)

	// API Route Group
	api := r.Group("/api")
	{
		api.GET("/health", healthHandler.Check)
		api.GET("/health/mongo", healthHandler.CheckMongo)
		api.GET("/health/redis", healthHandler.CheckRedis)

		// Analytics Dashboard & Leaderboard Overview
		api.GET("/analytics/overview", analyticsHandler.GetOverview)
		api.GET("/analytics/dashboard", analyticsHandler.GetOverview)
		api.GET("/analytics/leaderboard", analyticsHandler.GetOverview)

		// Authentication Routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/google", authHandler.GoogleLogin)

			protectedAuth := auth.Group("")
			protectedAuth.Use(middleware.AuthMiddleware(jwtService))
			{
				protectedAuth.GET("/me", authHandler.Me)
			}
		}

		// User Profile, History & Timeline Routes
		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware(jwtService))
		{
			users.GET("/profile", authHandler.GetProfileStats)
			users.PUT("/profile", authHandler.UpdateProfile)
			users.GET("/votes", authHandler.GetVoteHistory)
			users.GET("/timeline", authHandler.GetActivityTimeline)
		}

		// Persistent Notifications Routes
		if notificationHandler != nil {
			notifs := api.Group("/notifications")
			notifs.Use(middleware.AuthMiddleware(jwtService))
			{
				notifs.GET("", notificationHandler.List)
				notifs.PUT("/read-all", notificationHandler.MarkAllRead)
				notifs.PUT("/:id/read", notificationHandler.MarkRead)
				notifs.DELETE("/:id", notificationHandler.Delete)
			}
		}

		// Polls & Voting Routes
		polls := api.Group("/polls")
		{
			// Public Poll Endpoints
			polls.GET("", pollHandler.List)
			polls.GET("/:id", pollHandler.GetByID)
			polls.GET("/:id/results", voteHandler.GetResults)
			polls.GET("/:id/export", exportHandler.ExportCSV)
			polls.POST("/:id/ai-insights", aiHandler.GenerateInsights)
			if commentHandler != nil {
				polls.GET("/:id/comments", commentHandler.GetComments)
			}

			// Protected Poll & Vote Endpoints
			protectedPolls := polls.Group("")
			protectedPolls.Use(middleware.AuthMiddleware(jwtService))
			{
				protectedPolls.POST("", pollHandler.Create)
				protectedPolls.PUT("/:id", pollHandler.Update)
				protectedPolls.DELETE("/:id", pollHandler.Delete)
				protectedPolls.POST("/:id/clone", pollHandler.Clone)
				protectedPolls.POST("/:id/vote", voteHandler.CastVote)
				if commentHandler != nil {
					protectedPolls.POST("/:id/comments", commentHandler.AddComment)
				}
			}
		}

		// Real-Time WebSockets
		ws := api.Group("/ws")
		{
			ws.GET("/polls/:id", wsHandler.ServeWS)
		}

		// Administrator Control Portal (RBAC Protected)
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(jwtService))
		admin.Use(middleware.RequireRole(model.RoleAdmin))
		{
			admin.GET("/audit-logs", adminHandler.ListAuditLogs)
			admin.GET("/users", adminHandler.ListUsers)
			admin.DELETE("/polls/:id", pollHandler.Delete)
		}
	}

	return r
}
