package service

import (
	"context"
	"errors"
	"fmt"
	"math"
	"strings"
	"time"

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
	CreatePoll(ctx context.Context, userID, userEmail string, req *model.CreatePollRequest) (*model.PollResponse, error)
	GetPollByID(ctx context.Context, pollID string) (*model.PollResponse, error)
	ListPolls(ctx context.Context, page, limit int, status string) (*model.PollListResponse, error)
	UpdatePoll(ctx context.Context, userID, pollID string, req *model.UpdatePollRequest) (*model.PollResponse, error)
	DeletePoll(ctx context.Context, userID, pollID string) error
}

type pollService struct {
	pollRepo repository.PollRepository
	userRepo repository.UserRepository
}

// NewPollService creates an instance of PollService
func NewPollService(pollRepo repository.PollRepository, userRepo repository.UserRepository) PollService {
	return &pollService{
		pollRepo: pollRepo,
		userRepo: userRepo,
	}
}

// CreatePoll validates options and creator, and stores the new poll
func (s *pollService) CreatePoll(ctx context.Context, userID, userEmail string, req *model.CreatePollRequest) (*model.PollResponse, error) {
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
			continue // Skip duplicates
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

	// Validate expiration time if provided
	if req.ExpiresAt != nil && req.ExpiresAt.Before(time.Now().UTC()) {
		return nil, ErrInvalidExpiration
	}

	// Resolve creator name
	creatorName := userEmail
	user, err := s.userRepo.FindByID(ctx, creatorOID)
	if err == nil && user != nil && user.Name != "" {
		creatorName = user.Name
	}

	poll := &model.Poll{
		Question:    strings.TrimSpace(req.Question),
		Options:     sanitizedOptions,
		CreatorID:   creatorOID,
		CreatorName: creatorName,
		Status:      model.PollStatusActive,
		ExpiresAt:   req.ExpiresAt,
	}

	if err := s.pollRepo.Create(ctx, poll); err != nil {
		return nil, fmt.Errorf("failed to create poll: %w", err)
	}

	return poll.ToResponse(), nil
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
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}

	polls, total, err := s.pollRepo.List(ctx, page, limit, status)
	if err != nil {
		return nil, fmt.Errorf("failed to list polls: %w", err)
	}

	var pollResponses []*model.PollResponse
	for _, p := range polls {
		pollResponses = append(pollResponses, p.ToResponse())
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	return &model.PollListResponse{
		Polls:      pollResponses,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// UpdatePoll allows only the poll owner to update question or status
func (s *pollService) UpdatePoll(ctx context.Context, userID, pollID string, req *model.UpdatePollRequest) (*model.PollResponse, error) {
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

	// Verify ownership
	if poll.CreatorID.Hex() != userID {
		return nil, ErrUnauthorizedPoll
	}

	if req.Question != nil && strings.TrimSpace(*req.Question) != "" {
		poll.Question = strings.TrimSpace(*req.Question)
	}
	if req.Status != nil {
		poll.Status = *req.Status
	}

	if err := s.pollRepo.Update(ctx, poll); err != nil {
		return nil, fmt.Errorf("failed to update poll: %w", err)
	}

	return poll.ToResponse(), nil
}

// DeletePoll allows only the poll owner to delete the poll
func (s *pollService) DeletePoll(ctx context.Context, userID, pollID string) error {
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

	// Verify ownership
	if poll.CreatorID.Hex() != userID {
		return ErrUnauthorizedPoll
	}

	if err := s.pollRepo.Delete(ctx, oid); err != nil {
		return fmt.Errorf("failed to delete poll: %w", err)
	}

	return nil
}
