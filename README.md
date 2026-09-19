# 🌐 PollSphere — Real-Time Polling & Analytics Platform

> Create polls, share them with your audience, collect votes, and watch results update in real time — without refreshing the page.

PollSphere is a full-stack real-time polling platform built with **React, Go, MongoDB, Redis, and WebSockets**.

The platform allows authenticated users to create and manage polls while participants can access shared polls, vote, and view live results. Redis Pub/Sub and WebSockets power real-time synchronization across connected clients.

---

## 🚀 Project Links

| Resource | Link |
|---|---|
| 🌐 Live Application | https://poll-sphere-beta.vercel.app/ |
| 💻 GitHub Repository | https://github.com/srinagapriya06122006/PollSphere- |
| ⚙️ Backend API | https://pollsphere-py5v.onrender.com |

---

## ✨ Key Features

### 📊 Poll Management

- Create polls with multiple choices
- Add descriptions and categories
- Configure poll expiration
- Edit and delete polls
- Clone existing polls
- Manage created polls from a dedicated dashboard
- Use predefined poll templates

### ⚡ Real-Time Voting

- Vote on active polls
- Live result updates without page refresh
- WebSocket-based communication
- Redis Pub/Sub for real-time event distribution
- Automatic WebSocket reconnection

### 🔐 Authentication & Security

- Email/password authentication
- Strict Gmail address validation
- Google Sign-In using Google Identity Services
- JWT-based authentication
- bcrypt password hashing
- Protected routes
- Role-based access control
- API rate limiting
- CORS protection
- Backend request validation
- Duplicate vote protection

### 📈 Analytics

- Vote statistics
- Poll performance metrics
- Category distribution
- Interactive charts using Recharts
- Poll result visualization
- CSV/JSON result export

### 📱 Poll Sharing

- Shareable poll URLs
- Copy poll link
- QR code generation
- Mobile-friendly voting experience

### 🔔 Notifications

- Poll activity notifications
- Vote milestone notifications
- Poll expiration notifications
- Persistent notification center

### 🤖 AI Poll Insights

- AI-assisted poll result analysis
- Statistical insights
- Automated recommendations
- Google Gemini integration

---

# 🏗️ System Architecture

```mermaid
flowchart TD

    User["User / Browser"]

    subgraph Frontend["Frontend - React + Vite"]
        UI["React UI"]
        Auth["Authentication"]
        PollUI["Poll & Voting UI"]
        Analytics["Analytics Dashboard"]
        WSClient["WebSocket Client"]
    end

    subgraph Backend["Backend - Go + Gin"]
        Router["Gin Router"]
        Middleware["Auth / Validation / Rate Limiting"]
        Handler["HTTP Handlers"]
        Service["Business Services"]
        WebSocket["WebSocket Hub"]
    end

    subgraph Data["Data Layer"]
        Mongo[("MongoDB")]
        Redis[("Redis")]
    end

    User --> Frontend

    Frontend --> Router
    UI --> Auth
    UI --> PollUI
    UI --> Analytics
    PollUI --> WSClient

    Router --> Middleware
    Middleware --> Handler
    Handler --> Service

    Service --> Mongo
    Service --> Redis

    WSClient <--> WebSocket
    WebSocket <--> Redis
````

---

# ⚙️ How PollSphere Works

```text
Create Poll
     ↓
Poll Stored in MongoDB
     ↓
Share Poll Link / QR Code
     ↓
Audience Opens Poll
     ↓
User Votes
     ↓
Backend Validates Vote
     ↓
Vote Stored in MongoDB
     ↓
Redis Pub/Sub Broadcast
     ↓
WebSocket Sends Update
     ↓
Connected Clients See New Results
```

No manual page refresh is required to see updated results.

---

# 🧩 Technology Stack

## Frontend

| Technology               | Purpose               |
| ------------------------ | --------------------- |
| React 18                 | User interface        |
| Vite                     | Frontend build tool   |
| Tailwind CSS             | Styling               |
| React Router             | Client-side routing   |
| Axios                    | API communication     |
| Recharts                 | Data visualization    |
| Lucide React             | Icons                 |
| React Hot Toast          | Notifications         |
| Google Identity Services | Google authentication |

## Backend

| Technology        | Purpose                            |
| ----------------- | ---------------------------------- |
| Go                | Backend language                   |
| Gin               | HTTP framework                     |
| Gorilla WebSocket | Real-time communication            |
| MongoDB Go Driver | Database access                    |
| Redis             | Pub/Sub, caching and rate limiting |
| JWT               | Authentication                     |
| bcrypt            | Password hashing                   |
| Google Gemini     | AI insights                        |

## Infrastructure

| Technology    | Purpose                         |
| ------------- | ------------------------------- |
| Vercel        | Frontend deployment             |
| Render        | Backend deployment              |
| MongoDB Atlas | Cloud database                  |
| Redis         | Real-time messaging and caching |
| Docker        | Containerization                |
| GitHub        | Source control                  |

---

# 🔐 Authentication

PollSphere provides two authentication methods.

## 1. Email & Password

Users can register using a valid Gmail address.

The backend validates the email format before creating the account.

Passwords are securely hashed using bcrypt before storage.

```text
User Registration
       ↓
Gmail Validation
       ↓
Password Hashing
       ↓
MongoDB
       ↓
JWT Authentication
```

## 2. Google Sign-In

PollSphere also supports Google Sign-In using Google Identity Services.

```text
Google Sign-In
      ↓
Google ID Token
      ↓
Backend Verification
      ↓
User Account Creation / Login
      ↓
PollSphere JWT
```

---

# ⚡ Real-Time Architecture

Real-time communication is one of the core features of PollSphere.

When a user votes:

```text
User Vote
   ↓
Go API
   ↓
Vote Validation
   ↓
MongoDB
   ↓
Redis Pub/Sub
   ↓
WebSocket Hub
   ↓
Connected Browsers
```

This allows multiple users viewing the same poll to receive updated results without refreshing the page.

### Technologies involved

* Go WebSocket Hub
* Gorilla WebSocket
* Redis Pub/Sub
* MongoDB
* React WebSocket client

---

# 🗄️ Database Design

PollSphere uses MongoDB for persistent application data.

### Main Collections

| Collection      | Purpose                                      |
| --------------- | -------------------------------------------- |
| `users`         | User accounts and authentication information |
| `polls`         | Poll questions, choices and settings         |
| `votes`         | User voting records                          |
| `notifications` | User notifications                           |
| `audit_logs`    | Security and administrative activity         |

### Duplicate Vote Protection

Votes use a compound unique index:

```text
{ poll_id: 1, user_id: 1 }
```

This prevents the same authenticated user from voting multiple times on the same poll at the database level.

---

# 📡 API Overview

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
GET  /api/auth/me
```

## Polls

```text
GET    /api/polls
POST   /api/polls
GET    /api/polls/:id
PUT    /api/polls/:id
DELETE /api/polls/:id
POST   /api/polls/:id/clone
```

## Voting

```text
POST /api/polls/:id/vote
GET  /api/polls/:id/results
```

## AI Insights

```text
GET /api/polls/:id/insights
```

## Analytics

```text
GET /api/analytics/overview
```

## Notifications

```text
GET    /api/notifications
PATCH  /api/notifications/:id/read
DELETE /api/notifications/:id
```

## WebSocket

```text
GET /api/ws/polls/:id
```

## Health Check

```text
GET /health
```

---

# 🧭 Frontend Routes

| Route          | Access    | Purpose                 |
| -------------- | --------- | ----------------------- |
| `/`            | Public    | Landing page            |
| `/login`       | Public    | User login              |
| `/register`    | Public    | User registration       |
| `/explore`     | Public    | Browse community polls  |
| `/polls/:id`   | Public    | View and vote on a poll |
| `/dashboard`   | Protected | User dashboard          |
| `/create-poll` | Protected | Create a poll           |
| `/my-polls`    | Protected | Manage created polls    |
| `/analytics`   | Protected | View analytics          |
| `/leaderboard` | Protected | Community leaderboard   |
| `/profile`     | Protected | User profile            |
| `/admin`       | Admin     | Administration          |

---

# 🛡️ Security

PollSphere implements several security measures:

* JWT-based authentication
* bcrypt password hashing
* Strict Gmail validation
* Backend input validation
* Protected API routes
* Role-based authorization
* Redis-based rate limiting
* CORS configuration
* Duplicate vote protection
* Environment variable based secrets
* Google ID token verification

> **Important:** Never commit `.env` files, JWT secrets, Google client secrets, database credentials, or API keys to GitHub.

---

# 📁 Project Structure

```text
PollSphere-
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── cmd/
│   │   └── api/
│   ├── internal/
│   │   ├── handler/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   ├── middleware/
│   │   ├── database/
│   │   └── websocket/
│   ├── Dockerfile
│   ├── go.mod
│   └── go.sum
│
├── docker-compose.yml
├── vercel.json
├── README.md
└── .gitignore
```

---

# 💻 Getting Started

## Prerequisites

Make sure you have:

* Git
* Node.js 18+
* npm
* Go 1.24+
* MongoDB
* Redis

Cloud alternatives such as MongoDB Atlas and Redis hosting can also be used.

---

## 1. Clone the Repository

```bash
git clone https://github.com/srinagapriya06122006/PollSphere-.git

cd PollSphere-
```

---

## 2. Configure Backend

```bash
cd backend
```

Create a `.env` file:

```env
PORT=8080
GIN_MODE=release

MONGO_URI=your_mongodb_connection_string
MONGO_DB=pollsphere

REDIS_URL=your_redis_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRY_HOURS=72

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GEMINI_API_KEY=your_gemini_api_key
```

Install dependencies:

```bash
go mod download
```

Start the backend:

```bash
go run ./cmd/api/main.go
```

Backend:

```text
http://localhost:8080
```

---

# 🎨 3. Configure Frontend

Open another terminal:

```bash
cd frontend
```

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_BASE_URL=ws://localhost:8080/api/ws
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 🐳 Docker

PollSphere includes Docker configuration for local infrastructure and deployment.

Start services:

```bash
docker compose up -d
```

Check running containers:

```bash
docker ps
```

Stop services:

```bash
docker compose down
```

---

# ☁️ Deployment

## Frontend

The React application is deployed using **Vercel**.

**Production URL:**

[https://poll-sphere-beta.vercel.app/](https://poll-sphere-beta.vercel.app/)

## Backend

The Go API is deployed using **Render**.

**Production URL:**

[https://pollsphere-py5v.onrender.com](https://pollsphere-py5v.onrender.com)

## Database

MongoDB Atlas is used for cloud database storage.

## Real-Time Infrastructure

Redis is used for:

* Pub/Sub
* Result caching
* Rate limiting
* Real-time event distribution

---

# 🧪 Testing

Run the backend test suite:

```bash
cd backend
go test ./...
```

Verbose mode:

```bash
go test -v ./...
```

Testing areas include:

* Authentication
* JWT handling
* Request validation
* Middleware
* Duplicate voting protection
* Poll status validation
* Authorization

---

# 📋 Internship Requirement Coverage

| Requirement        | Implementation                          |
| ------------------ | --------------------------------------- |
| React Frontend     | React + Vite                            |
| Go Backend         | Go + Gin                                |
| MongoDB            | MongoDB Atlas                           |
| Redis              | Redis Pub/Sub + caching + rate limiting |
| Create Poll        | Protected poll creation                 |
| Share Poll         | Shareable URL + QR code                 |
| Audience Voting    | Poll voting system                      |
| Live Results       | WebSockets + Redis Pub/Sub              |
| Authentication     | JWT + Google Sign-In                    |
| Backend Validation | Server-side validation                  |
| Security           | JWT, bcrypt, rate limiting, CORS        |
| Deployment         | Vercel + Render                         |
| Responsive UI      | React + Tailwind CSS                    |

---

# 🎯 Core User Flow

```text
Register / Login
       ↓
Create Poll
       ↓
Publish Poll
       ↓
Share Poll Link / QR
       ↓
Audience Opens Poll
       ↓
Audience Votes
       ↓
Vote Stored in MongoDB
       ↓
Redis Pub/Sub
       ↓
WebSocket Broadcast
       ↓
Live Results Update
```

---

# 🧠 Key Technical Highlights

### 1. Real-Time Communication

Redis Pub/Sub and WebSockets allow vote updates to be distributed to connected clients without requiring page refreshes.

### 2. Duplicate Vote Protection

A MongoDB compound unique index prevents duplicate votes for the same user and poll.

### 3. Clean Architecture

The Go backend separates:

```text
Handlers
   ↓
Services
   ↓
Repositories
   ↓
Database
```

This keeps business logic independent from HTTP and database implementation details.

### 4. Protected Routes

Authentication middleware validates JWT tokens before allowing access to protected resources.

### 5. Responsive UI

The frontend is designed to work across:

* Desktop
* Tablet
* Mobile

---

# 📸 Application Preview

Add screenshots or GIFs here to showcase:

* Landing page
* Login / Google Sign-In
* Create Poll
* Poll Voting
* Live Results
* Analytics Dashboard

Example:

```markdown
![PollSphere Home](docs/screenshots/home.png)

![Live Poll Results](docs/screenshots/live-results.png)

![Analytics Dashboard](docs/screenshots/analytics.png)
```

---

# 🎥 Project Demonstration

The project demonstration covers:

1. Authentication
2. Poll creation
3. Poll sharing
4. Audience voting
5. Real-time result updates
6. Redis Pub/Sub and WebSocket architecture
7. Security and validation
8. Additional platform features

---

# 👩‍💻 Author

## Srinagapriya A

**B.E. Computer Science and Engineering**

### Links

* GitHub: [https://github.com/srinagapriya06122006](https://github.com/srinagapriya06122006)
* Project Repository: [https://github.com/srinagapriya06122006/PollSphere-](https://github.com/srinagapriya06122006/PollSphere-)

---

# 📄 License

This project is licensed under the MIT License.

