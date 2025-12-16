# Sports Social Media - Web Application

A modern, beautiful web application for sports fans to connect, discuss, and engage with their favorite teams.

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd web
npm install

# 2. Make sure backend is running (in another terminal)
cd ../backend
npm run dev

# 3. Start the web app
cd ../web
npm run dev
```

The app will open at `http://localhost:5173`

## 🎨 Features

- **Beautiful Modern UI** - Clean, responsive design similar to Twitter/Instagram
- **Team-Based Feeds** - View posts from your favorite teams
- **Live Game Threads** - Real-time discussions during games
- **User Profiles** - View stats, reputation, and team affiliations
- **Social Features** - Follow users, upvote/downvote posts
- **Responsive Design** - Works great on desktop, tablet, and mobile browsers

## 📝 Demo Accounts

Use these credentials to test the app:

| Email | Password | Team |
|-------|----------|------|
| steelers1@example.com | password123 | Pittsburgh Steelers |
| chiefs@example.com | password123 | Kansas City Chiefs |
| eagles22@example.com | password123 | Philadelphia Eagles |

## 🛠 Tech Stack

- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - API requests
- **Socket.io** - Real-time features
- **Lucide React** - Beautiful icons

## 📱 Pages

- `/login` - User authentication
- `/register` - New user registration
- `/onboarding` - Team selection
- `/` - Main feed
- `/games` - Game threads list
- `/games/:id` - Live game thread
- `/profile` - Your profile
- `/user/:id` - Other user profiles
- `/post/:id` - Post details with comments

## 🎯 MVP Status

✅ Authentication (Login/Register)
✅ Modern UI Design
✅ Responsive Layout
🔄 Onboarding (Team Selection) - In Progress
🔄 Feed System - In Progress
🔄 Game Threads - In Progress
🔄 User Profiles - In Progress

## 📦 Next Steps

The core pages are being created. Run the app and check the browser console for any missing components that need to be created.
