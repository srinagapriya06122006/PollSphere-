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

	// Root context for background processes (Hub, Redis subscriptions)
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
	initCtx, initCancel := context.WithTimeout(context.Background(), 10*time.Second)
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

	// Initialize Services
	jwtService := service.NewJWTService(cfg)
	authService := service.NewAuthService(userRepo, jwtService)
	pollService := service.NewPollService(pollRepo, userRepo)
	voteService := service.NewVoteService(voteRepo, pollRepo, redisClient, hub)

	// Initialize Handlers
	authHandler := handler.NewAuthHandler(authService)
	pollHandler := handler.NewPollHandler(pollService)
	voteHandler := handler.NewVoteHandler(voteService, jwtService)
	wsHandler := handler.NewWSHandler(hub, jwtService, voteService, pollService)

	// Setup Gin router with database, cache, handlers, and middlewares
	r := router.SetupRouter(cfg, mongoDB, redisClient, authHandler, pollHandler, voteHandler, wsHandler, jwtService)

	// Configure HTTP Server
	serverAddr := fmt.Sprintf(":%s", cfg.Port)
	srv := &http.Server{
		Addr:         serverAddr,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
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

	// Stop background Hub and Redis PubSub listeners
	appCancel()

	// Set a 5-second deadline context for in-flight HTTP requests to complete
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("Server forced to shutdown", "error", err)
		os.Exit(1)
	}

	slog.Info("Server stopped gracefully")
}
