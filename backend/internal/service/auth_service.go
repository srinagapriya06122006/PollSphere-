package service

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strings"

	"guvi-backend/internal/model"
	"guvi-backend/internal/repository"

	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrEmailAlreadyExists = errors.New("a user with this email already exists")
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrPasswordTooShort   = errors.New("password must be at least 6 characters")
	ErrUserNotFound       = errors.New("user not found")
	ErrWrongPassword      = errors.New("current password is incorrect")
)

// AuthService defines the business logic contract for authentication and user management
type AuthService interface {
	Register(ctx context.Context, req *model.RegisterRequest, ip string) (*model.UserResponse, error)
	Login(ctx context.Context, req *model.LoginRequest, ip string) (*model.AuthResponse, error)
	GetProfile(ctx context.Context, userID string) (*model.UserResponse, error)
	GetProfileWithStats(ctx context.Context, userID string) (*model.UserProfileResponse, error)
	UpdateProfile(ctx context.Context, userID string, req *model.UpdateProfileRequest) (*model.UserResponse, error)
	GetUserVoteHistory(ctx context.Context, userID string) ([]*model.UserVoteHistoryItem, error)
	GetActivityTimeline(ctx context.Context, userID string) ([]*model.ActivityTimelineItem, error)
	ListUsers(ctx context.Context, page, limit int) ([]*model.UserResponse, int64, error)
}

type authService struct {
	userRepo     repository.UserRepository
	pollRepo     repository.PollRepository
	voteRepo     repository.VoteRepository
	jwtService   JWTService
	auditService AuditService
}

// NewAuthService returns an instance of AuthService with injected dependencies
func NewAuthService(
	userRepo repository.UserRepository,
	pollRepo repository.PollRepository,
	voteRepo repository.VoteRepository,
	jwtService JWTService,
	auditService AuditService,
) AuthService {
	return &authService{
		userRepo:     userRepo,
		pollRepo:     pollRepo,
		voteRepo:     voteRepo,
		jwtService:   jwtService,
		auditService: auditService,
	}
}

// Register validates user data, hashes password, creates user, and records audit event
func (s *authService) Register(ctx context.Context, req *model.RegisterRequest, ip string) (*model.UserResponse, error) {
	normalizedEmail := strings.ToLower(strings.TrimSpace(req.Email))
	trimmedName := strings.TrimSpace(req.Name)

	if len(req.Password) < 6 {
		return nil, ErrPasswordTooShort
	}

	existingUser, err := s.userRepo.FindByEmail(ctx, normalizedEmail)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing user: %w", err)
	}
	if existingUser != nil {
		return nil, ErrEmailAlreadyExists
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	role := model.RoleUser
	if req.Role == "admin" {
		role = model.RoleAdmin
	}

	newUser := &model.User{
		Name:     trimmedName,
		Email:    normalizedEmail,
		Password: string(hashedPassword),
		Role:     role,
	}

	if err := s.userRepo.Create(ctx, newUser); err != nil {
		return nil, fmt.Errorf("failed to save user: %w", err)
	}

	if s.auditService != nil {
		s.auditService.Log(ctx, &newUser.ID, newUser.Email, model.AuditActionUserRegister, "user", newUser.ID.Hex(), "New account registered", ip)
	}

	return newUser.ToResponse(), nil
}

// Login validates user credentials and returns a signed JWT token with user details
func (s *authService) Login(ctx context.Context, req *model.LoginRequest, ip string) (*model.AuthResponse, error) {
	normalizedEmail := strings.ToLower(strings.TrimSpace(req.Email))

	user, err := s.userRepo.FindByEmail(ctx, normalizedEmail)
	if err != nil {
		return nil, fmt.Errorf("failed to query user: %w", err)
	}
	if user == nil {
		return nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	token, err := s.jwtService.GenerateToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate authentication token: %w", err)
	}

	if s.auditService != nil {
		s.auditService.Log(ctx, &user.ID, user.Email, model.AuditActionUserLogin, "user", user.ID.Hex(), "User logged in successfully", ip)
	}

	return &model.AuthResponse{
		Token: token,
		User:  user.ToResponse(),
	}, nil
}

// GetProfile fetches user details by their ID
func (s *authService) GetProfile(ctx context.Context, userID string) (*model.UserResponse, error) {
	oid, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	user, err := s.userRepo.FindByID(ctx, oid)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user: %w", err)
	}
	if user == nil {
		return nil, ErrUserNotFound
	}

	return user.ToResponse(), nil
}

// GetProfileWithStats calculates and returns user activity metrics
func (s *authService) GetProfileWithStats(ctx context.Context, userID string) (*model.UserProfileResponse, error) {
	oid, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	user, err := s.userRepo.FindByID(ctx, oid)
	if err != nil || user == nil {
		return nil, ErrUserNotFound
	}

	pollsCreated, _ := s.pollRepo.CountByCreator(ctx, oid)
	votesCast, _ := s.voteRepo.CountByUser(ctx, oid)
	votesReceived, _ := s.voteRepo.CountVotesReceivedByUser(ctx, oid)

	return &model.UserProfileResponse{
		User: user.ToResponse(),
		Stats: &model.UserProfileStats{
			PollsCreated:  pollsCreated,
			VotesCast:     votesCast,
			VotesReceived: votesReceived,
		},
	}, nil
}

// UpdateProfile updates user display name and/or password
func (s *authService) UpdateProfile(ctx context.Context, userID string, req *model.UpdateProfileRequest) (*model.UserResponse, error) {
	oid, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	user, err := s.userRepo.FindByID(ctx, oid)
	if err != nil || user == nil {
		return nil, ErrUserNotFound
	}

	if req.Name != nil && strings.TrimSpace(*req.Name) != "" {
		user.Name = strings.TrimSpace(*req.Name)
	}

	if req.NewPassword != nil && *req.NewPassword != "" {
		if req.CurrentPassword == nil {
			return nil, errors.New("current password is required to set new password")
		}
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(*req.CurrentPassword)); err != nil {
			return nil, ErrWrongPassword
		}
		hashed, err := bcrypt.GenerateFromPassword([]byte(*req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
		user.Password = string(hashed)
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}

	return user.ToResponse(), nil
}

// GetUserVoteHistory retrieves poll voting history for the authenticated user
func (s *authService) GetUserVoteHistory(ctx context.Context, userID string) ([]*model.UserVoteHistoryItem, error) {
	oid, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	return s.voteRepo.GetUserVoteHistory(ctx, oid, 50)
}

// GetActivityTimeline aggregates chronological activities for user profile
func (s *authService) GetActivityTimeline(ctx context.Context, userID string) ([]*model.ActivityTimelineItem, error) {
	oid, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	var timeline []*model.ActivityTimelineItem

	// 1. Fetch polls created by user
	createdPolls, _, err := s.pollRepo.ListWithFilter(ctx, model.PollFilter{CreatorID: userID, Limit: 50})
	if err == nil {
		for _, p := range createdPolls {
			timeline = append(timeline, &model.ActivityTimelineItem{
				ID:          p.ID.Hex() + "_create",
				Type:        "POLL_CREATED",
				Title:       "Created Live Poll",
				Description: fmt.Sprintf("Created poll \"%s\" in %s category", p.Question, p.Category),
				PollID:      p.ID.Hex(),
				Timestamp:   p.CreatedAt,
			})
		}
	}

	// 2. Fetch votes cast by user
	votes, err := s.voteRepo.GetUserVoteHistory(ctx, oid, 50)
	if err == nil {
		for _, v := range votes {
			timeline = append(timeline, &model.ActivityTimelineItem{
				ID:          v.VoteID,
				Type:        "VOTE_CAST",
				Title:       "Voted on Poll",
				Description: fmt.Sprintf("Voted for \"%s\" on \"%s\"", v.OptionText, v.Question),
				PollID:      v.PollID,
				Timestamp:   v.VotedAt,
			})
		}
	}

	// Sort descending by timestamp
	sort.Slice(timeline, func(i, j int) bool {
		return timeline[i].Timestamp.After(timeline[j].Timestamp)
	})

	return timeline, nil
}

// ListUsers returns paginated users for admin inspection
func (s *authService) ListUsers(ctx context.Context, page, limit int) ([]*model.UserResponse, int64, error) {
	users, total, err := s.userRepo.FindAll(ctx, page, limit)
	if err != nil {
		return nil, 0, err
	}

	var res []*model.UserResponse
	for _, u := range users {
		res = append(res, u.ToResponse())
	}

	return res, total, nil
}
