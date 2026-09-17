package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// Vote represents a single vote cast by a user for a specific poll option
type Vote struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	PollID    bson.ObjectID `bson:"poll_id" json:"poll_id"`
	OptionID  string        `bson:"option_id" json:"option_id"`
	UserID    bson.ObjectID `bson:"user_id" json:"user_id"`
	CreatedAt time.Time     `bson:"created_at" json:"created_at"`
}

// CastVoteRequest represents the incoming payload to vote on a poll
type CastVoteRequest struct {
	OptionID string `json:"optionId" binding:"required"`
}

// OptionResult represents the vote count and calculated percentage for an option
type OptionResult struct {
	OptionID   string  `json:"optionId"`
	Text       string  `json:"text"`
	VoteCount  int64   `json:"voteCount"`
	Percentage float64 `json:"percentage"`
}

// PollResultsResponse represents the aggregated voting statistics for a poll
type PollResultsResponse struct {
	PollID            string         `json:"pollId"`
	Question          string         `json:"question"`
	Status            PollStatus     `json:"status"`
	TotalVotes        int64          `json:"totalVotes"`
	Results           []OptionResult `json:"results"`
	UserVotedOptionID *string        `json:"userVotedOptionId,omitempty"`
}
