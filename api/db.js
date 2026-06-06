import pg from 'pg';
import dotenv from 'dotenv';

// Load local environment variables if not in Vercel production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("WARNING: DATABASE_URL is not set in environment variables. DB calls will fail.");
}

// Configure the database pool
const pool = new Pool({
  connectionString,
  ssl: connectionString && connectionString.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : false
});

let isInitialized = false;

// Unified query helper that ensures database tables are initialized first
export async function query(text, params) {
  if (!isInitialized) {
    await initDb();
  }
  return pool.query(text, params);
}

// Auto-migration script to spin up tables on Neon PostgreSQL
async function initDb() {
  isInitialized = true;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create Quizzes Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Questions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) DEFAULT 'multiple-choice',
        options TEXT, -- JSON-stringified array of choices
        correct_answer TEXT,
        points INTEGER DEFAULT 10,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Active Games Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'setup', -- 'setup', 'active', 'completed'
        current_question_index INTEGER DEFAULT 0,
        timer_ends_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Teams Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(50) DEFAULT '#ffffff',
        score INTEGER DEFAULT 0,
        players TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('PostgreSQL database schemas verified/initialized.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database schema initialization failed:', error);
    isInitialized = false; // Reset to allow retry on next query
    throw error;
  } finally {
    client.release();
  }
}
