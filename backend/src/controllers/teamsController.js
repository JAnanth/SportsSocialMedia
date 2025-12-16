const pool = require('../config/database');

const getAllTeams = async (req, res) => {
  try {
    const { sport, league, search } = req.query;

    let query = 'SELECT * FROM teams WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (sport) {
      paramCount++;
      query += ` AND sport = $${paramCount}`;
      params.push(sport);
    }

    if (league) {
      paramCount++;
      query += ` AND league = $${paramCount}`;
      params.push(league);
    }

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR city ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);

    res.json({ teams: result.rows });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM teams WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ team: result.rows[0] });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const addFavoriteTeam = async (req, res) => {
  try {
    const { teamId, fandomLevel, ranking } = req.body;
    const userId = req.user.id;

    // Check if team exists
    const teamCheck = await pool.query('SELECT id FROM teams WHERE id = $1', [teamId]);
    if (teamCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Add favorite team
    await pool.query(
      `INSERT INTO user_favorite_teams (user_id, team_id, fandom_level, ranking)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, team_id) DO UPDATE
       SET fandom_level = $3, ranking = $4`,
      [userId, teamId, fandomLevel, ranking]
    );

    // Initialize reputation for this team
    await pool.query(
      `INSERT INTO user_reputation (user_id, team_id, quality_score, verified_status)
       VALUES ($1, $2, 0, 'fan')
       ON CONFLICT (user_id, team_id) DO NOTHING`,
      [userId, teamId]
    );

    res.json({ message: 'Favorite team added successfully' });
  } catch (error) {
    console.error('Add favorite team error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const removeFavoriteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    await pool.query(
      'DELETE FROM user_favorite_teams WHERE user_id = $1 AND team_id = $2',
      [userId, teamId]
    );

    res.json({ message: 'Favorite team removed successfully' });
  } catch (error) {
    console.error('Remove favorite team error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserFavoriteTeams = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT t.*, uft.fandom_level, uft.ranking, ur.quality_score, ur.verified_status
       FROM user_favorite_teams uft
       JOIN teams t ON uft.team_id = t.id
       LEFT JOIN user_reputation ur ON ur.user_id = uft.user_id AND ur.team_id = t.id
       WHERE uft.user_id = $1
       ORDER BY uft.ranking`,
      [userId]
    );

    res.json({ teams: result.rows });
  } catch (error) {
    console.error('Get favorite teams error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  addFavoriteTeam,
  removeFavoriteTeam,
  getUserFavoriteTeams
};
