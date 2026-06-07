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
        is_private BOOLEAN DEFAULT FALSE,
        passcode VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Questions Table (Modified: includes timer_duration and rating_scale)
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) DEFAULT 'multiple-choice',
        options JSON,
        correct_answer TEXT,
        points INTEGER DEFAULT 10,
        order_index INTEGER NOT NULL,
        timer_duration INTEGER DEFAULT 0,
        rating_scale INTEGER DEFAULT 10,
        point_multiplier REAL DEFAULT 1.0,
        is_wager BOOLEAN DEFAULT FALSE
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
        timer_remaining INTEGER DEFAULT NULL,
        team_mode BOOLEAN DEFAULT FALSE,
        reveal_question_index INTEGER DEFAULT -1,
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
        is_active BOOLEAN DEFAULT FALSE,
        avatar VARCHAR(50) DEFAULT '🦁',
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
        submitted_image TEXT, 
        points_awarded INTEGER DEFAULT 0,
        wager INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Leaderboard Table (NEW)
    await client.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        team_name VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Alter table schemas for existing databases just in case they were initialized previously
    await client.query(`
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS timer_duration INTEGER DEFAULT 0;
    `);
    await client.query(`
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS rating_scale INTEGER DEFAULT 10;
    `);
    await client.query(`
      ALTER TABLE games ADD COLUMN IF NOT EXISTS team_mode BOOLEAN DEFAULT FALSE;
    `);
    await client.query(`
      ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
    `);
    await client.query(`
      ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS passcode VARCHAR(50);
    `);
    await client.query(`
      ALTER TABLE teams ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;
    `);
    await client.query(`
      ALTER TABLE games ADD COLUMN IF NOT EXISTS timer_remaining INTEGER DEFAULT NULL;
    `);
    await client.query(`
      ALTER TABLE games ADD COLUMN IF NOT EXISTS last_sfx VARCHAR(50) DEFAULT NULL;
    `);
    await client.query(`
      ALTER TABLE games ADD COLUMN IF NOT EXISTS last_sfx_time BIGINT DEFAULT NULL;
    `);
    await client.query(`
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS point_multiplier REAL DEFAULT 1.0;
    `);
    await client.query(`
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_wager BOOLEAN DEFAULT FALSE;
    `);
    await client.query(`
      ALTER TABLE teams ADD COLUMN IF NOT EXISTS avatar VARCHAR(50) DEFAULT '🦁';
    `);
    await client.query(`
      ALTER TABLE games ADD COLUMN IF NOT EXISTS reveal_question_index INTEGER DEFAULT -1;
    `);
    await client.query(`
      ALTER TABLE submissions ADD COLUMN IF NOT EXISTS wager INTEGER DEFAULT 0;
    `);

    await client.query('COMMIT');
    console.log('Database schemas verified and upgraded.');

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

    const seedPath = path.join(__dirname, 'questions_seed.json');
    if (!fs.existsSync(seedPath)) {
      console.warn(`WARNING: Seed file not found at ${seedPath}. Skipping seed.`);
      await client.query('COMMIT');
      return;
    }

    const quizzes = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    console.log(`Found ${quizzes.length} quizzes in seed file. Seeding questions...`);

    for (const quiz of quizzes) {
      const qRes = await client.query(
        'INSERT INTO quizzes (title, description) VALUES ($1, $2) RETURNING id',
        [quiz.title, quiz.description]
      );
      const quizId = qRes.rows[0].id;

      for (const q of quiz.questions) {
        await client.query(
          `INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index, timer_duration, rating_scale)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            quizId,
            q.text,
            q.type,
            q.options ? JSON.stringify(q.options) : null,
            q.ans,
            q.pts,
            q.idx,
            q.timer,
            q.scale
          ]
        );
      }
    }

    await client.query('COMMIT');
    console.log('500+ questions successfully seeded into the database!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding question bank failed:', err);
  } finally {
    client.release();
  }
}
