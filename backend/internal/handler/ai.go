package handler

import (
	"net/http"

	"guvi-backend/internal/service"

	"github.com/gin-gonic/gin"
)

// AIHandler handles requests for AI-generated insights
type AIHandler struct {
	aiService service.AIService
}

// NewAIHandler creates a new AIHandler instance
func NewAIHandler(aiService service.AIService) *AIHandler {
	return &AIHandler{aiService: aiService}
}

// GenerateInsights analyzes voting distribution and returns structured AI summary
func (h *AIHandler) GenerateInsights(c *gin.Context) {
	pollID := c.Param("id")
	if pollID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Poll ID is required"})
		return
	}

	insight, err := h.aiService.GeneratePollInsights(c.Request.Context(), pollID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, insight)
}
