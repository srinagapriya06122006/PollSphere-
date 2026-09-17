package websocket

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"strings"
	"sync"

	"guvi-backend/internal/database"
)

// BroadcastMessage wraps a payload intended for all clients subscribed to a specific poll room
type BroadcastMessage struct {
	PollID  string
	Payload []byte
}

// Hub maintains the set of active clients grouped into poll rooms and broadcasts messages
type Hub struct {
	// Registered clients partitioned by pollID
	rooms map[string]map[*Client]bool

	// Inbound messages from the clients / services
	broadcast chan *BroadcastMessage

	// Register requests from the clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Redis client for distributed Pub/Sub
	redis *database.RedisClient

	mu sync.RWMutex
}

// NewHub creates a new Hub instance
func NewHub(redis *database.RedisClient) *Hub {
	return &Hub{
		rooms:      make(map[string]map[*Client]bool),
		broadcast:  make(chan *BroadcastMessage, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		redis:      redis,
	}
}

// RegisterClient enqueues a client to be registered in its poll room
func (h *Hub) RegisterClient(client *Client) {
	h.register <- client
}

// UnregisterClient enqueues a client to be unregistered from its poll room
func (h *Hub) UnregisterClient(client *Client) {
	h.unregister <- client
}

// Run starts the central event loop for the WebSocket hub
func (h *Hub) Run(ctx context.Context) {
	// If Redis is connected, start listening for distributed updates across instances
	if h.redis != nil && h.redis.Client != nil {
		go h.subscribeRedisPubSub(ctx)
	}

	for {
		select {
		case <-ctx.Done():
			slog.Info("WebSocket Hub shutting down...")
			return

		case client := <-h.register:
			h.mu.Lock()
			if h.rooms[client.PollID] == nil {
				h.rooms[client.PollID] = make(map[*Client]bool)
			}
			h.rooms[client.PollID][client] = true
			totalClients := len(h.rooms[client.PollID])
			h.mu.Unlock()

			slog.Debug("Client connected to poll room", "pollId", client.PollID, "roomClients", totalClients)

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.rooms[client.PollID]; ok {
				if _, exists := clients[client]; exists {
					delete(clients, client)
					close(client.Send)
					if len(clients) == 0 {
						delete(h.rooms, client.PollID)
					}
				}
			}
			h.mu.Unlock()

			slog.Debug("Client disconnected from poll room", "pollId", client.PollID)

		case msg := <-h.broadcast:
			h.dispatchLocal(msg.PollID, msg.Payload)
		}
	}
}

// dispatchLocal sends a raw message to all connected clients in a specific poll room
func (h *Hub) dispatchLocal(pollID string, payload []byte) {
	h.mu.RLock()
	clients, ok := h.rooms[pollID]
	if !ok || len(clients) == 0 {
		h.mu.RUnlock()
		return
	}

	// Copy clients to avoid holding read lock while transmitting
	targetClients := make([]*Client, 0, len(clients))
	for client := range clients {
		targetClients = append(targetClients, client)
	}
	h.mu.RUnlock()

	for _, client := range targetClients {
		select {
		case client.Send <- payload:
		default:
			// Client send channel is blocked; unregister and close connection
			h.mu.Lock()
			delete(h.rooms[pollID], client)
			close(client.Send)
			h.mu.Unlock()
		}
	}
}

// BroadcastToPoll publishes a poll update event either through Redis Pub/Sub or locally
func (h *Hub) BroadcastToPoll(pollID string, payload interface{}) {
	data, err := json.Marshal(payload)
	if err != nil {
		slog.Error("Failed to serialize WebSocket broadcast payload", "error", err)
		return
	}

	// 1. If Redis is available, publish to Redis Pub/Sub channel
	if h.redis != nil && h.redis.Client != nil {
		channel := fmt.Sprintf("poll:updates:%s", pollID)
		if err := h.redis.Client.Publish(context.Background(), channel, data).Err(); err != nil {
			slog.Warn("Failed to publish poll update to Redis Pub/Sub, broadcasting locally", "error", err)
			h.broadcast <- &BroadcastMessage{PollID: pollID, Payload: data}
		} else {
			slog.Info("Published poll update to Redis channel", "channel", channel)
		}
		return
	}

	// 2. Fallback to local dispatch
	h.broadcast <- &BroadcastMessage{
		PollID:  pollID,
		Payload: data,
	}
}

// subscribeRedisPubSub listens to pattern 'poll:updates:*' and dispatches received messages locally
func (h *Hub) subscribeRedisPubSub(ctx context.Context) {
	pubsub := h.redis.Client.PSubscribe(ctx, "poll:updates:*")
	defer pubsub.Close()

	slog.Info("Subscribed to Redis Pub/Sub pattern: poll:updates:*")

	ch := pubsub.Channel()
	for {
		select {
		case <-ctx.Done():
			return
		case msg, ok := <-ch:
			if !ok {
				return
			}
			// Extract pollID from channel name: "poll:updates:<poll_id>"
			parts := strings.Split(msg.Channel, ":")
			if len(parts) == 3 {
				pollID := parts[2]
				h.broadcast <- &BroadcastMessage{
					PollID:  pollID,
					Payload: []byte(msg.Payload),
				}
			}
		}
	}
}
