package service

import (
	"context"
	"log/slog"

	"guvi-backend/internal/model"
	"guvi-backend/internal/repository"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// AuditService defines audit recording and querying operations
type AuditService interface {
	Log(ctx context.Context, userID *bson.ObjectID, email string, action model.AuditAction, entityType, entityID, details, ip string)
	List(ctx context.Context, page, limit int, action string) (*model.AuditLogListResponse, error)
}

type auditService struct {
	repo repository.AuditRepository
}

// NewAuditService creates a new AuditService
func NewAuditService(repo repository.AuditRepository) AuditService {
	return &auditService{repo: repo}
}

// Log records an audit entry asynchronously to avoid blocking user workflows
func (s *auditService) Log(ctx context.Context, userID *bson.ObjectID, email string, action model.AuditAction, entityType, entityID, details, ip string) {
	go func() {
		bgCtx := context.Background()
		entry := &model.AuditLog{
			UserID:     userID,
			UserEmail:  email,
			Action:     action,
			EntityType: entityType,
			EntityID:   entityID,
			Details:    details,
			IPAddress:  ip,
		}

		if err := s.repo.Log(bgCtx, entry); err != nil {
			slog.Error("Failed to record audit log", "error", err, "action", action, "entityId", entityID)
		}
	}()
}

// List returns paginated audit events
func (s *auditService) List(ctx context.Context, page, limit int, action string) (*model.AuditLogListResponse, error) {
	logs, total, err := s.repo.List(ctx, page, limit, action)
	if err != nil {
		return nil, err
	}

	totalPages := 0
	if limit > 0 {
		totalPages = int((total + int64(limit) - 1) / int64(limit))
	}

	var responseLogs []*model.AuditLogResponse
	for _, l := range logs {
		responseLogs = append(responseLogs, l.ToResponse())
	}

	return &model.AuditLogListResponse{
		Logs:       responseLogs,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}
