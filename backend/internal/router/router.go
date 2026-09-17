package router

import (
	"guvi-backend/internal/config"
	"guvi-backend/internal/database"
	"guvi-backend/internal/handler"
	"guvi-backend/internal/middleware"
	"guvi-backend/internal/service"

	"github.com/gin-gonic/gin"
)

// SetupRouter initializes Gin engine with middlewares and routes
func SetupRouter(
	cfg *config.Config,
	db *database.MongoDB,
	redis *database.RedisClient,
	authHandler *handler.AuthHandler,
	pollHandler *handler.PollHandler,
	voteHandler *handler.VoteHandler,
	wsHandler *handler.WSHandler,
	jwtService service.JWTService,
) *gin.Engine {
	// Set Gin mode (debug, release, test)
	gin.SetMode(cfg.GinMode)

	r := gin.New()

	// Global Middlewares
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(middleware.CORSMiddleware())

	// Handlers
	healthHandler := handler.NewHealthHandler(db, redis)

	// Direct health endpoint
	r.GET("/health", healthHandler.Check)

	// API versioned route group
	api := r.Group("/api")
	{
		api.GET("/health", healthHandler.Check)

		// Auth route group
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)

			// Protected auth endpoints
			protectedAuth := auth.Group("")
			protectedAuth.Use(middleware.AuthMiddleware(jwtService))
			{
				protectedAuth.GET("/me", authHandler.Me)
			}
		}

		// Polls & Voting route group
		polls := api.Group("/polls")
		{
			// Public poll endpoints
			polls.GET("", pollHandler.List)
			polls.GET("/:id", pollHandler.GetByID)
			polls.GET("/:id/results", voteHandler.GetResults)

			// Protected poll & voting endpoints
			protectedPolls := polls.Group("")
			protectedPolls.Use(middleware.AuthMiddleware(jwtService))
			{
				protectedPolls.POST("", pollHandler.Create)
				protectedPolls.PUT("/:id", pollHandler.Update)
				protectedPolls.DELETE("/:id", pollHandler.Delete)
				protectedPolls.POST("/:id/vote", voteHandler.CastVote)
			}
		}

		// Real-Time WebSockets route group
		ws := api.Group("/ws")
		{
			ws.GET("/polls/:id", wsHandler.ServeWS)
		}
	}

	return r
}
