package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"guvi-backend/internal/handler"
	"guvi-backend/internal/model"
	"guvi-backend/internal/service"

	"github.com/gin-gonic/gin"
)

// MockAuthService implements service.AuthService for handler unit tests
type MockAuthService struct {
	RegisterFunc            func(ctx context.Context, req *model.RegisterRequest, ip string) (*model.UserResponse, error)
	LoginFunc               func(ctx context.Context, req *model.LoginRequest, ip string) (*model.AuthResponse, error)
	GoogleLoginFunc         func(ctx context.Context, idToken string, ip string) (*model.AuthResponse, error)
	GetProfileFunc          func(ctx context.Context, userID string) (*model.UserResponse, error)
	GetProfileWithStatsFunc func(ctx context.Context, userID string) (*model.UserProfileResponse, error)
	UpdateProfileFunc       func(ctx context.Context, userID string, req *model.UpdateProfileRequest) (*model.UserResponse, error)
	GetUserVoteHistoryFunc  func(ctx context.Context, userID string) ([]*model.UserVoteHistoryItem, error)
	GetActivityTimelineFunc func(ctx context.Context, userID string) ([]*model.ActivityTimelineItem, error)
	ListUsersFunc           func(ctx context.Context, page, limit int) ([]*model.UserResponse, int64, error)
}

func (m *MockAuthService) Register(ctx context.Context, req *model.RegisterRequest, ip string) (*model.UserResponse, error) {
	if m.RegisterFunc != nil {
		return m.RegisterFunc(ctx, req, ip)
	}
	return nil, nil
}

func (m *MockAuthService) Login(ctx context.Context, req *model.LoginRequest, ip string) (*model.AuthResponse, error) {
	if m.LoginFunc != nil {
		return m.LoginFunc(ctx, req, ip)
	}
	return nil, nil
}

func (m *MockAuthService) GoogleLogin(ctx context.Context, idToken string, ip string) (*model.AuthResponse, error) {
	if m.GoogleLoginFunc != nil {
		return m.GoogleLoginFunc(ctx, idToken, ip)
	}
	return nil, nil
}

func (m *MockAuthService) GetProfile(ctx context.Context, userID string) (*model.UserResponse, error) {
	if m.GetProfileFunc != nil {
		return m.GetProfileFunc(ctx, userID)
	}
	return nil, nil
}

func (m *MockAuthService) GetProfileWithStats(ctx context.Context, userID string) (*model.UserProfileResponse, error) {
	if m.GetProfileWithStatsFunc != nil {
		return m.GetProfileWithStatsFunc(ctx, userID)
	}
	return nil, nil
}

func (m *MockAuthService) UpdateProfile(ctx context.Context, userID string, req *model.UpdateProfileRequest) (*model.UserResponse, error) {
	if m.UpdateProfileFunc != nil {
		return m.UpdateProfileFunc(ctx, userID, req)
	}
	return nil, nil
}

func (m *MockAuthService) GetUserVoteHistory(ctx context.Context, userID string) ([]*model.UserVoteHistoryItem, error) {
	if m.GetUserVoteHistoryFunc != nil {
		return m.GetUserVoteHistoryFunc(ctx, userID)
	}
	return nil, nil
}

func (m *MockAuthService) GetActivityTimeline(ctx context.Context, userID string) ([]*model.ActivityTimelineItem, error) {
	if m.GetActivityTimelineFunc != nil {
		return m.GetActivityTimelineFunc(ctx, userID)
	}
	return nil, nil
}

func (m *MockAuthService) ListUsers(ctx context.Context, page, limit int) ([]*model.UserResponse, int64, error) {
	if m.ListUsersFunc != nil {
		return m.ListUsersFunc(ctx, page, limit)
	}
	return nil, 0, nil
}

func TestAuthHandler_Register_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockSvc := &MockAuthService{
		RegisterFunc: func(ctx context.Context, req *model.RegisterRequest, ip string) (*model.UserResponse, error) {
			return &model.UserResponse{
				ID:        "66e85293f0b001a1a1a1a1a1",
				Name:      req.Name,
				Email:     req.Email,
				CreatedAt: time.Now(),
			}, nil
		},
	}

	h := handler.NewAuthHandler(mockSvc)
	r := gin.New()
	r.POST("/api/auth/register", h.Register)

	payload := model.RegisterRequest{
		Name:     "Test User",
		Email:    "test@example.com",
		Password: "password123",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest(http.MethodPost, "/api/auth/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected status 201 Created, got: %d, body: %s", w.Code, w.Body.String())
	}
}

func TestAuthHandler_Register_DuplicateEmail(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockSvc := &MockAuthService{
		RegisterFunc: func(ctx context.Context, req *model.RegisterRequest, ip string) (*model.UserResponse, error) {
			return nil, service.ErrEmailAlreadyExists
		},
	}

	h := handler.NewAuthHandler(mockSvc)
	r := gin.New()
	r.POST("/api/auth/register", h.Register)

	payload := model.RegisterRequest{
		Name:     "Duplicate User",
		Email:    "existing@example.com",
		Password: "password123",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest(http.MethodPost, "/api/auth/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusConflict {
		t.Fatalf("expected status 409 Conflict, got: %d", w.Code)
	}
}

func TestAuthHandler_Login_InvalidCredentials(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockSvc := &MockAuthService{
		LoginFunc: func(ctx context.Context, req *model.LoginRequest, ip string) (*model.AuthResponse, error) {
			return nil, service.ErrInvalidCredentials
		},
	}

	h := handler.NewAuthHandler(mockSvc)
	r := gin.New()
	r.POST("/api/auth/login", h.Login)

	payload := model.LoginRequest{
		Email:    "user@example.com",
		Password: "wrongpassword",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected status 401 Unauthorized, got: %d", w.Code)
	}
}

func TestAuthHandler_Login_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockSvc := &MockAuthService{
		LoginFunc: func(ctx context.Context, req *model.LoginRequest, ip string) (*model.AuthResponse, error) {
			return &model.AuthResponse{
				Token: "jwt-token-xyz",
				User: &model.UserResponse{
					ID:    "66e85293f0b001a1a1a1a1a1",
					Name:  "Logged In User",
					Email: req.Email,
				},
			}, nil
		},
	}

	h := handler.NewAuthHandler(mockSvc)
	r := gin.New()
	r.POST("/api/auth/login", h.Login)

	payload := model.LoginRequest{
		Email:    "user@example.com",
		Password: "password123",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got: %d", w.Code)
	}
}

func TestAuthHandler_Me_Unauthenticated(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockSvc := &MockAuthService{}

	h := handler.NewAuthHandler(mockSvc)
	r := gin.New()
	r.GET("/api/auth/me", h.Me)

	req, _ := http.NewRequest(http.MethodGet, "/api/auth/me", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected status 401 Unauthorized, got: %d", w.Code)
	}
}

func TestAuthHandler_GoogleLogin_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockSvc := &MockAuthService{
		GoogleLoginFunc: func(ctx context.Context, idToken string, ip string) (*model.AuthResponse, error) {
			return &model.AuthResponse{
				Token: "google-jwt-token-xyz",
				User: &model.UserResponse{
					ID:           "66e85293f0b001a1a1a1a1a1",
					Name:         "Google User",
					Email:        "googleuser@gmail.com",
					AuthProvider: "google",
				},
			}, nil
		},
	}

	h := handler.NewAuthHandler(mockSvc)
	r := gin.New()
	r.POST("/api/auth/google", h.GoogleLogin)

	payload := model.GoogleAuthRequest{
		IDToken: "valid-google-id-token-abc",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest(http.MethodPost, "/api/auth/google", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got: %d", w.Code)
	}

	var resp struct {
		Message string              `json:"message"`
		Data    *model.AuthResponse `json:"data"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Data == nil || resp.Data.Token != "google-jwt-token-xyz" {
		t.Fatalf("expected token google-jwt-token-xyz, got %+v", resp.Data)
	}
	if resp.Data.User.AuthProvider != "google" {
		t.Errorf("expected auth provider google, got %s", resp.Data.User.AuthProvider)
	}
}
