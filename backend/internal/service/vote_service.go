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
	CastVote(ctx context.Context, userID, pollID string, req *model.CastVoteRequest, ip string) error
	GetPollResults(ctx context.Context, pollID string, optionalUserID *string) (*model.PollResultsResponse, error)
	SetHub(hub *ws.Hub)
}

type voteService struct {
	voteRepo     repository.VoteRepository
	pollRepo     repository.PollRepository
	userRepo     repository.UserRepository
	auditService AuditService
	notifService NotificationService
	redis        *database.RedisClient
	hub          *ws.Hub
}

// NewVoteService creates an instance of VoteService with database, audit logging, notifications, and Redis caching
func NewVoteService(
	voteRepo repository.VoteRepository,
	pollRepo repository.PollRepository,
	userRepo repository.UserRepository,
	auditService AuditService,
	notifService NotificationService,
	redis *database.RedisClient,
	hub *ws.Hub,
) VoteService {
	return &voteService{
		voteRepo:     voteRepo,
		pollRepo:     pollRepo,
		userRepo:     userRepo,
		auditService: auditService,
		notifService: notifService,
		redis:        redis,
		hub:          hub,
	}
}

// SetHub attaches the WebSocket hub to the service
func (s *voteService) SetHub(hub *ws.Hub) {
	s.hub = hub
}

func getResultsCacheKey(pollID string) string {
	return fmt.Sprintf("poll:results:%s", pollID)
}

// CastVote validates poll state, records the vote, invalidates Redis cache, logs audit event, sends notification, and broadcasts update
func (s *voteService) CastVote(ctx context.Context, userID, pollID string, req *model.CastVoteRequest, ip string) error {
	userOID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return ErrInvalidPollID
	}

	pollOID, err := bson.ObjectIDFromHex(pollID)
	if err != nil {
		return ErrInvalidPollID
	}

	poll, err := s.pollRepo.FindByID(ctx, pollOID)
	if err != nil {
		return fmt.Errorf("failed to find poll: %w", err)
	}
	if poll == nil {
		return ErrPollNotFound
	}

	if poll.Status != model.PollStatusActive {
		return ErrPollClosed
	}

	if poll.ExpiresAt != nil && poll.ExpiresAt.Before(time.Now().UTC()) {
		return ErrPollExpired
	}

	var selectedOptionText string
	optionFound := false
	for _, opt := range poll.Options {
		if opt.ID == req.OptionID {
			optionFound = true
			selectedOptionText = opt.Text
			break
		}
	}
	if !optionFound {
		return ErrInvalidOption
	}

	hasVoted, _, err := s.voteRepo.HasUserVoted(ctx, pollOID, userOID)
	if err != nil {
		return fmt.Errorf("failed to verify user voting status: %w", err)
	}
	if hasVoted {
		return ErrAlreadyVoted
	}

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

	// Invalidate Redis cache for poll and analytics
	if s.redis != nil && s.redis.IsEnabled() {
		_ = s.redis.Del(ctx, getResultsCacheKey(pollID))
		_ = s.redis.Del(ctx, "cache:analytics:overview")
	}

	// Record audit event
	if s.auditService != nil {
		s.auditService.Log(ctx, &userOID, "", model.AuditActionVoteCast, "poll", pollID, fmt.Sprintf("Voted for option: %s", selectedOptionText), ip)
	}

	// Send persistent notification to poll creator
	if s.notifService != nil && poll.CreatorID != userOID {
		s.notifService.SendNotification(
			ctx,
			poll.CreatorID,
			"New Vote Received",
			fmt.Sprintf("Someone voted for \"%s\" on your poll \"%s\".", selectedOptionText, poll.Question),
			model.NotificationTypeVoteReceived,
			fmt.Sprintf("/polls/%s", pollID),
		)
	}

	// Broadcast real-time results via WebSockets
	if s.hub != nil {
		if updatedResults, err := s.GetPollResults(ctx, pollID, nil); err == nil {
			s.hub.BroadcastToPoll(pollID, gin.H{
				"type": "POLL_UPDATE",
				"data": updatedResults,
			})
			slog.Info("Broadcasted live poll update", "pollId", pollID)
		}
	}

	return nil
}

// GetPollResults aggregates vote counts with Redis caching
func (s *voteService) GetPollResults(ctx context.Context, pollID string, optionalUserID *string) (*model.PollResultsResponse, error) {
	pollOID, err := bson.ObjectIDFromHex(pollID)
	if err != nil {
		return nil, ErrInvalidPollID
	}

	cacheKey := getResultsCacheKey(pollID)
	var cachedResults *model.PollResultsResponse

	if s.redis != nil && s.redis.IsEnabled() {
		if val, err := s.redis.Get(ctx, cacheKey); err == nil && val != "" {
			var resp model.PollResultsResponse
			if err := json.Unmarshal([]byte(val), &resp); err == nil {
				cachedResults = &resp
			}
		}
	}

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

		cat := poll.Category
		if cat == "" {
			cat = model.CategoryGeneral
		}

		cachedResults = &model.PollResultsResponse{
			PollID:     poll.ID.Hex(),
			Question:   poll.Question,
			Status:     poll.Status,
			Category:   cat,
			TotalVotes: totalVotes,
			Results:    results,
		}

		if s.redis != nil && s.redis.IsEnabled() {
			if data, err := json.Marshal(cachedResults); err == nil {
				_ = s.redis.Set(ctx, cacheKey, string(data), PollResultsCacheTTL)
			}
		}
	}

	finalResponse := *cachedResults
	if optionalUserID != nil && *optionalUserID != "" {
		if userOID, err := bson.ObjectIDFromHex(*optionalUserID); err == nil {
			_, userVotedOptionID, _ := s.voteRepo.HasUserVoted(ctx, pollOID, userOID)
			finalResponse.UserVotedOptionID = userVotedOptionID
		}
	}

	return &finalResponse, nil
}
