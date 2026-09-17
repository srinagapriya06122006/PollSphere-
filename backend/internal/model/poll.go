package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// PollStatus defines the lifecycle state of a poll
type PollStatus string

const (
	PollStatusActive PollStatus = "active"
	PollStatusClosed PollStatus = "closed"
)

// PollOption represents a single selectable choice within a poll
type PollOption struct {
	ID   string `bson:"id" json:"id"`
	Text string `bson:"text" json:"text"`
}

// Poll represents the poll entity stored in MongoDB
type Poll struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Question    string        `bson:"question" json:"question"`
	Options     []PollOption  `bson:"options" json:"options"`
	CreatorID   bson.ObjectID `bson:"creator_id" json:"creator_id"`
	CreatorName string        `bson:"creator_name" json:"creator_name"`
	Status      PollStatus    `bson:"status" json:"status"`
	ExpiresAt   *time.Time    `bson:"expires_at,omitempty" json:"expires_at,omitempty"`
	CreatedAt   time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time     `bson:"updated_at" json:"updated_at"`
}

// CreatePollRequest represents the incoming payload to create a new poll
type CreatePollRequest struct {
	Question  string     `json:"question" binding:"required,min=5,max=300"`
	Options   []string   `json:"options" binding:"required,min=2,max=10,dive,required,min=1,max=100"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
}

// UpdatePollRequest represents fields that an owner can update
type UpdatePollRequest struct {
	Question *string     `json:"question,omitempty" binding:"omitempty,min=5,max=300"`
	Status   *PollStatus `json:"status,omitempty" binding:"omitempty,oneof=active closed"`
}

// PollResponse represents the serialized public poll structure
type PollResponse struct {
	ID          string       `json:"id"`
	Question    string       `json:"question"`
	Options     []PollOption `json:"options"`
	CreatorID   string       `json:"creator_id"`
	CreatorName string       `json:"creator_name"`
	Status      PollStatus   `json:"status"`
	ExpiresAt   *time.Time   `json:"expires_at,omitempty"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

// PollListResponse represents a paginated list of polls
type PollListResponse struct {
	Polls      []*PollResponse `json:"polls"`
	Total      int64           `json:"total"`
	Page       int             `json:"page"`
	Limit      int             `json:"limit"`
	TotalPages int             `json:"total_pages"`
}

// ToResponse converts a Poll domain entity into a PollResponse DTO
func (p *Poll) ToResponse() *PollResponse {
	return &PollResponse{
		ID:          p.ID.Hex(),
		Question:    p.Question,
		Options:     p.Options,
		CreatorID:   p.CreatorID.Hex(),
		CreatorName: p.CreatorName,
		Status:      p.Status,
		ExpiresAt:   p.ExpiresAt,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}
