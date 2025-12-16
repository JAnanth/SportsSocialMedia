# Sports Social Media Platform - MVP

A mobile-first social media platform designed exclusively for sports fans, providing team-specific communities, real-time game engagement, and fan connections.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Testing Guide](#testing-guide)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Architecture](#architecture)

## ✨ Features

### Core MVP Features (Implemented)

1. **Authentication & Onboarding**
   - User registration and login
   - Team selection and ranking
   - Profile creation

2. **Team-Specific Feed System**
   - View posts from all teams or specific teams
   - Post types: Discussion, Prediction, Analysis, News
   - Sort by Recent or Top
   - Upvote/Downvote system

3. **Live Game Threads**
   - Real-time game discussions using WebSockets
   - Three phases: Pre-game, Live, Post-game
   - Automatic score updates
   - Live commenting with instant updates

4. **Reputation & Quality System**
   - User reputation scores per team
   - Upvote/downvote tracking
   - Quality filtering by reputation

5. **User Profiles & Social Features**
   - User profiles with team affiliations
   - Follow/unfollow users
   - View user posts and stats
   - Notification system

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Socket.io** for real-time features
- **JWT** for authentication
- **bcryptjs** for password hashing

### Mobile App
- **React Native** with Expo
- **React Navigation** for routing
- **Axios** for API calls
- **Socket.io-client** for WebSocket
- **AsyncStorage** for local storage

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn**
- **Expo CLI** (for mobile development)

```bash
npm install -g expo-cli
```

## 🚀 Installation

### 1. Clone the Repository

```bash
cd SportsSocialMedia
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sports_social;

# Exit psql
\q
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=sports_social
# DB_USER=postgres
# DB_PASSWORD=your_password

# Run database migrations
npm run migrate

# Seed database with initial data (NFL teams and demo users)
npm run seed

# Start the backend server
npm run dev
```

The backend server will start on `http://localhost:3000`

### 4. Mobile App Setup

```bash
# Open a new terminal
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Update API configuration (if needed)
# Edit mobile/src/config/api.js and update API_BASE_URL
# For iOS Simulator: http://localhost:3000/api
# For Android Emulator: http://10.0.2.2:3000/api
# For Physical Device: http://YOUR_COMPUTER_IP:3000/api

# Start Expo development server
npm start
```

### 5. Run the Mobile App

After `npm start`, you'll see a QR code and options:

- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`
- **Physical Device**: Scan the QR code with Expo Go app

## 🧪 Testing Guide

### Backend Testing

#### 1. Test Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Test User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "hometown": "Pittsburgh"
  }'
```

#### 3. Test User Login

Use one of the seeded demo users:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "steelers1@example.com",
    "password": "password123"
  }'
```

Save the returned `token` for authenticated requests.

#### 4. Test Get Teams

```bash
curl http://localhost:3000/api/teams
```

#### 5. Test Get Feed

```bash
curl http://localhost:3000/api/posts
```

#### 6. Test Create Post (Authenticated)

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "teamId": 1,
    "content": "Great game today!",
    "postType": "discussion"
  }'
```

### Mobile App Testing

#### Demo User Credentials

The seed script creates 5 demo users with pre-configured teams:

| Username | Email | Password | Team |
|----------|-------|----------|------|
| steelersfan1 | steelers1@example.com | password123 | Pittsburgh Steelers |
| eaglesfan22 | eagles22@example.com | password123 | Philadelphia Eagles |
| cowboysfan88 | cowboys88@example.com | password123 | Dallas Cowboys |
| chiefskingdom | chiefs@example.com | password123 | Kansas City Chiefs |
| billsmafia | bills@example.com | password123 | Buffalo Bills |

#### Testing Workflow

1. **Test Registration Flow**
   - Launch the app
   - Tap "Sign up" on login screen
   - Fill in registration form
   - Submit and verify redirect to onboarding

2. **Test Onboarding**
   - Select 1-5 favorite teams
   - Verify ranking system (numbered badges)
   - Tap "Continue" and verify redirect to main app

3. **Test Login Flow**
   - Use demo credentials: `steelers1@example.com` / `password123`
   - Verify successful login and redirect to feed

4. **Test Feed**
   - View posts from all teams
   - Switch between team-specific feeds
   - Test upvote/downvote functionality
   - Tap a post to view details and comments

5. **Test Post Creation**
   - Tap "+ Post" button on feed
   - Select a team
   - Choose post type (discussion, prediction, analysis, news)
   - Write content and submit
   - Verify post appears in feed

6. **Test Game Threads**
   - Navigate to "Games" tab
   - View list of game threads
   - Tap a game thread to open
   - Test switching between Pre-game, Live, and Post-game tabs
   - Send a message and verify real-time updates

7. **Test Real-Time Features**
   - Open the same game thread on two devices/simulators
   - Send a message from one device
   - Verify it appears instantly on the other device

8. **Test User Profile**
   - Navigate to "Profile" tab
   - View your teams and reputation scores
   - Test logout functionality

9. **Test Social Features**
   - Tap on a username to view their profile
   - Test follow/unfollow functionality
   - View user's posts

10. **Test Notifications**
    - Navigate to Notifications from profile
    - View notification list
    - Tap a notification to navigate to related content

### Testing Real-Time Game Threads

To fully test real-time features:

1. **Start the backend server**
```bash
cd backend
npm run dev
```

2. **Open multiple instances**
   - Open the app on iOS Simulator
   - Open the app on Android Emulator simultaneously
   - Or use multiple physical devices

3. **Join the same game thread**
   - Both instances: Navigate to Games tab
   - Both instances: Tap the same game thread

4. **Test real-time messaging**
   - Send a message from one device
   - Verify it appears instantly on all connected devices
   - Test typing indicators (future feature)

### Testing Performance

**Backend Performance:**
```bash
# Test concurrent requests
for i in {1..10}; do
  curl http://localhost:3000/api/posts &
done
```

**Mobile App Performance:**
- Monitor app performance in Expo DevTools
- Check for memory leaks during navigation
- Test feed scrolling with 100+ posts
- Test game thread with 500+ messages

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "hometown": "string (optional)",
  "bio": "string (optional)"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string"
  }
}
```

#### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": { ... }
}
```

#### GET /api/auth/me
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "favorite_teams": [...]
  }
}
```

### Teams Endpoints

#### GET /api/teams
Get all teams.

**Query Parameters:**
- `sport`: Filter by sport (e.g., "Football")
- `league`: Filter by league (e.g., "NFL")
- `search`: Search by name or city

**Response:**
```json
{
  "teams": [
    {
      "id": 1,
      "name": "Pittsburgh Steelers",
      "sport": "Football",
      "league": "NFL",
      "city": "Pittsburgh",
      "logo_url": null,
      "primary_color": "#FFB612",
      "secondary_color": "#101820"
    }
  ]
}
```

#### POST /api/teams/favorites
Add a favorite team (requires authentication).

**Request Body:**
```json
{
  "teamId": 1,
  "fandomLevel": 5,
  "ranking": 1
}
```

#### GET /api/teams/favorites/me
Get user's favorite teams (requires authentication).

### Posts Endpoints

#### GET /api/posts
Get feed posts.

**Query Parameters:**
- `teamId`: Filter by team
- `postType`: Filter by post type
- `sort`: "recent" or "top"
- `limit`: Number of posts (default: 20)
- `offset`: Pagination offset
- `minReputation`: Filter by minimum reputation score

**Response:**
```json
{
  "posts": [
    {
      "id": 1,
      "user_id": 1,
      "username": "string",
      "team_name": "string",
      "content": "string",
      "post_type": "discussion",
      "upvotes": 10,
      "downvotes": 2,
      "user_vote": 1,
      "comment_count": 5,
      "created_at": "timestamp"
    }
  ]
}
```

#### POST /api/posts
Create a post (requires authentication).

**Request Body:**
```json
{
  "teamId": 1,
  "content": "string",
  "postType": "discussion",
  "parentPostId": null,
  "mediaUrls": []
}
```

#### POST /api/posts/:id/vote
Vote on a post (requires authentication).

**Request Body:**
```json
{
  "voteType": 1  // 1 = upvote, -1 = downvote, 0 = remove vote
}
```

### Game Threads Endpoints

#### GET /api/game-threads
Get game threads.

**Query Parameters:**
- `teamId`: Filter by team
- `status`: Filter by status ("scheduled", "live", "completed")
- `limit`: Number of threads (default: 20)

#### GET /api/game-threads/:id
Get game thread by ID.

#### POST /api/game-threads/posts
Create a post in game thread (requires authentication).

**Request Body:**
```json
{
  "gameThreadId": 1,
  "content": "string",
  "postPhase": "live"  // "pre-game", "live", or "post-game"
}
```

#### GET /api/game-threads/:gameThreadId/posts
Get posts from a game thread.

### Users Endpoints

#### GET /api/users/:id
Get user profile.

#### PUT /api/users/me
Update own profile (requires authentication).

#### POST /api/users/:id/follow
Follow a user (requires authentication).

#### DELETE /api/users/:id/follow
Unfollow a user (requires authentication).

#### GET /api/users/search?q=query
Search users.

### Notifications Endpoints

#### GET /api/notifications
Get notifications (requires authentication).

**Query Parameters:**
- `unreadOnly`: "true" or "false"
- `limit`: Number of notifications

#### PUT /api/notifications/:id/read
Mark notification as read (requires authentication).

#### PUT /api/notifications/read-all
Mark all notifications as read (requires authentication).

### WebSocket Events

#### Client → Server Events

- `join_game_thread`: Join a game thread room
  ```javascript
  socket.emit('join_game_thread', gameThreadId);
  ```

- `leave_game_thread`: Leave a game thread room
  ```javascript
  socket.emit('leave_game_thread', gameThreadId);
  ```

- `game_thread_message`: Send a message in game thread
  ```javascript
  socket.emit('game_thread_message', {
    gameThreadId: 1,
    content: "Great play!",
    postPhase: "live"
  });
  ```

#### Server → Client Events

- `joined_game_thread`: Confirmation of joining
  ```javascript
  socket.on('joined_game_thread', (data) => {
    console.log('Joined thread:', data.gameThreadId);
  });
  ```

- `new_game_thread_message`: New message in thread
  ```javascript
  socket.on('new_game_thread_message', (message) => {
    console.log('New message:', message);
  });
  ```

- `score_updated`: Score update
  ```javascript
  socket.on('score_updated', (data) => {
    console.log('Score:', data.homeScore, data.awayScore);
  });
  ```

- `notification`: New notification
  ```javascript
  socket.on('notification', (notification) => {
    console.log('Notification:', notification);
  });
  ```

## 📁 Project Structure

```
SportsSocialMedia/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Database configuration
│   │   ├── controllers/
│   │   │   ├── authController.js    # Authentication logic
│   │   │   ├── teamsController.js   # Teams logic
│   │   │   ├── postsController.js   # Posts logic
│   │   │   ├── gameThreadsController.js
│   │   │   ├── usersController.js
│   │   │   └── notificationsController.js
│   │   ├── database/
│   │   │   ├── migrate.js           # Database migrations
│   │   │   └── seed.js              # Database seeding
│   │   ├── middleware/
│   │   │   └── auth.js              # Auth middleware
│   │   ├── routes/
│   │   │   ├── auth.js              # Auth routes
│   │   │   ├── teams.js             # Teams routes
│   │   │   ├── posts.js             # Posts routes
│   │   │   ├── gameThreads.js       # Game threads routes
│   │   │   ├── users.js             # Users routes
│   │   │   └── notifications.js     # Notifications routes
│   │   ├── websocket/
│   │   │   └── handler.js           # WebSocket handler
│   │   └── server.js                # Main server file
│   ├── package.json
│   └── .env.example
│
├── mobile/
│   ├── src/
│   │   ├── components/
│   │   │   └── PostCard.js          # Reusable post card
│   │   ├── config/
│   │   │   └── api.js               # API configuration
│   │   ├── context/
│   │   │   └── AuthContext.js       # Auth state management
│   │   ├── navigation/
│   │   │   └── AppNavigator.js      # Navigation setup
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.js
│   │   │   │   ├── RegisterScreen.js
│   │   │   │   └── OnboardingScreen.js
│   │   │   ├── FeedScreen.js
│   │   │   ├── CreatePostScreen.js
│   │   │   ├── PostDetailScreen.js
│   │   │   ├── GameThreadsScreen.js
│   │   │   ├── GameThreadDetailScreen.js
│   │   │   ├── ProfileScreen.js
│   │   │   ├── UserProfileScreen.js
│   │   │   └── NotificationsScreen.js
│   │   └── services/
│   │       ├── authService.js       # Auth API calls
│   │       ├── teamsService.js      # Teams API calls
│   │       ├── postsService.js      # Posts API calls
│   │       ├── gameThreadsService.js
│   │       ├── usersService.js
│   │       └── websocketService.js  # WebSocket connection
│   ├── App.js                       # Main app entry
│   ├── app.json                     # Expo configuration
│   └── package.json
│
└── README.md                        # This file
```

## 🏗 Architecture

### Backend Architecture

```
┌─────────────────┐
│  Express Server │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Routes  │
    └────┬────┘
         │
  ┌──────┴──────┐
  │ Controllers │
  └──────┬──────┘
         │
    ┌────┴────┐
    │ Models  │
    └────┬────┘
         │
  ┌──────┴──────┐
  │ PostgreSQL  │
  └─────────────┘

┌────────────────┐
│   Socket.io    │  ← Real-time features
└────────────────┘
```

### Mobile App Architecture

```
┌─────────────────┐
│   React Native  │
└────────┬────────┘
         │
    ┌────┴────────────┐
    │   Navigation    │
    │  (Stack & Tab)  │
    └────┬────────────┘
         │
  ┌──────┴───────┐
  │   Screens    │
  └──────┬───────┘
         │
  ┌──────┴────────┐
  │   Context     │  ← State Management
  │ (AuthContext) │
  └──────┬────────┘
         │
  ┌──────┴────────┐
  │   Services    │  ← API & WebSocket
  └──────┬────────┘
         │
  ┌──────┴────────┐
  │    Backend    │
  └───────────────┘
```

### Data Flow

1. **Authentication Flow**
   ```
   Login → AuthContext → API Call → JWT Token → AsyncStorage
   ```

2. **Feed Flow**
   ```
   FeedScreen → postsService → API → PostgreSQL → Response → UI Update
   ```

3. **Real-time Game Thread Flow**
   ```
   GameThreadDetail → WebSocket Connect → Join Room →
   Send Message → Server Broadcast → All Clients Update
   ```

### Database Schema

Key relationships:
- Users have many favorite teams (many-to-many)
- Users have reputation per team (one-to-many)
- Posts belong to users and teams
- Posts can have parent posts (comments)
- Game threads have many posts
- Users can follow other users

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected routes with middleware
- Input validation with express-validator
- CORS configuration
- SQL injection prevention with parameterized queries

## 🚀 Future Enhancements

Phase 2 features mentioned in the proposal:
- Local meetup organization
- Prediction & competition system
- Fantasy integration
- Ticket marketplace integration
- Content creator partnerships

## 📝 License

This project is for demonstration purposes.

## 👥 Support

For issues or questions, please check the documentation or create an issue in the repository.

---

**Happy Testing! Go Sports! 🏈🏀⚽**
