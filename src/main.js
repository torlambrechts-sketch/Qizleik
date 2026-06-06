import { playCorrect, playIncorrect, playTick, playVictory } from './audio.js';
import { triggerConfetti } from './confetti.js';

// Application State
const state = {
  currentScreen: 'dashboard',
  quizzes: [],
  activeQuiz: null, // Quiz being edited or played
  editingQuizId: null, // ID of quiz being edited (null if creating)
  creatorQuestions: [], // Questions buffer in creator form
  setupTeams: [
    { name: 'Red Phoenix', color: '#ef4444', players: 'Alice, Bob' },
    { name: 'Blue Waves', color: '#3b82f6', players: 'Charlie, Diana' }
  ],
  activeGameId: null,
  activeGame: null, // Active game status from API
  pollInterval: null,
  timerInterval: null,
  isAdmin: sessionStorage.getItem('is_admin') === 'true',
  adminPin: sessionStorage.getItem('admin_pin') || ''
};

// UI Selectors
const el = {
  screens: {
    dashboard: document.getElementById('screen-dashboard'),
    creator: document.getElementById('screen-creator'),
    setup: document.getElementById('screen-setup'),
    host: document.getElementById('screen-host')
  },
  quizList: document.getElementById('quiz-list'),
  btnCreateQuiz: document.getElementById('btn-create-quiz'),
  
  // Creator Screen
  creatorTitle: document.getElementById('creator-title'),
  quizTitleInput: document.getElementById('quiz-title-input'),
  quizDescInput: document.getElementById('quiz-desc-input'),
  btnAddMcq: document.getElementById('btn-add-mcq'),
  btnAddText: document.getElementById('btn-add-text'),
  questionsBuilderList: document.getElementById('questions-builder-list'),
  btnCancelCreator: document.getElementById('btn-cancel-creator'),
  btnSaveQuiz: document.getElementById('btn-save-quiz'),
  
  // Setup Screen
  setupQuizSubtitle: document.getElementById('setup-quiz-subtitle'),
  btnAddTeam: document.getElementById('btn-add-team'),
  teamListBuilder: document.getElementById('team-list-builder'),
  btnCancelSetup: document.getElementById('btn-cancel-setup'),
  btnStartGame: document.getElementById('btn-start-game'),
  
  // Host Screen
  hostGameTitle: document.getElementById('host-game-title'),
  hostProgressText: document.getElementById('host-progress-text'),
  hostTimer: document.getElementById('host-timer'),
  hostTimerSec: document.getElementById('host-timer-sec'),
  btnOpenProjector: document.getElementById('btn-open-projector'),
  btnEndGame: document.getElementById('btn-end-game'),
  hostQuestionType: document.getElementById('host-question-type'),
  hostQuestionText: document.getElementById('host-question-text'),
  hostAnswersContainer: document.getElementById('host-answers-container'),
  hostTextAnswer: document.getElementById('host-text-answer'),
  hostTextAnswerVal: document.getElementById('host-text-answer-val'),
  btnPrevQuestion: document.getElementById('btn-prev-question'),
  btnNextQuestion: document.getElementById('btn-next-question'),
  btnTimerStart: document.getElementById('btn-timer-start'),
  btnTimerStop: document.getElementById('btn-timer-stop'),
  btnTimerReset: document.getElementById('btn-timer-reset'),
  btnSfxCorrect: document.getElementById('btn-sfx-correct'),
  btnSfxIncorrect: document.getElementById('btn-sfx-incorrect'),
  btnSfxVictory: document.getElementById('btn-sfx-victory'),
  btnSfxConfetti: document.getElementById('btn-sfx-confetti'),
  hostTeamsScoringList: document.getElementById('host-teams-scoring-list'),
  btnAddRate: document.getElementById('btn-add-rate'),
  hostSubmissionsPanel: document.getElementById('host-submissions-panel'),
  hostSubmissionsList: document.getElementById('host-submissions-list'),
  hostTeamLink: document.getElementById('host-team-link'),
  
  // Admin & Leaderboard elements
  adminStatus: document.getElementById('admin-status'),
  btnAdminLogin: document.getElementById('btn-admin-login'),
  adminLoginModal: document.getElementById('admin-login-modal'),
  adminPinInput: document.getElementById('admin-pin-input'),
  btnAdminCancel: document.getElementById('btn-admin-cancel'),
  btnAdminSubmit: document.getElementById('btn-admin-submit'),
  leaderboardModal: document.getElementById('leaderboard-modal'),
  leaderboardModalQuiz: document.getElementById('leaderboard-modal-quiz'),
  leaderboardModalBody: document.getElementById('leaderboard-modal-body'),
  btnLeaderboardClose: document.getElementById('btn-leaderboard-close')
};

// Colors palette for teams quick selection
const TEAM_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7', '#84cc16'];

// -------------------------------------------------------------
// CORE FUNCTIONS
// -------------------------------------------------------------

function showScreen(screenName) {
  state.currentScreen = screenName;
  Object.keys(el.screens).forEach(key => {
    if (key === screenName) {
      el.screens[key].classList.add('active');
    } else {
      el.screens[key].classList.remove('active');
    }
  });

  // Handle screen transition side-effects
  if (screenName !== 'host') {
    stopPolling();
  }
}

// -------------------------------------------------------------
// API CALL HELPERS
// -------------------------------------------------------------

async function apiCall(url, method = 'GET', data = null) {
  const options = {
    method,
    headers: { 
      'Content-Type': 'application/json',
      'X-Admin-Pin': state.adminPin || ''
    }
  };
  if (data) {
    options.body = JSON.stringify(data);
  }
  const response = await fetch(url, options);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Server request failed');
  }
  return response.json();
}

// -------------------------------------------------------------
// DASHBOARD & LISTING
// -------------------------------------------------------------

async function loadQuizzes() {
  try {
    state.quizzes = await apiCall('/api/quizzes');
    renderQuizList();
  } catch (error) {
    console.error('Error loading quizzes:', error);
    el.quizList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--color-danger); padding: 50px;">
      Failed to load quizzes. ${error.message}
    </div>`;
  }
}

function renderQuizList() {
  if (state.quizzes.length === 0) {
    el.quizList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-muted);">
      No quizzes found. Create your first one to get started!
    </div>`;
    return;
  }

  el.quizList.innerHTML = state.quizzes.map(quiz => {
    const actionsHtml = state.isAdmin ? `
      <button class="btn-primary btn-play" data-id="${quiz.id}" style="padding: 6px 12px; font-size: 0.85rem;">Play</button>
      <button class="btn-secondary btn-edit" data-id="${quiz.id}" style="padding: 6px 12px; font-size: 0.85rem;">Edit</button>
      <button class="btn-secondary btn-view-leaderboard" data-id="${quiz.id}" data-title="${escapeHtml(quiz.title)}" style="padding: 6px 12px; font-size: 0.85rem;">Leaderboard</button>
      <button class="btn-danger btn-delete" data-id="${quiz.id}" style="padding: 6px 12px; font-size: 0.85rem; margin-left: auto;">Delete</button>
    ` : `
      <button class="btn-primary btn-view-leaderboard" data-id="${quiz.id}" data-title="${escapeHtml(quiz.title)}" style="width: 100%; padding: 8px 16px;">
        🏆 View High Scores Leaderboard
      </button>
    `;

    return `
      <div class="glass-panel quiz-card" style="height: auto; min-height: 220px;">
        <h3>${escapeHtml(quiz.title)}</h3>
        <p>${escapeHtml(quiz.description || 'No description provided.')}</p>
        <div class="quiz-card-meta">
          <span>🧩 ${quiz.question_count} Questions</span>
          <span>📅 ${new Date(quiz.created_at).toLocaleDateString()}</span>
        </div>
        <div class="quiz-card-actions" style="margin-top: 20px;">
          ${actionsHtml}
        </div>
      </div>
    `;
  }).join('');

  // Attach event listeners to card actions
  el.quizList.querySelectorAll('.btn-play').forEach(btn => {
    btn.onclick = () => startSetupScreen(btn.dataset.id);
  });
  el.quizList.querySelectorAll('.btn-edit').forEach(btn => {
    btn.onclick = () => startEditScreen(btn.dataset.id);
  });
  el.quizList.querySelectorAll('.btn-view-leaderboard').forEach(btn => {
    btn.onclick = () => showLeaderboard(btn.dataset.id, btn.dataset.title);
  });
  el.quizList.querySelectorAll('.btn-delete').forEach(btn => {
    btn.onclick = () => deleteQuiz(btn.dataset.id);
  });
}

async function deleteQuiz(id) {
  if (confirm('Are you sure you want to delete this quiz? This cannot be undone.')) {
    try {
      await apiCall(`/api/quizzes?id=${id}`, 'DELETE');
      loadQuizzes();
    } catch (error) {
      alert('Failed to delete quiz: ' + error.message);
    }
  }
}

// -------------------------------------------------------------
// QUIZ CREATOR/EDITOR
// -------------------------------------------------------------

function startCreateScreen() {
  state.editingQuizId = null;
  state.creatorQuestions = [];
  el.creatorTitle.textContent = 'Create Quiz';
  el.quizTitleInput.value = '';
  el.quizDescInput.value = '';
  addCreatorQuestion('multiple-choice');
  showScreen('creator');
}

async function startEditScreen(id) {
  try {
    const quiz = await apiCall(`/api/quizzes?id=${id}`);
    state.editingQuizId = id;
    el.creatorTitle.textContent = 'Edit Quiz';
    el.quizTitleInput.value = quiz.title;
    el.quizDescInput.value = quiz.description || '';
    state.creatorQuestions = quiz.questions;
    renderCreatorQuestions();
    showScreen('creator');
  } catch (error) {
    alert('Failed to load quiz details: ' + error.message);
  }
}

function addCreatorQuestion(type) {
  state.creatorQuestions.push({
    question_text: '',
    question_type: type,
    options: type === 'multiple-choice' ? ['', '', '', ''] : null,
    correct_answer: '',
    points: 10,
    timer_duration: 0,
    rating_scale: 10
  });
  renderCreatorQuestions();
}

function renderCreatorQuestions() {
  el.questionsBuilderList.innerHTML = '';
  
  state.creatorQuestions.forEach((q, qIndex) => {
    const questionCard = document.createElement('div');
    questionCard.className = 'glass-panel question-builder-item';
    
    // Header & Remove btn
    let html = `
      <button class="btn-danger remove-question" data-index="${qIndex}" style="padding: 4px 8px; font-size: 0.75rem;">Remove</button>
      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 15px;">
        <span style="font-weight: 800; font-size: 1.1rem; color: var(--text-secondary);">Q${qIndex + 1}</span>
        <span style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; background: rgba(139,92,246,0.15); padding: 4px 8px; border-radius: 4px; color: var(--text-secondary); font-weight: 600;">
          ${q.question_type === 'multiple-choice' ? 'Multiple Choice' : q.question_type === 'text' ? 'Text Answer' : 'Rate Submission'}
        </span>
        <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
          <label style="font-size: 0.85rem; color: var(--text-muted); font-weight:600;">Points:</label>
          <input type="number" class="q-points" data-index="${qIndex}" value="${q.points}" style="width: 70px; padding: 6px;" min="1" max="100">
        </div>
      </div>
      <div class="form-group">
        <label>Question Text</label>
        <input type="text" class="q-text" data-index="${qIndex}" value="${escapeHtml(q.question_text)}" placeholder="Type question here...">
      </div>
      
      <!-- Advanced Settings foldout -->
      <div style="display: flex; gap: 15px; background: rgba(0,0,0,0.15); padding: 12px; border-radius: 8px; margin-bottom: 20px;">
        <div style="flex: 1;">
          <label style="font-size: 0.8rem; color: var(--text-secondary); display:block; margin-bottom:4px; font-weight:600;">Time Limit (0 = manual)</label>
          <input type="number" class="q-timer-limit" data-index="${qIndex}" value="${q.timer_duration || 0}" min="0" max="300" style="padding: 6px; font-size: 0.85rem;">
        </div>
        ${q.question_type === 'rate-submission' ? `
          <div style="flex: 1;">
            <label style="font-size: 0.8rem; color: var(--text-secondary); display:block; margin-bottom:4px; font-weight:600;">Rating Scale Max</label>
            <input type="number" class="q-rating-scale" data-index="${qIndex}" value="${q.rating_scale || 10}" min="2" max="100" style="padding: 6px; font-size: 0.85rem;">
          </div>
        ` : ''}
      </div>
    `;

    // MCQ choices
    if (q.question_type === 'multiple-choice') {
      html += `<div class="form-group"><label>Options & Correct Answer</label>`;
      q.options.forEach((opt, oIndex) => {
        const isChecked = q.correct_answer === opt && opt !== '';
        html += `
          <div class="mcq-option-row">
            <span style="display: flex; align-items: center; justify-content: center; width: 30px; font-weight: 800; color: var(--text-muted);">${String.fromCharCode(65 + oIndex)}</span>
            <input type="text" class="q-option" data-qindex="${qIndex}" data-oindex="${oIndex}" value="${escapeHtml(opt)}" placeholder="Option ${oIndex + 1}">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 0 10px; font-size: 0.85rem; color: var(--text-secondary);">
              <input type="radio" name="correct_${qIndex}" class="q-correct-mcq" data-qindex="${qIndex}" value="${oIndex}" ${isChecked ? 'checked' : ''}>
              Correct
            </label>
          </div>
        `;
      });
      html += `</div>`;
    } else if (q.question_type === 'text') {
      // Text Answer
      html += `
        <div class="form-group">
          <label>Correct Answer Value</label>
          <input type="text" class="q-correct-text" data-index="${qIndex}" value="${escapeHtml(q.correct_answer)}" placeholder="e.g. Venus">
        </div>
      `;
    } else {
      // Rate Submission
      html += `
        <div class="form-group">
          <label>Submission Prompt Information</label>
          <input type="text" class="q-correct-text" data-index="${qIndex}" value="${escapeHtml(q.correct_answer)}" placeholder="e.g. Image upload or caption prompt information">
        </div>
      `;
    }

    questionCard.innerHTML = html;
    el.questionsBuilderList.appendChild(questionCard);
  });

  // Bind input synchronization events
  el.questionsBuilderList.querySelectorAll('.q-text').forEach(input => {
    input.oninput = (e) => {
      state.creatorQuestions[e.target.dataset.index].question_text = e.target.value;
    };
  });

  el.questionsBuilderList.querySelectorAll('.q-points').forEach(input => {
    input.onchange = (e) => {
      state.creatorQuestions[e.target.dataset.index].points = parseInt(e.target.value) || 10;
    };
  });

  el.questionsBuilderList.querySelectorAll('.q-timer-limit').forEach(input => {
    input.onchange = (e) => {
      state.creatorQuestions[e.target.dataset.index].timer_duration = parseInt(e.target.value) || 0;
    };
  });

  el.questionsBuilderList.querySelectorAll('.q-rating-scale').forEach(input => {
    input.onchange = (e) => {
      state.creatorQuestions[e.target.dataset.index].rating_scale = parseInt(e.target.value) || 10;
    };
  });

  el.questionsBuilderList.querySelectorAll('.q-option').forEach(input => {
    input.oninput = (e) => {
      const qIdx = parseInt(e.target.dataset.qindex);
      const oIdx = parseInt(e.target.dataset.oindex);
      const wasCorrect = state.creatorQuestions[qIdx].correct_answer === state.creatorQuestions[qIdx].options[oIdx];
      state.creatorQuestions[qIdx].options[oIdx] = e.target.value;
      if (wasCorrect) {
        state.creatorQuestions[qIdx].correct_answer = e.target.value;
      }
    };
  });

  el.questionsBuilderList.querySelectorAll('.q-correct-mcq').forEach(radio => {
    radio.onchange = (e) => {
      const qIdx = parseInt(e.target.dataset.qindex);
      const oIdx = parseInt(e.target.value);
      state.creatorQuestions[qIdx].correct_answer = state.creatorQuestions[qIdx].options[oIdx];
    };
  });

  el.questionsBuilderList.querySelectorAll('.q-correct-text').forEach(input => {
    input.oninput = (e) => {
      state.creatorQuestions[e.target.dataset.index].correct_answer = e.target.value;
    };
  });

  el.questionsBuilderList.querySelectorAll('.remove-question').forEach(btn => {
    btn.onclick = (e) => {
      state.creatorQuestions.splice(parseInt(e.target.dataset.index), 1);
      renderCreatorQuestions();
    };
  });
}

async function saveQuiz() {
  const title = el.quizTitleInput.value.trim();
  const description = el.quizDescInput.value.trim();
  
  if (!title) {
    alert('Please enter a quiz title.');
    return;
  }
  if (state.creatorQuestions.length === 0) {
    alert('Please add at least one question.');
    return;
  }

  // Validate that questions have content and answers
  for (let i = 0; i < state.creatorQuestions.length; i++) {
    const q = state.creatorQuestions[i];
    if (!q.question_text.trim()) {
      alert(`Question ${i + 1} has no question text.`);
      return;
    }
    if (q.question_type === 'multiple-choice') {
      const filledOptions = q.options.filter(o => o.trim() !== '');
      if (filledOptions.length < 2) {
        alert(`Question ${i + 1} needs at least 2 non-empty options.`);
        return;
      }
      if (!q.correct_answer) {
        alert(`Please select a correct answer for Multiple Choice question ${i + 1}.`);
        return;
      }
    } else {
      if (!q.correct_answer.trim()) {
        alert(`Please type a correct answer for Text question ${i + 1}.`);
        return;
      }
    }
  }

  const payload = {
    title,
    description,
    questions: state.creatorQuestions
  };

  try {
    let url = '/api/quizzes';
    if (state.editingQuizId) {
      url += `?id=${state.editingQuizId}`;
    }
    await apiCall(url, 'POST', payload);
    loadQuizzes();
    showScreen('dashboard');
  } catch (error) {
    alert('Failed to save quiz: ' + error.message);
  }
}

// -------------------------------------------------------------
// GAME TEAMS SETUP
// -------------------------------------------------------------

async function startSetupScreen(quizId) {
  try {
    const quiz = await apiCall(`/api/quizzes?id=${quizId}`);
    state.activeQuiz = quiz;
    el.setupQuizSubtitle.textContent = `Quiz: ${quiz.title}`;
    
    // Set default teams if array is small
    if (state.setupTeams.length < 2) {
      state.setupTeams = [
        { name: 'Red Phoenix', color: '#ef4444', players: 'Alice, Bob' },
        { name: 'Blue Waves', color: '#3b82f6', players: 'Charlie, Diana' }
      ];
    }
    renderTeamBuilderList();
    showScreen('setup');
  } catch (error) {
    alert('Failed to load quiz setup: ' + error.message);
  }
}

function renderTeamBuilderList() {
  el.teamListBuilder.innerHTML = '';
  
  state.setupTeams.forEach((team, index) => {
    const teamDiv = document.createElement('div');
    teamDiv.className = 'team-builder-card';
    teamDiv.innerHTML = `
      <div class="color-picker-wrapper">
        <input type="color" class="team-color-input" data-index="${index}" value="${team.color}">
      </div>
      <div style="flex-grow: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <input type="text" class="team-name-input" data-index="${index}" value="${escapeHtml(team.name)}" placeholder="Team Name">
        <input type="text" class="team-players-input" data-index="${index}" value="${escapeHtml(team.players)}" placeholder="Players (comma-separated)">
      </div>
      <button class="btn-danger btn-remove-team" data-index="${index}" style="padding: 10px 14px;">
        &times;
      </button>
    `;
    
    el.teamListBuilder.appendChild(teamDiv);
  });

  // Bind change handlers
  el.teamListBuilder.querySelectorAll('.team-color-input').forEach(input => {
    input.onchange = (e) => {
      state.setupTeams[e.target.dataset.index].color = e.target.value;
    };
  });
  el.teamListBuilder.querySelectorAll('.team-name-input').forEach(input => {
    input.oninput = (e) => {
      state.setupTeams[e.target.dataset.index].name = e.target.value;
    };
  });
  el.teamListBuilder.querySelectorAll('.team-players-input').forEach(input => {
    input.oninput = (e) => {
      state.setupTeams[e.target.dataset.index].players = e.target.value;
    };
  });
  el.teamListBuilder.querySelectorAll('.btn-remove-team').forEach(btn => {
    btn.onclick = (e) => {
      if (state.setupTeams.length <= 1) {
        alert('You must have at least one team to play.');
        return;
      }
      state.setupTeams.splice(parseInt(e.target.dataset.index), 1);
      renderTeamBuilderList();
    };
  });
}

function addTeamToBuilder() {
  const newIndex = state.setupTeams.length;
  const color = TEAM_COLORS[newIndex % TEAM_COLORS.length];
  state.setupTeams.push({
    name: `Team ${String.fromCharCode(65 + newIndex)}`,
    color,
    players: ''
  });
  renderTeamBuilderList();
}

async function startGame() {
  // Validate teams
  for (let i = 0; i < state.setupTeams.length; i++) {
    if (!state.setupTeams[i].name.trim()) {
      alert(`Team ${i + 1} has no name.`);
      return;
    }
  }

  try {
    // 1. Start game session
    const startRes = await apiCall('/api/game', 'POST', {
      action: 'start',
      quiz_id: state.activeQuiz.id
    });
    const gameId = startRes.game_id;
    state.activeGameId = gameId;

    // 2. Save teams
    await apiCall('/api/game', 'POST', {
      action: 'teams',
      game_id: gameId,
      teams: state.setupTeams
    });

    // 3. Set status to active
    const firstQuestion = state.activeQuiz && state.activeQuiz.questions ? state.activeQuiz.questions[0] : null;
    const firstTimer = firstQuestion ? (firstQuestion.timer_duration || 0) : 0;

    await apiCall('/api/game', 'POST', {
      action: 'update',
      game_id: gameId,
      status: 'active',
      current_question_index: 0,
      timer_duration: firstTimer
    });

    // Load Host Console
    loadHostScreen(gameId);
  } catch (error) {
    alert('Failed to launch game: ' + error.message);
  }
}

// -------------------------------------------------------------
// HOST CONTROLLER VIEW
// -------------------------------------------------------------

async function loadHostScreen(gameId) {
  state.activeGameId = gameId;
  showScreen('host');
  
  // Set the portal link
  const portalUrl = `${window.location.origin}/team.html?gameId=${gameId}`;
  el.hostTeamLink.href = portalUrl;
  el.hostTeamLink.textContent = portalUrl;

  await refreshGameState();
  startPolling();
}

async function refreshGameState() {
  if (!state.activeGameId) return;

  try {
    const game = await apiCall(`/api/game?id=${state.activeGameId}`);
    state.activeGame = game;
    
    // Auto-load quiz details if missing (needed for advanced question metadata)
    if (!state.activeQuiz || state.activeQuiz.id !== game.quiz_id) {
      state.activeQuiz = await apiCall(`/api/quizzes?id=${game.quiz_id}`);
    }
    
    renderHostState();
  } catch (error) {
    console.error('Error fetching game status:', error);
  }
}

function renderHostState() {
  const game = state.activeGame;
  if (!game) return;

  el.hostGameTitle.textContent = game.quiz_title;
  el.hostProgressText.textContent = `Question ${game.current_question_index + 1} of ${game.total_questions}`;

  // Handle timer countdown
  updateTimerDisplay();

  // Render question card
  if (game.question) {
    const q = game.question;
    el.hostQuestionType.textContent = q.question_type === 'multiple-choice' ? 'Multiple Choice' : q.question_type === 'text' ? 'Text Answer' : 'Rate Submission';
    el.hostQuestionText.textContent = q.question_text;
    
    if (q.question_type === 'multiple-choice') {
      el.hostAnswersContainer.style.display = 'grid';
      el.hostTextAnswer.style.display = 'none';
      el.hostAnswersContainer.innerHTML = q.options.map((opt, idx) => {
        const isCorrect = q.correct_answer === opt;
        return `
          <div class="answer-option-pill ${isCorrect ? 'correct-ans' : ''}">
            <span style="font-weight: 800; margin-right: 8px;">${String.fromCharCode(65 + idx)}.</span>
            ${escapeHtml(opt)}
          </div>
        `;
      }).join('');
    } else if (q.question_type === 'text') {
      el.hostAnswersContainer.style.display = 'none';
      el.hostTextAnswer.style.display = 'block';
      el.hostTextAnswerVal.textContent = q.correct_answer;
    } else {
      el.hostAnswersContainer.style.display = 'none';
      el.hostTextAnswer.style.display = 'none';
    }
  } else {
    // If complete
    el.hostQuestionType.textContent = 'Quiz Finished';
    el.hostQuestionText.textContent = 'Game complete! Open Projector View to see the Winner podium.';
    el.hostAnswersContainer.style.display = 'none';
    el.hostTextAnswer.style.display = 'none';
  }

  // Render submissions list if rate-submission question type
  if (game.question && game.question.question_type === 'rate-submission') {
    el.hostSubmissionsPanel.style.display = 'block';
    el.hostSubmissionsList.innerHTML = '';
    
    game.teams.forEach(team => {
      const sub = game.submissions.find(s => String(s.team_id) === String(team.id));
      const subCard = document.createElement('div');
      subCard.className = 'glass-panel submission-card';
      subCard.style.borderLeftColor = team.color || '#fff';
      
      let contentHtml = '';
      if (sub) {
        if (sub.submitted_text) {
          contentHtml += `<div class="submission-text">"${escapeHtml(sub.submitted_text)}"</div>`;
        }
        if (sub.submitted_image) {
          contentHtml += `
            <div class="submission-image-wrapper">
              <img class="submission-image" src="${sub.submitted_image}" alt="Team drawing">
            </div>
          `;
        }
      } else {
        contentHtml += `<div style="color: var(--text-muted); font-size: 0.9rem;">Waiting for submission...</div>`;
      }
      
      // Generate rating buttons scaled to question points
      const maxPoints = game.question.points;
      const scoreSteps = [
        0,
        Math.round(maxPoints * 0.25),
        Math.round(maxPoints * 0.5),
        Math.round(maxPoints * 0.75),
        maxPoints
      ];
      
      const currentPoints = sub ? sub.points_awarded : 0;
      
      const ratingButtonsHtml = scoreSteps.map(pts => `
        <button class="btn-rating-pill ${currentPoints === pts ? 'selected' : ''}" 
                data-teamid="${team.id}" data-points="${pts}">
          ${pts} pts
        </button>
      `).join('');
      
      subCard.innerHTML = `
        <div class="submission-meta">
          <span style="color: ${team.color || '#fff'}">${escapeHtml(team.name)}</span>
          <span style="color: var(--text-secondary);">${currentPoints} / ${maxPoints} rated</span>
        </div>
        ${contentHtml}
        <div class="submission-rating-group">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight:700;">Score Awarded:</span>
          <div class="rating-pill-container">
            ${ratingButtonsHtml}
          </div>
        </div>
      `;
      
      // Bind rating buttons
      subCard.querySelectorAll('.btn-rating-pill').forEach(btn => {
        btn.onclick = () => rateSubmission(team.id, btn.dataset.points);
      });
      
      el.hostSubmissionsList.appendChild(subCard);
    });
  } else {
    el.hostSubmissionsPanel.style.display = 'none';
  }

  // Render scoring panel
  el.hostTeamsScoringList.innerHTML = game.teams.map(team => `
    <div class="glass-panel host-team-row" style="border-left-color: ${team.color || '#fff'}">
      <div class="host-team-info">
        <div class="team-avatar" style="background: ${team.color || '#fff'}"></div>
        <div>
          <div style="font-weight:700; color:#fff;">${escapeHtml(team.name)}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(team.players)}</div>
        </div>
      </div>
      <div class="host-score-controls">
        <button class="btn-danger btn-score-dec" data-id="${team.id}" style="padding: 4px 10px; font-size: 0.8rem;">-</button>
        <span class="host-score-display">${team.score}</span>
        <button class="btn-primary btn-score-inc" data-id="${team.id}" style="padding: 4px 10px; font-size: 0.8rem;">+</button>
      </div>
    </div>
  `).join('');

  // Bind score inc/dec buttons (relative points)
  const currentPoints = game.question ? game.question.points : 10;
  
  el.hostTeamsScoringList.querySelectorAll('.btn-score-dec').forEach(btn => {
    btn.onclick = () => adjustScore(btn.dataset.id, -currentPoints);
  });
  el.hostTeamsScoringList.querySelectorAll('.btn-score-inc').forEach(btn => {
    btn.onclick = () => adjustScore(btn.dataset.id, currentPoints);
  });
}

async function rateSubmission(teamId, points) {
  if (!state.activeGame || !state.activeGame.question) return;

  if (parseInt(points) > 0) {
    playCorrect();
  } else {
    playIncorrect();
  }

  try {
    await apiCall('/api/game', 'POST', {
      action: 'rate',
      game_id: state.activeGameId,
      team_id: teamId,
      question_index: state.activeGame.current_question_index,
      points_awarded: parseInt(points)
    });
    refreshGameState();
  } catch (error) {
    console.error('Failed to rate submission:', error);
  }
}

// Adjust Score API call
async function adjustScore(teamId, scoreChange) {
  if (scoreChange > 0) {
    playCorrect();
  } else {
    playIncorrect();
  }
  
  try {
    await apiCall('/api/game', 'POST', {
      action: 'score',
      game_id: state.activeGameId,
      team_id: teamId,
      score_change: scoreChange
    });
    refreshGameState();
  } catch (error) {
    console.error('Failed to update score:', error);
  }
}

// Handle question navigation
async function navigateQuestion(direction) {
  if (!state.activeGame) return;
  
  const current = state.activeGame.current_question_index;
  let target = current + direction;
  
  if (target < 0) return;
  if (target >= state.activeGame.total_questions) {
    if (confirm('End the quiz? This will show the final podium to the audience.')) {
      await endGameSession();
    }
    return;
  }

  // Clear timer when advancing
  clearInterval(state.timerInterval);
  el.hostTimer.classList.remove('pulse');

  const targetQuestion = state.activeQuiz && state.activeQuiz.questions ? state.activeQuiz.questions[target] : null;
  const autoTimerDuration = targetQuestion ? (targetQuestion.timer_duration || 0) : 0;

  try {
    await apiCall('/api/game', 'POST', {
      action: 'update',
      game_id: state.activeGameId,
      current_question_index: target,
      timer_duration: autoTimerDuration
    });
    refreshGameState();
  } catch (error) {
    alert('Navigation failed: ' + error.message);
  }
}

// Timer Synchronizer
function updateTimerDisplay() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  
  const timerEndsAt = state.activeGame.timer_ends_at;
  if (!timerEndsAt) {
    el.hostTimerSec.textContent = '30';
    el.hostTimer.classList.remove('pulse');
    return;
  }

  const endsTime = new Date(timerEndsAt).getTime();
  
  const tick = () => {
    const timeLeft = Math.max(0, Math.ceil((endsTime - Date.now()) / 1000));
    el.hostTimerSec.textContent = timeLeft;

    if (timeLeft <= 5 && timeLeft > 0) {
      el.hostTimer.classList.add('pulse');
      playTick();
    } else if (timeLeft === 0) {
      el.hostTimer.classList.remove('pulse');
      clearInterval(state.timerInterval);
      playIncorrect(); // Play buzzer on time out
    }
  };

  tick();
  state.timerInterval = setInterval(tick, 1000);
}

async function triggerTimer(duration) {
  try {
    await apiCall('/api/game', 'POST', {
      action: 'update',
      game_id: state.activeGameId,
      timer_duration: duration
    });
    refreshGameState();
  } catch (error) {
    console.error('Failed to set timer:', error);
  }
}

async function stopTimer() {
  try {
    await apiCall('/api/game', 'POST', {
      action: 'update',
      game_id: state.activeGameId,
      timer_duration: 0 // Clear timer
    });
    refreshGameState();
  } catch (error) {
    console.error('Failed to stop timer:', error);
  }
}

// End Quiz Session
async function endGameSession() {
  playVictory();
  try {
    await apiCall('/api/game', 'POST', {
      action: 'update',
      game_id: state.activeGameId,
      status: 'completed',
      timer_duration: 0
    });
    refreshGameState();
  } catch (error) {
    console.error('Failed to end game:', error);
  }
}

// -------------------------------------------------------------
// POLLING ENGINE
// -------------------------------------------------------------

function startPolling() {
  stopPolling();
  // Poll database every 3 seconds for host sync (so host window stays aligned)
  state.pollInterval = setInterval(refreshGameState, 3000);
}

function stopPolling() {
  if (state.pollInterval) clearInterval(state.pollInterval);
  if (state.timerInterval) clearInterval(state.timerInterval);
}

// --- ADMIN & LEADERBOARD HELPERS ---

async function showLeaderboard(quizId, quizTitle) {
  try {
    const entries = await apiCall(`/api/quizzes?leaderboard=true&quizId=${quizId}`);
    el.leaderboardModalQuiz.textContent = `Quiz: ${quizTitle}`;
    
    if (entries.length === 0) {
      el.leaderboardModalBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 20px; color: var(--text-muted);">
            No high scores recorded yet. Be the first to play!
          </td>
        </tr>
      `;
    } else {
      el.leaderboardModalBody.innerHTML = entries.map((entry, idx) => `
        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.95rem;">
          <td style="padding: 12px; font-weight: 800; color: ${idx === 0 ? 'var(--color-warning)' : 'var(--text-primary)'};">
            ${idx + 1}${idx === 0 ? ' 👑' : ''}
          </td>
          <td style="padding: 12px; font-weight: 600; color: #fff;">
            ${escapeHtml(entry.team_name)}
          </td>
          <td style="padding: 12px; text-align: right; font-weight: 800; color: var(--accent-secondary);">
            ${entry.score}
          </td>
          <td style="padding: 12px; text-align: right; color: var(--text-muted); font-size: 0.8rem;">
            ${new Date(entry.played_at).toLocaleDateString()}
          </td>
        </tr>
      `).join('');
    }
    
    el.leaderboardModal.style.display = 'flex';
  } catch (error) {
    alert('Failed to load leaderboard: ' + error.message);
  }
}

function toggleAdminMode() {
  if (state.isAdmin) {
    // Logout
    state.isAdmin = false;
    state.adminPin = '';
    sessionStorage.removeItem('is_admin');
    sessionStorage.removeItem('admin_pin');
    
    el.adminStatus.style.display = 'none';
    el.btnAdminLogin.textContent = 'Admin Login';
    el.btnCreateQuiz.style.display = 'none';
    
    loadQuizzes();
  } else {
    // Show Login Modal
    el.adminPinInput.value = '';
    el.adminLoginModal.style.display = 'flex';
    el.adminPinInput.focus();
  }
}

async function verifyAdminPin() {
  const pin = el.adminPinInput.value.trim();
  if (!pin) return;

  try {
    const res = await apiCall('/api/auth', 'POST', { pin });
    if (res.success) {
      state.isAdmin = true;
      state.adminPin = pin;
      sessionStorage.setItem('is_admin', 'true');
      sessionStorage.setItem('admin_pin', pin);
      
      el.adminStatus.style.display = 'inline-flex';
      el.btnAdminLogin.textContent = 'Admin Logout';
      el.btnCreateQuiz.style.display = 'inline-flex';
      el.adminLoginModal.style.display = 'none';
      
      loadQuizzes();
    }
  } catch (error) {
    alert('Verification failed: ' + error.message);
    el.adminPinInput.value = '';
    el.adminPinInput.focus();
  }
}

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------

function init() {
  // Bind Header logo to home
  document.querySelector('.logo').onclick = () => {
    showScreen('dashboard');
    loadQuizzes();
  };

  // Screen-Dashboard Bindings
  el.btnCreateQuiz.onclick = startCreateScreen;
  
  // Screen-Creator Bindings
  el.btnCancelCreator.onclick = () => {
    showScreen('dashboard');
    loadQuizzes();
  };
  el.btnSaveQuiz.onclick = saveQuiz;
  el.btnAddMcq.onclick = () => addCreatorQuestion('multiple-choice');
  el.btnAddText.onclick = () => addCreatorQuestion('text');
  el.btnAddRate.onclick = () => addCreatorQuestion('rate-submission');

  // Screen-Setup Bindings
  el.btnAddTeam.onclick = addTeamToBuilder;
  el.btnCancelSetup.onclick = () => showScreen('dashboard');
  el.btnStartGame.onclick = startGame;

  // Screen-Host Bindings
  el.btnPrevQuestion.onclick = () => navigateQuestion(-1);
  el.btnNextQuestion.onclick = () => navigateQuestion(1);
  el.btnEndGame.onclick = () => {
    if (confirm('End the game immediately?')) {
      endGameSession();
    }
  };

  el.btnTimerStart.onclick = () => triggerTimer(30);
  el.btnTimerStop.onclick = stopTimer;
  el.btnTimerReset.onclick = () => triggerTimer(30);

  // Presenter Link
  el.btnOpenProjector.onclick = () => {
    if (state.activeGameId) {
      window.open(`presenter.html?gameId=${state.activeGameId}`, 'QuizMasterPresenter', 'width=1200,height=800');
    }
  };

  // Sound board bindings
  el.btnSfxCorrect.onclick = playCorrect;
  el.btnSfxIncorrect.onclick = playIncorrect;
  el.btnSfxVictory.onclick = playVictory;
  el.btnSfxConfetti.onclick = () => {
    triggerConfetti();
  };

  // Admin Login & Leaderboard bindings
  el.btnAdminLogin.onclick = toggleAdminMode;
  el.btnAdminCancel.onclick = () => {
    el.adminLoginModal.style.display = 'none';
  };
  el.btnAdminSubmit.onclick = verifyAdminPin;
  el.adminPinInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
      verifyAdminPin();
    }
  };
  el.btnLeaderboardClose.onclick = () => {
    el.leaderboardModal.style.display = 'none';
  };

  // Sync initial Admin GUI state
  if (state.isAdmin) {
    el.adminStatus.style.display = 'inline-flex';
    el.btnAdminLogin.textContent = 'Admin Logout';
    el.btnCreateQuiz.style.display = 'inline-flex';
  } else {
    el.adminStatus.style.display = 'none';
    el.btnAdminLogin.textContent = 'Admin Login';
    el.btnCreateQuiz.style.display = 'none';
  }

  // Start app
  loadQuizzes();
}

// Helper to escape HTML tags
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initialize when document loads
window.onload = init;
