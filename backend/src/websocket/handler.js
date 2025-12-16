const jwt = require('jsonwebtoken');
const pool = require('../config/database');

class WebSocketHandler {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // Map of userId -> Set of socket IDs
    this.gameThreadRooms = new Map(); // Map of gameThreadId -> Set of socket IDs
  }

  initialize() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');

        // Verify user exists
        const result = await pool.query(
          'SELECT id, username, email FROM users WHERE id = $1',
          [decoded.userId]
        );

        if (result.rows.length === 0) {
          return next(new Error('User not found'));
        }

        socket.user = result.rows[0];
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.username} (${socket.id})`);

      // Track user socket
      if (!this.userSockets.has(socket.user.id)) {
        this.userSockets.set(socket.user.id, new Set());
      }
      this.userSockets.get(socket.user.id).add(socket.id);

      // Handle joining game thread room
      socket.on('join_game_thread', (gameThreadId) => {
        const room = `game_thread_${gameThreadId}`;
        socket.join(room);

        if (!this.gameThreadRooms.has(gameThreadId)) {
          this.gameThreadRooms.set(gameThreadId, new Set());
        }
        this.gameThreadRooms.get(gameThreadId).add(socket.id);

        console.log(`User ${socket.user.username} joined game thread ${gameThreadId}`);
        socket.emit('joined_game_thread', { gameThreadId });
      });

      // Handle leaving game thread room
      socket.on('leave_game_thread', (gameThreadId) => {
        const room = `game_thread_${gameThreadId}`;
        socket.leave(room);

        if (this.gameThreadRooms.has(gameThreadId)) {
          this.gameThreadRooms.get(gameThreadId).delete(socket.id);
        }

        console.log(`User ${socket.user.username} left game thread ${gameThreadId}`);
      });

      // Handle new game thread message
      socket.on('game_thread_message', async (data) => {
        const { gameThreadId, content, postPhase } = data;

        try {
          // Save message to database
          const result = await pool.query(
            `INSERT INTO game_thread_posts (game_thread_id, user_id, content, post_phase)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [gameThreadId, socket.user.id, content, postPhase || 'live']
          );

          const post = result.rows[0];

          // Broadcast to all users in the game thread room
          const room = `game_thread_${gameThreadId}`;
          this.io.to(room).emit('new_game_thread_message', {
            ...post,
            username: socket.user.username,
            profile_image: null
          });
        } catch (error) {
          console.error('Game thread message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle game score update
      socket.on('game_score_update', (data) => {
        const { gameThreadId, homeScore, awayScore } = data;
        const room = `game_thread_${gameThreadId}`;

        // Broadcast score update to all users in the room
        this.io.to(room).emit('score_updated', {
          gameThreadId,
          homeScore,
          awayScore
        });
      });

      // Handle typing indicator
      socket.on('typing', (data) => {
        const { gameThreadId } = data;
        const room = `game_thread_${gameThreadId}`;

        socket.to(room).emit('user_typing', {
          username: socket.user.username,
          gameThreadId
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.username} (${socket.id})`);

        // Remove from user sockets
        if (this.userSockets.has(socket.user.id)) {
          this.userSockets.get(socket.user.id).delete(socket.id);
          if (this.userSockets.get(socket.user.id).size === 0) {
            this.userSockets.delete(socket.user.id);
          }
        }

        // Remove from game thread rooms
        this.gameThreadRooms.forEach((sockets, gameThreadId) => {
          sockets.delete(socket.id);
        });
      });
    });
  }

  // Helper method to send notification to a specific user
  sendNotificationToUser(userId, notification) {
    if (this.userSockets.has(userId)) {
      const socketIds = this.userSockets.get(userId);
      socketIds.forEach(socketId => {
        this.io.to(socketId).emit('notification', notification);
      });
    }
  }

  // Helper method to broadcast to a game thread
  broadcastToGameThread(gameThreadId, event, data) {
    const room = `game_thread_${gameThreadId}`;
    this.io.to(room).emit(event, data);
  }
}

module.exports = WebSocketHandler;
