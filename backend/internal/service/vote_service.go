package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"math"
	"time"

	"guvi-backend/internal/database"
	"guvi-backend/internal/model"
	"guvi-backend/internal/repository"
	ws "guvi-backend/internal/websocket"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

const (
	// PollResultsCacheTTL defines the duration poll results remain cached in Redis
	PollResultsCacheTTL = 5 * time.Minute
)

var (
	ErrAlreadyVoted  = errors.New("you have already voted in this poll")
	ErrPollClosed    = errors.New("this poll is closed and no longer accepting votes")
	ErrPollExpired   = errors.New("this poll has expired and is no longer accepting votes")
	ErrInvalidOption = errors.New("the selected option does not exist for this poll")
)

// VoteService defines business logic for voting and retrieving poll results
type VoteService interface {
	CastVote(ctx context.Context, userID, pollID string, req *model.CastVoteRequest) error
	GetPollResults(ctx context.Context, pollID string, optionalUserID *string) (*model.PollResultsResponse, error)
	SetHub(hub *ws.Hub)
}

type voteService struct {
	voteRepo repository.VoteRepository
	pollRepo repository.PollRepository
	redis    *database.RedisClient
	hub      *ws.Hub
}

// NewVoteService creates an instance of VoteService with database and optional Redis cache
func NewVoteService(voteRepo repository.VoteRepository, pollRepo repository.PollRepository, redis *database.RedisClient, hub *ws.Hub) VoteService {
	return &voteService{
		voteRepo: voteRepo,
		pollRepo: pollRepo,
		redis:    redis,
		hub:      hub,
	}
}

// SetHub attaches the WebSocket hub to the service
func (s *voteService) SetHub(hub *ws.Hub) {
	s.hub = hub
}

// getResultsCacheKey formats the Redis key for cached poll results
func getResultsCacheKey(pollID string) string {
	return fmt.Sprintf("poll:results:%s", pollID)
}

// CastVote validates poll state, records the vote, invalidates Redis cache, and broadcasts real-time update
func (s *voteService) CastVote(ctx context.Context, userID, pollID string, req *model.CastVoteRequest) error {
	userOID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return ErrInvalidPollID
	}

	pollOID, err := bson.ObjectIDFromHex(pollID)
	if err != nil {
		return ErrInvalidPollID
	}

	// 1. Verify poll exists
	poll, err := s.pollRepo.FindByID(ctx, pollOID)
	if err != nil {
		return fmt.Errorf("failed to find poll: %w", err)
	}
	if poll == nil {
		return ErrPollNotFound
	}

	// 2. Verify poll status is active
	if poll.Status != model.PollStatusActive {
		return ErrPollClosed
	}

	// 3. Verify poll has not expired
	if poll.ExpiresAt != nil && poll.ExpiresAt.Before(time.Now().UTC()) {
		return ErrPollExpired
	}

	// 4. Verify option belongs to the poll
	optionFound := false
	for _, opt := range poll.Options {
		if opt.ID == req.OptionID {
			optionFound = true
			break
		}
	}
	if !optionFound {
		return ErrInvalidOption
	}

	// 5. Pre-check if user already voted (application level)
	hasVoted, _, err := s.voteRepo.HasUserVoted(ctx, pollOID, userOID)
	if err != nil {
		return fmt.Errorf("failed to verify user voting status: %w", err)
	}
	if hasVoted {
		return ErrAlreadyVoted
	}

	// 6. Record the vote in MongoDB (Unique compound index handles race conditions)
	vote := &model.Vote{
		PollID:   pollOID,
		OptionID: req.OptionID,
		UserID:   userOID,
	}

	if err := s.voteRepo.Create(ctx, vote); err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return ErrAlreadyVoted
		}
		return fmt.Errorf("failed to cast vote: %w", err)
	}

	// 7. Invalidate the Redis cache for this poll so subsequent queries get fresh results
	if s.redis != nil {
		cacheKey := getResultsCacheKey(pollID)
		if err := s.redis.Del(ctx, cacheKey); err != nil {
			slog.Warn("Failed to invalidate Redis cache on vote", "key", cacheKey, "error", err)
		} else {
			slog.Info("Redis cache invalidated for poll results", "pollId", pollID)
		}
	}

	// 8. Broadcast updated results to all connected WebSocket clients for this poll
	if s.hub != nil {
		if updatedResults, err := s.GetPollResults(ctx, pollID, nil); err == nil {
			s.hub.BroadcastToPoll(pollID, gin.H{
				"type": "POLL_UPDATE",
				"data": updatedResults,
			})
			slog.Info("Broadcasted real-time poll update via WebSocket / Redis PubSub", "pollId", pollID)
		}
	}

	return nil
}

// GetPollResults aggregates vote counts with Redis read-through caching and graceful fallback
func (s *voteService) GetPollResults(ctx context.Context, pollID string, optionalUserID *string) (*model.PollResultsResponse, error) {
	pollOID, err := bson.ObjectIDFromHex(pollID)
	if err != nil {
		return nil, ErrInvalidPollID
	}

	cacheKey := getResultsCacheKey(pollID)
	var cachedResults *model.PollResultsResponse

	// 1. Try reading from Redis Cache (Cache-Aside / Read-Through Pattern)
	if s.redis != nil {
		if val, err := s.redis.Get(ctx, cacheKey); err == nil && val != "" {
			var resp model.PollResultsResponse
			if err := json.Unmarshal([]byte(val), &resp); err == nil {
				cachedResults = &resp
				slog.Info("Redis cache hit for poll results", "pollId", pollID)
			}
		}
	}

	// 2. If Cache Miss, fetch and calculate from MongoDB persistent source
	if cachedResults == nil {
		poll, err := s.pollRepo.FindByID(ctx, pollOID)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch poll: %w", err)
		}
		if poll == nil {
			return nil, ErrPollNotFound
		}

		counts, totalVotes, err := s.voteRepo.CountVotesByOption(ctx, pollOID)
		if err != nil {
			return nil, fmt.Errorf("failed to calculate poll results: %w", err)
		}

		var results []model.OptionResult
		for _, opt := range poll.Options {
			count := counts[opt.ID]
			var percentage float64
			if totalVotes > 0 {
				percentage = math.Round((float64(count)/float64(totalVotes))*1000) / 10
			}

			results = append(results, model.OptionResult{
				OptionID:   opt.ID,
				Text:       opt.Text,
				VoteCount:  count,
				Percentage: percentage,
			})
		}

		cachedResults = &model.PollResultsResponse{
			PollID:     poll.ID.Hex(),
			Question:   poll.Question,
			Status:     poll.Status,
			TotalVotes: totalVotes,
			Results:    results,
		}

		// 3. Store aggregated results in Redis with TTL (Cache warming)
		if s.redis != nil {
			if data, err := json.Marshal(cachedResults); err == nil {
				if err := s.redis.Set(ctx, cacheKey, data, PollResultsCacheTTL); err != nil {
					slog.Warn("Failed to cache poll results in Redis", "key", cacheKey, "error", err)
				} else {
					slog.Info("Poll results cached in Redis", "pollId", pollID, "ttl", PollResultsCacheTTL)
				}
			}
		}
	}

	// 4. Attach user-specific vote info if authenticated user requested it (not cached globally)
	finalResponse := *cachedResults
	if optionalUserID != nil && *optionalUserID != "" {
		if userOID, err := bson.ObjectIDFromHex(*optionalUserID); err == nil {
			_, userVotedOptionID, _ := s.voteRepo.HasUserVoted(ctx, pollOID, userOID)
			finalResponse.UserVotedOptionID = userVotedOptionID
		}
	}

	return &finalResponse, nil
}
