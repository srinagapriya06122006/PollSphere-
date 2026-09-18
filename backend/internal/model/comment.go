package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// PollComment represents a discussion entry or user feedback on a poll
type PollComment struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	PollID    string             `bson:"poll_id" json:"pollId"`
	UserID    string             `bson:"user_id" json:"userId"`
	UserName  string             `bson:"user_name" json:"userName"`
	UserEmail string             `bson:"user_email" json:"userEmail"`
	Content   string             `bson:"content" json:"content"`
	CreatedAt time.Time          `bson:"created_at" json:"createdAt"`
}

// CreateCommentRequest payload for adding a comment
type CreateCommentRequest struct {
	Content string `json:"content" binding:"required,min=1,max=500"`
}
