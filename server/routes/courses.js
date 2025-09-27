const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Get all courses
router.get('/', (req, res) => {
  const query = `
    SELECT 
      c.*,
      GROUP_CONCAT(p.name) as professors
    FROM courses c
    LEFT JOIN professors p ON c.id = p.course_id
    GROUP BY c.id
    ORDER BY c.follower_count DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching courses:', err);
      return res.status(500).json({ error: 'Failed to fetch courses' });
    }

    const courses = rows.map(row => ({
      ...row,
      professors: row.professors ? row.professors.split(',') : [],
      followerCount: parseInt(row.follower_count)
    }));

    res.json(courses);
  });
});

// Get a single course by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      c.*,
      GROUP_CONCAT(p.name) as professors
    FROM courses c
    LEFT JOIN professors p ON c.id = p.course_id
    WHERE c.id = ?
    GROUP BY c.id
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching course:', err);
      return res.status(500).json({ error: 'Failed to fetch course' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = {
      ...row,
      professors: row.professors ? row.professors.split(',') : [],
      followerCount: parseInt(row.follower_count)
    };

    res.json(course);
  });
});

// Create a new course (admin function)
router.post('/', (req, res) => {
  const { id, name, code, description, professors = [] } = req.body;
  
  if (!id || !name || !code) {
    return res.status(400).json({ error: 'ID, name, and code are required' });
  }

  const query = `
    INSERT INTO courses (id, name, code, description)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [id, name, code, description], function(err) {
    if (err) {
      console.error('Error creating course:', err);
      return res.status(500).json({ error: 'Failed to create course' });
    }

    // Insert professors
    if (professors && professors.length > 0) {
      const insertProfessorQuery = `
        INSERT INTO professors (name, course_id)
        VALUES (?, ?)
      `;

      professors.forEach(professor => {
        db.run(insertProfessorQuery, [professor, id]);
      });
    }

    res.status(201).json({ message: 'Course created successfully', courseId: id });
  });
});

// Update course follower count
router.patch('/:id/followers', (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'follow' or 'unfollow'

  if (!action || !['follow', 'unfollow'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action. Must be "follow" or "unfollow"' });
  }

  const delta = action === 'follow' ? 1 : -1;
  const query = 'UPDATE courses SET follower_count = follower_count + ? WHERE id = ?';

  db.run(query, [delta, id], function(err) {
    if (err) {
      console.error('Error updating follower count:', err);
      return res.status(500).json({ error: 'Failed to update follower count' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: `Course ${action}ed successfully` });
  });
});

module.exports = router;
