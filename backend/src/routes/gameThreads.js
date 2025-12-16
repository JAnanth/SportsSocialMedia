const express = require('express');
const router = express.Router();
const {
  createGameThread,
  getGameThreads,
  getGameThreadById,
  updateGameThread,
  createGameThreadPost,
  getGameThreadPosts
} = require('../controllers/gameThreadsController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Get all game threads
router.get('/', optionalAuth, getGameThreads);

// Get game thread by ID
router.get('/:id', optionalAuth, getGameThreadById);

// Create game thread (admin only in production)
router.post('/', authenticateToken, createGameThread);

// Update game thread (admin only in production)
router.put('/:id', authenticateToken, updateGameThread);

// Create post in game thread
router.post('/posts', authenticateToken, createGameThreadPost);

// Get posts from game thread
router.get('/:gameThreadId/posts', optionalAuth, getGameThreadPosts);

module.exports = router;
