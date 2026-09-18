package service

import (
	"context"
	"errors"
	"fmt"
	"math"
	"strings"
	"time"

	"guvi-backend/internal/database"
	"guvi-backend/internal/model"
	"guvi-backend/internal/repository"

	"go.mongodb.org/mongo-driver/v2/bson"
)

var (
	ErrInvalidPollID     = errors.New("invalid poll id format")
	ErrPollNotFound      = errors.New("poll not found")
	ErrUnauthorizedPoll  = errors.New("you are not authorized to modify this poll")
	ErrInvalidOptions    = errors.New("at least 2 unique options are required")
	ErrInvalidExpiration = errors.New("expiration time must be in the future")
)

// PollService defines business operations for managing polls
type PollService interface {
	CreatePoll(ctx context.Context, userID, userEmail string, req *model.CreatePollRequest, ip string) (*model.PollResponse, error)
	ClonePoll(ctx context.Context, userID, userEmail, pollID, ip string) (*model.PollResponse, error)
	GetPollByID(ctx context.Context, pollID string) (*model.PollResponse, error)
	ListPolls(ctx context.Context, page, limit int, status string) (*model.PollListResponse, error)
	ListPollsWithFilter(ctx context.Context, filter model.PollFilter) (*model.PollListResponse, error)
	UpdatePoll(ctx context.Context, userID string, userRole model.UserRole, pollID string, req *model.UpdatePollRequest, ip string) (*model.PollResponse, error)
	DeletePoll(ctx context.Context, userID string, userRole model.UserRole, pollID string, ip string) error
	InvalidatePollCache(ctx context.Context, pollID string)
}

type pollService struct {
	pollRepo     repository.PollRepository
	voteRepo     repository.VoteRepository
	userRepo     repository.UserRepository
	auditService AuditService
	notifService NotificationService
	redisClient  *database.RedisClient
}

// NewPollService creates an instance of PollService
func NewPollService(
	pollRepo repository.PollRepository,
	voteRepo repository.VoteRepository,
	userRepo repository.UserRepository,
	auditService AuditService,
	notifService NotificationService,
	redisClient *database.RedisClient,
) PollService {
	return &pollService{
		pollRepo:     pollRepo,
		voteRepo:     voteRepo,
		userRepo:     userRepo,
		auditService: auditService,
		notifService: notifService,
		redisClient:  redisClient,
	}
}

// CreatePoll validates options, category, creator, and stores the new poll
func (s *pollService) CreatePoll(ctx context.Context, userID, userEmail string, req *model.CreatePollRequest, ip string) (*model.PollResponse, error) {
	creatorOID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, ErrInvalidPollID
	}

	// Validate options: deduplicate and trim
	seen := make(map[string]bool)
	var sanitizedOptions []model.PollOption

	for _, optText := range req.Options {
		trimmed := strings.TrimSpace(optText)
		if trimmed == "" {
			continue
		}
		lower := strings.ToLower(trimmed)
		if seen[lower] {
			continue
		}
		seen[lower] = true
		sanitizedOptions = append(sanitizedOptions, model.PollOption{
			ID:   bson.NewObjectID().Hex(),
			Text: trimmed,
		})
	}

	if len(sanitizedOptions) < 2 {
		return nil, ErrInvalidOptions
	}

	if req.ExpiresAt != nil && req.ExpiresAt.Before(time.Now().UTC()) {
		return nil, ErrInvalidExpiration
	}

	category := model.CategoryGeneral
	if req.Category != nil && *req.Category != "" {
		category = *req.Category
	}

	creatorName := userEmail
	user, err := s.userRepo.FindByID(ctx, creatorOID)
	if err == nil && user != nil && user.Name != "" {
		creatorName = user.Name
	}

	poll := &model.Poll{
		Question:    strings.TrimSpace(req.Question),
		Options:     sanitizedOptions,
		Category:    category,
		CreatorID:   creatorOID,
		CreatorName: creatorName,
		Status:      model.PollStatusActive,
		ExpiresAt:   req.ExpiresAt,
	}

	if err := s.pollRepo.Create(ctx, poll); err != nil {
		return nil, fmt.Errorf("failed to create poll: %w", err)
	}

	if s.auditService != nil {
		s.auditService.Log(ctx, &creatorOID, userEmail, model.AuditActionPollCreate, "poll", poll.ID.Hex(), fmt.Sprintf("Poll created: %s", poll.Question), ip)
	}

	if s.notifService != nil {
		s.notifService.SendNotification(ctx, creatorOID, "Poll Published", fmt.Sprintf("Your poll \"%s\" is live.", poll.Question), model.NotificationTypeSystem, fmt.Sprintf("/polls/%s", poll.ID.Hex()))
	}

	// Invalidate analytics cache
	if s.redisClient != nil && s.redisClient.IsEnabled() {
		_ = s.redisClient.Del(ctx, "cache:analytics:overview")
	}

	return poll.ToResponse(), nil
}

// ClonePoll duplicates an existing poll with fresh IDs for options and current user ownership
func (s *pollService) ClonePoll(ctx context.Context, userID, userEmail, pollID, ip string) (*model.PollResponse, error) {
	sourcePoll, err := s.GetPollByID(ctx, pollID)
	if err != nil {
		return nil, err
	}

	var clonedOptions []string
	for _, opt := range sourcePoll.Options {
		clonedOptions = append(clonedOptions, opt.Text)
	}

	req := &model.CreatePollRequest{
		Question: fmt.Sprintf("Copy of %s", sourcePoll.Question),
		Options:  clonedOptions,
		Category: &sourcePoll.Category,
	}

	return s.CreatePoll(ctx, userID, userEmail, req, ip)
}

// GetPollByID retrieves a poll by its hex string ID
func (s *pollService) GetPollByID(ctx context.Context, pollID string) (*model.PollResponse, error) {
	oid, err := bson.ObjectIDFromHex(pollID)
	if err != nil {
		return nil, ErrInvalidPollID
	}

	poll, err := s.pollRepo.FindByID(ctx, oid)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch poll: %w", err)
	}
	if poll == nil {
		return nil, ErrPollNotFound
	}

	return poll.ToResponse(), nil
}

// ListPolls retrieves paginated polls
func (s *pollService) ListPolls(ctx context.Context, page, limit int, status string) (*model.PollListResponse, error) {
	return s.ListPollsWithFilter(ctx, model.PollFilter{
		Page:   page,
		Limit:  limit,
		Status: status,
	})
}

// ListPollsWithFilter retrieves polls matching query criteria
func (s *pollService) ListPollsWithFilter(ctx context.Context, filter model.PollFilter) (*model.PollListResponse, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 || filter.Limit > 50 {
		filter.Limit = 10
	}

	polls, total, err := s.pollRepo.ListWithFilter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to list polls: %w", err)
	}

	var pollResponses []*model.PollResponse
	for _, p := range polls {
		resp := p.ToResponse()
		_, totalVotes, _ := s.voteRepo.CountVotesByOption(ctx, p.ID)
		resp.TotalVotes = totalVotes
		pollResponses = append(pollResponses, resp)
	}

	totalPages := int(math.Ceil(float64(total) / float64(filter.Limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	return &model.PollListResponse{
		Polls:      pollResponses,
		Total:      total,
		Page:       filter.Page,
		Limit:      filter.Limit,
		TotalPages: totalPages,
	}, nil
}

// UpdatePoll allows poll owner or admin to update poll question, category, or status
func (s *pollService) UpdatePoll(ctx context.Context, userID string, userRole model.UserRole, pollID string, req *model.UpdatePollRequest, ip string) (*model.PollResponse, error) {
	oid, err := bson.ObjectIDFromHex(pollID)
	if err != nil {
		return nil, ErrInvalidPollID
	}

	poll, err := s.pollRepo.FindByID(ctx, oid)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch poll: %w", err)
	}
	if poll == nil {
		return nil, ErrPollNotFound
	}

	if poll.CreatorID.Hex() != userID && userRole != model.RoleAdmin {
		return nil, ErrUnauthorizedPoll
	}

	if req.Question != nil && strings.TrimSpace(*req.Question) != "" {
		poll.Question = strings.TrimSpace(*req.Question)
	}
	if req.Category != nil && *req.Category != "" {
		poll.Category = *req.Category
	}
	if req.Status != nil {
		poll.Status = *req.Status
	}

	if err := s.pollRepo.Update(ctx, poll); err != nil {
		return nil, fmt.Errorf("failed to update poll: %w", err)
	}

	s.InvalidatePollCache(ctx, pollID)

	if s.auditService != nil {
		userOID, _ := bson.ObjectIDFromHex(userID)
		s.auditService.Log(ctx, &userOID, "", model.AuditActionPollUpdate, "poll", pollID, "Poll modified", ip)
	}

	return poll.ToResponse(), nil
}

// DeletePoll allows owner or admin to delete poll and associated votes
func (s *pollService) DeletePoll(ctx context.Context, userID string, userRole model.UserRole, pollID string, ip string) error {
	oid, err := bson.ObjectIDFromHex(pollID)
	if err != nil {
		return ErrInvalidPollID
	}

	poll, err := s.pollRepo.FindByID(ctx, oid)
	if err != nil {
		return fmt.Errorf("failed to fetch poll: %w", err)
	}
	if poll == nil {
		return ErrPollNotFound
	}

	if poll.CreatorID.Hex() != userID && userRole != model.RoleAdmin {
		return ErrUnauthorizedPoll
	}

	if err := s.pollRepo.Delete(ctx, oid); err != nil {
		return fmt.Errorf("failed to delete poll: %w", err)
	}

	_ = s.voteRepo.DeleteByPollID(ctx, oid)
	s.InvalidatePollCache(ctx, pollID)

	if s.auditService != nil {
		userOID, _ := bson.ObjectIDFromHex(userID)
		s.auditService.Log(ctx, &userOID, "", model.AuditActionPollDelete, "poll", pollID, fmt.Sprintf("Poll deleted: %s", poll.Question), ip)
	}

	if s.notifService != nil {
		s.notifService.SendNotification(ctx, poll.CreatorID, "Poll Deleted", fmt.Sprintf("Your poll \"%s\" was deleted.", poll.Question), model.NotificationTypePollDeleted, "/")
	}

	return nil
}

// InvalidatePollCache removes cached poll and results
func (s *pollService) InvalidatePollCache(ctx context.Context, pollID string) {
	if s.redisClient != nil && s.redisClient.IsEnabled() {
		_ = s.redisClient.Del(ctx, fmt.Sprintf("cache:poll_results:%s", pollID))
		_ = s.redisClient.Del(ctx, "cache:analytics:overview")
	}
}
