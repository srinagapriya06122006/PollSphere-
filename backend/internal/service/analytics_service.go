package service

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	"guvi-backend/internal/database"
	"guvi-backend/internal/model"
	"guvi-backend/internal/repository"
)

const (
	analyticsCacheKey = "cache:analytics:overview"
	analyticsCacheTTL = 60 * time.Second
)

// AnalyticsService defines high-level analytics operations
type AnalyticsService interface {
	GetOverview(ctx context.Context) (*model.AnalyticsOverviewResponse, error)
	InvalidateCache(ctx context.Context)
}

type analyticsService struct {
	analyticsRepo repository.AnalyticsRepository
	pollRepo      repository.PollRepository
	voteRepo      repository.VoteRepository
	userRepo      repository.UserRepository
	redisClient   *database.RedisClient
}

// NewAnalyticsService creates a new AnalyticsService
func NewAnalyticsService(
	analyticsRepo repository.AnalyticsRepository,
	pollRepo repository.PollRepository,
	voteRepo repository.VoteRepository,
	userRepo repository.UserRepository,
	redisClient *database.RedisClient,
) AnalyticsService {
	return &analyticsService{
		analyticsRepo: analyticsRepo,
		pollRepo:      pollRepo,
		voteRepo:      voteRepo,
		userRepo:      userRepo,
		redisClient:   redisClient,
	}
}

// GetOverview computes or retrieves cached system overview statistics
func (s *analyticsService) GetOverview(ctx context.Context) (*model.AnalyticsOverviewResponse, error) {
	// Try reading from Redis cache first
	if s.redisClient != nil && s.redisClient.IsEnabled() {
		cachedData, err := s.redisClient.Get(ctx, analyticsCacheKey)
		if err == nil && cachedData != "" {
			var resp model.AnalyticsOverviewResponse
			if err := json.Unmarshal([]byte(cachedData), &resp); err == nil {
				return &resp, nil
			}
		}
	}

	// Compute metrics concurrently or sequentially from repositories
	totalPolls, _ := s.pollRepo.Count(ctx)
	activePolls, _ := s.pollRepo.CountByStatus(ctx, model.PollStatusActive)
	closedPolls, _ := s.pollRepo.CountByStatus(ctx, model.PollStatusClosed)
	totalVotes, _ := s.voteRepo.Count(ctx)
	totalUsers, _ := s.userRepo.Count(ctx)

	catDist, err := s.analyticsRepo.GetCategoryDistribution(ctx)
	if err != nil {
		catDist = []model.CategoryCount{}
	}

	popularPolls, err := s.analyticsRepo.GetPopularPolls(ctx, 5)
	if err != nil {
		popularPolls = []model.PopularPollItem{}
	}

	voteTrend, err := s.analyticsRepo.GetDailyVoteTrend(ctx, 7)
	if err != nil {
		voteTrend = []model.DailyVoteTrend{}
	}

	topCreators, err := s.analyticsRepo.GetTopCreators(ctx, 5)
	if err != nil {
		topCreators = []model.TopUserLeaderboard{}
	}

	topVoters, err := s.analyticsRepo.GetTopVoters(ctx, 5)
	if err != nil {
		topVoters = []model.TopUserLeaderboard{}
	}

	overview := &model.AnalyticsOverviewResponse{
		TotalPolls:           totalPolls,
		TotalVotes:           totalVotes,
		ActivePolls:          activePolls,
		ClosedPolls:          closedPolls,
		TotalUsers:           totalUsers,
		CategoryDistribution: catDist,
		PopularPolls:         popularPolls,
		VoteTrend:            voteTrend,
		TopCreators:          topCreators,
		TopVoters:            topVoters,
	}

	// Cache in Redis for performance
	if s.redisClient != nil && s.redisClient.IsEnabled() {
		if data, err := json.Marshal(overview); err == nil {
			if err := s.redisClient.Set(ctx, analyticsCacheKey, string(data), analyticsCacheTTL); err != nil {
				slog.Warn("Failed to cache analytics overview", "error", err)
			}
		}
	}

	return overview, nil
}

// InvalidateCache clears the analytics cache key
func (s *analyticsService) InvalidateCache(ctx context.Context) {
	if s.redisClient != nil && s.redisClient.IsEnabled() {
		_ = s.redisClient.Del(ctx, analyticsCacheKey)
	}
}
