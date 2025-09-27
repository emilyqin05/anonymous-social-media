const { init, seedData } = require('../database/db');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    await init();
    
    console.log('Seeding database with dummy data...');
    await seedData();
    
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
