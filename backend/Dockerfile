# ==========================================
# Multi-Stage Dockerfile for Go Backend
# ==========================================

# Stage 1: Build static Go binary
FROM golang:alpine AS builder

# Install required build tools and CA certificates
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

# Leverage Docker layer caching for dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy application source code
COPY . .

# Build statically linked binary without debugging symbols for minimal size
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server ./cmd/api

# ==========================================
# Stage 2: Minimal Production Runtime
# ==========================================
FROM alpine:3.21

# Install CA certificates for HTTPS outbound requests and set non-root user
RUN apk --no-cache add ca-certificates tzdata && \
    addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/server /app/server
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Use non-root user for enhanced container security
USER appuser:appgroup

# Expose HTTP service port
EXPOSE 8080

# Run the compiled backend service
ENTRYPOINT ["/app/server"]
