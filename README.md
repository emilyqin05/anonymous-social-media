# Anonymous Social Media Platform

A full-stack anonymous social media application built with Next.js (frontend) and Node.js/Express (backend) with SQLite database.

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm

### Start Development Servers

1. **Option 1: Use the startup script (recommended)**
   ```bash
   ./start-dev.sh
   ```

2. **Option 2: Start manually**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm install
   npm run init-db  # Only needed first time
   npm start

   # Terminal 2 - Frontend  
   cd client
   npm install
   npm run dev
   ```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## Project Structure

```
anonymous-social-media/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   └── package.json
├── server/                # Node.js/Express backend
│   ├── database/          # SQLite database files
│   ├── routes/            # API route handlers
│   ├── scripts/           # Database initialization
│   └── package.json
└── start-dev.sh          # Development startup script
```

## Features

### Current Implementation
- **Posts System**: Create, view, and manage posts
- **Course System**: Follow courses and set professor preferences
- **Voting System**: Upvote/downvote posts with real-time score updates
- **Tag System**: Categorize posts with tags
- **User Feed**: Personalized feed based on followed content
- **Database**: SQLite with proper schema and relationships
- **API**: RESTful API with CORS support

### Planned Features
- **Authentication**: User registration and login
- **Comments**: Comment system for posts
- **Real-time Updates**: WebSocket support for live updates
-  **File Uploads**: Image and file attachments
- **Moderation**: Content moderation tools

## Database Schema

The SQLite database includes these main tables:
- `users` - User accounts and authentication
- `courses` - Course information with follower counts
- `professors` - Course professors (many-to-many relationship)
- `posts` - User posts with voting scores
- `tags` - Post categorization tags
- `votes` - User votes on posts
- `course_follows` - User course subscriptions
- `tag_follows` - User tag subscriptions
- `professor_preferences` - User professor preferences

## API Endpoints

### Posts
- `GET /api/posts` - Get all posts (with filtering)
- `GET /api/posts/:id` - Get specific post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get specific course
- `POST /api/courses` - Create new course

### Votes
- `POST /api/votes` - Vote on post
- `GET /api/votes/:postId` - Get user's vote

### Follows
- `POST /api/follows/course` - Follow/unfollow course
- `POST /api/follows/tag` - Follow/unfollow tag
- `GET /api/follows/courses` - Get followed courses
- `GET /api/follows/tags` - Get followed tags

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/feed` - Get personalized feed
- `GET /api/users/posts` - Get user's posts

## Testing the Backend

The backend comes with dummy data for testing:

```bash
# Test API endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/posts
curl http://localhost:3001/api/courses
curl http://localhost:3001/api/users/me

# Create a new post
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Post","content":"This is a test","courseId":"cmpt120"}'

# Vote on a post
curl -X POST http://localhost:3001/api/votes \
  -H "Content-Type: application/json" \
  -d '{"postId":1,"voteValue":1}'
```

## Development

### Backend Development
```bash
cd server
npm run dev  # Start with nodemon for auto-restart
npm run init-db  # Reinitialize database with fresh data
```

### Frontend Development
```bash
cd client
npm run dev  # Start Next.js development server
npm run build  # Build for production
```
