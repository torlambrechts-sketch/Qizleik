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
        timer_remaining: game.timer_remaining,
        last_sfx: game.last_sfx,
        last_sfx_time: game.last_sfx_time ? parseInt(game.last_sfx_time) : null,
        reveal_question_index: game.reveal_question_index,
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
        const { game_id, name, color, players, avatar } = req.body;
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
            avatar: checkRes.rows[0].avatar,
            message: 'Reconnected to existing team' 
          });
        }

        // Insert new team
        const insertRes = await query(
          'INSERT INTO teams (game_id, name, color, score, players, avatar, is_active) VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING *',
          [game_id, name.trim(), color || '#ffffff', 0, players || '', avatar || '🦁']
        );
        const newTeam = insertRes.rows[0];

        return res.status(201).json({
          team_id: newTeam.id,
          name: newTeam.name,
          color: newTeam.color,
          avatar: newTeam.avatar,
          message: 'Team signed up successfully'
        });
      }

      if (action === 'join_team') {
        const { team_id, name, players, avatar } = req.body;
        if (!team_id || !name) {
          return res.status(400).json({ error: 'team_id and name are required to join a team' });
        }

        // Update the pre-created team with username and company and set active
        await query(
          'UPDATE teams SET name = $1, players = $2, avatar = $3, is_active = TRUE WHERE id = $4',
          [name.trim(), players || '', avatar || '🦁', team_id]
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
          avatar: updatedTeam.avatar,
          message: 'Connected to team successfully'
        });
      }

      if (action === 'pause_timer') {
        const { game_id } = req.body;
        if (!game_id) {
          return res.status(400).json({ error: 'Game ID is required' });
        }

        const gameRes = await query('SELECT timer_ends_at, timer_remaining FROM games WHERE id = $1', [game_id]);
        if (gameRes.rows.length === 0) {
          return res.status(404).json({ error: 'Game session not found' });
        }
        const game = gameRes.rows[0];

        if (game.timer_remaining !== null) {
          return res.status(200).json({ message: 'Timer is already paused', timer_remaining: game.timer_remaining });
        }

        if (!game.timer_ends_at) {
          return res.status(200).json({ message: 'No active timer to pause' });
        }

        const endsTime = new Date(game.timer_ends_at).getTime();
        const remaining = Math.max(0, Math.ceil((endsTime - Date.now()) / 1000));

        await query(
          'UPDATE games SET timer_ends_at = NULL, timer_remaining = $1 WHERE id = $2',
          [remaining, game_id]
        );

        return res.status(200).json({ message: 'Timer paused', timer_remaining: remaining });
      }

      if (action === 'resume_timer') {
        const { game_id } = req.body;
        if (!game_id) {
          return res.status(400).json({ error: 'Game ID is required' });
        }

        const gameRes = await query('SELECT timer_remaining FROM games WHERE id = $1', [game_id]);
        if (gameRes.rows.length === 0) {
          return res.status(404).json({ error: 'Game session not found' });
        }
        const game = gameRes.rows[0];

        if (game.timer_remaining === null) {
          return res.status(200).json({ message: 'Timer is not paused' });
        }

        const remaining = game.timer_remaining;
        const endsAt = remaining > 0 ? new Date(Date.now() + remaining * 1000).toISOString() : null;

        await query(
          'UPDATE games SET timer_ends_at = $1, timer_remaining = NULL WHERE id = $2',
          [endsAt, game_id]
        );

        return res.status(200).json({ message: 'Timer resumed', timer_ends_at: endsAt });
      }

      if (action === 'update') {
        const { game_id, status, current_question_index, timer_duration, team_mode, last_sfx, last_sfx_time, reveal_question_index } = req.body;
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
          updateQuery += `timer_ends_at = $${index}, timer_remaining = NULL, `;
          const endsAt = timer_duration > 0 ? new Date(Date.now() + timer_duration * 1000).toISOString() : null;
          params.push(endsAt);
          index++;
        }

        if (team_mode !== undefined) {
          updateQuery += `team_mode = $${index}, `;
          params.push(team_mode);
          index++;
        }

        if (last_sfx !== undefined) {
          updateQuery += `last_sfx = $${index}, `;
          params.push(last_sfx);
          index++;
        }

        if (last_sfx_time !== undefined) {
          updateQuery += `last_sfx_time = $${index}, `;
          params.push(last_sfx_time ? parseInt(last_sfx_time) : null);
          index++;
        }

        if (reveal_question_index !== undefined && reveal_question_index !== null) {
          updateQuery += `reveal_question_index = $${index}, `;
          params.push(parseInt(reveal_question_index));
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

      if (action === 'wager') {
        const { game_id, team_id, question_index, wager } = req.body;
        if (!game_id || !team_id || question_index === undefined || wager === undefined) {
          return res.status(400).json({ error: 'game_id, team_id, question_index, and wager are required' });
        }

        // Check if submission already exists
        const existRes = await query(
          `SELECT id FROM submissions 
           WHERE game_id = $1 AND team_id = $2 AND question_index = $3`,
          [game_id, team_id, question_index]
        );

        if (existRes.rows.length > 0) {
          await query(
            `UPDATE submissions SET wager = $1 WHERE id = $2`,
            [parseInt(wager), existRes.rows[0].id]
          );
        } else {
          await query(
            `INSERT INTO submissions (game_id, team_id, question_index, wager, submitted_text) 
             VALUES ($1, $2, $3, $4, 'Wager Placed')`,
            [game_id, team_id, question_index, parseInt(wager)]
          );
        }
        return res.status(200).json({ message: 'Wager recorded successfully' });
      }

      if (action === 'submit') {
        const { game_id, team_id, question_index, submitted_text, submitted_image, wager } = req.body;
        if (!game_id || !team_id || question_index === undefined) {
          return res.status(400).json({ error: 'game_id, team_id, and question_index are required' });
        }

        // Fetch the question to get the correct answer, points, and multipliers
        const gameRes = await query('SELECT quiz_id FROM games WHERE id = $1', [game_id]);
        if (gameRes.rows.length === 0) {
          return res.status(404).json({ error: 'Game session not found' });
        }
        const quizId = gameRes.rows[0].quiz_id;

        const questionsRes = await query(
          'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index ASC',
          [quizId]
        );
        const question = questionsRes.rows[question_index];
        let pointsAwarded = 0;
        let wagerPoints = 0;

        if (question) {
          let maxPoints = question.points !== undefined && question.points !== null ? question.points : 10;
          
          // Apply multiplier (Comeback mechanics)
          const multiplier = question.point_multiplier !== undefined ? question.point_multiplier : 1.0;
          maxPoints = Math.round(maxPoints * multiplier);

          // Check if wager round
          const isWager = question.is_wager || false;
          if (isWager) {
            const existSub = await query(
              'SELECT wager FROM submissions WHERE game_id = $1 AND team_id = $2 AND question_index = $3',
              [game_id, team_id, question_index]
            );
            if (existSub.rows.length > 0 && existSub.rows[0].wager > 0) {
              wagerPoints = existSub.rows[0].wager;
            } else if (wager !== undefined) {
              wagerPoints = parseInt(wager);
            }
          }

          let finalPoints = maxPoints;
          if (isWager) {
            finalPoints = wagerPoints;
          } else {
            // Speed-based point decay (linear decay down to 30%)
            const totalDuration = question.timer_duration || 0;
            if (totalDuration > 0) {
              const activeGameRes = await query('SELECT timer_ends_at, timer_remaining FROM games WHERE id = $1', [game_id]);
              if (activeGameRes.rows.length > 0) {
                const gameObj = activeGameRes.rows[0];
                let remaining = 0;
                if (gameObj.timer_remaining !== null) {
                  remaining = gameObj.timer_remaining;
                } else if (gameObj.timer_ends_at) {
                  const endsAt = new Date(gameObj.timer_ends_at).getTime();
                  remaining = Math.max(0, (endsAt - Date.now()) / 1000);
                } else {
                  remaining = totalDuration;
                }

                const fraction = Math.min(1.0, Math.max(0.0, remaining / totalDuration));
                const minPoints = Math.round(maxPoints * 0.3);
                finalPoints = Math.round(minPoints + (maxPoints - minPoints) * fraction);
              }
            }
          }

          // Evaluate correctness
          let isCorrect = false;
          if (question.question_type === 'multiple-choice') {
            isCorrect = (submitted_text === question.correct_answer);
          } else if (question.question_type === 'text') {
            isCorrect = (question.correct_answer && submitted_text &&
                        submitted_text.trim().toLowerCase() === question.correct_answer.trim().toLowerCase());
          }

          if (isCorrect) {
            pointsAwarded = finalPoints;
          } else {
            pointsAwarded = isWager ? -finalPoints : 0;
          }
        }

        // Check if submission already exists
        const existRes = await query(
          `SELECT id, points_awarded FROM submissions 
           WHERE game_id = $1 AND team_id = $2 AND question_index = $3`,
          [game_id, team_id, question_index]
        );

        if (existRes.rows.length > 0) {
          const oldPoints = existRes.rows[0].points_awarded || 0;
          const diff = pointsAwarded - oldPoints;

          await query(
            `UPDATE submissions 
             SET submitted_text = $1, submitted_image = $2, points_awarded = $3, created_at = CURRENT_TIMESTAMP 
             WHERE id = $4`,
            [submitted_text || '', submitted_image || null, pointsAwarded, existRes.rows[0].id]
          );

          if (diff !== 0) {
            await query(
              'UPDATE teams SET score = score + $1 WHERE id = $2 AND game_id = $3',
              [diff, team_id, game_id]
            );
          }
          return res.status(200).json({ message: 'Submission updated successfully', points_awarded: pointsAwarded });
        } else {
          await query(
            `INSERT INTO submissions (game_id, team_id, question_index, submitted_text, submitted_image, points_awarded, wager) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [game_id, team_id, question_index, submitted_text || '', submitted_image || null, pointsAwarded, wagerPoints]
          );

          if (pointsAwarded !== 0) {
            await query(
              'UPDATE teams SET score = score + $1 WHERE id = $2 AND game_id = $3',
              [pointsAwarded, team_id, game_id]
            );
          }
          return res.status(201).json({ message: 'Submission recorded successfully', points_awarded: pointsAwarded });
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
