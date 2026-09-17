package service_test

import (
	"testing"
	"time"

	"guvi-backend/internal/config"
	"guvi-backend/internal/model"
	"guvi-backend/internal/service"

	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestJWTService_GenerateAndValidateToken(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:      "test-secret-key-for-unit-testing-only-12345",
		JWTExpiryHours: 2 * time.Hour,
	}

	jwtSvc := service.NewJWTService(cfg)
	userID := bson.NewObjectID()
	user := &model.User{
		ID:    userID,
		Name:  "Test User",
		Email: "test@example.com",
	}

	// 1. Generate Token
	tokenString, err := jwtSvc.GenerateToken(user)
	if err != nil {
		t.Fatalf("expected no error generating token, got: %v", err)
	}
	if tokenString == "" {
		t.Fatalf("expected non-empty token string")
	}

	// 2. Validate Token
	claims, err := jwtSvc.ValidateToken(tokenString)
	if err != nil {
		t.Fatalf("expected token to be valid, got error: %v", err)
	}

	if claims.UserID != userID.Hex() {
		t.Errorf("expected user_id %s, got %s", userID.Hex(), claims.UserID)
	}
	if claims.Email != "test@example.com" {
		t.Errorf("expected email test@example.com, got %s", claims.Email)
	}
}

func TestJWTService_InvalidTokenSignature(t *testing.T) {
	cfg1 := &config.Config{
		JWTSecret:      "secret-key-one",
		JWTExpiryHours: 1 * time.Hour,
	}
	cfg2 := &config.Config{
		JWTSecret:      "secret-key-two-different",
		JWTExpiryHours: 1 * time.Hour,
	}

	jwtSvc1 := service.NewJWTService(cfg1)
	jwtSvc2 := service.NewJWTService(cfg2)

	user := &model.User{
		ID:    bson.NewObjectID(),
		Email: "hacker@example.com",
	}

	tokenString, err := jwtSvc1.GenerateToken(user)
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	// Validate using a different secret key
	_, err = jwtSvc2.ValidateToken(tokenString)
	if err == nil {
		t.Fatalf("expected error when validating with wrong secret, got nil")
	}
}

func TestJWTService_ExpiredToken(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:      "test-secret-key",
		JWTExpiryHours: -1 * time.Hour, // Expired in the past
	}

	jwtSvc := service.NewJWTService(cfg)
	user := &model.User{
		ID:    bson.NewObjectID(),
		Email: "expired@example.com",
	}

	tokenString, err := jwtSvc.GenerateToken(user)
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	_, err = jwtSvc.ValidateToken(tokenString)
	if err == nil {
		t.Fatalf("expected error for expired token, got nil")
	}
}

func TestJWTService_MalformedToken(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:      "test-secret-key",
		JWTExpiryHours: 1 * time.Hour,
	}

	jwtSvc := service.NewJWTService(cfg)

	invalidTokens := []string{
		"",
		"not-a-valid-jwt",
		"header.payload",
		"a.b.c.d",
	}

	for _, tok := range invalidTokens {
		_, err := jwtSvc.ValidateToken(tok)
		if err == nil {
			t.Errorf("expected error for malformed token '%s', got nil", tok)
		}
	}
}
