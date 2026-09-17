package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"

	"guvi-backend/internal/service"
	ws "guvi-backend/internal/websocket"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// WSHandler handles WebSocket connections for real-time poll updates
type WSHandler struct {
	hub         *ws.Hub
	jwtService  service.JWTService
	voteService service.VoteService
	pollService service.PollService
	upgrader    websocket.Upgrader
}

// NewWSHandler creates a new WSHandler instance
func NewWSHandler(
	hub *ws.Hub,
	jwtService service.JWTService,
	voteService service.VoteService,
	pollService service.PollService,
) *WSHandler {
	return &WSHandler{
		hub:         hub,
		jwtService:  jwtService,
		voteService: voteService,
		pollService: pollService,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				// Allow all origins for development and frontend clients
				return true
			},
		},
	}
}

// ServeWS upgrades HTTP connection to WebSocket and subscribes client to a poll room
func (h *WSHandler) ServeWS(c *gin.Context) {
	pollID := c.Param("id")

	// 1. Verify poll exists before upgrading connection
	_, err := h.pollService.GetPollByID(c.Request.Context(), pollID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
		return
	}

	// 2. Extract optional authentication token from query param or header
	var userID string
	tokenString := c.Query("token")
	if tokenString == "" {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
				tokenString = strings.TrimSpace(parts[1])
			}
		}
	}

	if tokenString != "" {
		if claims, err := h.jwtService.ValidateToken(tokenString); err == nil {
			userID = claims.UserID
		}
	}

	// 3. Upgrade HTTP connection to WebSocket
	conn, err := h.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		slog.Error("Failed to upgrade WebSocket connection", "error", err)
		return
	}

	client := &ws.Client{
		Hub:    h.hub,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		PollID: pollID,
		UserID: userID,
	}

	// Register client with the Hub
	client.Hub.RegisterClient(client)

	// 4. Send initial poll results immediately upon connection
	var optUserID *string
	if userID != "" {
		optUserID = &userID
	}
	if initialResults, err := h.voteService.GetPollResults(c.Request.Context(), pollID, optUserID); err == nil {
		if data, err := json.Marshal(gin.H{
			"type": "POLL_UPDATE",
			"data": initialResults,
		}); err == nil {
			client.Send <- data
		}
	}

	// 5. Start pumping routines in separate goroutines
	go client.WritePump()
	go client.ReadPump()
}
