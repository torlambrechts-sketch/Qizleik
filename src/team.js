import { playCorrect, playIncorrect, playTick, playVictory } from './audio.js';

// State Management for Team Portal
const state = {
  gameId: localStorage.getItem('team_game_id') || null,
  teamId: localStorage.getItem('team_team_id') || null,
  teamName: localStorage.getItem('team_name') || null,
  teamColor: localStorage.getItem('team_color') || null,
  game: null,
  currentQuestionIndex: -1,
  pollInterval: null,
  isDrawing: false,
  canvasCtx: null,
  canvasElement: null
};

// UI Selectors
const el = {
  joinPanel: document.getElementById('portal-join'),
  joinGameId: document.getElementById('join-game-id'),
  btnFetchTeams: document.getElementById('btn-fetch-teams'),
  teamSelectGroup: document.getElementById('join-team-select-group'),
  joinTeamSelect: document.getElementById('join-team-select'),
  btnJoinGame: document.getElementById('btn-join-game'),
  
  arenaPanel: document.getElementById('portal-arena'),
  teamBadge: document.getElementById('portal-team-badge'),
  scoreBadge: document.getElementById('portal-score-badge'),
  btnLogout: document.getElementById('btn-portal-logout'),
  
  stateLobby: document.getElementById('portal-state-lobby'),
  stateActive: document.getElementById('portal-state-active'),
  stateCompleted: document.getElementById('portal-state-completed'),
  
  questionProgress: document.getElementById('portal-question-progress'),
  questionPrompt: document.getElementById('portal-question-prompt'),
  responderContainer: document.getElementById('portal-responder-container'),
  submittedStatus: document.getElementById('portal-submitted-status'),
  teamModeFeed: document.getElementById('portal-team-mode-feed'),
  teamModeStatusText: document.getElementById('portal-team-mode-status-text'),
  teamModeAnswersList: document.getElementById('portal-team-mode-answers-list'),

  // Join Tab controls
  tabJoinSignup: document.getElementById('tab-join-signup'),
  tabJoinExisting: document.getElementById('tab-join-existing'),
  joinSectionSignup: document.getElementById('join-section-signup'),
  joinSectionExisting: document.getElementById('join-section-existing'),

  // Signup fields
  signupUsername: document.getElementById('signup-username'),
  signupCompany: document.getElementById('signup-company'),
  signupColor: document.getElementById('signup-color'),
  btnSignupJoin: document.getElementById('btn-signup-join'),

  // Client SFX buttons
  btnSfxCorrect: document.getElementById('btn-sfx-correct'),
  btnSfxIncorrect: document.getElementById('btn-sfx-incorrect'),
  btnSfxVictory: document.getElementById('btn-sfx-victory'),
  btnSfxTick: document.getElementById('btn-sfx-tick'),

  // Join Pre-created inputs
  joinUsername: document.getElementById('join-username'),
  joinCompany: document.getElementById('join-company')
};

// -------------------------------------------------------------
// JOIN GAME / LOGIN FUNCTIONS
// -------------------------------------------------------------

async function fetchTeams() {
  const gameId = el.joinGameId.value.trim();
  if (!gameId) {
    alert('Please enter a Game ID.');
    return;
  }

  try {
    const game = await fetch(`/api/game?id=${gameId}`).then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    });
    
    // Filter out already active teams
    const inactiveTeams = game.teams.filter(team => !team.is_active);
    if (inactiveTeams.length === 0) {
      alert('All pre-created team slots are taken! Please use the "Sign Up Team" tab to create your own.');
      return;
    }
    
    // Populate dropdown
    el.joinTeamSelect.innerHTML = inactiveTeams.map(team => `
      <option value="${team.id}" data-name="${team.name}" data-color="${team.color}">${escapeHtml(team.name)}</option>
    `).join('');
    
    el.teamSelectGroup.style.display = 'block';
    state.gameId = gameId;
  } catch (error) {
    alert('Could not find active game session. Check the ID and try again.');
  }
}

async function joinGame() {
  const gameId = state.gameId;
  const username = el.joinUsername.value.trim();
  const company = el.joinCompany.value.trim();
  const select = el.joinTeamSelect;
  const option = select.options[select.selectedIndex];
  
  if (!username) {
    alert('Please enter your Username / Player Name.');
    return;
  }
  
  const teamId = select.value;
  
  try {
    const res = await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join_team',
        team_id: teamId,
        name: username,
        players: company
      })
    }).then(r => {
      if (!r.ok) throw new Error();
      return r.json();
    });
    
    state.teamId = res.team_id;
    state.teamName = res.name;
    state.teamColor = res.color;
    
    localStorage.setItem('team_game_id', gameId);
    localStorage.setItem('team_team_id', state.teamId);
    localStorage.setItem('team_name', state.teamName);
    localStorage.setItem('team_color', state.teamColor);
    
    enterArena();
  } catch (error) {
    alert('Failed to connect to team. Please try again.');
  }
}

function enterArena() {
  el.joinPanel.style.display = 'none';
  el.arenaPanel.style.display = 'block';
  el.teamBadge.textContent = state.teamName;
  el.teamBadge.style.color = state.teamColor;
  
  pollGameStatus();
  state.pollInterval = setInterval(pollGameStatus, 2000); // Poll game status every 2 seconds
}

async function signupAndJoin() {
  const gameId = el.joinGameId.value.trim();
  const username = el.signupUsername.value.trim();
  const company = el.signupCompany.value.trim();
  const color = el.signupColor.value;

  if (!gameId) {
    alert('Please enter a Game ID.');
    return;
  }
  if (!username) {
    alert('Please enter your Username / Team Name.');
    return;
  }

  try {
    const res = await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register_team',
        game_id: gameId,
        name: username,
        color: color,
        players: company // Storing company name in players field
      })
    }).then(r => {
      if (!r.ok) throw new Error();
      return r.json();
    });

    state.gameId = gameId;
    state.teamId = res.team_id;
    state.teamName = res.name;
    state.teamColor = res.color;

    localStorage.setItem('team_game_id', state.gameId);
    localStorage.setItem('team_team_id', state.teamId);
    localStorage.setItem('team_name', state.teamName);
    localStorage.setItem('team_color', state.teamColor);

    enterArena();
  } catch (error) {
    alert('Failed to register team. Check Game ID and try again.');
  }
}

function toggleJoinTab(tab) {
  if (tab === 'signup') {
    el.tabJoinSignup.className = 'btn-primary';
    el.tabJoinSignup.style.background = 'var(--accent-coral)';
    el.tabJoinSignup.style.borderColor = 'transparent';
    el.tabJoinExisting.className = 'btn-secondary';
    el.tabJoinExisting.style.background = '';
    el.tabJoinExisting.style.borderColor = '';
    el.joinSectionSignup.style.display = 'block';
    el.joinSectionExisting.style.display = 'none';
  } else {
    el.tabJoinSignup.className = 'btn-secondary';
    el.tabJoinSignup.style.background = '';
    el.tabJoinSignup.style.borderColor = '';
    el.tabJoinExisting.className = 'btn-primary';
    el.tabJoinExisting.style.background = 'var(--accent-coral)';
    el.tabJoinExisting.style.borderColor = 'transparent';
    el.joinSectionSignup.style.display = 'none';
    el.joinSectionExisting.style.display = 'block';
  }
}

function logout() {
  stopPolling();
  localStorage.clear();
  state.gameId = null;
  state.teamId = null;
  state.teamName = null;
  state.teamColor = null;
  
  el.joinPanel.style.display = 'block';
  el.arenaPanel.style.display = 'none';
  el.teamSelectGroup.style.display = 'none';
  el.joinGameId.value = '';
}

// -------------------------------------------------------------
// POLLING STATUS
// -------------------------------------------------------------

async function pollGameStatus() {
  if (!state.gameId) return;

  try {
    const game = await fetch(`/api/game?id=${state.gameId}`).then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    });
    state.game = game;

    // Update score badge (Freeze/Hide current question score in team competition mode until all submit)
    const myTeam = game.teams.find(t => String(t.id) === String(state.teamId));
    if (myTeam) {
      if (game.team_mode) {
        const mySubmission = game.submissions.find(s => String(s.team_id) === String(state.teamId));
        const totalSubmittedCount = game.submissions.length;
        const activeTeamsCount = game.teams.filter(t => t.is_active).length;
        const allSubmitted = totalSubmittedCount === activeTeamsCount;
        
        if (allSubmitted) {
          el.scoreBadge.textContent = `Score: ${myTeam.score} pts`;
        } else {
          // Subtract points awarded for this question so far to show previous total score
          const pointsThisRound = mySubmission ? (mySubmission.points_awarded || 0) : 0;
          el.scoreBadge.textContent = `Score: ${myTeam.score - pointsThisRound} pts (Locked)`;
        }
      } else {
        el.scoreBadge.textContent = `Score: ${myTeam.score} pts`;
      }
    }

    renderPortalState();
  } catch (error) {
    console.error('Polling failed:', error);
  }
}

function subHasContent(sub) {
  return (sub.submitted_text && sub.submitted_text !== 'Host manual scoring') || sub.submitted_image;
}

function renderPortalState() {
  const game = state.game;
  if (!game) return;

  if (game.status === 'setup') {
    el.stateLobby.style.display = 'block';
    el.stateActive.style.display = 'none';
    el.stateCompleted.style.display = 'none';
  } 
  else if (game.status === 'active') {
    el.stateLobby.style.display = 'none';
    el.stateActive.style.display = 'block';
    el.stateCompleted.style.display = 'none';

    // Check if we have submitted an answer
    const mySubmission = game.submissions.find(s => String(s.team_id) === String(state.teamId));
    const hasSubmitted = mySubmission && subHasContent(mySubmission);

    // Clear and redraw responder form if question index changes
    if (game.current_question_index !== state.currentQuestionIndex) {
      state.currentQuestionIndex = game.current_question_index;
      el.submittedStatus.style.display = 'none';
      el.responderContainer.style.display = 'block';
      el.teamModeFeed.style.display = 'none';
      renderResponder();
    } else if (hasSubmitted) {
      // Hide input panel and display success badge
      el.responderContainer.style.display = 'none';
      el.submittedStatus.style.display = 'block';
      
      // Update submitted status label to wait or show graded feedback
      const totalSubmittedCount = game.submissions.length;
      const activeTeamsCount = game.teams.filter(t => t.is_active).length;
      const allSubmitted = totalSubmittedCount === activeTeamsCount;
      
      if (game.team_mode) {
        el.teamModeFeed.style.display = 'block';
        
        if (allSubmitted) {
          el.teamModeStatusText.textContent = `🎉 All teams have submitted! Results unlocked.`;
          
          if (mySubmission.points_awarded !== undefined && mySubmission.points_awarded !== null) {
            el.submittedStatus.innerHTML = `
              <span style="color: #10b981; font-weight: 800; font-size: 1rem; display: block; margin-bottom: 4px;">✓ Response Graded!</span>
              <span style="font-size: 0.9rem; color: var(--text-dark); font-weight: 700;">+${mySubmission.points_awarded} Points Awarded</span>
              ${game.question && game.question.correct_answer ? `<div style="font-size: 0.8rem; color: var(--text-medium); margin-top: 4px;">Correct Answer: ${escapeHtml(game.question.correct_answer)}</div>` : ''}
            `;
          } else {
            el.submittedStatus.innerHTML = `
              <span style="color: #10b981; font-weight: 800; font-size: 1rem; display: block; margin-bottom: 4px;">✓ Response Submitted!</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">All submissions are in. Waiting for host to grade or advance...</span>
            `;
          }
        } else {
          el.teamModeStatusText.textContent = `⏳ Waiting for other teams to submit... (${totalSubmittedCount} of ${activeTeamsCount} completed)`;
          el.submittedStatus.innerHTML = `
            <span style="color: #10b981; font-weight: 800; font-size: 1rem; display: block; margin-bottom: 4px;">✓ Response Submitted!</span>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Waiting for all other teams to submit...</span>
          `;
        }

        // Render other teams' answers
        el.teamModeAnswersList.innerHTML = game.submissions.map(sub => {
          if (String(sub.team_id) === String(state.teamId)) return '';
          
          let mediaHtml = '';
          if (sub.submitted_text) {
            mediaHtml += `<div style="margin-top: 4px; font-weight: 500; color: var(--text-dark);">"${escapeHtml(sub.submitted_text)}"</div>`;
          }
          if (sub.submitted_image) {
            mediaHtml += `
              <div style="margin-top: 8px; max-width: 250px; border: 1px solid var(--border-color-light); border-radius: 8px; padding: 4px; background: #fff;">
                <img src="${sub.submitted_image}" style="width: 100%; border-radius: 6px; object-fit: contain; max-height: 140px;">
              </div>
            `;
          }
          
          const team = game.teams.find(t => String(t.id) === String(sub.team_id));
          const displayName = team && team.players ? `${sub.team_name} (${team.players})` : sub.team_name;
          
          return `
            <div style="padding: 12px; border: 1px solid var(--border-color-light); border-radius: 12px; background: #fafafb; border-left: 4px solid ${sub.team_color || '#ccc'}; text-align: left;">
              <strong style="color: ${sub.team_color || 'var(--text-dark)'}; font-size: 0.85rem;">
                ${escapeHtml(displayName)}
              </strong>
              ${mediaHtml}
            </div>
          `;
        }).join('');
      } else {
        el.teamModeFeed.style.display = 'none';
        el.submittedStatus.innerHTML = `
          <span style="color: #10b981; font-weight: 800; font-size: 1rem; display: block; margin-bottom: 4px;">✓ Response Submitted!</span>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Waiting for host to score or advance the quiz...</span>
        `;
      }
    } else {
      el.responderContainer.style.display = 'block';
      el.submittedStatus.style.display = 'none';
      el.teamModeFeed.style.display = 'none';
    }
  }
  else if (game.status === 'completed') {
    el.stateLobby.style.display = 'none';
    el.stateActive.style.display = 'none';
    el.stateCompleted.style.display = 'block';
  }
}

// -------------------------------------------------------------
// RESPONDER RENDERING & CAPABILITIES
// -------------------------------------------------------------

function renderResponder() {
  const q = state.game.question;
  if (!q) {
    el.questionProgress.textContent = '';
    el.questionPrompt.textContent = 'Preparing next question...';
    el.responderContainer.innerHTML = '';
    return;
  }

  el.questionProgress.textContent = `Question ${state.game.current_question_index + 1} of ${state.game.total_questions}`;
  el.questionPrompt.textContent = q.question_text;

  // Render different inputs based on question types
  if (q.question_type === 'multiple-choice') {
    el.responderContainer.innerHTML = `
      <div class="mcq-grid">
        ${q.options.map((opt, idx) => `
          <button class="btn-secondary btn-mcq-choice" data-answer="${escapeHtml(opt)}">
            ${String.fromCharCode(65 + idx)}
          </button>
        `).join('')}
      </div>
    `;
    
    // Bind MCQ choice buttons
    el.responderContainer.querySelectorAll('.btn-mcq-choice').forEach(btn => {
      btn.onclick = () => submitAnswer(btn.dataset.answer, null);
    });
  } 
  else if (q.question_type === 'text') {
    el.responderContainer.innerHTML = `
      <div class="form-group" style="margin-top: 15px;">
        <input type="text" id="resp-text-val" placeholder="Type your answer here..." style="margin-bottom: 15px;">
        <button id="btn-submit-text" class="btn-primary" style="width: 100%;">Submit Answer</button>
      </div>
    `;
    
    const input = document.getElementById('resp-text-val');
    document.getElementById('btn-submit-text').onclick = () => {
      submitAnswer(input.value.trim(), null);
    };
  } 
  else if (q.question_type === 'rate-submission') {
    // Determine prompt parameters: is it asking for drawings (image) or text captions?
    const isImagePrompt = q.question_text.toLowerCase().includes('draw') || q.question_text.toLowerCase().includes('design') || q.question_text.toLowerCase().includes('logo');

    el.responderContainer.innerHTML = `
      <div class="form-group" style="margin-top: 15px;">
        <label for="resp-rate-text">Text Caption / Story (Optional)</label>
        <textarea id="resp-rate-text" rows="3" placeholder="Type any text caption here..."></textarea>
      </div>
      
      ${isImagePrompt ? `
        <div class="sketchpad-container">
          <label style="color: var(--text-secondary); font-size: 0.85rem; font-weight:700; display:block; margin-bottom: 8px;">Doodle Sketchpad</label>
          <canvas id="sketchpad"></canvas>
          <div class="canvas-controls">
            <button id="btn-canvas-clear" class="btn-secondary" style="padding: 6px 12px; font-size:0.8rem;">Clear</button>
          </div>
        </div>
        <div class="form-group" style="margin-top: 15px;">
          <label for="resp-rate-file">Or Upload Image File</label>
          <input type="file" id="resp-rate-file" accept="image/*">
        </div>
      ` : ''}
      
      <button id="btn-submit-submission" class="btn-cyan" style="width: 100%; margin-top: 20px;">
        Submit to Host
      </button>
    `;

    // Initialize Canvas Drawpad if it exists
    const canvas = document.getElementById('sketchpad');
    if (canvas) {
      initSketchpad(canvas);
      
      // Clear button
      document.getElementById('btn-canvas-clear').onclick = () => {
        state.canvasCtx.fillStyle = '#ffffff';
        state.canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      };

      // File Uploader mapping
      const fileInput = document.getElementById('resp-rate-file');
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            // Draw uploaded image onto the canvas, fitting bounds
            state.canvasCtx.fillStyle = '#ffffff';
            state.canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;
            state.canvasCtx.drawImage(img, x, y, w, h);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      };
    }

    document.getElementById('btn-submit-submission').onclick = () => {
      const textVal = document.getElementById('resp-rate-text').value.trim();
      let imageVal = null;
      
      if (canvas) {
        // Only upload image if they drew something (don't send blank canvas)
        imageVal = canvas.toDataURL('image/jpeg', 0.65); // compress to JPG (65% quality) to save DB space
      }
      
      submitAnswer(textVal, imageVal);
    };
  }
}

// -------------------------------------------------------------
// CANVAS DRAWING LOGIC (TOUCH/MOUSE SUPPORT)
// -------------------------------------------------------------

function initSketchpad(canvas) {
  state.canvasElement = canvas;
  const ctx = canvas.getContext('2d');
  state.canvasCtx = ctx;

  // Handle high-dpi sizing
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  // Fill background white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Set brush configurations
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDraw = (e) => {
    state.isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    e.preventDefault();
  };

  const draw = (e) => {
    if (!state.isDrawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDraw = () => {
    state.isDrawing = false;
  };

  // Mouse bindings
  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);

  // Touch bindings (mobile)
  canvas.addEventListener('touchstart', startDraw);
  canvas.addEventListener('touchmove', draw);
  canvas.addEventListener('touchend', stopDraw);
}

// -------------------------------------------------------------
// PUSH SUBMISSIONS
// -------------------------------------------------------------

async function submitAnswer(textVal, imageVal) {
  if (!textVal && !imageVal) {
    alert('Please draw something or write a caption before submitting!');
    return;
  }

  try {
    await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submit',
        game_id: state.gameId,
        team_id: state.teamId,
        question_index: state.currentQuestionIndex,
        submitted_text: textVal,
        submitted_image: imageVal
      })
    }).then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    });

    // Hide input panel and display success badge
    el.responderContainer.style.display = 'none';
    el.submittedStatus.style.display = 'block';
  } catch (error) {
    alert('Failed to submit answer. Try again.');
  }
}

// -------------------------------------------------------------
// POLLING UTILS
// -------------------------------------------------------------

function stopPolling() {
  if (state.pollInterval) clearInterval(state.pollInterval);
}

// Initialize Portal script
function init() {
  // Check URL query parameters for gameId
  const urlParams = new URLSearchParams(window.location.search);
  const urlGameId = urlParams.get('gameId');
  if (urlGameId) {
    el.joinGameId.value = urlGameId;
  }

  // Join tab selectors
  el.tabJoinSignup.onclick = () => toggleJoinTab('signup');
  el.tabJoinExisting.onclick = () => toggleJoinTab('existing');
  el.btnSignupJoin.onclick = signupAndJoin;

  el.btnFetchTeams.onclick = fetchTeams;
  el.btnJoinGame.onclick = joinGame;
  el.btnLogout.onclick = logout;

  // Sound effects prompt triggers
  el.btnSfxCorrect.onclick = playCorrect;
  el.btnSfxIncorrect.onclick = playIncorrect;
  el.btnSfxVictory.onclick = playVictory;
  el.btnSfxTick.onclick = playTick;

  // Auto-connect if cookies/localstorage has credentials
  if (state.gameId && state.teamId && state.teamName) {
    enterArena();
  }
}

// Simple escape HTML tags
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.onload = init;
window.onunload = stopPolling;
