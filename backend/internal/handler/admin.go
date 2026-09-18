package handler

import (
	"net/http"
	"strconv"

	"guvi-backend/internal/service"

	"github.com/gin-gonic/gin"
)

// AdminHandler handles administrator management operations
type AdminHandler struct {
	auditService service.AuditService
	authService  service.AuthService
}

// NewAdminHandler creates a new AdminHandler instance
func NewAdminHandler(auditService service.AuditService, authService service.AuthService) *AdminHandler {
	return &AdminHandler{
		auditService: auditService,
		authService:  authService,
	}
}

// ListAuditLogs returns paginated audit events
func (h *AdminHandler) ListAuditLogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	action := c.Query("action")

	logs, err := h.auditService.List(c.Request.Context(), page, limit, action)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch audit logs"})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// ListUsers returns paginated system users
func (h *AdminHandler) ListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	users, total, err := h.authService.ListUsers(c.Request.Context(), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list users"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}
