import { query } from './db.js';

export default async function handler(req, res) {
  const { method } = req;
  const { id, leaderboard, quizId } = req.query;

  try {
    if (method === 'GET') {
      // 1. Resolve leaderboard checks
      if (leaderboard === 'true' && quizId) {
        const leaderRes = await query(
          `SELECT * FROM leaderboard 
           WHERE quiz_id = $1 
           ORDER BY score DESC, played_at DESC 
           LIMIT 10`,
          [quizId]
        );
        return res.status(200).json(leaderRes.rows);
      }

      // 2. Fetch specific quiz details
      if (id) {
        const quizRes = await query('SELECT * FROM quizzes WHERE id = $1', [id]);
        if (quizRes.rows.length === 0) {
          return res.status(404).json({ error: 'Quiz not found' });
        }
        
        const questionsRes = await query(
          'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index ASC',
          [id]
        );
        
        const quiz = quizRes.rows[0];
        quiz.questions = questionsRes.rows.map(q => ({
          ...q,
          options: q.options ? JSON.parse(q.options) : [],
          timer_duration: q.timer_duration || 0,
          rating_scale: q.rating_scale || 10
        }));
        
        return res.status(200).json(quiz);
      } else {
        // Fetch all quizzes with question count
        const quizzesRes = await query(`
          SELECT q.*, COALESCE(COUNT(qu.id), 0) as question_count 
          FROM quizzes q 
          LEFT JOIN questions qu ON q.id = qu.quiz_id 
          GROUP BY q.id 
          ORDER BY q.created_at DESC
        `);
        return res.status(200).json(quizzesRes.rows);
      }
    } 
    
    // --- AUTHENTICATION SHIELD FOR WRITES / DELETES ---
    if (method === 'POST' || method === 'DELETE') {
      const clientPin = req.headers['x-admin-pin'];
      const adminPin = process.env.ADMIN_PIN || '1234';

      if (clientPin !== adminPin) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Admin PIN' });
      }
    }

    if (method === 'POST') {
      const { title, description, questions } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Quiz title is required' });
      }

      if (id) {
        // Update existing quiz details
        await query(
          'UPDATE quizzes SET title = $1, description = $2 WHERE id = $3',
          [title, description, id]
        );
        
        // Re-sync questions: delete existing questions and re-insert the updated list
        await query('DELETE FROM questions WHERE quiz_id = $1', [id]);
        
        if (questions && Array.isArray(questions)) {
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            await query(
              `INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index, timer_duration, rating_scale) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                id,
                q.question_text,
                q.question_type || 'multiple-choice',
                q.options ? JSON.stringify(q.options) : null,
                q.correct_answer || '',
                parseInt(q.points) || 10,
                i,
                parseInt(q.timer_duration) || 0,
                parseInt(q.rating_scale) || 10
              ]
            );
          }
        }
        return res.status(200).json({ id, message: 'Quiz updated successfully' });
      } else {
        // Create new quiz entry
        const insertQuizRes = await query(
          'INSERT INTO quizzes (title, description) VALUES ($1, $2) RETURNING id',
          [title, description]
        );
        const newQuizId = insertQuizRes.rows[0].id;

        if (questions && Array.isArray(questions)) {
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            await query(
              `INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index, timer_duration, rating_scale) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                newQuizId,
                q.question_text,
                q.question_type || 'multiple-choice',
                q.options ? JSON.stringify(q.options) : null,
                q.correct_answer || '',
                parseInt(q.points) || 10,
                i,
                parseInt(q.timer_duration) || 0,
                parseInt(q.rating_scale) || 10
              ]
            );
          }
        }
        return res.status(201).json({ id: newQuizId, message: 'Quiz created successfully' });
      }
    }

    if (method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'Quiz ID is required' });
      }
      // Cascade delete is active, so questions will be auto-deleted
      await query('DELETE FROM quizzes WHERE id = $1', [id]);
      return res.status(200).json({ message: 'Quiz deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });

  } catch (error) {
    console.error('API Error in quizzes.js:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
