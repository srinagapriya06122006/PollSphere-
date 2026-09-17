package model_test

import (
	"encoding/json"
	"strings"
	"testing"
	"time"

	"guvi-backend/internal/model"

	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestUser_ToResponse_HidesPassword(t *testing.T) {
	id := bson.NewObjectID()
	now := time.Now().UTC()

	user := &model.User{
		ID:        id,
		Name:      "Secure User",
		Email:     "secure@test.com",
		Password:  "$2a$10$verysecretpasswordhashthatshouldneverleak",
		CreatedAt: now,
		UpdatedAt: now,
	}

	res := user.ToResponse()

	if res.ID != id.Hex() {
		t.Errorf("expected hex ID %s, got %s", id.Hex(), res.ID)
	}
	if res.Email != "secure@test.com" {
		t.Errorf("expected email secure@test.com, got %s", res.Email)
	}
	if res.Name != "Secure User" {
		t.Errorf("expected name Secure User, got %s", res.Name)
	}

	// JSON Marshalling check: ensure password is not in serialized JSON
	jsonData, err := json.Marshal(res)
	if err != nil {
		t.Fatalf("failed to marshal UserResponse: %v", err)
	}

	jsonStr := string(jsonData)
	if strings.Contains(jsonStr, "password") || strings.Contains(jsonStr, "verysecretpasswordhash") {
		t.Errorf("security issue: serialized UserResponse leaked password field: %s", jsonStr)
	}
}
