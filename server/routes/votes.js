const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Vote on a post
router.post('/', (req, res) => {
  const { postId, voteValue } = req.body;
  
  if (!postId || !voteValue || ![-1, 1].includes(voteValue)) {
    return res.status(400).json({ error: 'postId and voteValue (1 or -1) are required' });
  }

  // For now, use a hardcoded username since we're not implementing auth yet
  const username = 'EmilyQ';

  // Check if user has already voted on this post
  const checkVoteQuery = 'SELECT vote_value FROM votes WHERE post_id = ? AND username = ?';
  
  db.get(checkVoteQuery, [postId, username], (err, existingVote) => {
    if (err) {
      console.error('Error checking existing vote:', err);
      return res.status(500).json({ error: 'Failed to check existing vote' });
    }

    let newVoteValue = voteValue;
    let scoreChange = voteValue;

    if (existingVote) {
      if (existingVote.vote_value === voteValue) {
        // User is removing their vote
        newVoteValue = null;
        scoreChange = -voteValue;
      } else {
        // User is changing their vote
        scoreChange = voteValue - existingVote.vote_value;
      }
    }

    // Start a transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      if (newVoteValue === null) {
        // Remove the vote
        db.run('DELETE FROM votes WHERE post_id = ? AND username = ?', [postId, username]);
      } else if (existingVote) {
        // Update existing vote
        db.run('UPDATE votes SET vote_value = ? WHERE post_id = ? AND username = ?', 
               [newVoteValue, postId, username]);
      } else {
        // Insert new vote
        db.run('INSERT INTO votes (post_id, username, vote_value) VALUES (?, ?, ?)', 
               [postId, username, newVoteValue]);
      }

      // Update post score
      db.run('UPDATE posts SET score = score + ? WHERE id = ?', [scoreChange, postId]);

      // Get updated post score
      db.get('SELECT score FROM posts WHERE id = ?', [postId], (err, post) => {
        if (err) {
          console.error('Error getting updated score:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to update vote' });
        }

        db.run('COMMIT', (err) => {
          if (err) {
            console.error('Error committing transaction:', err);
            return res.status(500).json({ error: 'Failed to update vote' });
          }

          res.json({
            postId: parseInt(postId),
            score: post.score,
            userVote: newVoteValue
          });
        });
      });
    });
  });
});

// Get user's vote on a post
router.get('/:postId', (req, res) => {
  const { postId } = req.params;
  const username = 'EmilyQ'; // Hardcoded for now

  const query = 'SELECT vote_value FROM votes WHERE post_id = ? AND username = ?';
  
  db.get(query, [postId, username], (err, row) => {
    if (err) {
      console.error('Error fetching vote:', err);
      return res.status(500).json({ error: 'Failed to fetch vote' });
    }

    res.json({
      postId: parseInt(postId),
      userVote: row ? row.vote_value : null
    });
  });
});

// Get all votes for a user (for debugging)
router.get('/user/:username', (req, res) => {
  const { username } = req.params;

  const query = 'SELECT post_id, vote_value FROM votes WHERE username = ?';
  
  db.all(query, [username], (err, rows) => {
    if (err) {
      console.error('Error fetching user votes:', err);
      return res.status(500).json({ error: 'Failed to fetch user votes' });
    }

    const votes = rows.map(row => ({
      postId: row.post_id,
      voteValue: row.vote_value
    }));

    res.json(votes);
  });
});

module.exports = router;
