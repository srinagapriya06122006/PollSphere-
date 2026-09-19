package handler

import (
	"errors"
	"net/http"

	"guvi-backend/internal/model"
	"guvi-backend/internal/service"

	"github.com/gin-gonic/gin"
)

// AuthHandler handles authentication and user profile HTTP requests
type AuthHandler struct {
	authService service.AuthService
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var req model.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
		return
	}

	clientIP := c.ClientIP()
	userResponse, err := h.authService.Register(c.Request.Context(), &req, clientIP)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidGmailAddress):
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		case errors.Is(err, service.ErrEmailAlreadyExists):
			c.JSON(http.StatusConflict, gin.H{
				"error": err.Error(),
			})
		case errors.Is(err, service.ErrPasswordTooShort):
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to register user",
			})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"data":    userResponse,
	})
}

// Login handles user login and returns a JWT
func (h *AuthHandler) Login(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
		return
	}

	clientIP := c.ClientIP()
	authResponse, err := h.authService.Login(c.Request.Context(), &req, clientIP)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidGmailAddress):
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		case errors.Is(err, service.ErrInvalidCredentials):
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": err.Error(),
			})
			return
		default:
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Authentication failed",
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"data":    authResponse,
	})
}

// Me returns the currently authenticated user's profile
func (h *AuthHandler) Me(c *gin.Context) {
	userIDVal, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized user context",
		})
		return
	}

	userID, ok := userIDVal.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Invalid user context type",
		})
		return
	}

	userResponse, err := h.authService.GetProfile(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, service.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "User profile not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch profile",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": userResponse,
	})
}

// GetProfileStats returns user profile along with aggregated activity metrics
func (h *AuthHandler) GetProfileStats(c *gin.Context) {
	userIDVal, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized user context"})
		return
	}

	userID, _ := userIDVal.(string)
	profile, err := h.authService.GetProfileWithStats(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user profile metrics"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// UpdateProfile modifies user name and/or password
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userIDVal, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized user context"})
		return
	}

	userID, _ := userIDVal.(string)
	var req model.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid update payload", "details": err.Error()})
		return
	}

	updatedUser, err := h.authService.UpdateProfile(c.Request.Context(), userID, &req)
	if err != nil {
		if errors.Is(err, service.ErrWrongPassword) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"data":    updatedUser,
	})
}

// GetVoteHistory returns the list of past votes cast by the authenticated user
func (h *AuthHandler) GetVoteHistory(c *gin.Context) {
	userIDVal, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized user context"})
		return
	}

	userID, _ := userIDVal.(string)
	votes, err := h.authService.GetUserVoteHistory(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve voting history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"votes": votes,
	})
}

// GetActivityTimeline returns aggregated timeline events for the user
func (h *AuthHandler) GetActivityTimeline(c *gin.Context) {
	userIDVal, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized user context"})
		return
	}

	userID, _ := userIDVal.(string)
	timeline, err := h.authService.GetActivityTimeline(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve activity timeline"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"timeline": timeline,
	})
}
