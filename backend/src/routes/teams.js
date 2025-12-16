const express = require('express');
const router = express.Router();
const {
  getAllTeams,
  getTeamById,
  addFavoriteTeam,
  removeFavoriteTeam,
  getUserFavoriteTeams
} = require('../controllers/teamsController');
const { authenticateToken } = require('../middleware/auth');

// Get all teams
router.get('/', getAllTeams);

// Get team by ID
router.get('/:id', getTeamById);

// Get user's favorite teams
router.get('/favorites/me', authenticateToken, getUserFavoriteTeams);

// Add favorite team
router.post('/favorites', authenticateToken, addFavoriteTeam);

// Remove favorite team
router.delete('/favorites/:teamId', authenticateToken, removeFavoriteTeam);

module.exports = router;
