const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const { verifyToken } = require('./auth');

// Get all posts with optional filtering
router.get('/', (req, res) => {
  const { courseId, sortBy = 'score', limit = 50 } = req.query;
  
  let query = `
    SELECT 
      p.*,
      GROUP_CONCAT(t.name) as tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.is_deleted = 0
  `;
  
  const params = [];
  
  if (courseId) {
    query += ' AND p.course_id = ?';
    params.push(courseId);
  }
  
  query += ' GROUP BY p.id';
  
  if (sortBy === 'score') {
    query += ' ORDER BY p.score DESC';
  } else if (sortBy === 'new') {
    query += ' ORDER BY p.created_at DESC';
  }
  
  query += ' LIMIT ?';
  params.push(parseInt(limit));

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    // Parse tags from comma-separated string
    const posts = rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : [],
      score: parseInt(row.score),
      user_vote: null // Will be set by client based on auth
    }));

    res.json(posts);
  });
});

// Get a single post by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      p.*,
      GROUP_CONCAT(t.name) as tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.id = ? AND p.is_deleted = 0
    GROUP BY p.id
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching post:', err);
      return res.status(500).json({ error: 'Failed to fetch post' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = {
      ...row,
      tags: row.tags ? row.tags.split(',') : [],
      score: parseInt(row.score),
      user_vote: null
    };

    res.json(post);
  });
});

// Create a new post
router.post('/', verifyToken, (req, res) => {
  const { title, content, courseId, professor, tags = [] } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  // Get username from authenticated user
  const username = req.user.username;

  const query = `
    INSERT INTO posts (title, content, username, course_id, professor)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [title, content, username, courseId || null, professor || null], function(err) {
    if (err) {
      console.error('Error creating post:', err);
      return res.status(500).json({ error: 'Failed to create post' });
    }

    const postId = this.lastID;

    // Insert tags if provided
    if (tags && tags.length > 0) {
      const insertTagQuery = `
        INSERT OR IGNORE INTO post_tags (post_id, tag_id)
        SELECT ?, id FROM tags WHERE name = ?
      `;

      tags.forEach(tagName => {
        db.run(insertTagQuery, [postId, tagName]);
      });
    }

    // Return the created post
    const getPostQuery = `
      SELECT 
        p.*,
        GROUP_CONCAT(t.name) as tags
      FROM posts p
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.id = ?
      GROUP BY p.id
    `;

    db.get(getPostQuery, [postId], (err, row) => {
      if (err) {
        console.error('Error fetching created post:', err);
        return res.status(500).json({ error: 'Failed to fetch created post' });
      }

      const post = {
        ...row,
        tags: row.tags ? row.tags.split(',') : [],
        score: parseInt(row.score),
        user_vote: 1 // User automatically upvotes their own post
      };

      res.status(201).json(post);
    });
  });
});

// Update a post (for future use)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const query = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
  
  db.run(query, [title, content, id], function(err) {
    if (err) {
      console.error('Error updating post:', err);
      return res.status(500).json({ error: 'Failed to update post' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post updated successfully' });
  });
});

// Delete a post (soft delete)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const username = 'EmilyQ'; // Hardcoded for now

  const query = 'UPDATE posts SET is_deleted = 1 WHERE id = ? AND username = ?';
  
  db.run(query, [id, username], function(err) {
    if (err) {
      console.error('Error deleting post:', err);
      return res.status(500).json({ error: 'Failed to delete post' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Post not found or not authorized' });
    }

    res.json({ message: 'Post deleted successfully' });
  });
});

module.exports = router;
