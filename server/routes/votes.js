const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Vote on a post or comment
router.post('/', (req, res) => {
  const { postId, commentId, voteValue } = req.body;
  
  if (!voteValue || ![-1, 1].includes(voteValue)) {
    return res.status(400).json({ error: 'voteValue (1 or -1) is required' });
  }

  if (!postId && !commentId) {
    return res.status(400).json({ error: 'Either postId or commentId is required' });
  }

  if (postId && commentId) {
    return res.status(400).json({ error: 'Cannot vote on both post and comment simultaneously' });
  }

  // For now, use a hardcoded username since we're not implementing auth yet
  const username = 'EmilyQ';

  // Check if user has already voted on this post/comment
  const checkVoteQuery = postId 
    ? 'SELECT vote_value FROM votes WHERE post_id = ? AND username = ?'
    : 'SELECT vote_value FROM votes WHERE comment_id = ? AND username = ?';
  
  const checkParams = postId ? [postId, username] : [commentId, username];
  
  db.get(checkVoteQuery, checkParams, (err, existingVote) => {
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

      let responseHandled = false;

      const handleError = (err, message) => {
        if (responseHandled) return;
        responseHandled = true;
        console.error(message, err);
        db.run('ROLLBACK');
        res.status(500).json({ error: message });
      };

      const sendSuccess = (item) => {
        if (responseHandled) return;
        responseHandled = true;
        db.run('COMMIT', (err) => {
          if (err) {
            console.error('Failed to commit transaction:', err);
            return res.status(500).json({ error: 'Failed to commit transaction' });
          }
          
          res.json({
            postId: postId ? parseInt(postId) : null,
            commentId: commentId ? parseInt(commentId) : null,
            score: item.score,
            userVote: newVoteValue
          });
        });
      };

      const updateScoreAndRespond = () => {
        const updateQuery = postId 
          ? 'UPDATE posts SET score = score + ? WHERE id = ?' 
          : 'UPDATE comments SET score = score + ? WHERE id = ?';
        const updateParams = postId ? [scoreChange, postId] : [scoreChange, commentId];
        
        db.run(updateQuery, updateParams, function(err) {
          if (err) return handleError(err, 'Failed to update score');
          
          const getScoreQuery = postId 
            ? 'SELECT score FROM posts WHERE id = ?' 
            : 'SELECT score FROM comments WHERE id = ?';
          const getScoreParams = postId ? [postId] : [commentId];
          
          db.get(getScoreQuery, getScoreParams, (err, item) => {
            if (err) return handleError(err, 'Failed to get updated score');
            sendSuccess(item);
          });
        });
      };

      if (newVoteValue === null) {
        // Remove the vote
        const deleteQuery = postId 
          ? 'DELETE FROM votes WHERE post_id = ? AND username = ?' 
          : 'DELETE FROM votes WHERE comment_id = ? AND username = ?';
        const deleteParams = postId ? [postId, username] : [commentId, username];
        
        db.run(deleteQuery, deleteParams, function(err) {
          if (err) return handleError(err, 'Failed to delete vote');
          updateScoreAndRespond();
        });
      } else if (existingVote) {
        // Update existing vote
        const updateVoteQuery = postId 
          ? 'UPDATE votes SET vote_value = ? WHERE post_id = ? AND username = ?' 
          : 'UPDATE votes SET vote_value = ? WHERE comment_id = ? AND username = ?';
        const updateVoteParams = postId ? [newVoteValue, postId, username] : [newVoteValue, commentId, username];
        
        db.run(updateVoteQuery, updateVoteParams, function(err) {
          if (err) return handleError(err, 'Failed to update vote');
          updateScoreAndRespond();
        });
      } else {
        // Insert new vote
        let insertQuery, insertParams;
        
        if (postId) {
          insertQuery = 'INSERT INTO votes (post_id, username, vote_value) VALUES (?, ?, ?)';
          insertParams = [postId, username, newVoteValue];
        } else {
          insertQuery = 'INSERT INTO votes (comment_id, username, vote_value) VALUES (?, ?, ?)';
          insertParams = [commentId, username, newVoteValue];
        }
        
        console.log('INSERT QUERY:', insertQuery);
        console.log('INSERT PARAMS:', insertParams);
        
        db.run(insertQuery, insertParams, function(err) {
          if (err) return handleError(err, 'Failed to insert vote');
          updateScoreAndRespond();
        });
      }
    });
  });
});

// Get user's vote on a post or comment
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const { type } = req.query; // 'post' or 'comment'
  const username = 'EmilyQ'; // Hardcoded for now

  if (!type || !['post', 'comment'].includes(type)) {
    return res.status(400).json({ error: 'Type parameter must be "post" or "comment"' });
  }

  const query = type === 'post' 
    ? 'SELECT vote_value FROM votes WHERE post_id = ? AND username = ?'
    : 'SELECT vote_value FROM votes WHERE comment_id = ? AND username = ?';
  
  db.get(query, [id, username], (err, row) => {
    if (err) {
      console.error('Error fetching vote:', err);
      return res.status(500).json({ error: 'Failed to fetch vote' });
    }

    res.json({
      [type === 'post' ? 'postId' : 'commentId']: parseInt(id),
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