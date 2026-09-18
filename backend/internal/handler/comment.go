package handler

import (
	"net/http"

	"guvi-backend/internal/model"
	"guvi-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type CommentHandler struct {
	commentService service.CommentService
}

func NewCommentHandler(commentService service.CommentService) *CommentHandler {
	return &CommentHandler{commentService: commentService}
}

// GetComments returns comments for a specific poll
func (h *CommentHandler) GetComments(c *gin.Context) {
	pollID := c.Param("id")
	if pollID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "poll ID is required"})
		return
	}

	comments, err := h.commentService.GetComments(c.Request.Context(), pollID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch comments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"comments": comments,
		"count":    len(comments),
	})
}

// AddComment posts a new discussion comment
func (h *CommentHandler) AddComment(c *gin.Context) {
	pollID := c.Param("id")
	if pollID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "poll ID is required"})
		return
	}

	userIDVal, exists := c.Get("userId")
	if !exists || userIDVal == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, _ := userIDVal.(string)
	userEmailVal, _ := c.Get("userEmail")
	userEmail, _ := userEmailVal.(string)

	var req model.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body or content is empty"})
		return
	}

	userName := userEmail
	if idx := len(userEmail); idx > 0 {
		userName = userEmail
	}

	comment, err := h.commentService.AddComment(c.Request.Context(), pollID, userID, userName, userEmail, req.Content)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "comment posted successfully",
		"comment": comment,
	})
}
