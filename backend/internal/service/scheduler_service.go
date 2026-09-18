package service

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"guvi-backend/internal/model"
	"guvi-backend/internal/repository"
	ws "guvi-backend/internal/websocket"
)

// SchedulerService manages background jobs like poll expiration
type SchedulerService interface {
	Start(ctx context.Context)
}

type schedulerService struct {
	pollRepo     repository.PollRepository
	pollService  PollService
	auditService AuditService
	notifService NotificationService
	hub          *ws.Hub
	interval     time.Duration
}

// NewSchedulerService creates a new SchedulerService instance
func NewSchedulerService(
	pollRepo repository.PollRepository,
	pollService PollService,
	auditService AuditService,
	notifService NotificationService,
	hub *ws.Hub,
	interval time.Duration,
) SchedulerService {
	if interval <= 0 {
		interval = 15 * time.Second
	}
	return &schedulerService{
		pollRepo:     pollRepo,
		pollService:  pollService,
		auditService: auditService,
		notifService: notifService,
		hub:          hub,
		interval:     interval,
	}
}

// Start begins the cron ticker loop in a background goroutine
func (s *schedulerService) Start(ctx context.Context) {
	go func() {
		slog.Info("Poll Expiry Scheduler started", "interval", s.interval.String())
		ticker := time.NewTicker(s.interval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				slog.Info("Poll Expiry Scheduler stopping")
				return
			case <-ticker.C:
				s.checkAndCloseExpiredPolls(ctx)
			}
		}
	}()
}

func (s *schedulerService) checkAndCloseExpiredPolls(ctx context.Context) {
	expiredPolls, err := s.pollRepo.CloseExpiredPolls(ctx)
	if err != nil {
		slog.Error("Scheduler error closing expired polls", "error", err)
		return
	}

	if len(expiredPolls) == 0 {
		return
	}

	slog.Info("Scheduler closed expired polls", "count", len(expiredPolls))

	for _, p := range expiredPolls {
		pollID := p.ID.Hex()

		// Invalidate cache
		s.pollService.InvalidatePollCache(ctx, pollID)

		// Record audit log
		s.auditService.Log(ctx, nil, "system@scheduler.internal", model.AuditActionPollExpire, "poll", pollID, "Automatically closed upon reaching expiry time", "127.0.0.1")

		// Send persistent notification to creator
		if s.notifService != nil {
			s.notifService.SendNotification(
				ctx,
				p.CreatorID,
				"Poll Closed (Expired)",
				fmt.Sprintf("Your poll \"%s\" reached its scheduled expiration time and is now closed.", p.Question),
				model.NotificationTypePollExpired,
				fmt.Sprintf("/polls/%s", pollID),
			)
		}

		// Broadcast WebSocket update to all connected viewers in this poll room
		if s.hub != nil {
			s.hub.BroadcastToPoll(pollID, map[string]interface{}{
				"type": "POLL_EXPIRED",
				"data": map[string]interface{}{
					"pollId":  pollID,
					"status":  model.PollStatusClosed,
					"message": "This poll has reached its scheduled expiration time and is now closed.",
				},
			})
		}
	}
}
