const pool = require('../config/database');

const createGameThread = async (req, res) => {
  try {
    const { teamId, opponentId, gameDate, isHomeTeam } = req.body;

    // Validate teams exist
    const teamCheck = await pool.query(
      'SELECT id FROM teams WHERE id = $1 OR id = $2',
      [teamId, opponentId]
    );

    if (teamCheck.rows.length < 2) {
      return res.status(404).json({ error: 'One or both teams not found' });
    }

    const result = await pool.query(
      `INSERT INTO game_threads (team_id, opponent_id, game_date, is_home_team, status)
       VALUES ($1, $2, $3, $4, 'scheduled')
       RETURNING *`,
      [teamId, opponentId, gameDate, isHomeTeam]
    );

    res.status(201).json({ gameThread: result.rows[0] });
  } catch (error) {
    console.error('Create game thread error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getGameThreads = async (req, res) => {
  try {
    const { teamId, status, limit = 20 } = req.query;

    let query = `
      SELECT gt.*,
             t1.name as team_name, t1.logo_url as team_logo,
             t2.name as opponent_name, t2.logo_url as opponent_logo,
             (SELECT COUNT(*) FROM game_thread_posts WHERE game_thread_id = gt.id) as post_count
      FROM game_threads gt
      JOIN teams t1 ON gt.team_id = t1.id
      JOIN teams t2 ON gt.opponent_id = t2.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (teamId) {
      paramCount++;
      query += ` AND (gt.team_id = $${paramCount} OR gt.opponent_id = $${paramCount})`;
      params.push(teamId);
    }

    if (status) {
      paramCount++;
      query += ` AND gt.status = $${paramCount}`;
      params.push(status);
    }

    query += ' ORDER BY gt.game_date DESC';

    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    const result = await pool.query(query, params);

    res.json({ gameThreads: result.rows });
  } catch (error) {
    console.error('Get game threads error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getGameThreadById = async (req, res) => {
  try {
    const { id } = req.params;

    const threadResult = await pool.query(
      `SELECT gt.*,
              t1.name as team_name, t1.logo_url as team_logo, t1.primary_color as team_color,
              t2.name as opponent_name, t2.logo_url as opponent_logo, t2.primary_color as opponent_color
       FROM game_threads gt
       JOIN teams t1 ON gt.team_id = t1.id
       JOIN teams t2 ON gt.opponent_id = t2.id
       WHERE gt.id = $1`,
      [id]
    );

    if (threadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Game thread not found' });
    }

    res.json({ gameThread: threadResult.rows[0] });
  } catch (error) {
    console.error('Get game thread error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateGameThread = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, homeScore, awayScore } = req.body;

    const result = await pool.query(
      `UPDATE game_threads
       SET status = COALESCE($1, status),
           home_score = COALESCE($2, home_score),
           away_score = COALESCE($3, away_score),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, homeScore, awayScore, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game thread not found' });
    }

    res.json({ gameThread: result.rows[0] });
  } catch (error) {
    console.error('Update game thread error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createGameThreadPost = async (req, res) => {
  try {
    const { gameThreadId, content, postPhase } = req.body;
    const userId = req.user.id;

    // Verify game thread exists
    const threadCheck = await pool.query(
      'SELECT id FROM game_threads WHERE id = $1',
      [gameThreadId]
    );

    if (threadCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Game thread not found' });
    }

    const result = await pool.query(
      `INSERT INTO game_thread_posts (game_thread_id, user_id, content, post_phase)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [gameThreadId, userId, content, postPhase || 'live']
    );

    // Get complete post with user info
    const completePost = await pool.query(
      `SELECT gtp.*, u.username, u.profile_image
       FROM game_thread_posts gtp
       JOIN users u ON gtp.user_id = u.id
       WHERE gtp.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({ post: completePost.rows[0] });
  } catch (error) {
    console.error('Create game thread post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getGameThreadPosts = async (req, res) => {
  try {
    const { gameThreadId } = req.params;
    const { postPhase, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT gtp.*, u.username, u.profile_image
      FROM game_thread_posts gtp
      JOIN users u ON gtp.user_id = u.id
      WHERE gtp.game_thread_id = $1
    `;

    const params = [gameThreadId];
    let paramCount = 1;

    if (postPhase) {
      paramCount++;
      query += ` AND gtp.post_phase = $${paramCount}`;
      params.push(postPhase);
    }

    query += ' ORDER BY gtp.created_at ASC';

    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get game thread posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createGameThread,
  getGameThreads,
  getGameThreadById,
  updateGameThread,
  createGameThreadPost,
  getGameThreadPosts
};
