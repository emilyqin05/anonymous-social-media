const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Get all comments for a post
router.get('/post/:postId', (req, res) => {
  const { postId } = req.params;
  
  const query = `
    SELECT 
      c.*,
      v.vote_value as user_vote
    FROM comments c
    LEFT JOIN votes v ON c.id = v.comment_id AND v.username = 'EmilyQ'
    WHERE c.post_id = ? AND c.is_deleted = 0
    ORDER BY c.created_at ASC
  `;

  db.all(query, [postId], (err, rows) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }

    const comments = rows.map(row => ({
      ...row,
      score: parseInt(row.score),
      user_vote: row.user_vote || null
    }));

    res.json(comments);
  });
});

// Create a new comment
router.post('/', (req, res) => {
  const { postId, content } = req.body;
  
  if (!postId || !content) {
    return res.status(400).json({ error: 'postId and content are required' });
  }

  const username = 'EmilyQ'; // Hardcoded for now

  const query = `
    INSERT INTO comments (post_id, username, content)
    VALUES (?, ?, ?)
  `;

  db.run(query, [postId, username, content], function(err) {
    if (err) {
      console.error('Error creating comment:', err);
      return res.status(500).json({ error: 'Failed to create comment' });
    }

    const commentId = this.lastID;

    // Return the created comment
    const getCommentQuery = `
      SELECT 
        c.*,
        v.vote_value as user_vote
      FROM comments c
      LEFT JOIN votes v ON c.id = v.comment_id AND v.username = ?
      WHERE c.id = ?
    `;

    db.get(getCommentQuery, [username, commentId], (err, row) => {
      if (err) {
        console.error('Error fetching created comment:', err);
        return res.status(500).json({ error: 'Failed to fetch created comment' });
      }

      const comment = {
        ...row,
        score: parseInt(row.score),
        user_vote: row.user_vote || null
      };

      res.status(201).json(comment);
    });
  });
});

// Update a comment
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const username = 'EmilyQ'; // Hardcoded for now

  const query = 'UPDATE comments SET content = ? WHERE id = ? AND username = ? AND is_deleted = 0';
  
  db.run(query, [content, id, username], function(err) {
    if (err) {
      console.error('Error updating comment:', err);
      return res.status(500).json({ error: 'Failed to update comment' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Comment not found or not authorized' });
    }

    res.json({ message: 'Comment updated successfully' });
  });
});

// Delete a comment (soft delete)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const username = 'EmilyQ'; // Hardcoded for now

  const query = 'UPDATE comments SET is_deleted = 1 WHERE id = ? AND username = ?';
  
  db.run(query, [id, username], function(err) {
    if (err) {
      console.error('Error deleting comment:', err);
      return res.status(500).json({ error: 'Failed to delete comment' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Comment not found or not authorized' });
    }

    res.json({ message: 'Comment deleted successfully' });
  });
});

module.exports = router;
