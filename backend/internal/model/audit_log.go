package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// AuditAction defines the operation performed
type AuditAction string

const (
	AuditActionUserRegister AuditAction = "USER_REGISTER"
	AuditActionUserLogin    AuditAction = "USER_LOGIN"
	AuditActionPollCreate   AuditAction = "POLL_CREATE"
	AuditActionPollUpdate   AuditAction = "POLL_UPDATE"
	AuditActionPollDelete   AuditAction = "POLL_DELETE"
	AuditActionPollClose    AuditAction = "POLL_CLOSE"
	AuditActionPollExpire   AuditAction = "POLL_EXPIRE"
	AuditActionVoteCast     AuditAction = "VOTE_CAST"
)

// AuditLog represents a single audit event entry in MongoDB
type AuditLog struct {
	ID         bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	UserID     *bson.ObjectID `bson:"user_id,omitempty" json:"userId,omitempty"`
	UserEmail  string         `bson:"user_email" json:"userEmail"`
	Action     AuditAction    `bson:"action" json:"action"`
	EntityType string         `bson:"entity_type" json:"entityType"`
	EntityID   string         `bson:"entity_id" json:"entityId"`
	Details    string         `bson:"details,omitempty" json:"details,omitempty"`
	IPAddress  string         `bson:"ip_address,omitempty" json:"ipAddress,omitempty"`
	CreatedAt  time.Time      `bson:"created_at" json:"createdAt"`
}

// AuditLogResponse represents the client-facing audit log format
type AuditLogResponse struct {
	ID         string      `json:"id"`
	UserID     string      `json:"userId,omitempty"`
	UserEmail  string      `json:"userEmail"`
	Action     AuditAction `json:"action"`
	EntityType string      `json:"entityType"`
	EntityID   string      `json:"entityId"`
	Details    string      `json:"details,omitempty"`
	IPAddress  string      `json:"ipAddress,omitempty"`
	CreatedAt  time.Time   `json:"createdAt"`
}

// ToResponse converts domain AuditLog to DTO
func (a *AuditLog) ToResponse() *AuditLogResponse {
	userIDStr := ""
	if a.UserID != nil {
		userIDStr = a.UserID.Hex()
	}
	return &AuditLogResponse{
		ID:         a.ID.Hex(),
		UserID:     userIDStr,
		UserEmail:  a.UserEmail,
		Action:     a.Action,
		EntityType: a.EntityType,
		EntityID:   a.EntityID,
		Details:    a.Details,
		IPAddress:  a.IPAddress,
		CreatedAt:  a.CreatedAt,
	}
}

// AuditLogListResponse represents a paginated list of audit logs
type AuditLogListResponse struct {
	Logs       []*AuditLogResponse `json:"logs"`
	Total      int64               `json:"total"`
	Page       int                 `json:"page"`
	Limit      int                 `json:"limit"`
	TotalPages int                 `json:"totalPages"`
}
