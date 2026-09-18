package service

import (
	"errors"
	"fmt"
	"time"

	"guvi-backend/internal/config"
	"guvi-backend/internal/model"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidToken = errors.New("invalid authentication token")
	ErrExpiredToken = errors.New("authentication token has expired")
)

// CustomClaims defines the JWT claims structure including custom user fields and roles
type CustomClaims struct {
	UserID string         `json:"user_id"`
	Email  string         `json:"email"`
	Role   model.UserRole `json:"role"`
	jwt.RegisteredClaims
}

// JWTService handles generating and validating JSON Web Tokens
type JWTService interface {
	GenerateToken(user *model.User) (string, error)
	ValidateToken(tokenString string) (*CustomClaims, error)
}

type jwtService struct {
	secretKey      []byte
	expiryDuration time.Duration
}

// NewJWTService creates a new JWTService instance with injected configuration
func NewJWTService(cfg *config.Config) JWTService {
	return &jwtService{
		secretKey:      []byte(cfg.JWTSecret),
		expiryDuration: cfg.JWTExpiryHours,
	}
}

// GenerateToken creates a signed JWT token with user claims and expiration
func (s *jwtService) GenerateToken(user *model.User) (string, error) {
	now := time.Now().UTC()
	role := user.Role
	if role == "" {
		role = model.RoleUser
	}

	claims := CustomClaims{
		UserID: user.ID.Hex(),
		Email:  user.Email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(s.expiryDuration)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    "guvi-polling-app",
			Subject:   user.ID.Hex(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.secretKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken parses and verifies the signature and expiration of a JWT string
func (s *jwtService) ValidateToken(tokenString string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(t *jwt.Token) (interface{}, error) {
		// Ensure signing algorithm is HMAC
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.secretKey, nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrInvalidToken
}
