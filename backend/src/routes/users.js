const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  getUserPosts,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers
} = require('../controllers/usersController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Search users
router.get('/search', searchUsers);

// Update own profile
router.put('/me', authenticateToken, updateProfile);

// Get user profile
router.get('/:id', optionalAuth, getUserProfile);

// Get user posts
router.get('/:id/posts', optionalAuth, getUserPosts);

// Follow user
router.post('/:id/follow', authenticateToken, followUser);

// Unfollow user
router.delete('/:id/follow', authenticateToken, unfollowUser);

// Get user followers
router.get('/:id/followers', getFollowers);

// Get user following
router.get('/:id/following', getFollowing);

module.exports = router;
