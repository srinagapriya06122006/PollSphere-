package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"guvi-backend/internal/config"
	"guvi-backend/internal/database"
	"guvi-backend/internal/handler"
	"guvi-backend/internal/repository"
	"guvi-backend/internal/router"
	"guvi-backend/internal/service"
	ws "guvi-backend/internal/websocket"
)

func main() {
	// Initialize structured logging
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	// Load centralized configuration
	cfg := config.LoadConfig()
	slog.Info("Configuration loaded",
		"port", cfg.Port,
		"env", cfg.AppEnv,
		"gin_mode", cfg.GinMode,
		"redis_enabled", cfg.RedisEnabled,
	)

	// Root context for background processes (Hub, Redis subscriptions, Schedulers)
	appCtx, appCancel := context.WithCancel(context.Background())
	defer appCancel()

	// Initialize MongoDB connection
	mongoDB, err := database.Connect(cfg)
	if err != nil {
		slog.Error("Failed to connect to MongoDB", "error", err)
		os.Exit(1)
	}
	defer mongoDB.Disconnect()

	// Initialize Redis connection (with fallback logging)
	redisClient, err := database.ConnectRedis(cfg)
	if err != nil {
		slog.Warn("Application will continue without Redis cache (fallback to MongoDB)", "error", err)
	} else if redisClient != nil {
		defer redisClient.Disconnect()
	}

	// Initialize WebSocket Hub and run event loop
	hub := ws.NewHub(redisClient)
	go hub.Run(appCtx)

	// Initialize Repositories and create indexes
	initCtx, initCancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer initCancel()

	userRepo := repository.NewUserRepository(mongoDB.Database)
	if err := userRepo.EnsureIndexes(initCtx); err != nil {
		slog.Error("Failed to initialize MongoDB user indexes", "error", err)
		os.Exit(1)
	}

	pollRepo := repository.NewPollRepository(mongoDB.Database)
	if err := pollRepo.EnsureIndexes(initCtx); err != nil {
		slog.Error("Failed to initialize MongoDB poll indexes", "error", err)
		os.Exit(1)
	}

	voteRepo := repository.NewVoteRepository(mongoDB.Database)
	if err := voteRepo.EnsureIndexes(initCtx); err != nil {
		slog.Error("Failed to initialize MongoDB vote indexes", "error", err)
		os.Exit(1)
	}

	auditRepo := repository.NewAuditRepository(mongoDB.Database)
	if err := auditRepo.EnsureIndexes(initCtx); err != nil {
		slog.Error("Failed to initialize MongoDB audit indexes", "error", err)
		os.Exit(1)
	}

	analyticsRepo := repository.NewAnalyticsRepository(mongoDB.Database)
	commentRepo := repository.NewCommentRepository(mongoDB.Database)

	notifRepo := repository.NewNotificationRepository(mongoDB.Database)
	if err := notifRepo.EnsureIndexes(initCtx); err != nil {
		slog.Error("Failed to initialize MongoDB notification indexes", "error", err)
		os.Exit(1)
	}

	// Initialize Services
	jwtService := service.NewJWTService(cfg)
	auditService := service.NewAuditService(auditRepo)
	notifService := service.NewNotificationService(notifRepo)
	commentService := service.NewCommentService(commentRepo, pollRepo)
	googleService := service.NewGoogleAuthService(cfg)
	authService := service.NewAuthService(userRepo, pollRepo, voteRepo, jwtService, auditService, googleService)
	pollService := service.NewPollService(pollRepo, voteRepo, userRepo, auditService, notifService, redisClient)
	voteService := service.NewVoteService(voteRepo, pollRepo, userRepo, auditService, notifService, redisClient, hub)
	analyticsService := service.NewAnalyticsService(analyticsRepo, pollRepo, voteRepo, userRepo, redisClient)
	exportService := service.NewExportService(pollService, voteService)
	aiService := service.NewAIService(pollService, voteService)

	// Start Background Poll Expiry Scheduler (runs every 15 seconds)
	schedulerService := service.NewSchedulerService(pollRepo, pollService, auditService, notifService, hub, 15*time.Second)
	schedulerService.Start(appCtx)

	// Initialize Handlers
	authHandler := handler.NewAuthHandler(authService)
	pollHandler := handler.NewPollHandler(pollService)
	voteHandler := handler.NewVoteHandler(voteService, jwtService)
	wsHandler := handler.NewWSHandler(hub, jwtService, voteService, pollService)
	analyticsHandler := handler.NewAnalyticsHandler(analyticsService)
	exportHandler := handler.NewExportHandler(exportService)
	aiHandler := handler.NewAIHandler(aiService)
	adminHandler := handler.NewAdminHandler(auditService, authService)
	notificationHandler := handler.NewNotificationHandler(notifService)
	commentHandler := handler.NewCommentHandler(commentService)

	// Setup Gin router with database, cache, handlers, rate limiting, and middlewares
	r := router.SetupRouter(
		cfg,
		mongoDB,
		redisClient,
		authHandler,
		pollHandler,
		voteHandler,
		wsHandler,
		analyticsHandler,
		exportHandler,
		aiHandler,
		adminHandler,
		notificationHandler,
		commentHandler,
		jwtService,
	)

	// Configure HTTP Server
	serverAddr := fmt.Sprintf(":%s", cfg.Port)
	srv := &http.Server{
		Addr:         serverAddr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a separate goroutine
	go func() {
		slog.Info("Server starting", "address", fmt.Sprintf("http://localhost%s", serverAddr))
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("Server failed to listen", "error", err)
			os.Exit(1)
		}
	}()

	// Listen for OS interrupt signals for graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit
	slog.Info("Shutdown signal received", "signal", sig.String())

	// Stop background Hub, Scheduler, and Redis PubSub listeners
	appCancel()

	// Set deadline context for in-flight requests
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("Server forced to shutdown", "error", err)
		os.Exit(1)
	}

	slog.Info("Server stopped gracefully")
}
