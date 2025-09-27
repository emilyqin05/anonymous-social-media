const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Follow/unfollow a course
router.post('/course', (req, res) => {
  const { courseId, action } = req.body;
  
  if (!courseId || !action || !['follow', 'unfollow'].includes(action)) {
    return res.status(400).json({ error: 'courseId and action (follow/unfollow) are required' });
  }

  const username = 'EmilyQ'; // Hardcoded for now

  if (action === 'follow') {
    const query = 'INSERT OR IGNORE INTO course_follows (username, course_id) VALUES (?, ?)';
    
    db.run(query, [username, courseId], function(err) {
      if (err) {
        console.error('Error following course:', err);
        return res.status(500).json({ error: 'Failed to follow course' });
      }

      // Update course follower count
      db.run('UPDATE courses SET follower_count = follower_count + 1 WHERE id = ?', [courseId]);

      res.json({ message: 'Course followed successfully' });
    });
  } else {
    const query = 'DELETE FROM course_follows WHERE username = ? AND course_id = ?';
    
    db.run(query, [username, courseId], function(err) {
      if (err) {
        console.error('Error unfollowing course:', err);
        return res.status(500).json({ error: 'Failed to unfollow course' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Course follow not found' });
      }

      // Update course follower count
      db.run('UPDATE courses SET follower_count = follower_count - 1 WHERE id = ?', [courseId]);

      res.json({ message: 'Course unfollowed successfully' });
    });
  }
});

// Follow/unfollow a tag
router.post('/tag', (req, res) => {
  const { tagName, action } = req.body;
  
  if (!tagName || !action || !['follow', 'unfollow'].includes(action)) {
    return res.status(400).json({ error: 'tagName and action (follow/unfollow) are required' });
  }

  const username = 'EmilyQ'; // Hardcoded for now

  if (action === 'follow') {
    // First ensure the tag exists
    db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tagName], (err) => {
      if (err) {
        console.error('Error creating tag:', err);
        return res.status(500).json({ error: 'Failed to create tag' });
      }

      // Then follow the tag
      const query = 'INSERT OR IGNORE INTO tag_follows (username, tag_id) SELECT ?, id FROM tags WHERE name = ?';
      
      db.run(query, [username, tagName], function(err) {
        if (err) {
          console.error('Error following tag:', err);
          return res.status(500).json({ error: 'Failed to follow tag' });
        }

        res.json({ message: 'Tag followed successfully' });
      });
    });
  } else {
    const query = `
      DELETE FROM tag_follows 
      WHERE username = ? AND tag_id = (SELECT id FROM tags WHERE name = ?)
    `;
    
    db.run(query, [username, tagName], function(err) {
      if (err) {
        console.error('Error unfollowing tag:', err);
        return res.status(500).json({ error: 'Failed to unfollow tag' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Tag follow not found' });
      }

      res.json({ message: 'Tag unfollowed successfully' });
    });
  }
});

// Set professor preference for a course
router.post('/professor-preference', (req, res) => {
  const { courseId, professorName } = req.body;
  
  if (!courseId || !professorName) {
    return res.status(400).json({ error: 'courseId and professorName are required' });
  }

  const username = 'EmilyQ'; // Hardcoded for now

  const query = `
    INSERT OR REPLACE INTO professor_preferences (username, course_id, professor_name)
    VALUES (?, ?, ?)
  `;
  
  db.run(query, [username, courseId, professorName], function(err) {
    if (err) {
      console.error('Error setting professor preference:', err);
      return res.status(500).json({ error: 'Failed to set professor preference' });
    }

    res.json({ message: 'Professor preference set successfully' });
  });
});

// Get user's followed courses
router.get('/courses', (req, res) => {
  const username = 'EmilyQ'; // Hardcoded for now

  const query = 'SELECT course_id FROM course_follows WHERE username = ?';
  
  db.all(query, [username], (err, rows) => {
    if (err) {
      console.error('Error fetching followed courses:', err);
      return res.status(500).json({ error: 'Failed to fetch followed courses' });
    }

    const courseIds = rows.map(row => row.course_id);
    res.json(courseIds);
  });
});

// Get user's followed tags
router.get('/tags', (req, res) => {
  const username = 'EmilyQ'; // Hardcoded for now

  const query = `
    SELECT t.name 
    FROM tag_follows tf
    JOIN tags t ON tf.tag_id = t.id
    WHERE tf.username = ?
  `;
  
  db.all(query, [username], (err, rows) => {
    if (err) {
      console.error('Error fetching followed tags:', err);
      return res.status(500).json({ error: 'Failed to fetch followed tags' });
    }

    const tagNames = rows.map(row => row.name);
    res.json(tagNames);
  });
});

// Get user's professor preferences
router.get('/professor-preferences', (req, res) => {
  const username = 'EmilyQ'; // Hardcoded for now

  const query = 'SELECT course_id, professor_name FROM professor_preferences WHERE username = ?';
  
  db.all(query, [username], (err, rows) => {
    if (err) {
      console.error('Error fetching professor preferences:', err);
      return res.status(500).json({ error: 'Failed to fetch professor preferences' });
    }

    const preferences = {};
    rows.forEach(row => {
      preferences[row.course_id] = row.professor_name;
    });

    res.json(preferences);
  });
});

module.exports = router;
