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
          id: 'cs101',
          name: 'Introduction to Computer Science',
          code: 'CS 101',
          description: 'Fundamentals of programming and computer science concepts',
          follower_count: 245
        },
        {
          id: 'math201',
          name: 'Calculus II',
          code: 'MATH 201',
          description: 'Integration techniques and applications',
          follower_count: 189
        },
        {
          id: 'phys301',
          name: 'Advanced Physics',
          code: 'PHYS 301',
          description: 'Quantum mechanics and modern physics',
          follower_count: 67
        },
        {
          id: 'eng102',
          name: 'English Composition',
          code: 'ENG 102',
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
        { name: 'Dr. Smith', course_id: 'cs101' },
        { name: 'Prof. Davis', course_id: 'cs101' },
        { name: 'Prof. Johnson', course_id: 'math201' },
        { name: 'Dr. Lee', course_id: 'math201' },
        { name: 'Prof. Wilson', course_id: 'phys301' },
        { name: 'Dr. Brown', course_id: 'eng102' },
        { name: 'Prof. Taylor', course_id: 'eng102' }
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
        'lab-reports', 'guidelines', 'programming', 'math', 'physics', 'writing'
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
        {
          title: "Tips for CS 101 Final Exam",
          content: "Here are some study tips that helped me ace the final...",
          username: "student123",
          score: 15,
          course_id: "cs101",
          professor: "Dr. Smith",
          tags: ["study-tips", "finals"]
        },
        {
          title: "Math 201 Homework Help",
          content: "Can someone explain problem 3.4? I'm stuck on the integration part.",
          username: "mathstudent",
          score: 8,
          course_id: "math201",
          professor: "Prof. Johnson",
          tags: ["homework", "help"]
        },
        {
          title: "Best Study Spots on Campus",
          content: "The library's third floor is amazing for group study sessions!",
          username: "campusexplorer",
          score: 23,
          course_id: null,
          professor: null,
          tags: ["campus", "study-spots"]
        },
        {
          title: "Physics 301 Lab Report Guidelines",
          content: "Professor Wilson shared these formatting requirements...",
          username: "physicsTA",
          score: 12,
          course_id: "phys301",
          professor: "Prof. Wilson",
          tags: ["lab-reports", "guidelines"]
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
                  VALUES ('EmilyQ', 'cs101'), ('EmilyQ', 'math201')
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
                      VALUES ('EmilyQ', 'cs101', 'Dr. Smith'), ('EmilyQ', 'math201', 'Prof. Johnson')
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
