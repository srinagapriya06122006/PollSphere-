package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"guvi-backend/internal/config"
)

var (
	ErrInvalidGoogleToken   = errors.New("invalid or expired Google token")
	ErrGoogleAudienceMismatch = errors.New("google token audience mismatch")
	ErrGoogleEmailNotVerified = errors.New("google email is not verified")
)

// GoogleTokenPayload holds the verified claims returned by Google's tokeninfo endpoint
type GoogleTokenPayload struct {
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified any    `json:"email_verified"` // Can be boolean or string from tokeninfo
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	Aud           string `json:"aud"`
	Iss           string `json:"iss"`
	Exp           any    `json:"exp"`
	Error         string `json:"error,omitempty"`
	ErrorDesc     string `json:"error_description,omitempty"`
}

// GoogleAuthService handles Google ID token verification
type GoogleAuthService interface {
	VerifyIDToken(ctx context.Context, idToken string) (*GoogleTokenPayload, error)
}

type googleAuthService struct {
	clientID   string
	httpClient *http.Client
}

// NewGoogleAuthService initializes a new GoogleAuthService instance
func NewGoogleAuthService(cfg *config.Config) GoogleAuthService {
	return &googleAuthService{
		clientID: cfg.GoogleClientID,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// VerifyIDToken contacts Google's tokeninfo endpoint and validates audience, issuer, expiry, and verification status
func (s *googleAuthService) VerifyIDToken(ctx context.Context, idToken string) (*GoogleTokenPayload, error) {
	trimmedToken := strings.TrimSpace(idToken)
	if trimmedToken == "" {
		return nil, errors.New("id token is required")
	}

	url := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", trimmedToken)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to build token verification request: %w", err)
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to contact Google token verification endpoint: %w", err)
	}
	defer resp.Body.Close()

	var payload GoogleTokenPayload
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("failed to parse Google token response: %w", err)
	}

	if resp.StatusCode != http.StatusOK || payload.Error != "" {
		return nil, fmt.Errorf("%w: %s", ErrInvalidGoogleToken, payload.ErrorDesc)
	}

	// 1. Verify Audience
	if s.clientID != "" && payload.Aud != s.clientID {
		return nil, fmt.Errorf("%w: expected %s, got %s", ErrGoogleAudienceMismatch, s.clientID, payload.Aud)
	}

	// 2. Verify Issuer
	if payload.Iss != "accounts.google.com" && payload.Iss != "https://accounts.google.com" {
		return nil, fmt.Errorf("%w: unexpected issuer %s", ErrInvalidGoogleToken, payload.Iss)
	}

	// 3. Verify Expiry if provided as unix timestamp
	if payload.Exp != nil {
		var expUnix int64
		switch v := payload.Exp.(type) {
		case float64:
			expUnix = int64(v)
		case string:
			expUnix, _ = strconv.ParseInt(v, 10, 64)
		}
		if expUnix > 0 && time.Now().Unix() > expUnix {
			return nil, fmt.Errorf("%w: token expired", ErrInvalidGoogleToken)
		}
	}

	// 4. Verify Email is verified
	isVerified := false
	switch v := payload.EmailVerified.(type) {
	case bool:
		isVerified = v
	case string:
		isVerified = strings.ToLower(v) == "true"
	}
	if !isVerified {
		return nil, ErrGoogleEmailNotVerified
	}

	if payload.Email == "" || payload.Sub == "" {
		return nil, fmt.Errorf("%w: missing required user fields", ErrInvalidGoogleToken)
	}

	return &payload, nil
}
