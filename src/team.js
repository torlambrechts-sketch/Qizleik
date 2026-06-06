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
  submittedStatus: document.getElementById('portal-submitted-status')
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
    
    // Populate dropdown
    el.joinTeamSelect.innerHTML = game.teams.map(team => `
      <option value="${team.id}" data-name="${team.name}" data-color="${team.color}">${escapeHtml(team.name)}</option>
    `).join('');
    
    el.teamSelectGroup.style.display = 'block';
    state.gameId = gameId;
  } catch (error) {
    alert('Could not find active game session. Check the ID and try again.');
  }
}

function joinGame() {
  const select = el.joinTeamSelect;
  const option = select.options[select.selectedIndex];
  
  state.teamId = select.value;
  state.teamName = option.dataset.name;
  state.teamColor = option.dataset.color;
  
  localStorage.setItem('team_game_id', state.gameId);
  localStorage.setItem('team_team_id', state.teamId);
  localStorage.setItem('team_name', state.teamName);
  localStorage.setItem('team_color', state.teamColor);
  
  enterArena();
}

function enterArena() {
  el.joinPanel.style.display = 'none';
  el.arenaPanel.style.display = 'block';
  el.teamBadge.textContent = state.teamName;
  el.teamBadge.style.color = state.teamColor;
  
  pollGameStatus();
  state.pollInterval = setInterval(pollGameStatus, 2000); // Poll game status every 2 seconds
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

    // Update score badge
    const myTeam = game.teams.find(t => String(t.id) === String(state.teamId));
    if (myTeam) {
      el.scoreBadge.textContent = `Score: ${myTeam.score} pts`;
    }

    renderPortalState();
  } catch (error) {
    console.error('Polling failed:', error);
  }
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

    // Clear and redraw responder form if question index changes
    if (game.current_question_index !== state.currentQuestionIndex) {
      state.currentQuestionIndex = game.current_question_index;
      el.submittedStatus.style.display = 'none';
      el.responderContainer.style.display = 'block';
      renderResponder();
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
  el.btnFetchTeams.onclick = fetchTeams;
  el.btnJoinGame.onclick = joinGame;
  el.btnLogout.onclick = logout;

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
