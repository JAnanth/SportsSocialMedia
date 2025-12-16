const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  getPostById,
  votePost,
  deletePost
} = require('../controllers/postsController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Get feed (supports optional auth for vote status)
router.get('/', optionalAuth, getFeed);

// Get post by ID
router.get('/:id', optionalAuth, getPostById);

// Create post
router.post('/', authenticateToken, createPost);

// Vote on post
router.post('/:id/vote', authenticateToken, votePost);

// Delete post
router.delete('/:id', authenticateToken, deletePost);

module.exports = router;
