package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"guvi-backend/internal/config"
	"guvi-backend/internal/middleware"
	"guvi-backend/internal/model"
	"guvi-backend/internal/service"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func setupTestRouter(jwtSvc service.JWTService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	protected := r.Group("/api/protected")
	protected.Use(middleware.AuthMiddleware(jwtSvc))
	{
		protected.GET("/ping", func(c *gin.Context) {
			userID, _ := c.Get("userId")
			userEmail, _ := c.Get("userEmail")
			c.JSON(http.StatusOK, gin.H{
				"userId":    userID,
				"userEmail": userEmail,
			})
		})
	}

	return r
}

func TestAuthMiddleware_MissingHeader(t *testing.T) {
	cfg := &config.Config{JWTSecret: "supersecret", JWTExpiryHours: time.Hour}
	jwtSvc := service.NewJWTService(cfg)
	router := setupTestRouter(jwtSvc)

	req, _ := http.NewRequest(http.MethodGet, "/api/protected/ping", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401 Unauthorized, got: %d", w.Code)
	}
}

func TestAuthMiddleware_InvalidBearerFormat(t *testing.T) {
	cfg := &config.Config{JWTSecret: "supersecret", JWTExpiryHours: time.Hour}
	jwtSvc := service.NewJWTService(cfg)
	router := setupTestRouter(jwtSvc)

	req, _ := http.NewRequest(http.MethodGet, "/api/protected/ping", nil)
	req.Header.Set("Authorization", "Basic 123456")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401 for invalid Bearer format, got: %d", w.Code)
	}
}

func TestAuthMiddleware_InvalidToken(t *testing.T) {
	cfg := &config.Config{JWTSecret: "supersecret", JWTExpiryHours: time.Hour}
	jwtSvc := service.NewJWTService(cfg)
	router := setupTestRouter(jwtSvc)

	req, _ := http.NewRequest(http.MethodGet, "/api/protected/ping", nil)
	req.Header.Set("Authorization", "Bearer invalid.fake.token")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401 for invalid token, got: %d", w.Code)
	}
}

func TestAuthMiddleware_ValidToken(t *testing.T) {
	cfg := &config.Config{JWTSecret: "supersecret", JWTExpiryHours: time.Hour}
	jwtSvc := service.NewJWTService(cfg)
	router := setupTestRouter(jwtSvc)

	uid := bson.NewObjectID()
	user := &model.User{
		ID:    uid,
		Email: "alice@test.com",
	}

	token, err := jwtSvc.GenerateToken(user)
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	req, _ := http.NewRequest(http.MethodGet, "/api/protected/ping", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200 OK, got: %d", w.Code)
	}
}
