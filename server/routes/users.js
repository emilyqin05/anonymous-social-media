const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Get current user info (for testing with hardcoded user)
router.get('/me', (req, res) => {
  const username = 'EmilyQ';

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
  const username = 'EmilyQ';
  const { sortBy = 'score', limit = 50 } = req.query;

  const getFollowedCoursesQuery = 'SELECT course_id FROM course_follows WHERE username = ?';
  const getFollowedTagsQuery = 'SELECT t.name FROM tag_follows tf JOIN tags t ON tf.tag_id = t.id WHERE tf.username = ?';

  db.all(getFollowedCoursesQuery, [username], (err, courseRows) => {
    if (err) {
      console.error('Error fetching followed courses:', err);
      return res.status(500).json({ error: 'Failed to fetch followed courses' });
    }

    const followedCourses = courseRows.map(row => row.course_id);



    db.all(getFollowedTagsQuery, [username], (err, tagRows) => {
      if (err) {
        console.error('Error fetching followed tags:', err);
        return res.status(500).json({ error: 'Failed to fetch followed tags' });
      }

      const followedTags = tagRows.map(row => row.name);



      let queries = [];
      let allParams = [];

      if (followedCourses.length > 0) {
        const coursePostsQuery = `
          SELECT DISTINCT p.id, p.title, p.content, p.username, p.score, p.course_id, p.professor, p.created_at, GROUP_CONCAT(t.name) as tags
          FROM posts p
          LEFT JOIN post_tags pt ON p.id = pt.post_id
          LEFT JOIN tags t ON pt.tag_id = t.id
          WHERE p.course_id IN (${followedCourses.map(() => '?').join(',')})
          AND p.is_deleted = 0
          GROUP BY p.id
        `;
        queries.push(coursePostsQuery);
        allParams.push(...followedCourses);
      }

      if (followedTags.length > 0) {
        const explorePostsQuery = `
          SELECT DISTINCT p.id, p.title, p.content, p.username, p.score, p.course_id, p.professor, p.created_at, GROUP_CONCAT(t.name) as tags
          FROM posts p
          LEFT JOIN post_tags pt ON p.id = pt.post_id
          LEFT JOIN tags t ON pt.tag_id = t.id
          WHERE p.course_id IS NULL
          AND EXISTS (SELECT 1 FROM post_tags pt2 JOIN tags t2 ON pt2.tag_id = t2.id WHERE pt2.post_id = p.id AND t2.name IN (${followedTags.map(() => '?').join(',')}))
          AND p.is_deleted = 0
          GROUP BY p.id
        `;
        queries.push(explorePostsQuery);
        allParams.push(...followedTags);
      }

      if (queries.length === 0) {
        return res.json([]);
      }

      const combinedQuery = `${queries.join(' UNION ')} ORDER BY ${sortBy === 'score' ? 'score DESC' : 'created_at DESC'} LIMIT ?`;
      allParams.push(parseInt(limit));


      db.all(combinedQuery, allParams, (err, rows) => {
        if (err) {
          console.error('Error fetching feed posts:', err);
          return res.status(500).json({ error: 'Failed to fetch feed posts' });
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
  });
});

// Get user's posts
router.get('/posts', (req, res) => {
  const username = 'EmilyQ';
  const { limit = 50 } = req.query;

  const query = `
    SELECT p.*, GROUP_CONCAT(t.name) as tags
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