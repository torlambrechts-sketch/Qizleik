import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERROR: DATABASE_URL is not set. Please create a .env file or export it.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function run() {
  console.log("Connecting to PostgreSQL database...");
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log("Clearing existing quizzes, questions, and games tables (cascading)...");
    await client.query('TRUNCATE quizzes, games, teams, submissions, leaderboard RESTART IDENTITY CASCADE');

    const seedPath = path.join(__dirname, '..', 'api', 'questions_seed.json');
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file not found at ${seedPath}`);
    }

    const quizzes = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    console.log(`Found ${quizzes.length} quizzes in questions_seed.json. Seeding...`);

    for (const quiz of quizzes) {
      const qRes = await client.query(
        'INSERT INTO quizzes (title, description) VALUES ($1, $2) RETURNING id',
        [quiz.title, quiz.description]
      );
      const quizId = qRes.rows[0].id;
      console.log(`- Seeded Quiz: "${quiz.title}" with ${quiz.questions.length} questions.`);

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
    console.log("Successfully seeded 500+ questions into the database!");
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Force seeding failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
