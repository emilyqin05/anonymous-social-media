const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Next.js dev server
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth').router);
app.use('/api/posts', require('./routes/posts'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/follows', require('./routes/follows'));
app.use('/api/users', require('./routes/users'));
app.use('/api/comments', require('./routes/comments'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
