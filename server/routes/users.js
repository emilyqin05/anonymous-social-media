const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Get current user info (for testing with hardcoded user)
router.get('/me', (req, res) => {
  const username = 'EmilyQ'; // Hardcoded for now

  const query = 'SELECT id, username, email, created_at FROM users WHERE username = ?';
  
  db.get(query, [username], (err, row) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(row);
  });
});

// Get user's home feed posts
router.get('/feed', (req, res) => {
  const username = 'EmilyQ'; // Hardcoded for now
  const { sortBy = 'score', limit = 50 } = req.query;

  // Get user's followed courses and tags
  const getFollowedDataQuery = `
    SELECT 
      GROUP_CONCAT(cf.course_id) as followed_courses,
      GROUP_CONCAT(t.name) as followed_tags
    FROM course_follows cf
    LEFT JOIN tag_follows tf ON cf.username = tf.username
    LEFT JOIN tags t ON tf.tag_id = t.id
    WHERE cf.username = ?
  `;

  db.get(getFollowedDataQuery, [username], (err, followedData) => {
    if (err) {
      console.error('Error fetching followed data:', err);
      return res.status(500).json({ error: 'Failed to fetch followed data' });
    }

    const followedCourses = followedData.followed_courses ? followedData.followed_courses.split(',') : [];
    const followedTags = followedData.followed_tags ? followedData.followed_tags.split(',') : [];

    // Get posts from followed courses
    let coursePostsQuery = `
      SELECT 
        p.*,
        GROUP_CONCAT(t.name) as tags
      FROM posts p
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.course_id IN (${followedCourses.map(() => '?').join(',')})
    `;

    const params = [...followedCourses];

    // Get posts with followed tags (from explore posts)
    let explorePostsQuery = `
      SELECT 
        p.*,
        GROUP_CONCAT(t.name) as tags
      FROM posts p
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.course_id IS NULL
      AND EXISTS (
        SELECT 1 FROM post_tags pt2 
        JOIN tags t2 ON pt2.tag_id = t2.id 
        WHERE pt2.post_id = p.id 
        AND t2.name IN (${followedTags.map(() => '?').join(',')})
      )
      AND p.score >= 10
    `;

    const exploreParams = [...followedTags];

    // Combine both queries
    const combinedQuery = `
      ${coursePostsQuery}
      UNION
      ${explorePostsQuery}
      GROUP BY p.id
      ORDER BY ${sortBy === 'score' ? 'p.score DESC' : 'p.created_at DESC'}
      LIMIT ?
    `;

    const allParams = [...params, ...exploreParams, parseInt(limit)];

    db.all(combinedQuery, allParams, (err, rows) => {
      if (err) {
        console.error('Error fetching feed posts:', err);
        return res.status(500).json({ error: 'Failed to fetch feed posts' });
      }

      const posts = rows.map(row => ({
        ...row,
        tags: row.tags ? row.tags.split(',') : [],
        score: parseInt(row.score),
        user_vote: null // Will be set by client
      }));

      res.json(posts);
    });
  });
});

// Get user's posts
router.get('/posts', (req, res) => {
  const username = 'EmilyQ'; // Hardcoded for now
  const { limit = 50 } = req.query;

  const query = `
    SELECT 
      p.*,
      GROUP_CONCAT(t.name) as tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.username = ?
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ?
  `;

  db.all(query, [username, parseInt(limit)], (err, rows) => {
    if (err) {
      console.error('Error fetching user posts:', err);
      return res.status(500).json({ error: 'Failed to fetch user posts' });
    }

    const posts = rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : [],
      score: parseInt(row.score),
      user_vote: null
    }));

    res.json(posts);
  });
});

module.exports = router;
