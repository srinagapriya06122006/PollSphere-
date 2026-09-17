package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// User represents the user domain model stored in MongoDB
type User struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string        `bson:"name" json:"name"`
	Email     string        `bson:"email" json:"email"`
	Password  string        `bson:"password" json:"-"` // Never exposed in JSON serialization
	CreatedAt time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time     `bson:"updated_at" json:"updated_at"`
}

// RegisterRequest represents the incoming registration payload
type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6,max=100"`
}

// LoginRequest represents the incoming login credentials payload
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// UserResponse represents the safe public user representation
type UserResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// AuthResponse represents the login response returning the JWT and safe user information
type AuthResponse struct {
	Token string        `json:"token"`
	User  *UserResponse `json:"user"`
}

// ToResponse converts a User domain model into a safe UserResponse DTO
func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		ID:        u.ID.Hex(),
		Name:      u.Name,
		Email:     u.Email,
		CreatedAt: u.CreatedAt,
	}
}
