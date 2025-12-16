require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const WebSocketHandler = require('./websocket/handler');

// Import routes
const authRoutes = require('./routes/auth');
const teamsRoutes = require('./routes/teams');
const postsRoutes = require('./routes/posts');
const gameThreadsRoutes = require('./routes/gameThreads');
const usersRoutes = require('./routes/users');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:8081', 'http://localhost:19006'];

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/game-threads', gameThreadsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS not allowed' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Initialize WebSocket handler
const wsHandler = new WebSocketHandler(io);
wsHandler.initialize();

// Make WebSocket handler available globally for other modules
app.set('wsHandler', wsHandler);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║   Sports Social Media Platform - Backend Server      ║
╠═══════════════════════════════════════════════════════╣
║   Server running on port ${PORT}                     ║
║   Environment: ${process.env.NODE_ENV || 'development'}                      ║
║                                                       ║
║   API Endpoints:                                      ║
║   - POST   /api/auth/register                        ║
║   - POST   /api/auth/login                           ║
║   - GET    /api/auth/me                              ║
║   - GET    /api/teams                                ║
║   - GET    /api/posts                                ║
║   - GET    /api/game-threads                         ║
║   - GET    /api/users/:id                            ║
║   - GET    /api/notifications                        ║
║                                                       ║
║   WebSocket: Ready for real-time connections         ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
