package handler

import (
	"net/http"

	"guvi-backend/internal/service"

	"github.com/gin-gonic/gin"
)

// AnalyticsHandler handles requests for platform analytics and metrics
type AnalyticsHandler struct {
	analyticsService service.AnalyticsService
}

// NewAnalyticsHandler creates an instance of AnalyticsHandler
func NewAnalyticsHandler(analyticsService service.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsService: analyticsService}
}

// GetOverview returns aggregated system statistics for dashboard visualization
func (h *AnalyticsHandler) GetOverview(c *gin.Context) {
	overview, err := h.analyticsService.GetOverview(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to compute analytics overview",
		})
		return
	}

	c.JSON(http.StatusOK, overview)
}
