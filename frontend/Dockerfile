# ==========================================
# Multi-Stage Dockerfile for React Frontend
# ==========================================

# Stage 1: Build the React Application
FROM node:22-alpine AS builder

WORKDIR /app

# Build args for frontend environment variables
ARG VITE_API_BASE_URL=http://localhost:8080/api
ARG VITE_WS_BASE_URL=ws://localhost:8080/api/ws

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_BASE_URL=$VITE_WS_BASE_URL

# Copy package descriptors and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and compile production bundle
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Serve with Nginx Alpine
# ==========================================
FROM nginx:1.27-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
