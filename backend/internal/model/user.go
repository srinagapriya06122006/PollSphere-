package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// UserRole defines access level
type UserRole string

const (
	RoleUser  UserRole = "user"
	RoleAdmin UserRole = "admin"
)

// User represents the user domain model stored in MongoDB
type User struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Name         string        `bson:"name" json:"name"`
	Email        string        `bson:"email" json:"email"`
	Password     string        `bson:"password,omitempty" json:"-"` // Never exposed in JSON serialization, optional for OAuth users
	Role         UserRole      `bson:"role" json:"role"`
	AuthProvider string        `bson:"auth_provider,omitempty" json:"auth_provider,omitempty"` // "local", "google"
	GoogleID     string        `bson:"google_id,omitempty" json:"google_id,omitempty"`
	ProfileImage string        `bson:"profile_image,omitempty" json:"profile_image,omitempty"`
	CreatedAt    time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time     `bson:"updated_at" json:"updated_at"`
}

// RegisterRequest represents the incoming registration payload
type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6,max=100"`
	Role     string `json:"role,omitempty"`
}

// LoginRequest represents the incoming login credentials payload
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// GoogleAuthRequest represents the Google Sign-In verification payload
type GoogleAuthRequest struct {
	IDToken string `json:"idToken" binding:"required"`
}

// UpdateProfileRequest represents profile and password changes
type UpdateProfileRequest struct {
	Name            *string `json:"name,omitempty" binding:"omitempty,min=2,max=50"`
	CurrentPassword *string `json:"current_password,omitempty" binding:"omitempty,min=6,max=100"`
	NewPassword     *string `json:"new_password,omitempty" binding:"omitempty,min=6,max=100"`
}

// UserResponse represents the safe public user representation
type UserResponse struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	Role         UserRole  `json:"role"`
	AuthProvider string    `json:"auth_provider,omitempty"`
	ProfileImage string    `json:"profile_image,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

// UserProfileStats contains aggregated activity metrics for the user profile
type UserProfileStats struct {
	PollsCreated  int64 `json:"pollsCreated"`
	VotesCast     int64 `json:"votesCast"`
	VotesReceived int64 `json:"votesReceived"`
}

// UserProfileResponse contains user info and activity statistics
type UserProfileResponse struct {
	User  *UserResponse     `json:"user"`
	Stats *UserProfileStats `json:"stats"`
}

// ActivityTimelineItem represents an activity item for the user profile timeline
type ActivityTimelineItem struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"` // "POLL_CREATED", "VOTE_CAST", "POLL_CLOSED"
	Title       string    `json:"title"`
	Description string    `json:"description"`
	PollID      string    `json:"pollId,omitempty"`
	Timestamp   time.Time `json:"timestamp"`
}

// AuthResponse represents the login response returning the JWT and safe user information
type AuthResponse struct {
	Token string        `json:"token"`
	User  *UserResponse `json:"user"`
}

// ToResponse converts a User domain model into a safe UserResponse DTO
func (u *User) ToResponse() *UserResponse {
	role := u.Role
	if role == "" {
		role = RoleUser
	}
	return &UserResponse{
		ID:           u.ID.Hex(),
		Name:         u.Name,
		Email:        u.Email,
		Role:         role,
		AuthProvider: u.AuthProvider,
		ProfileImage: u.ProfileImage,
		CreatedAt:    u.CreatedAt,
	}
}
