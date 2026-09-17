package service

import (
	"context"
	"errors"
	"fmt"
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
)

// AuthService defines the business logic contract for authentication
type AuthService interface {
	Register(ctx context.Context, req *model.RegisterRequest) (*model.UserResponse, error)
	Login(ctx context.Context, req *model.LoginRequest) (*model.AuthResponse, error)
	GetProfile(ctx context.Context, userID string) (*model.UserResponse, error)
}

type authService struct {
	userRepo   repository.UserRepository
	jwtService JWTService
}

// NewAuthService returns an instance of AuthService with injected repository and JWT service
func NewAuthService(userRepo repository.UserRepository, jwtService JWTService) AuthService {
	return &authService{
		userRepo:   userRepo,
		jwtService: jwtService,
	}
}

// Register validates user data, hashes the password, and creates the user record
func (s *authService) Register(ctx context.Context, req *model.RegisterRequest) (*model.UserResponse, error) {
	// Normalize email: trim whitespace and convert to lowercase
	normalizedEmail := strings.ToLower(strings.TrimSpace(req.Email))
	trimmedName := strings.TrimSpace(req.Name)

	if len(req.Password) < 6 {
		return nil, ErrPasswordTooShort
	}

	// Check if user already exists
	existingUser, err := s.userRepo.FindByEmail(ctx, normalizedEmail)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing user: %w", err)
	}
	if existingUser != nil {
		return nil, ErrEmailAlreadyExists
	}

	// Hash the password with bcrypt (DefaultCost = 10)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	newUser := &model.User{
		Name:     trimmedName,
		Email:    normalizedEmail,
		Password: string(hashedPassword),
	}

	if err := s.userRepo.Create(ctx, newUser); err != nil {
		return nil, fmt.Errorf("failed to save user: %w", err)
	}

	return newUser.ToResponse(), nil
}

// Login validates user credentials and returns a signed JWT token with user details
func (s *authService) Login(ctx context.Context, req *model.LoginRequest) (*model.AuthResponse, error) {
	normalizedEmail := strings.ToLower(strings.TrimSpace(req.Email))

	user, err := s.userRepo.FindByEmail(ctx, normalizedEmail)
	if err != nil {
		return nil, fmt.Errorf("failed to query user: %w", err)
	}
	if user == nil {
		return nil, ErrInvalidCredentials
	}

	// Compare plaintext password against the stored bcrypt hash
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	// Generate JWT
	token, err := s.jwtService.GenerateToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate authentication token: %w", err)
	}

	return &model.AuthResponse{
		Token: token,
		User:  user.ToResponse(),
	}, nil
}

// GetProfile fetches the user details by their ID
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
