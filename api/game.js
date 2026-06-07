import { query } from './db.js';

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Game ID is required' });
      }

      // 1. Fetch the game session
      const gameRes = await query('SELECT * FROM games WHERE id = $1', [id]);
      if (gameRes.rows.length === 0) {
        return res.status(404).json({ error: 'Game session not found' });
      }
      const game = gameRes.rows[0];

      // 2. Fetch the quiz details
      const quizRes = await query('SELECT title FROM quizzes WHERE id = $1', [game.quiz_id]);
      const quizTitle = quizRes.rows.length > 0 ? quizRes.rows[0].title : 'Unknown Quiz';

      // 3. Fetch questions to resolve the active question
      const questionsRes = await query(
        'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index ASC',
        [game.quiz_id]
      );
      
      const totalQuestions = questionsRes.rows.length;
      let activeQuestion = null;
      if (game.current_question_index >= 0 && game.current_question_index < totalQuestions) {
        const q = questionsRes.rows[game.current_question_index];
        activeQuestion = {
          ...q,
          options: q.options ? JSON.parse(q.options) : []
        };
      }

      // 4. Fetch the teams
      const teamsRes = await query(
        'SELECT * FROM teams WHERE game_id = $1 ORDER BY score DESC, name ASC',
        [id]
      );

      // 5. Fetch submissions for the current question
      const submissionsRes = await query(
        `SELECT s.*, t.name as team_name, t.color as team_color 
         FROM submissions s 
         JOIN teams t ON s.team_id = t.id 
         WHERE s.game_id = $1 AND s.question_index = $2`,
        [id, game.current_question_index]
      );

      // Return the compiled state of the active session
      return res.status(200).json({
        id: game.id,
        quiz_id: game.quiz_id,
        quiz_title: quizTitle,
        status: game.status,
        current_question_index: game.current_question_index,
        total_questions: totalQuestions,
        question: activeQuestion,
        teams: teamsRes.rows,
        submissions: submissionsRes.rows,
        timer_ends_at: game.timer_ends_at,
        team_mode: game.team_mode
      });
    }

    if (method === 'POST') {
      const { action } = req.body;

      if (action === 'start') {
        const { quiz_id, team_mode } = req.body;
        if (!quiz_id) {
          return res.status(400).json({ error: 'Quiz ID is required to start a game' });
        }
        
        // Start a new game session in 'setup' state
        const insertGameRes = await query(
          'INSERT INTO games (quiz_id, status, current_question_index, team_mode) VALUES ($1, $2, $3, $4) RETURNING id',
          [quiz_id, 'setup', 0, team_mode || false]
        );
        const gameId = insertGameRes.rows[0].id;
        
        return res.status(201).json({ game_id: gameId, message: 'Game session created' });
      }

      if (action === 'teams') {
        const { game_id, teams } = req.body;
        if (!game_id || !teams || !Array.isArray(teams)) {
          return res.status(400).json({ error: 'game_id and teams array are required' });
        }

        // Clear existing teams first (if editing setup)
        await query('DELETE FROM teams WHERE game_id = $1', [game_id]);

        // Insert new teams
        for (const team of teams) {
          await query(
            'INSERT INTO teams (game_id, name, color, score, players) VALUES ($1, $2, $3, $4, $5)',
            [game_id, team.name, team.color || '#ffffff', 0, team.players || '']
          );
        }

        return res.status(200).json({ message: 'Teams initialized successfully' });
      }

      if (action === 'register_team') {
        const { game_id, name, color, players } = req.body;
        if (!game_id || !name) {
          return res.status(400).json({ error: 'game_id and name are required to register a team' });
        }

        // Check if team name already exists in this game session (reconnect case)
        const checkRes = await query(
          'SELECT * FROM teams WHERE game_id = $1 AND name = $2',
          [game_id, name.trim()]
        );

        if (checkRes.rows.length > 0) {
          return res.status(200).json({ 
            team_id: checkRes.rows[0].id, 
            name: checkRes.rows[0].name, 
            color: checkRes.rows[0].color, 
            message: 'Reconnected to existing team' 
          });
        }

        // Insert new team
        const insertRes = await query(
          'INSERT INTO teams (game_id, name, color, score, players, is_active) VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING *',
          [game_id, name.trim(), color || '#ffffff', 0, players || '']
        );
        const newTeam = insertRes.rows[0];

        return res.status(201).json({
          team_id: newTeam.id,
          name: newTeam.name,
          color: newTeam.color,
          message: 'Team signed up successfully'
        });
      }

      if (action === 'join_team') {
        const { team_id, name, players } = req.body;
        if (!team_id || !name) {
          return res.status(400).json({ error: 'team_id and name are required to join a team' });
        }

        // Update the pre-created team with username and company and set active
        await query(
          'UPDATE teams SET name = $1, players = $2, is_active = TRUE WHERE id = $3',
          [name.trim(), players || '', team_id]
        );

        const selectRes = await query('SELECT * FROM teams WHERE id = $1', [team_id]);
        if (selectRes.rows.length === 0) {
          return res.status(404).json({ error: 'Team not found' });
        }
        const updatedTeam = selectRes.rows[0];

        return res.status(200).json({
          team_id: updatedTeam.id,
          name: updatedTeam.name,
          color: updatedTeam.color,
          message: 'Connected to team successfully'
        });
      }

      if (action === 'update') {
        const { game_id, status, current_question_index, timer_duration, team_mode } = req.body;
        if (!game_id) {
          return res.status(400).json({ error: 'Game ID is required' });
        }

        let updateQuery = 'UPDATE games SET ';
        const params = [];
        let index = 1;

        if (status) {
          updateQuery += `status = $${index}, `;
          params.push(status);
          index++;

          // Persistent Leaderboard recording upon quiz completion
          if (status === 'completed') {
            const gRes = await query('SELECT quiz_id FROM games WHERE id = $1', [game_id]);
            if (gRes.rows.length > 0) {
              const quizId = gRes.rows[0].quiz_id;
              // Fetch only active teams
              const teamsRes = await query('SELECT name, players, score FROM teams WHERE game_id = $1 AND is_active = TRUE', [game_id]);
              for (const team of teamsRes.rows) {
                const finalName = team.players ? `${team.name} (${team.players})` : team.name;
                await query(
                  'INSERT INTO leaderboard (quiz_id, team_name, score) VALUES ($1, $2, $3)',
                  [quizId, finalName, team.score]
                );
              }
            }
          }
        }

        if (current_question_index !== undefined && current_question_index !== null) {
          updateQuery += `current_question_index = $${index}, `;
          params.push(parseInt(current_question_index));
          index++;
        }

        if (timer_duration !== undefined) {
          updateQuery += `timer_ends_at = $${index}, `;
          const endsAt = timer_duration > 0 ? new Date(Date.now() + timer_duration * 1000).toISOString() : null;
          params.push(endsAt);
          index++;
        }

        if (team_mode !== undefined) {
          updateQuery += `team_mode = $${index}, `;
          params.push(team_mode);
          index++;
        }

        // Trim trailing comma
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ` WHERE id = $${index}`;
        params.push(game_id);

        await query(updateQuery, params);
        return res.status(200).json({ message: 'Game session updated' });
      }

      if (action === 'score') {
        const { game_id, team_id, score_change } = req.body;
        if (!game_id || !team_id || score_change === undefined) {
          return res.status(400).json({ error: 'game_id, team_id, and score_change are required' });
        }

        const updateRes = await query(
          'UPDATE teams SET score = score + $1 WHERE id = $2 AND game_id = $3 RETURNING score',
          [parseInt(score_change), team_id, game_id]
        );

        if (updateRes.rows.length === 0) {
          return res.status(404).json({ error: 'Team not found in this game' });
        }

        return res.status(200).json({ 
          team_id, 
          new_score: updateRes.rows[0].score, 
          message: 'Score adjusted successfully' 
        });
      }

      // --- SUBMISSIONS WORKFLOW ACTIONS ---

      if (action === 'submit') {
        const { game_id, team_id, question_index, submitted_text, submitted_image } = req.body;
        if (!game_id || !team_id || question_index === undefined) {
          return res.status(400).json({ error: 'game_id, team_id, and question_index are required' });
        }

        // Check if submission already exists
        const existRes = await query(
          `SELECT id FROM submissions 
           WHERE game_id = $1 AND team_id = $2 AND question_index = $3`,
          [game_id, team_id, question_index]
        );

        if (existRes.rows.length > 0) {
          await query(
            `UPDATE submissions 
             SET submitted_text = $1, submitted_image = $2, created_at = CURRENT_TIMESTAMP 
             WHERE id = $3`,
            [submitted_text || '', submitted_image || null, existRes.rows[0].id]
          );
          return res.status(200).json({ message: 'Submission updated successfully' });
        } else {
          await query(
            `INSERT INTO submissions (game_id, team_id, question_index, submitted_text, submitted_image) 
             VALUES ($1, $2, $3, $4, $5)`,
            [game_id, team_id, question_index, submitted_text || '', submitted_image || null]
          );
          return res.status(201).json({ message: 'Submission recorded successfully' });
        }
      }

      if (action === 'rate') {
        const { game_id, team_id, question_index, points_awarded } = req.body;
        if (!game_id || !team_id || question_index === undefined || points_awarded === undefined) {
          return res.status(400).json({ error: 'game_id, team_id, question_index, and points_awarded are required' });
        }

        // Get current points rated for this submission
        const subRes = await query(
          `SELECT id, points_awarded FROM submissions 
           WHERE game_id = $1 AND team_id = $2 AND question_index = $3`,
          [game_id, team_id, question_index]
        );

        let diff = parseInt(points_awarded);
        let subId = null;

        if (subRes.rows.length > 0) {
          diff = parseInt(points_awarded) - parseInt(subRes.rows[0].points_awarded);
          subId = subRes.rows[0].id;
          await query(
            'UPDATE submissions SET points_awarded = $1 WHERE id = $2',
            [parseInt(points_awarded), subId]
          );
        } else {
          // Create a mock submission row to save rating if team has not submitted yet
          const insRes = await query(
            `INSERT INTO submissions (game_id, team_id, question_index, points_awarded, submitted_text) 
             VALUES ($1, $2, $3, $4, 'Host manual scoring') RETURNING id`,
            [game_id, team_id, question_index, parseInt(points_awarded)]
          );
          subId = insRes.rows[0].id;
        }

        // Apply point difference directly to the team's total score
        await query(
          'UPDATE teams SET score = score + $1 WHERE id = $2 AND game_id = $3',
          [diff, team_id, game_id]
        );

        return res.status(200).json({ 
          team_id, 
          points_awarded: parseInt(points_awarded), 
          score_difference: diff, 
          message: 'Rating saved and team score adjusted.' 
        });
      }

      return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });

  } catch (error) {
    console.error('API Error in game.js:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
