package service

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"sort"
	"strings"

	"guvi-backend/internal/model"
	"guvi-backend/internal/repository"

	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"
)

var (
	gmailRegex             = regexp.MustCompile(`^[a-zA-Z0-9._]+@gmail\.com$`)
	ErrInvalidGmailAddress = errors.New("please enter a valid Gmail address (example: username@gmail.com)")
	ErrEmailAlreadyExists  = errors.New("a user with this email already exists")
	ErrInvalidCredentials  = errors.New("invalid email or password")
	ErrPasswordTooShort    = errors.New("password must be at least 6 characters")
	ErrUserNotFound        = errors.New("user not found")
	ErrWrongPassword       = errors.New("current password is incorrect")
)

// AuthService defines the business logic contract for authentication and user management
type AuthService interface {
	Register(ctx context.Context, req *model.RegisterRequest, ip string) (*model.UserResponse, error)
	Login(ctx context.Context, req *model.LoginRequest, ip string) (*model.AuthResponse, error)
	GoogleLogin(ctx context.Context, idToken string, ip string) (*model.AuthResponse, error)
	GetProfile(ctx context.Context, userID string) (*model.UserResponse, error)
	GetProfileWithStats(ctx context.Context, userID string) (*model.UserProfileResponse, error)
	UpdateProfile(ctx context.Context, userID string, req *model.UpdateProfileRequest) (*model.UserResponse, error)
	GetUserVoteHistory(ctx context.Context, userID string) ([]*model.UserVoteHistoryItem, error)
	GetActivityTimeline(ctx context.Context, userID string) ([]*model.ActivityTimelineItem, error)
	ListUsers(ctx context.Context, page, limit int) ([]*model.UserResponse, int64, error)
}

type authService struct {
	userRepo      repository.UserRepository
	pollRepo      repository.PollRepository
	voteRepo      repository.VoteRepository
	jwtService    JWTService
	auditService  AuditService
	googleService GoogleAuthService
}

// NewAuthService returns an instance of AuthService with injected dependencies
func NewAuthService(
	userRepo repository.UserRepository,
	pollRepo repository.PollRepository,
	voteRepo repository.VoteRepository,
	jwtService JWTService,
	auditService AuditService,
	googleService GoogleAuthService,
) AuthService {
	return &authService{
		userRepo:      userRepo,
		pollRepo:      pollRepo,
		voteRepo:      voteRepo,
		jwtService:    jwtService,
		auditService:  auditService,
		googleService: googleService,
	}
}

// Register validates user data, hashes password, creates user, and records audit event
func (s *authService) Register(ctx context.Context, req *model.RegisterRequest, ip string) (*model.UserResponse, error) {
	normalizedEmail := strings.ToLower(strings.TrimSpace(req.Email))
	trimmedName := strings.TrimSpace(req.Name)

	if !gmailRegex.MatchString(normalizedEmail) {
		return nil, ErrInvalidGmailAddress
	}

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

	if !gmailRegex.MatchString(normalizedEmail) {
		return nil, ErrInvalidGmailAddress
	}

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

// GoogleLogin verifies the Google ID token and logs in or creates the user
func (s *authService) GoogleLogin(ctx context.Context, idToken string, ip string) (*model.AuthResponse, error) {
	if s.googleService == nil {
		return nil, errors.New("Google authentication service is not configured")
	}

	payload, err := s.googleService.VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, fmt.Errorf("Google token verification failed: %w", err)
	}

	normalizedEmail := strings.ToLower(strings.TrimSpace(payload.Email))
	if normalizedEmail == "" || payload.Sub == "" {
		return nil, errors.New("incomplete Google user profile")
	}

	// 1. Check if user already exists with this Google ID
	user, err := s.userRepo.FindByGoogleID(ctx, payload.Sub)
	if err != nil {
		return nil, fmt.Errorf("failed to query user by Google ID: %w", err)
	}

	if user != nil {
		// Existing Google user: update profile picture or name if missing
		updated := false
		if user.ProfileImage == "" && payload.Picture != "" {
			user.ProfileImage = payload.Picture
			updated = true
		}
		if user.Name == "" && payload.Name != "" {
			user.Name = payload.Name
			updated = true
		}
		if updated {
			_ = s.userRepo.Update(ctx, user)
		}
	} else {
		// 2. Check if a user with this email exists (e.g. registered with password)
		existingByEmail, err := s.userRepo.FindByEmail(ctx, normalizedEmail)
		if err != nil {
			return nil, fmt.Errorf("failed to check existing email: %w", err)
		}

		if existingByEmail != nil {
			// Link existing account to Google
			user = existingByEmail
			user.GoogleID = payload.Sub
			if user.AuthProvider == "" || user.AuthProvider == "local" {
				user.AuthProvider = "google"
			}
			if user.ProfileImage == "" && payload.Picture != "" {
				user.ProfileImage = payload.Picture
			}
			if user.Name == "" && payload.Name != "" {
				user.Name = payload.Name
			}
			if err := s.userRepo.Update(ctx, user); err != nil {
				return nil, fmt.Errorf("failed to link Google account: %w", err)
			}
		} else {
			// 3. Create a brand new Google user
			name := strings.TrimSpace(payload.Name)
			if name == "" {
				parts := strings.Split(normalizedEmail, "@")
				name = parts[0]
			}

			newUser := &model.User{
				Name:         name,
				Email:        normalizedEmail,
				Role:         model.RoleUser,
				AuthProvider: "google",
				GoogleID:     payload.Sub,
				ProfileImage: payload.Picture,
			}

			if err := s.userRepo.Create(ctx, newUser); err != nil {
				return nil, fmt.Errorf("failed to create user with Google: %w", err)
			}
			user = newUser

			if s.auditService != nil {
				s.auditService.Log(ctx, &user.ID, user.Email, model.AuditActionUserRegister, "user", user.ID.Hex(), "New account registered via Google OAuth", ip)
			}
		}
	}

	// 4. Issue PollSphere standard JWT
	token, err := s.jwtService.GenerateToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate authentication token: %w", err)
	}

	if s.auditService != nil {
		s.auditService.Log(ctx, &user.ID, user.Email, model.AuditActionUserLogin, "user", user.ID.Hex(), "User logged in via Google OAuth", ip)
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
