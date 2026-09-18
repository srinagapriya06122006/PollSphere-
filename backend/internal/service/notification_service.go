package service

import (
	"context"
	"log/slog"

	"guvi-backend/internal/model"
	"guvi-backend/internal/repository"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// NotificationService defines business logic for user notifications
type NotificationService interface {
	SendNotification(ctx context.Context, userID bson.ObjectID, title, message string, notifType model.NotificationType, link string)
	GetUserNotifications(ctx context.Context, userID string, limit int) (*model.NotificationListResponse, error)
	MarkAsRead(ctx context.Context, notifID, userID string) error
	MarkAllAsRead(ctx context.Context, userID string) error
	DeleteNotification(ctx context.Context, notifID, userID string) error
}

type notificationService struct {
	repo repository.NotificationRepository
}

// NewNotificationService creates a new NotificationService instance
func NewNotificationService(repo repository.NotificationRepository) NotificationService {
	return &notificationService{repo: repo}
}

// SendNotification stores notification asynchronously
func (s *notificationService) SendNotification(ctx context.Context, userID bson.ObjectID, title, message string, notifType model.NotificationType, link string) {
	go func() {
		bgCtx := context.Background()
		notif := &model.Notification{
			UserID:  userID,
			Title:   title,
			Message: message,
			Type:    notifType,
			Link:    link,
			IsRead:  false,
		}

		if err := s.repo.Create(bgCtx, notif); err != nil {
			slog.Error("Failed to persist notification", "error", err, "userId", userID.Hex(), "title", title)
		}
	}()
}

// GetUserNotifications returns user notifications and unread count
func (s *notificationService) GetUserNotifications(ctx context.Context, userID string, limit int) (*model.NotificationListResponse, error) {
	oid, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}

	list, total, err := s.repo.FindByUser(ctx, oid, limit)
	if err != nil {
		return nil, err
	}

	unread, _ := s.repo.CountUnread(ctx, oid)

	var dtos []*model.NotificationResponse
	for _, n := range list {
		dtos = append(dtos, n.ToResponse())
	}

	return &model.NotificationListResponse{
		Notifications: dtos,
		Total:         total,
		UnreadCount:   unread,
	}, nil
}

// MarkAsRead marks a notification as read
func (s *notificationService) MarkAsRead(ctx context.Context, notifID, userID string) error {
	nOID, err := bson.ObjectIDFromHex(notifID)
	if err != nil {
		return err
	}
	uOID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	return s.repo.MarkAsRead(ctx, nOID, uOID)
}

// MarkAllAsRead marks all unread notifications of a user as read
func (s *notificationService) MarkAllAsRead(ctx context.Context, userID string) error {
	uOID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	return s.repo.MarkAllAsRead(ctx, uOID)
}

// DeleteNotification deletes a notification
func (s *notificationService) DeleteNotification(ctx context.Context, notifID, userID string) error {
	nOID, err := bson.ObjectIDFromHex(notifID)
	if err != nil {
		return err
	}
	uOID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	return s.repo.Delete(ctx, nOID, uOID)
}
