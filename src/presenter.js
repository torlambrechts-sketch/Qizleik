import { playIncorrect, playTick, playVictory } from './audio.js';
import { triggerConfetti } from './confetti.js';

// Get Game ID from URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('gameId');

// Local cache to check state changes
let localState = {
  status: 'setup',
  currentQuestionIndex: -1,
  timerEndsAt: null,
  teamsJson: ''
};

// UI Selectors
const el = {
  gameTitle: document.getElementById('presenter-game-title'),
  timer: document.getElementById('presenter-timer'),
  timerSec: document.getElementById('presenter-timer-sec'),
  lobby: document.getElementById('presenter-lobby'),
  lobbyTeams: document.getElementById('presenter-lobby-teams'),
  questionPanel: document.getElementById('presenter-question'),
  progress: document.getElementById('presenter-progress'),
  questionText: document.getElementById('presenter-question-text'),
  options: document.getElementById('presenter-options'),
  completed: document.getElementById('presenter-completed'),
  podium: document.getElementById('presenter-podium'),
  scoreboard: document.getElementById('presenter-scoreboard')
};

let pollInterval = null;
let timerInterval = null;
let timerBuzzerPlayed = false;

// -------------------------------------------------------------
// TIMER CONTROL
// -------------------------------------------------------------

function runTimer(endsAtString) {
  if (timerInterval) clearInterval(timerInterval);
  
  if (!endsAtString) {
    el.timer.style.opacity = '0';
    return;
  }
  
  el.timer.style.opacity = '1';
  const endsTime = new Date(endsAtString).getTime();
  
  const tick = () => {
    const timeLeft = Math.max(0, Math.ceil((endsTime - Date.now()) / 1000));
    el.timerSec.textContent = timeLeft;

    if (timeLeft <= 5 && timeLeft > 0) {
      el.timer.classList.add('pulse');
      playTick();
    } else if (timeLeft === 0) {
      el.timer.classList.remove('pulse');
      clearInterval(timerInterval);
      
      // Play timer buzzer once
      if (!timerBuzzerPlayed) {
        playIncorrect();
        timerBuzzerPlayed = true;
      }
    }
  };

  tick();
  timerInterval = setInterval(tick, 1000);
}

// -------------------------------------------------------------
// STATE RENDERING
// -------------------------------------------------------------

function renderPresenterState(game) {
  el.gameTitle.textContent = game.quiz_title;

  // 1. Manage Timer Sync
  if (game.timer_ends_at !== localState.timerEndsAt) {
    localState.timerEndsAt = game.timer_ends_at;
    timerBuzzerPlayed = false; // Reset buzzer flag for new timer
    runTimer(game.timer_ends_at);
  }

  // 2. View States Router
  if (game.status === 'setup') {
    el.lobby.style.display = 'block';
    el.questionPanel.style.display = 'none';
    el.completed.style.display = 'none';
    renderLobby(game.teams);
  } 
  else if (game.status === 'active') {
    el.lobby.style.display = 'none';
    el.questionPanel.style.display = 'block';
    el.completed.style.display = 'none';
    
    // Only repaint question area if the question index actually changed
    if (game.current_question_index !== localState.currentQuestionIndex) {
      localState.currentQuestionIndex = game.current_question_index;
      renderQuestion(game);
    }
  } 
  else if (game.status === 'completed') {
    el.lobby.style.display = 'none';
    el.questionPanel.style.display = 'none';
    el.completed.style.display = 'block';
    el.timer.style.opacity = '0';
    if (timerInterval) clearInterval(timerInterval);
    
    // Trigger celebrations ONCE upon transition to completed status
    if (localState.status !== 'completed') {
      playVictory();
      triggerConfetti();
      // Throw double bursts for extra reward
      setTimeout(triggerConfetti, 1000);
    }
    
    renderPodium(game.teams);
  }

  // 3. Render Scoreboard columns at bottom (always visible)
  const currentTeamsJson = JSON.stringify(game.teams);
  if (currentTeamsJson !== localState.teamsJson) {
    localState.teamsJson = currentTeamsJson;
    renderScoreboard(game.teams);
  }

  // Keep state status cache updated
  localState.status = game.status;
}

// Lobby Rendering
function renderLobby(teams) {
  if (teams.length === 0) {
    el.lobbyTeams.innerHTML = '<span style="color: var(--text-muted);">No teams registered yet. Waiting for host...</span>';
    return;
  }
  
  el.lobbyTeams.innerHTML = teams.map(team => `
    <span class="glass-panel" style="padding: 10px 20px; font-weight:700; border-color:${team.color || '#fff'}; color:#fff; font-size:1.2rem;">
      🎨 ${escapeHtml(team.name)}
    </span>
  `).join('');
}

// Question Panel Rendering
function renderQuestion(game) {
  const q = game.question;
  if (!q) {
    el.questionText.textContent = 'Preparing next round...';
    el.options.innerHTML = '';
    return;
  }

  el.progress.textContent = `Question ${game.current_question_index + 1} of ${game.total_questions}`;
  el.questionText.textContent = q.question_text;

  if (q.question_type === 'multiple-choice') {
    el.options.style.display = 'grid';
    el.options.innerHTML = q.options.map((opt, idx) => `
      <div class="presenter-option-box glass-panel">
        <div class="presenter-option-letter">${String.fromCharCode(65 + idx)}</div>
        <div>${escapeHtml(opt)}</div>
      </div>
    `).join('');
  } else {
    // Hide MCQ cards for Text answers (allows audience to discuss answers without seeing them)
    el.options.style.display = 'none';
  }
}

// Victory 3D Podium Rendering
function renderPodium(teams) {
  if (teams.length === 0) {
    el.podium.innerHTML = '';
    return;
  }

  // Sort teams descending
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  
  // Arrange top 3: 2nd place (left), 1st place (center), 3rd place (right)
  const podiumSpots = [];
  if (sorted[1]) podiumSpots.push({ team: sorted[1], rank: 2, height: '170px', color: '#cbd5e1', label: '2nd' }); // Silver
  if (sorted[0]) podiumSpots.push({ team: sorted[0], rank: 1, height: '240px', color: '#fbbf24', label: '1st' }); // Gold
  if (sorted[2]) podiumSpots.push({ team: sorted[2], rank: 3, height: '120px', color: '#b45309', label: '3rd' }); // Bronze

  el.podium.innerHTML = podiumSpots.map(spot => `
    <div class="podium-place">
      <div class="podium-name">${escapeHtml(spot.team.name)}</div>
      <div class="podium-score">${spot.team.score} pts</div>
      <div class="podium-block" style="height: ${spot.height}; background: linear-gradient(135deg, ${spot.team.color || '#8b5cf6'} 0%, #1e1b4b 100%); border: 2px solid ${spot.color}">
        ${spot.label}
      </div>
    </div>
  `).join('');
}

// Live Footer Scoreboard Bar Charts
function renderScoreboard(teams) {
  if (teams.length === 0) {
    el.scoreboard.innerHTML = '';
    return;
  }

  // Find max score to normalize bar heights
  const maxScore = Math.max(...teams.map(t => t.score));
  
  el.scoreboard.innerHTML = teams.map(team => {
    // Normalise height percentage (between 5% and 85%)
    let pct = 5;
    if (maxScore > 0 && team.score > 0) {
      pct = (team.score / maxScore) * 85;
    }
    
    return `
      <div class="presenter-score-column">
        <span class="presenter-score-val" style="color: ${team.color || '#fff'}">${team.score}</span>
        <div class="presenter-score-bar-wrapper">
          <div class="presenter-score-bar" style="height: ${pct}%; background: linear-gradient(to top, ${team.color || '#8b5cf6'} 30%, #fff 100%);"></div>
        </div>
        <div class="presenter-team-name" style="color: #fff;">${escapeHtml(team.name)}</div>
      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------
// POLLING ENGINE
// -------------------------------------------------------------

async function pollGameStatus() {
  if (!gameId) {
    el.gameTitle.textContent = 'Error: No Game ID';
    return;
  }

  try {
    const game = await fetch(`/api/game?id=${gameId}`).then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    });
    renderPresenterState(game);
  } catch (error) {
    console.error('Failed to poll game state:', error);
  }
}

// Escape HTML tags helper
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Start polling immediately on load
if (gameId) {
  pollGameStatus();
  pollInterval = setInterval(pollGameStatus, 1500); // 1.5 second serverless-friendly polling interval
} else {
  el.gameTitle.textContent = 'No Game ID specified';
  el.lobby.innerHTML = '<h1>Invalid Game Link</h1><p>Please open the Projector View from the Host Controller Panel.</p>';
}
