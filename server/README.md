# Anonymous Social Media Backend

A Node.js/Express backend with SQLite database for the anonymous social media application.

## Features

- **Posts Management**: Create, read, update, and delete posts
- **Course System**: Manage courses with professors and follower counts
- **Voting System**: Upvote/downvote posts with score tracking
- **Follow System**: Follow courses and tags, set professor preferences
- **User Feed**: Personalized feed based on followed content
- **Tag System**: Categorize posts with tags

## Setup

1. Install dependencies:
```bash
npm install
```

2. Initialize the database with dummy data:
```bash
npm run init-db
```

3. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### Posts
- `GET /api/posts` - Get all posts (with optional filtering)
- `GET /api/posts/:id` - Get a specific post
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get a specific course
- `POST /api/courses` - Create a new course
- `PATCH /api/courses/:id/followers` - Update follower count

### Votes
- `POST /api/votes` - Vote on a post
- `GET /api/votes/:postId` - Get user's vote on a post
- `GET /api/votes/user/:username` - Get all votes for a user

### Follows
- `POST /api/follows/course` - Follow/unfollow a course
- `POST /api/follows/tag` - Follow/unfollow a tag
- `POST /api/follows/professor-preference` - Set professor preference
- `GET /api/follows/courses` - Get followed courses
- `GET /api/follows/tags` - Get followed tags
- `GET /api/follows/professor-preferences` - Get professor preferences

### Users
- `GET /api/users/me` - Get current user info
- `GET /api/users/feed` - Get personalized feed
- `GET /api/users/posts` - Get user's posts

## Database Schema

The database includes the following tables:
- `users` - User accounts
- `courses` - Course information
- `professors` - Course professors (many-to-many)
- `posts` - User posts
- `tags` - Post tags
- `post_tags` - Post-tag relationships
- `votes` - Post votes
- `course_follows` - User course follows
- `tag_follows` - User tag follows
- `professor_preferences` - User professor preferences

## Dummy Data

The database is seeded with:
- 4 courses (CS 101, MATH 201, PHYS 301, ENG 102)
- 4 sample posts
- 1 test user (EmilyQ)
- Sample follows and preferences

## Development

- The server uses SQLite for easy development
- CORS is configured for `http://localhost:3000` (Next.js dev server)
- All routes return JSON responses
- Error handling is included for common scenarios
