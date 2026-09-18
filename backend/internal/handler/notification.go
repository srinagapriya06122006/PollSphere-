package handler

import (
	"net/http"
	"strconv"

	"guvi-backend/internal/service"

	"github.com/gin-gonic/gin"
)

// NotificationHandler handles HTTP requests for notifications
type NotificationHandler struct {
	notifService service.NotificationService
}

// NewNotificationHandler creates a new NotificationHandler instance
func NewNotificationHandler(notifService service.NotificationService) *NotificationHandler {
	return &NotificationHandler{notifService: notifService}
}

// List returns the authenticated user's notifications
func (h *NotificationHandler) List(c *gin.Context) {
	userIDVal, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	res, err := h.notifService.GetUserNotifications(c.Request.Context(), userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	c.JSON(http.StatusOK, res)
}

// MarkRead marks a single notification as read
func (h *NotificationHandler) MarkRead(c *gin.Context) {
	userIDVal, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)
	notifID := c.Param("id")

	if err := h.notifService.MarkAsRead(c.Request.Context(), notifID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

// MarkAllRead marks all user notifications as read
func (h *NotificationHandler) MarkAllRead(c *gin.Context) {
	userIDVal, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)

	if err := h.notifService.MarkAllAsRead(c.Request.Context(), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark all as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read"})
}

// Delete removes a notification
func (h *NotificationHandler) Delete(c *gin.Context) {
	userIDVal, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)
	notifID := c.Param("id")

	if err := h.notifService.DeleteNotification(c.Request.Context(), notifID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification deleted"})
}
