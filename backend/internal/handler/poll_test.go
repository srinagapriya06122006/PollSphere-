package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"guvi-backend/internal/config"
	"guvi-backend/internal/handler"
	"guvi-backend/internal/model"
	"guvi-backend/internal/service"
	ws "guvi-backend/internal/websocket"

	"github.com/gin-gonic/gin"
)

// MockPollService implements service.PollService
type MockPollService struct {
	CreatePollFunc          func(ctx context.Context, userID, userEmail string, req *model.CreatePollRequest, ip string) (*model.PollResponse, error)
	ClonePollFunc           func(ctx context.Context, userID, userEmail, pollID, ip string) (*model.PollResponse, error)
	GetPollByIDFunc         func(ctx context.Context, pollID string) (*model.PollResponse, error)
	ListPollsFunc           func(ctx context.Context, page, limit int, status string) (*model.PollListResponse, error)
	ListPollsWithFilterFunc func(ctx context.Context, filter model.PollFilter) (*model.PollListResponse, error)
	UpdatePollFunc          func(ctx context.Context, userID string, userRole model.UserRole, pollID string, req *model.UpdatePollRequest, ip string) (*model.PollResponse, error)
	DeletePollFunc          func(ctx context.Context, userID string, userRole model.UserRole, pollID string, ip string) error
	InvalidatePollCacheFunc func(ctx context.Context, pollID string)
}

func (m *MockPollService) CreatePoll(ctx context.Context, userID, userEmail string, req *model.CreatePollRequest, ip string) (*model.PollResponse, error) {
	if m.CreatePollFunc != nil {
		return m.CreatePollFunc(ctx, userID, userEmail, req, ip)
	}
	return nil, nil
}

func (m *MockPollService) ClonePoll(ctx context.Context, userID, userEmail, pollID, ip string) (*model.PollResponse, error) {
	if m.ClonePollFunc != nil {
		return m.ClonePollFunc(ctx, userID, userEmail, pollID, ip)
	}
	return nil, nil
}

func (m *MockPollService) GetPollByID(ctx context.Context, pollID string) (*model.PollResponse, error) {
	if m.GetPollByIDFunc != nil {
		return m.GetPollByIDFunc(ctx, pollID)
	}
	return nil, nil
}

func (m *MockPollService) ListPolls(ctx context.Context, page, limit int, status string) (*model.PollListResponse, error) {
	if m.ListPollsFunc != nil {
		return m.ListPollsFunc(ctx, page, limit, status)
	}
	return nil, nil
}

func (m *MockPollService) ListPollsWithFilter(ctx context.Context, filter model.PollFilter) (*model.PollListResponse, error) {
	if m.ListPollsWithFilterFunc != nil {
		return m.ListPollsWithFilterFunc(ctx, filter)
	}
	return nil, nil
}

func (m *MockPollService) UpdatePoll(ctx context.Context, userID string, userRole model.UserRole, pollID string, req *model.UpdatePollRequest, ip string) (*model.PollResponse, error) {
	if m.UpdatePollFunc != nil {
		return m.UpdatePollFunc(ctx, userID, userRole, pollID, req, ip)
	}
	return nil, nil
}

func (m *MockPollService) DeletePoll(ctx context.Context, userID string, userRole model.UserRole, pollID string, ip string) error {
	if m.DeletePollFunc != nil {
		return m.DeletePollFunc(ctx, userID, userRole, pollID, ip)
	}
	return nil
}

func (m *MockPollService) InvalidatePollCache(ctx context.Context, pollID string) {
	if m.InvalidatePollCacheFunc != nil {
		m.InvalidatePollCacheFunc(ctx, pollID)
	}
}

// MockVoteService implements service.VoteService
type MockVoteService struct {
	CastVoteFunc       func(ctx context.Context, userID, pollID string, req *model.CastVoteRequest, ip string) error
	GetPollResultsFunc func(ctx context.Context, pollID string, optionalUserID *string) (*model.PollResultsResponse, error)
}

func (m *MockVoteService) CastVote(ctx context.Context, userID, pollID string, req *model.CastVoteRequest, ip string) error {
	if m.CastVoteFunc != nil {
		return m.CastVoteFunc(ctx, userID, pollID, req, ip)
	}
	return nil
}

func (m *MockVoteService) GetPollResults(ctx context.Context, pollID string, optionalUserID *string) (*model.PollResultsResponse, error) {
	if m.GetPollResultsFunc != nil {
		return m.GetPollResultsFunc(ctx, pollID, optionalUserID)
	}
	return nil, nil
}

func (m *MockVoteService) SetHub(hub *ws.Hub) {}

func TestPollHandler_Create_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockPollSvc := &MockPollService{
		CreatePollFunc: func(ctx context.Context, userID, userEmail string, req *model.CreatePollRequest, ip string) (*model.PollResponse, error) {
			return &model.PollResponse{
				ID:          "66e85293f0b001a1a1a1a1b1",
				Question:    req.Question,
				CreatorID:   userID,
				CreatorName: userEmail,
				Status:      model.PollStatusActive,
				CreatedAt:   time.Now(),
			}, nil
		},
	}

	h := handler.NewPollHandler(mockPollSvc)
	r := gin.New()
	r.POST("/api/polls", func(c *gin.Context) {
		c.Set("userId", "66e85293f0b001a1a1a1a1a1")
		c.Set("userEmail", "creator@example.com")
		h.Create(c)
	})

	payload := model.CreatePollRequest{
		Question: "Which backend framework do you prefer?",
		Options:  []string{"Gin (Go)", "FastAPI (Python)", "Express (Node)"},
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest(http.MethodPost, "/api/polls", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected status 201 Created, got: %d, body: %s", w.Code, w.Body.String())
	}
}

func TestPollHandler_GetByID_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockPollSvc := &MockPollService{
		GetPollByIDFunc: func(ctx context.Context, pollID string) (*model.PollResponse, error) {
			return nil, service.ErrPollNotFound
		},
	}

	h := handler.NewPollHandler(mockPollSvc)
	r := gin.New()
	r.GET("/api/polls/:id", h.GetByID)

	req, _ := http.NewRequest(http.MethodGet, "/api/polls/66e85293f0b001a1a1a1a1b1", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("expected status 404 Not Found, got: %d", w.Code)
	}
}

func TestVoteHandler_CastVote_AlreadyVoted(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockVoteSvc := &MockVoteService{
		CastVoteFunc: func(ctx context.Context, userID, pollID string, req *model.CastVoteRequest, ip string) error {
			return service.ErrAlreadyVoted
		},
	}

	jwtSvc := service.NewJWTService(&config.Config{JWTSecret: "test-secret", JWTExpiryHours: time.Hour})
	h := handler.NewVoteHandler(mockVoteSvc, jwtSvc)
	r := gin.New()
	r.POST("/api/polls/:id/vote", func(c *gin.Context) {
		c.Set("userId", "66e85293f0b001a1a1a1a1a1")
		h.CastVote(c)
	})

	payload := model.CastVoteRequest{
		OptionID: "opt-1",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest(http.MethodPost, "/api/polls/66e85293f0b001a1a1a1a1b1/vote", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusConflict {
		t.Fatalf("expected status 409 Conflict for duplicate vote, got: %d", w.Code)
	}
}

func TestVoteHandler_CastVote_ClosedPoll(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockVoteSvc := &MockVoteService{
		CastVoteFunc: func(ctx context.Context, userID, pollID string, req *model.CastVoteRequest, ip string) error {
			return service.ErrPollClosed
		},
	}

	jwtSvc := service.NewJWTService(&config.Config{JWTSecret: "test-secret", JWTExpiryHours: time.Hour})
	h := handler.NewVoteHandler(mockVoteSvc, jwtSvc)
	r := gin.New()
	r.POST("/api/polls/:id/vote", func(c *gin.Context) {
		c.Set("userId", "66e85293f0b001a1a1a1a1a1")
		h.CastVote(c)
	})

	payload := model.CastVoteRequest{
		OptionID: "opt-1",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest(http.MethodPost, "/api/polls/66e85293f0b001a1a1a1a1b1/vote", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400 Bad Request for closed poll, got: %d", w.Code)
	}
}

func TestVoteHandler_GetResults_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockVoteSvc := &MockVoteService{
		GetPollResultsFunc: func(ctx context.Context, pollID string, optionalUserID *string) (*model.PollResultsResponse, error) {
			return &model.PollResultsResponse{
				PollID:     pollID,
				Question:   "Sample Question",
				Status:     model.PollStatusActive,
				TotalVotes: 10,
				Results: []model.OptionResult{
					{OptionID: "1", Text: "A", VoteCount: 7, Percentage: 70.0},
					{OptionID: "2", Text: "B", VoteCount: 3, Percentage: 30.0},
				},
			}, nil
		},
	}

	jwtSvc := service.NewJWTService(&config.Config{JWTSecret: "test-secret", JWTExpiryHours: time.Hour})
	h := handler.NewVoteHandler(mockVoteSvc, jwtSvc)
	r := gin.New()
	r.GET("/api/polls/:id/results", h.GetResults)

	req, _ := http.NewRequest(http.MethodGet, "/api/polls/66e85293f0b001a1a1a1a1b1/results", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got: %d", w.Code)
	}
}
