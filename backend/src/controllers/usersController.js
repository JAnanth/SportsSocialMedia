const pool = require('../config/database');

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const result = await pool.query(
      `SELECT u.id, u.username, u.hometown, u.bio, u.profile_image, u.created_at,
              COALESCE(json_agg(
                DISTINCT jsonb_build_object(
                  'team_id', t.id,
                  'team_name', t.name,
                  'team_logo', t.logo_url,
                  'fandom_level', uft.fandom_level,
                  'ranking', uft.ranking,
                  'quality_score', ur.quality_score,
                  'verified_status', ur.verified_status
                ) ORDER BY uft.ranking
              ) FILTER (WHERE t.id IS NOT NULL), '[]') as favorite_teams,
              (SELECT COUNT(*) FROM user_follows WHERE following_id = u.id) as follower_count,
              (SELECT COUNT(*) FROM user_follows WHERE follower_id = u.id) as following_count,
              ${currentUserId ? `(SELECT COUNT(*) > 0 FROM user_follows WHERE follower_id = ${currentUserId} AND following_id = u.id) as is_following` : 'false as is_following'}
       FROM users u
       LEFT JOIN user_favorite_teams uft ON u.id = uft.user_id
       LEFT JOIN teams t ON uft.team_id = t.id
       LEFT JOIN user_reputation ur ON ur.user_id = u.id AND ur.team_id = t.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, hometown, bio, profileImage } = req.body;
    const userId = req.user.id;

    // Check if username is taken (if changing)
    if (username) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const result = await pool.query(
      `UPDATE users
       SET username = COALESCE($1, username),
           hometown = COALESCE($2, hometown),
           bio = COALESCE($3, bio),
           profile_image = COALESCE($4, profile_image),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, username, email, hometown, bio, profile_image`,
      [username, hometown, bio, profileImage, userId]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    const currentUserId = req.user?.id;

    const result = await pool.query(
      `SELECT p.*, t.name as team_name, t.logo_url as team_logo,
              COALESCE(json_agg(pm.media_url) FILTER (WHERE pm.media_url IS NOT NULL), '[]') as media_urls,
              ${currentUserId ? `COALESCE((SELECT vote_type FROM post_votes WHERE post_id = p.id AND user_id = ${currentUserId}), 0) as user_vote` : '0 as user_vote'},
              (SELECT COUNT(*) FROM posts WHERE parent_post_id = p.id) as comment_count
       FROM posts p
       JOIN teams t ON p.team_id = t.id
       LEFT JOIN post_media pm ON p.id = pm.post_id
       WHERE p.user_id = $1 AND p.parent_post_id IS NULL
       GROUP BY p.id, t.name, t.logo_url
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user.id;

    if (parseInt(id) === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await pool.query(
      `INSERT INTO user_follows (follower_id, following_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [followerId, id]
    );

    // Create notification
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_user_id)
       VALUES ($1, 'follow', 'New follower', 'started following you', $2)`,
      [id, followerId]
    );

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user.id;

    await pool.query(
      'DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, id]
    );

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT u.id, u.username, u.profile_image, u.bio
       FROM user_follows uf
       JOIN users u ON uf.follower_id = u.id
       WHERE uf.following_id = $1
       ORDER BY uf.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.json({ followers: result.rows });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT u.id, u.username, u.profile_image, u.bio
       FROM user_follows uf
       JOIN users u ON uf.following_id = u.id
       WHERE uf.follower_id = $1
       ORDER BY uf.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.json({ following: result.rows });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const result = await pool.query(
      `SELECT id, username, profile_image, bio, hometown
       FROM users
       WHERE username ILIKE $1
       ORDER BY username
       LIMIT $2`,
      [`%${q}%`, limit]
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  getUserPosts,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers
};
