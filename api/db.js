import pg from 'pg';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("WARNING: DATABASE_URL is not set in environment variables. DB calls will fail.");
}

const pool = new Pool({
  connectionString,
  ssl: connectionString && connectionString.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : false
});

let isInitialized = false;

export async function query(text, params) {
  if (!isInitialized) {
    await initDb();
  }
  return pool.query(text, params);
}

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
        options TEXT, 
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
        status VARCHAR(50) DEFAULT 'setup', 
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

    // Create Submissions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        question_index INTEGER NOT NULL,
        submitted_text TEXT,
        submitted_image TEXT, -- Base64 encoded data URI
        points_awarded INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('Database tables successfully verified.');

    // --- SEED CHECK ---
    const countCheck = await pool.query('SELECT COUNT(*) FROM quizzes');
    if (parseInt(countCheck.rows[0].count) === 0) {
      console.log('Seeding sample quizzes into empty PostgreSQL database...');
      await seedData();
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database schema initialization failed:', error);
    isInitialized = false; 
    throw error;
  } finally {
    client.release();
  }
}

async function seedData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Quiz 1: General Trivia
    const q1 = await client.query(
      `INSERT INTO quizzes (title, description) 
       VALUES ('Mind Blazer Trivia', 'A fast-paced general knowledge quiz covering science, pop culture, and geography.') 
       RETURNING id`
    );
    const q1Id = q1.rows[0].id;

    const quiz1Questions = [
      {
        text: 'Approximately how long does it take for light from the Sun to reach Earth?',
        type: 'multiple-choice',
        options: JSON.stringify(['8 seconds', '8 minutes', '8 hours', '8 days']),
        ans: '8 minutes',
        pts: 10,
        idx: 0
      },
      {
        text: 'Which planet is known as the "Red Planet"?',
        type: 'text',
        options: null,
        ans: 'Mars',
        pts: 10,
        idx: 1
      },
      {
        text: 'What is the tallest active volcano in Europe?',
        type: 'multiple-choice',
        options: JSON.stringify(['Mount Vesuvius', 'Mount Etna', 'Mount Stromboli', 'Mount Olympus']),
        ans: 'Mount Etna',
        pts: 15,
        idx: 2
      }
    ];

    for (const q of quiz1Questions) {
      await client.query(
        `INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q1Id, q.text, q.type, q.options, q.ans, q.pts, q.idx]
      );
    }

    // Quiz 2: Caption Carnival (Text rating submission)
    const q2 = await client.query(
      `INSERT INTO quizzes (title, description) 
       VALUES ('Caption Carnival', 'Funny Caption Showdown! Teams submit text captions to prompts, and the Host rates them.') 
       RETURNING id`
    );
    const q2Id = q2.rows[0].id;

    const quiz2Questions = [
      {
        text: 'PROMPT: Write the best headline for a news report about a cat that has accidentally been elected Mayor of a small town.',
        type: 'rate-submission',
        options: null,
        ans: 'Text submission to be rated by host.',
        pts: 20,
        idx: 0
      },
      {
        text: 'PROMPT: What would be the worst slogan for a brand new anti-gravity theme park ride?',
        type: 'rate-submission',
        options: null,
        ans: 'Text submission to be rated by host.',
        pts: 20,
        idx: 1
      }
    ];

    for (const q of quiz2Questions) {
      await client.query(
        `INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q2Id, q.text, q.type, q.options, q.ans, q.pts, q.idx]
      );
    }

    // Quiz 3: Doodle Duel (Drawing/Image rating submission)
    const q3 = await client.query(
      `INSERT INTO quizzes (title, description) 
       VALUES ('Doodle Duel', 'Visual arts face-off! Teams sketch and upload images to match the design prompt.') 
       RETURNING id`
    );
    const q3Id = q3.rows[0].id;

    const quiz3Questions = [
      {
        text: 'PROMPT: Draw a logo for a futuristic startup named "Antigravity Inc" that makes floating furniture.',
        type: 'rate-submission',
        options: null,
        ans: 'Image upload or sketch submission to be rated by host.',
        pts: 30,
        idx: 0
      },
      {
        text: 'PROMPT: Design a brand new official flag for human colonies on Mars.',
        type: 'rate-submission',
        options: null,
        ans: 'Image upload or sketch submission to be rated by host.',
        pts: 30,
        idx: 1
      }
    ];

    for (const q of quiz3Questions) {
      await client.query(
        `INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q3Id, q.text, q.type, q.options, q.ans, q.pts, q.idx]
      );
    }

    await client.query('COMMIT');
    console.log('Sample quizzes successfully seeded.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding sample data failed:', err);
  } finally {
    client.release();
  }
}
