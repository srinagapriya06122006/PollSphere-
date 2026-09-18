package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// NotificationType categorizes user notifications
type NotificationType string

const (
	NotificationTypeVoteReceived NotificationType = "VOTE_RECEIVED"
	NotificationTypePollClosed   NotificationType = "POLL_CLOSED"
	NotificationTypePollExpired  NotificationType = "POLL_EXPIRE"
	NotificationTypePollDeleted  NotificationType = "POLL_DELETED"
	NotificationTypeSystem       NotificationType = "SYSTEM"
)

// Notification represents a persistent user notification in MongoDB
type Notification struct {
	ID        bson.ObjectID    `bson:"_id,omitempty" json:"id"`
	UserID    bson.ObjectID    `bson:"user_id" json:"userId"`
	Title     string           `bson:"title" json:"title"`
	Message   string           `bson:"message" json:"message"`
	Type      NotificationType `bson:"type" json:"type"`
	Link      string           `bson:"link,omitempty" json:"link,omitempty"`
	IsRead    bool             `bson:"is_read" json:"isRead"`
	CreatedAt time.Time        `bson:"created_at" json:"createdAt"`
}

// NotificationResponse represents client-facing notification DTO
type NotificationResponse struct {
	ID        string           `json:"id"`
	UserID    string           `json:"userId"`
	Title     string           `json:"title"`
	Message   string           `json:"message"`
	Type      NotificationType `json:"type"`
	Link      string           `json:"link,omitempty"`
	IsRead    bool             `json:"isRead"`
	CreatedAt time.Time        `json:"createdAt"`
}

// NotificationListResponse represents list of notifications and unread count
type NotificationListResponse struct {
	Notifications []*NotificationResponse `json:"notifications"`
	Total         int64                   `json:"total"`
	UnreadCount   int64                   `json:"unreadCount"`
}

// ToResponse converts Notification domain model into DTO
func (n *Notification) ToResponse() *NotificationResponse {
	return &NotificationResponse{
		ID:        n.ID.Hex(),
		UserID:    n.UserID.Hex(),
		Title:     n.Title,
		Message:   n.Message,
		Type:      n.Type,
		Link:      n.Link,
		IsRead:    n.IsRead,
		CreatedAt: n.CreatedAt,
	}
}
