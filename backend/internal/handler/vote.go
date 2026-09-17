package handler

import (
	"errors"
	"net/http"
	"strings"

	"guvi-backend/internal/model"
	"guvi-backend/internal/service"

	"github.com/gin-gonic/gin"
)

// VoteHandler handles voting and poll results endpoints
type VoteHandler struct {
	voteService service.VoteService
	jwtService  service.JWTService
}

// NewVoteHandler creates a new VoteHandler
func NewVoteHandler(voteService service.VoteService, jwtService service.JWTService) *VoteHandler {
	return &VoteHandler{
		voteService: voteService,
		jwtService:  jwtService,
	}
}

// CastVote handles submitting a vote for a poll option
func (h *VoteHandler) CastVote(c *gin.Context) {
	userIDVal, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, _ := userIDVal.(string)
	pollID := c.Param("id")

	var req model.CastVoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid vote payload",
			"details": err.Error(),
		})
		return
	}

	err := h.voteService.CastVote(c.Request.Context(), userID, pollID, &req)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidPollID):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, service.ErrPollNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		case errors.Is(err, service.ErrPollClosed), errors.Is(err, service.ErrPollExpired), errors.Is(err, service.ErrInvalidOption):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, service.ErrAlreadyVoted):
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cast vote"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Vote cast successfully",
	})
}

// GetResults retrieves aggregated voting statistics for a poll
func (h *VoteHandler) GetResults(c *gin.Context) {
	pollID := c.Param("id")

	var optionalUserID *string
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" {
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
			if claims, err := h.jwtService.ValidateToken(strings.TrimSpace(parts[1])); err == nil {
				optionalUserID = &claims.UserID
			}
		}
	}

	results, err := h.voteService.GetPollResults(c.Request.Context(), pollID, optionalUserID)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidPollID):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, service.ErrPollNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate poll results"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": results,
	})
}
