const pool = require('../config/database');

const createPost = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { teamId, content, postType, parentPostId, mediaUrls } = req.body;
    const userId = req.user.id;

    // Validate team exists
    const teamCheck = await client.query('SELECT id FROM teams WHERE id = $1', [teamId]);
    if (teamCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Team not found' });
    }

    // Create post
    const postResult = await client.query(
      `INSERT INTO posts (user_id, team_id, content, post_type, parent_post_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, teamId, content, postType || 'discussion', parentPostId || null]
    );

    const post = postResult.rows[0];

    // Add media if provided
    if (mediaUrls && mediaUrls.length > 0) {
      for (const mediaUrl of mediaUrls) {
        await client.query(
          'INSERT INTO post_media (post_id, media_url, media_type) VALUES ($1, $2, $3)',
          [post.id, mediaUrl, 'image']
        );
      }
    }

    await client.query('COMMIT');

    // Fetch complete post with user info
    const completePost = await pool.query(
      `SELECT p.*, u.username, u.profile_image, t.name as team_name, t.logo_url as team_logo,
              COALESCE(json_agg(pm.media_url) FILTER (WHERE pm.media_url IS NOT NULL), '[]') as media_urls
       FROM posts p
       JOIN users u ON p.user_id = u.id
       JOIN teams t ON p.team_id = t.id
       LEFT JOIN post_media pm ON p.id = pm.post_id
       WHERE p.id = $1
       GROUP BY p.id, u.username, u.profile_image, t.name, t.logo_url`,
      [post.id]
    );

    res.status(201).json({ post: completePost.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

const getFeed = async (req, res) => {
  try {
    const { teamId, postType, sort = 'recent', limit = 20, offset = 0, minReputation } = req.query;
    const userId = req.user?.id;

    let query = `
      SELECT p.*, u.username, u.profile_image, t.name as team_name, t.logo_url as team_logo,
             t.primary_color as team_color,
             COALESCE(json_agg(pm.media_url) FILTER (WHERE pm.media_url IS NOT NULL), '[]') as media_urls,
             ${userId ? `COALESCE((SELECT vote_type FROM post_votes WHERE post_id = p.id AND user_id = ${userId}), 0) as user_vote` : '0 as user_vote'},
             (SELECT COUNT(*) FROM posts WHERE parent_post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN teams t ON p.team_id = t.id
      LEFT JOIN post_media pm ON p.id = pm.post_id
      WHERE p.parent_post_id IS NULL
    `;

    const params = [];
    let paramCount = 0;

    if (teamId) {
      paramCount++;
      query += ` AND p.team_id = $${paramCount}`;
      params.push(teamId);
    }

    if (postType) {
      paramCount++;
      query += ` AND p.post_type = $${paramCount}`;
      params.push(postType);
    }

    if (minReputation && userId) {
      paramCount++;
      query += ` AND EXISTS (
        SELECT 1 FROM user_reputation ur
        WHERE ur.user_id = p.user_id
        AND ur.team_id = p.team_id
        AND ur.quality_score >= $${paramCount}
      )`;
      params.push(minReputation);
    }

    query += ' GROUP BY p.id, u.username, u.profile_image, t.name, t.logo_url, t.primary_color';

    // Apply sorting
    if (sort === 'top') {
      query += ' ORDER BY (p.upvotes - p.downvotes) DESC, p.created_at DESC';
    } else {
      query += ' ORDER BY p.created_at DESC';
    }

    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get main post
    const postResult = await pool.query(
      `SELECT p.*, u.username, u.profile_image, t.name as team_name, t.logo_url as team_logo,
              t.primary_color as team_color,
              COALESCE(json_agg(pm.media_url) FILTER (WHERE pm.media_url IS NOT NULL), '[]') as media_urls,
              ${userId ? `COALESCE((SELECT vote_type FROM post_votes WHERE post_id = p.id AND user_id = ${userId}), 0) as user_vote` : '0 as user_vote'}
       FROM posts p
       JOIN users u ON p.user_id = u.id
       JOIN teams t ON p.team_id = t.id
       LEFT JOIN post_media pm ON p.id = pm.post_id
       WHERE p.id = $1
       GROUP BY p.id, u.username, u.profile_image, t.name, t.logo_url, t.primary_color`,
      [id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get comments
    const commentsResult = await pool.query(
      `SELECT p.*, u.username, u.profile_image,
              ${userId ? `COALESCE((SELECT vote_type FROM post_votes WHERE post_id = p.id AND user_id = ${userId}), 0) as user_vote` : '0 as user_vote'}
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.parent_post_id = $1
       ORDER BY p.created_at ASC`,
      [id]
    );

    res.json({
      post: postResult.rows[0],
      comments: commentsResult.rows
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const votePost = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { voteType } = req.body; // 1 for upvote, -1 for downvote, 0 to remove vote
    const userId = req.user.id;

    // Check if post exists
    const postCheck = await client.query('SELECT id, user_id, team_id FROM posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postCheck.rows[0];

    // Get existing vote
    const existingVote = await client.query(
      'SELECT vote_type FROM post_votes WHERE post_id = $1 AND user_id = $2',
      [id, userId]
    );

    let oldVoteType = existingVote.rows.length > 0 ? existingVote.rows[0].vote_type : 0;

    if (voteType === 0) {
      // Remove vote
      await client.query(
        'DELETE FROM post_votes WHERE post_id = $1 AND user_id = $2',
        [id, userId]
      );
    } else {
      // Insert or update vote
      await client.query(
        `INSERT INTO post_votes (post_id, user_id, vote_type)
         VALUES ($1, $2, $3)
         ON CONFLICT (post_id, user_id) DO UPDATE SET vote_type = $3`,
        [id, userId, voteType]
      );
    }

    // Update post vote counts
    const upvoteDelta = (voteType === 1 ? 1 : 0) - (oldVoteType === 1 ? 1 : 0);
    const downvoteDelta = (voteType === -1 ? 1 : 0) - (oldVoteType === -1 ? 1 : 0);

    await client.query(
      'UPDATE posts SET upvotes = upvotes + $1, downvotes = downvotes + $2 WHERE id = $3',
      [upvoteDelta, downvoteDelta, id]
    );

    // Update user reputation (post author gets reputation)
    if (post.user_id !== userId) {
      const reputationDelta = upvoteDelta * 5 - downvoteDelta * 2;
      if (reputationDelta !== 0) {
        await client.query(
          `INSERT INTO user_reputation (user_id, team_id, quality_score)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, team_id) DO UPDATE
           SET quality_score = user_reputation.quality_score + $3`,
          [post.user_id, post.team_id, reputationDelta]
        );
      }
    }

    await client.query('COMMIT');

    res.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Vote post error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if post exists and user owns it
    const postCheck = await pool.query(
      'SELECT id FROM posts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [id]);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createPost,
  getFeed,
  getPostById,
  votePost,
  deletePost
};
