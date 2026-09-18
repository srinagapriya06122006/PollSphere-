package handler

import (
	"errors"
	"net/http"
	"strconv"

	"guvi-backend/internal/model"
	"guvi-backend/internal/service"

	"github.com/gin-gonic/gin"
)

// PollHandler handles poll-related HTTP endpoints
type PollHandler struct {
	pollService service.PollService
}

// NewPollHandler creates a new PollHandler
func NewPollHandler(pollService service.PollService) *PollHandler {
	return &PollHandler{
		pollService: pollService,
	}
}

// Create handles creating a new poll by an authenticated user
func (h *PollHandler) Create(c *gin.Context) {
	userIDVal, _ := c.Get("userId")
	userEmailVal, _ := c.Get("userEmail")

	userID, _ := userIDVal.(string)
	userEmail, _ := userEmailVal.(string)
	clientIP := c.ClientIP()

	var req model.CreatePollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid poll payload",
			"details": err.Error(),
		})
		return
	}

	pollResponse, err := h.pollService.CreatePoll(c.Request.Context(), userID, userEmail, &req, clientIP)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidOptions), errors.Is(err, service.ErrInvalidExpiration):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, service.ErrInvalidPollID):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create poll"})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Poll created successfully",
		"data":    pollResponse,
	})
}

// List handles listing polls with pagination, search, category, status, and sorting filters
func (h *PollHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := c.Query("status")
	category := c.Query("category")
	search := c.Query("search")
	sortBy := c.Query("sort_by")
	creatorID := c.Query("creator_id")

	filter := model.PollFilter{
		Search:    search,
		Category:  category,
		Status:    status,
		CreatorID: creatorID,
		SortBy:    sortBy,
		Page:      page,
		Limit:     limit,
	}

	result, err := h.pollService.ListPollsWithFilter(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to list polls",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": result,
	})
}

// GetByID handles retrieving a single poll by ID
func (h *PollHandler) GetByID(c *gin.Context) {
	pollID := c.Param("id")

	pollResponse, err := h.pollService.GetPollByID(c.Request.Context(), pollID)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidPollID):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, service.ErrPollNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch poll"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": pollResponse,
	})
}

// Update handles updating a poll's question, category, or status
func (h *PollHandler) Update(c *gin.Context) {
	userIDVal, _ := c.Get("userId")
	userID, _ := userIDVal.(string)
	userRoleVal, _ := c.Get("userRole")
	userRole, _ := userRoleVal.(model.UserRole)
	clientIP := c.ClientIP()
	pollID := c.Param("id")

	var req model.UpdatePollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid update payload",
			"details": err.Error(),
		})
		return
	}

	pollResponse, err := h.pollService.UpdatePoll(c.Request.Context(), userID, userRole, pollID, &req, clientIP)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidPollID):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, service.ErrPollNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		case errors.Is(err, service.ErrUnauthorizedPoll):
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update poll"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Poll updated successfully",
		"data":    pollResponse,
	})
}

// Delete handles deleting a poll by creator or admin
func (h *PollHandler) Delete(c *gin.Context) {
	userIDVal, _ := c.Get("userId")
	userID, _ := userIDVal.(string)
	userRoleVal, _ := c.Get("userRole")
	userRole, _ := userRoleVal.(model.UserRole)
	clientIP := c.ClientIP()
	pollID := c.Param("id")

	err := h.pollService.DeletePoll(c.Request.Context(), userID, userRole, pollID, clientIP)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidPollID):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, service.ErrPollNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		case errors.Is(err, service.ErrUnauthorizedPoll):
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete poll"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Poll deleted successfully",
	})
}

// Clone handles duplicating an existing poll for the authenticated user
func (h *PollHandler) Clone(c *gin.Context) {
	userIDVal, _ := c.Get("userId")
	userEmailVal, _ := c.Get("userEmail")

	userID, _ := userIDVal.(string)
	userEmail, _ := userEmailVal.(string)
	clientIP := c.ClientIP()
	pollID := c.Param("id")

	clonedPoll, err := h.pollService.ClonePoll(c.Request.Context(), userID, userEmail, pollID, clientIP)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidPollID):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, service.ErrPollNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to duplicate poll"})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Poll cloned successfully",
		"data":    clonedPoll,
	})
}
