const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'social_media.db');
const db = new sqlite3.Database(dbPath);

const init = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Courses table
      db.run(`
        CREATE TABLE IF NOT EXISTS courses (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT NOT NULL,
          description TEXT,
          follower_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Professors table (many-to-many with courses)
      db.run(`
        CREATE TABLE IF NOT EXISTS professors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          course_id TEXT NOT NULL,
          FOREIGN KEY (course_id) REFERENCES courses (id)
        )
      `);

      // Posts table
      db.run(`
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          username TEXT NOT NULL,
          score INTEGER DEFAULT 1,
          course_id TEXT,
          professor TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (course_id) REFERENCES courses (id)
        )
      `);

      // Tags table
      db.run(`
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL
        )
      `);

      // Post tags junction table
      db.run(`
        CREATE TABLE IF NOT EXISTS post_tags (
          post_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          PRIMARY KEY (post_id, tag_id),
          FOREIGN KEY (post_id) REFERENCES posts (id),
          FOREIGN KEY (tag_id) REFERENCES tags (id)
        )
      `);

      // Votes table
      db.run(`
        CREATE TABLE IF NOT EXISTS votes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER NOT NULL,
          username TEXT NOT NULL,
          vote_value INTEGER NOT NULL CHECK (vote_value IN (-1, 1)),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(post_id, username),
          FOREIGN KEY (post_id) REFERENCES posts (id)
        )
      `);

      // Course follows table
      db.run(`
        CREATE TABLE IF NOT EXISTS course_follows (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          course_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(username, course_id),
          FOREIGN KEY (course_id) REFERENCES courses (id)
        )
      `);

      // Tag follows table
      db.run(`
        CREATE TABLE IF NOT EXISTS tag_follows (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          tag_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(username, tag_id),
          FOREIGN KEY (tag_id) REFERENCES tags (id)
        )
      `);

      // Professor preferences table
      db.run(`
        CREATE TABLE IF NOT EXISTS professor_preferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          course_id TEXT NOT NULL,
          professor_name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(username, course_id),
          FOREIGN KEY (course_id) REFERENCES courses (id)
        )
      `);

      console.log('Database tables created successfully');
      resolve();
    });
  });
};

const seedData = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Insert courses
      const courses = [
        {
          id: 'cmpt120',
          name: 'Introduction to Computer Science',
          code: 'CMPT 120',
          description: 'Fundamentals of programming and computer science concepts',
          follower_count: 245
        },
        {
          id: 'math152',
          name: 'Calculus II',
          code: 'MATH 152',
          description: 'Integration techniques and applications',
          follower_count: 189
        },
        {
          id: 'cmpt276',
          name: 'Introduction to Software Engineering',
          code: 'CMPT 276',
          description: 'Software development and software project management',
          follower_count: 67
        },
        {
          id: 'cmpt105w',
          name: 'Social Issues and Communication',
          code: 'CMPT 105W',
          description: 'Advanced writing and critical thinking',
          follower_count: 156
        }
      ];

      const insertCourse = db.prepare(`
        INSERT OR REPLACE INTO courses (id, name, code, description, follower_count)
        VALUES (?, ?, ?, ?, ?)
      `);

      courses.forEach(course => {
        insertCourse.run(course.id, course.name, course.code, course.description, course.follower_count);
      });
      insertCourse.finalize();

      // Insert professors
      const professors = [
        { name: 'Prof. Nicholas Vincent', course_id: 'cmpt120' },
        { name: 'Dr. Brian Fraser', course_id: 'cmpt120' },
        { name: 'Prof. Jamie Mulholland', course_id: 'math152' },
        { name: 'Prof. Michael Monagan', course_id: 'math152' },
        { name: 'Prof. Saba Alimadadi', course_id: 'cmpt276' },
        { name: 'Prof. Steven Pearce', course_id: 'cmpt276' },
        { name: 'Prof. Harinder Khangura', course_id: 'cmpt105w' },
        { name: 'Prof. Felix Lo', course_id: 'cmpt105w' }
      ];

      const insertProfessor = db.prepare(`
        INSERT OR REPLACE INTO professors (name, course_id)
        VALUES (?, ?)
      `);

      professors.forEach(prof => {
        insertProfessor.run(prof.name, prof.course_id);
      });
      insertProfessor.finalize();

      // Insert tags
      const tags = [
        'study-tips', 'finals', 'homework', 'help', 'campus', 'study-spots',
        'lab-reports', 'guidelines', 'programming', 'math', 'physics', 'writing',
        'study-partner', 'lab', 'integration', 'study-group', 'midterm',
        'project', 'software-engineering', 'ideas', 'team', 'collaboration',
        'git', 'essay', 'technology', 'peer-review', 'sfu', 'food', 'budget',
        'parking', 'transportation', 'gym', 'fitness', 'clubs', 'social'
      ];

      const insertTag = db.prepare(`
        INSERT OR IGNORE INTO tags (name)
        VALUES (?)
      `);

      tags.forEach(tag => {
        insertTag.run(tag);
      });
      insertTag.finalize();

      // Insert posts
      const posts = [
        // CMPT 120 posts
        {
          title: "CMPT 120 Final Exam Tips - Dr. Fraser",
          content: "Dr. Fraser's final is next week! Here are the key topics to focus on: recursion, linked lists, and basic algorithms. The exam is mostly coding questions with some theory. Practice the past midterms!",
          username: "cs_student_2024",
          score: 18,
          course_id: "cmpt120",
          professor: "Dr. Brian Fraser",
          tags: ["study-tips", "finals", "programming"]
        },
        {
          title: "CMPT 120 Assignment 3 Help - Recursion",
          content: "Stuck on the recursive binary search problem. Anyone have hints for the base case? I keep getting infinite loops...",
          username: "struggling_coder",
          score: 12,
          course_id: "cmpt120",
          professor: "Prof. Nicholas Vincent",
          tags: ["homework", "help", "programming"]
        },
        {
          title: "CMPT 120 Lab Partner Needed",
          content: "Looking for a lab partner for the rest of the semester. I'm decent at coding but need help with debugging. Meet in AQ library?",
          username: "looking_for_help",
          score: 8,
          course_id: "cmpt120",
          professor: null,
          tags: ["study-partner", "lab", "help"]
        },
        
        // MATH 152 posts
        {
          title: "MATH 152 Integration Techniques - Prof. Mulholland",
          content: "Prof. Mulholland's integration by parts method is so much clearer than the textbook. Here's my cheat sheet for the common patterns!",
          username: "math_enthusiast",
          score: 15,
          course_id: "math152",
          professor: "Prof. Jamie Mulholland",
          tags: ["study-tips", "math", "integration"]
        },
        {
          title: "MATH 152 Midterm Review Session",
          content: "Anyone want to form a study group for the midterm next Friday? We can meet in the AQ study rooms and go through practice problems together.",
          username: "study_group_organizer",
          score: 22,
          course_id: "math152",
          professor: "Prof. Michael Monagan",
          tags: ["study-group", "midterm", "math"]
        },
        {
          title: "MATH 152 Assignment 4 - Partial Fractions",
          content: "The partial fractions question is killing me. Can someone explain the decomposition step? I keep getting the wrong coefficients.",
          username: "calculus_struggles",
          score: 9,
          course_id: "math152",
          professor: null,
          tags: ["homework", "help", "math"]
        },

        // CMPT 276 posts
        {
          title: "CMPT 276 Project Ideas - Prof. Alimadadi",
          content: "Prof. Alimadadi suggested some great project ideas for the final project. Web app, mobile app, or desktop application - which would you choose?",
          username: "project_planner",
          score: 14,
          course_id: "cmpt276",
          professor: "Prof. Saba Alimadadi",
          tags: ["project", "software-engineering", "ideas"]
        },
        {
          title: "CMPT 276 Team Formation",
          content: "Looking for 2 more team members for our CMPT 276 project. We're thinking of building a study group finder app. DM me if interested!",
          username: "team_builder",
          score: 11,
          course_id: "cmpt276",
          professor: "Prof. Steven Pearce",
          tags: ["team", "project", "collaboration"]
        },
        {
          title: "CMPT 276 Git Workflow Help",
          content: "Our team is having merge conflicts every day. Any tips for better Git workflow in group projects? We're using GitHub but keep stepping on each other's toes.",
          username: "git_newbie",
          score: 7,
          course_id: "cmpt276",
          professor: null,
          tags: ["git", "collaboration", "help"]
        },

        // CMPT 105W posts
        {
          title: "CMPT 105W Essay Topic Ideas - Prof. Khangura",
          content: "Prof. Khangura wants us to write about technology's impact on society. Any interesting angles? I'm thinking about social media and mental health.",
          username: "essay_writer",
          score: 13,
          course_id: "cmpt105w",
          professor: "Prof. Harinder Khangura",
          tags: ["essay", "writing", "technology"]
        },
        {
          title: "CMPT 105W Peer Review Partners",
          content: "Need someone to review my draft essay on AI ethics. I can review yours in return! 2000 words, due next Monday.",
          username: "peer_reviewer",
          score: 6,
          course_id: "cmpt105w",
          professor: "Prof. Felix Lo",
          tags: ["peer-review", "essay", "collaboration"]
        },

        // General campus posts
        {
          title: "Best Study Spots at SFU Burnaby",
          content: "The AQ library is packed during finals. Here are some hidden gems: 4th floor of the WMC, the quiet study rooms in the SUB, and the 24/7 study space in the Applied Sciences building!",
          username: "campus_explorer",
          score: 25,
          course_id: null,
          professor: null,
          tags: ["campus", "study-spots", "sfu"]
        },
        {
          title: "SFU Food Court Recommendations",
          content: "The food court prices are getting ridiculous. Best budget options: the sandwich place near the bookstore, and the Asian food stall has decent portions for the price.",
          username: "hungry_student",
          score: 19,
          course_id: null,
          professor: null,
          tags: ["food", "campus", "budget"]
        },
        {
          title: "Parking at SFU - Pro Tips",
          content: "If you're driving to campus, the best parking is in the West Mall Complex after 2 PM. Before that, you're better off taking the bus. The parking pass is worth it if you're here 4+ days a week.",
          username: "commuter_student",
          score: 16,
          course_id: null,
          professor: null,
          tags: ["parking", "transportation", "campus"]
        },
        {
          title: "SFU Recreation Center - Best Times to Go",
          content: "The gym is packed from 4-7 PM. Best times are early morning (6-8 AM) or late evening (9-11 PM). The pool is usually less crowded on weekends.",
          username: "fitness_enthusiast",
          score: 12,
          course_id: null,
          professor: null,
          tags: ["gym", "fitness", "campus"]
        },
        {
          title: "SFU Clubs and Societies Fair",
          content: "The clubs fair is next week in the SUB! Great way to meet people with similar interests. The computer science club always has cool demos and free pizza.",
          username: "club_organizer",
          score: 14,
          course_id: null,
          professor: null,
          tags: ["clubs", "social", "campus"]
        }
      ];

      const insertPost = db.prepare(`
        INSERT OR REPLACE INTO posts (title, content, username, score, course_id, professor)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      let postCount = 0;
      posts.forEach((post) => {
        insertPost.run(post.title, post.content, post.username, post.score, post.course_id, post.professor, (err) => {
          if (err) {
            console.error('Error inserting post:', err);
            return;
          }
          postCount++;
          
          // Insert post tags after post is inserted
          if (post.tags && post.tags.length > 0) {
            post.tags.forEach(tagName => {
              db.run(`
                INSERT OR IGNORE INTO post_tags (post_id, tag_id)
                SELECT last_insert_rowid(), id FROM tags WHERE name = ?
              `, [tagName]);
            });
          }
          
          if (postCount === posts.length) {
            // All posts inserted, continue with other data
            insertPost.finalize();
            
            // Insert test users for testing
            const bcrypt = require('bcryptjs');
            const testPassword = bcrypt.hashSync('password123', 10);
            
            // Insert EmilyQ test user
            db.run(`
              INSERT OR REPLACE INTO users (id, username, email, password_hash)
              VALUES (1, 'EmilyQ', 'emily@example.com', ?)
            `, [testPassword], (err) => {
              if (err) {
                console.error('Error inserting user:', err);
                return;
              }
              
              // Insert another test user
              db.run(`
                INSERT OR REPLACE INTO users (id, username, email, password_hash)
                VALUES (2, 'TestUser', 'test@example.com', ?)
              `, [testPassword], (err) => {
                if (err) {
                  console.error('Error inserting test user:', err);
                  return;
                }
                
                // Insert some course follows for the dummy user
                db.run(`
                  INSERT OR IGNORE INTO course_follows (username, course_id)
                  VALUES ('EmilyQ', 'cmpt120'), ('EmilyQ', 'math152')
                `, (err) => {
                  if (err) {
                    console.error('Error inserting course follows:', err);
                    return;
                  }
                  
                  // Insert some tag follows for the dummy user
                  db.run(`
                    INSERT OR IGNORE INTO tag_follows (username, tag_id)
                    SELECT 'EmilyQ', id FROM tags WHERE name IN ('study-tips', 'campus')
                  `, (err) => {
                    if (err) {
                      console.error('Error inserting tag follows:', err);
                      return;
                    }
                    
                    // Insert professor preferences for the dummy user
                    db.run(`
                      INSERT OR IGNORE INTO professor_preferences (username, course_id, professor_name)
                      VALUES ('EmilyQ', 'cmpt120', 'Dr. Brian Fraser'), ('EmilyQ', 'math152', 'Prof. Jamie Mulholland')
                    `, (err) => {
                      if (err) {
                        console.error('Error inserting professor preferences:', err);
                        return;
                      }
                      
                      console.log('Database seeded with dummy data');
                      console.log('Test users created:');
                      console.log('  - EmilyQ (emily@example.com) / password: password123');
                      console.log('  - TestUser (test@example.com) / password: password123');
                      resolve();
                    });
                  });
                });
              });
            });
          }
        });
      });
    });
  });
};

module.exports = {
  db,
  init,
  seedData
};
