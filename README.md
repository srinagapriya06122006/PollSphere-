# ⚡ Live Polling Application

> A high-performance, real-time polling and voting platform engineered with **Go (Gin)**, **MongoDB**, **Redis (Cache & Pub/Sub)**, **WebSockets**, and **React (Vite + Tailwind CSS)**. Built following clean architecture, distributed systems patterns, and production-grade security practices.

---

## 📑 Table of Contents
1. [System Architecture](#-system-architecture)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Project Structure](#-project-structure)
5. [Getting Started](#-getting-started)
   - [Prerequisites](#prerequisites)
   - [Method 1: Running with Docker Compose (Recommended)](#method-1-running-with-docker-compose-recommended)
   - [Method 2: Running Locally from Source](#method-2-running-locally-from-source)
6. [API & WebSocket Documentation](#-api--websocket-documentation)
7. [Environment Variables](#-environment-variables)
8. [Automated Testing](#-automated-testing)
9. [System Design & Interview Q&A](#-system-design--interview-qa)

---

## 🏛 System Architecture

The application is structured into decoupled frontend and backend services communicating over REST and WebSockets, backed by MongoDB for persistence and Redis for sub-millisecond caching and cross-instance Pub/Sub message distribution.

```mermaid
flowchart TD
    subgraph Clients["Frontend Clients (Browser / React SPA)"]
        UserA["User A (Voter)"]
        UserB["User B (Viewer)"]
    end

    subgraph ReverseProxy["Nginx / Ingress"]
        Nginx["Nginx Web Server (:3000)"]
    end

    subgraph BackendCluster["Backend API & WebSocket Server (Go / Gin :8080)"]
        Router["Gin HTTP Router"]
        AuthMiddleware["JWT Auth Middleware"]
        PollHandler["Poll & Vote Handlers"]
        WSHub["WebSocket Hub (Room Manager)"]
        VoteService["Vote & Aggregation Service"]
    end

    subgraph DataTier["Data & Cache Layer"]
        MongoDB[("MongoDB 8.0\n- Users & Polls\n- Unique Compound Index\n- Aggregation Pipeline")]
        Redis[("Redis 7.0\n- 5-Min TTL Cache-Aside\n- Pub/Sub Channel: poll:updates:*")]
    end

    UserA -->|HTTP POST /api/polls/:id/vote| Router
    UserB -->|WebSocket ws://api/ws/polls/:id| WSHub
    Clients --> Nginx

    Router --> AuthMiddleware
    AuthMiddleware --> PollHandler
    PollHandler --> VoteService

    VoteService -->|1. Check Duplicate & Insert| MongoDB
    VoteService -->|2. Invalidate Cache| Redis
    VoteService -->|3. Publish Update| Redis
    Redis -.->|Subscribe to Updates| WSHub
    WSHub -.->|Broadcast JSON Results| UserB
    WSHub -.->|Broadcast JSON Results| UserA
```

---

## ✨ Key Features

- **🔐 Robust Authentication & Authorization**:
  - Secure bcrypt password hashing ($2a$10$).
  - Stateless JWT authentication (HS256) with custom claims and expiration validation.
  - Strict resource ownership verification (only poll creators can update or delete their polls).

- **⚡ Real-Time Live Updates via WebSockets & Redis Pub/Sub**:
  - Instant live vote count and percentage updates pushed to all connected viewers without polling.
  - Horizontally scalable room manager: background goroutines subscribe to Redis Pub/Sub channels (`poll:updates:<id>`) to propagate updates across multiple backend nodes.
  - Client-side auto-reconnection with exponential backoff and ping/pong keep-alives.

- **🛡️ Concurrency-Safe Single-Vote Guarantee**:
  - Enforced at both the business logic layer and database engine level via MongoDB **unique compound index** on `{ poll_id: 1, user_id: 1 }`.
  - Prevents race conditions and double-voting even during concurrent requests.

- **🚀 Sub-Millisecond Aggregation & Redis Caching**:
  - High-throughput MongoDB aggregation pipeline computes vote counts and percentages dynamically.
  - Read-through (cache-aside) caching with a 5-minute TTL in Redis.
  - Instant cache invalidation triggered immediately when a new vote is successfully recorded.

- **🎨 Modern, Responsive React UI**:
  - Interactive vote options with animated percentage bars.
  - Dark/Light-inspired sleek modern aesthetic with Tailwind CSS and Lucide icons.
  - Dedicated pages: Home/Poll Feed, Create Poll, Poll Details with Live Results, User Profile, Login, and Registration.

---

## 🛠 Technology Stack

### Backend
| Technology | Description |
| :--- | :--- |
| **Go 1.24** | High-performance compiled systems language |
| **Gin Gonic** | Fast HTTP web framework with middleware pipeline |
| **MongoDB Go Driver v2** | Native NoSQL document database driver |
| **Go-Redis v9** | Modern Redis client with Pub/Sub support |
| **Gorilla WebSocket** | RFC 6455 compliant WebSocket implementation |
| **golang-jwt/jwt/v5** | Secure JSON Web Token library |
| **golang.org/x/crypto/bcrypt** | Password hashing standard |

### Frontend
| Technology | Description |
| :--- | :--- |
| **React 18** | Declarative component-based UI library |
| **Vite 6** | Ultra-fast build tool and development server |
| **Tailwind CSS 3** | Utility-first CSS framework |
| **React Router v6** | Client-side routing with protected route guards |
| **Axios** | HTTP client with automatic Bearer token interceptor |
| **Lucide React** | Modern iconography set |

### Infrastructure & DevOps
| Technology | Description |
| :--- | :--- |
| **Docker & Docker Compose** | Multi-container orchestration |
| **Nginx Alpine** | Lightweight production web server and SPA router |
| **MongoDB 8.0** | Document database with replication readiness |
| **Redis 7.0 Alpine** | In-memory cache and message broker |

---

## 📁 Project Structure

```
.
├── docker-compose.yml           # Multi-service orchestration (Backend, Frontend, Mongo, Redis)
├── .gitignore                   # Comprehensive repository gitignore
├── README.md                    # Project documentation & interview guide
│
├── backend/                     # Go Backend Service
│   ├── Dockerfile               # Multi-stage production build (Alpine runner)
│   ├── .dockerignore
│   ├── .env.example             # Backend environment template
│   ├── go.mod / go.sum          # Go module dependencies
│   ├── cmd/
│   │   └── api/
│   │       └── main.go          # Application entrypoint & graceful shutdown
│   └── internal/
│       ├── config/              # Environment & configuration loader
│       ├── database/            # MongoDB & Redis client connections
│       ├── handler/             # HTTP & WebSocket controllers + unit tests
│       ├── middleware/          # JWT Auth & CORS middlewares + unit tests
│       ├── model/               # Domain data structures & DTOs
│       ├── repository/          # Database persistence layer (Mongo queries)
│       ├── router/              # Gin route registration
│       ├── service/             # Business logic & caching + unit tests
│       └── websocket/           # WebSocket Client & Hub (Room Manager)
│
└── frontend/                    # React Frontend Application
    ├── Dockerfile               # Multi-stage production build (Nginx runner)
    ├── .dockerignore
    ├── nginx.conf               # Nginx SPA fallback & caching configuration
    ├── .env.example             # Frontend environment template
    ├── package.json             # NPM dependencies & scripts
    ├── index.html               # SPA root document
    ├── vite.config.js           # Vite build configuration
    ├── tailwind.config.js       # Tailwind CSS design system configuration
    └── src/
        ├── api/                 # Axios HTTP client with JWT injection
        ├── components/          # Reusable UI, Auth, and Poll components
        ├── context/             # Global AuthContext provider
        ├── hooks/               # usePollWebSocket & custom hooks
        ├── pages/               # Home, Login, Register, CreatePoll, PollDetail, Profile
        ├── services/            # API service calls (auth, poll, vote)
        ├── App.jsx              # Application router & routes
        └── main.jsx             # React DOM bootstrap
```

---

## 🚀 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Docker Compose v2+)
- **Optional for local manual run**: [Go 1.22+](https://go.dev/dl/), [Node.js 20+](https://nodejs.org/), [MongoDB](https://www.mongodb.com/), and [Redis](https://redis.io/).

---

### Method 1: Running with Docker Compose (Recommended)

Start all 4 services (Go Backend, React Frontend, MongoDB, and Redis) with a single command:

```bash
# Clone repository
git clone https://github.com/your-username/live-polling-app.git
cd live-polling-app

# Launch entire stack
docker compose up --build -d
```

- **Frontend Application**: [`http://localhost:3000`](http://localhost:3000)
- **Backend API**: [`http://localhost:8080/api`](http://localhost:8080/api)
- **Health Endpoint**: [`http://localhost:8080/health`](http://localhost:8080/health)

To stop all services:
```bash
docker compose down
```

---

### Method 2: Running Locally from Source

#### 1. Start MongoDB and Redis
```bash
# Start databases using Docker
docker run -d --name local-mongo -p 27017:27017 mongo:8
docker run -d --name local-redis -p 6379:6379 redis:7-alpine
```

#### 2. Start Go Backend
```bash
cd backend
cp .env.example .env
go mod download
go run ./cmd/api
# Backend will start on http://localhost:8080
```

#### 3. Start React Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# Frontend will start on http://localhost:5173
```

---

## 📡 API & WebSocket Documentation

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile | **Yes (Bearer JWT)** |

### Poll Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/polls` | List paginated polls (`?page=1&limit=10&status=active`) | No |
| `GET` | `/api/polls/:id` | Get poll details by ID | No |
| `POST` | `/api/polls` | Create a new poll with options | **Yes (Bearer JWT)** |
| `PUT` | `/api/polls/:id` | Update poll status / question (Owner only) | **Yes (Bearer JWT)** |
| `DELETE` | `/api/polls/:id` | Delete poll and related votes (Owner only) | **Yes (Bearer JWT)** |

### Voting Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/polls/:id/vote` | Cast a single vote for an option | **Yes (Bearer JWT)** |
| `GET` | `/api/polls/:id/results` | Get aggregated vote results & percentages | No (Optional JWT) |

### Real-Time WebSocket Endpoint
| Protocol | Endpoint | Description |
| :--- | :--- | :--- |
| `WS` | `/api/ws/polls/:id` | Real-time WebSocket connection subscribing to poll updates |

#### Real-Time Message Format (`POLL_UPDATE`):
```json
{
  "type": "POLL_UPDATE",
  "data": {
    "poll_id": "66e85293f0b001a1a1a1a1a1",
    "question": "What is your primary backend language?",
    "status": "active",
    "total_votes": 42,
    "results": [
      { "option_id": "opt-1", "text": "Go", "vote_count": 28, "percentage": 66.7 },
      { "option_id": "opt-2", "text": "Rust", "vote_count": 14, "percentage": 33.3 }
    ]
  }
}
```

---

## 🧪 Automated Testing

The backend includes comprehensive unit and integration test suites covering JWT security, authentication middleware, user models, and API handler error flows:

```bash
cd backend
go test -v ./...
```

### Test Suite Summary:
- ✅ `TestJWTService_GenerateAndValidateToken`: Validates token creation and claim parsing.
- ✅ `TestJWTService_InvalidTokenSignature`: Tests signature tampering protection.
- ✅ `TestJWTService_ExpiredToken`: Asserts automatic token expiration handling.
- ✅ `TestAuthMiddleware_MissingHeader`: Verifies 401 response on missing headers.
- ✅ `TestAuthMiddleware_ValidToken`: Verifies Gin context claim injection.
- ✅ `TestAuthHandler_Register_DuplicateEmail`: Tests 409 Conflict duplicate user handling.
- ✅ `TestVoteHandler_CastVote_AlreadyVoted`: Tests 409 Conflict on double-voting attempts.
- ✅ `TestVoteHandler_CastVote_ClosedPoll`: Asserts 400 Bad Request on closed polls.

---

## 💡 System Design & Interview Q&A

### 1. How do you prevent double-voting during high-concurrency race conditions?
> **Answer:** Double-voting prevention is enforced at two distinct layers:
> 1. **Application Layer**: Prior to writing a vote, the `VoteService` checks if a record with `{ poll_id, user_id }` already exists.
> 2. **Database Engine Layer**: In MongoDB, we created a **unique compound index** on `{ poll_id: 1, user_id: 1 }`. Even if two concurrent requests from the same user pass the application pre-check simultaneously, MongoDB's atomic index write guarantees that one insert succeeds and the second fails with duplicate key error `E11000`. The service detects this and returns an `ErrAlreadyVoted` (HTTP 409 Conflict).

### 2. How does Redis Pub/Sub solve the WebSocket multi-server scaling problem?
> **Answer:** If we scale the backend horizontally across multiple container replicas, Client A may be connected to Node 1 while Client B is connected to Node 2. When a vote is cast on Node 1, an in-memory broadcast would only notify clients on Node 1.
> By integrating **Redis Pub/Sub**, when Node 1 records a vote, it publishes a message to channel `poll:updates:<poll_id>`. All backend nodes subscribe to these channels. Node 2 receives the Redis message and immediately broadcasts the updated vote results to its local WebSocket clients.

### 3. How does the Cache-Aside pattern work for Poll Results?
> **Answer:**
> 1. **Read Path**: When a client requests `GET /api/polls/:id/results`, the service checks Redis key `poll:results:<id>`.
>    - If present (**Cache Hit**), results return in <1ms without querying MongoDB.
>    - If missing (**Cache Miss**), the service runs the MongoDB aggregation pipeline, caches the calculated result in Redis with a 5-minute TTL, and returns the response.
> 2. **Write Path (Invalidation)**: When a vote is cast (`POST /api/polls/:id/vote`), the service immediately issues `DEL poll:results:<id>` in Redis before publishing the real-time update. This ensures zero stale data while offloading heavy read traffic.

### 4. Why use Go and Gin for high-throughput live polling?
> **Answer:** Go's lightweight concurrency model (goroutines consuming only ~2KB of initial stack memory vs ~1MB for OS threads) allows a single backend node to handle tens of thousands of concurrent WebSocket connections and HTTP requests with minimal CPU and memory overhead. Gin provides a fast, zero-allocation radix tree router ideal for latency-critical APIs.

---

## 📜 License
This project is open source and available under the [MIT License](LICENSE).
