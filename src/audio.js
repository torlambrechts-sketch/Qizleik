let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume context if suspended (browser security autoplay policies)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Helper to synthesize a tone
function playTone(ctx, freq, duration, time, type = 'sine', volume = 0.1) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  
  gainNode.gain.setValueAtTime(volume, time);
  // Smoothly fade out the sound
  gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  osc.start(time);
  osc.stop(time + duration);
}

// High-pitch ascending chime for a correct response
export function playCorrect() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    playTone(ctx, 523.25, 0.15, now, 'sine', 0.12);       // C5
    playTone(ctx, 659.25, 0.15, now + 0.08, 'sine', 0.12);  // E5
    playTone(ctx, 783.99, 0.15, now + 0.16, 'sine', 0.12);  // G5
    playTone(ctx, 1046.50, 0.3, now + 0.24, 'sine', 0.15); // C6
  } catch (error) {
    console.warn("Could not play audio tone:", error);
  }
}

// Low detuned sawtooth buzzer for incorrect responses
export function playIncorrect() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.linearRampToValueAtTime(90, now + 0.35);
    
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(137, now); // slightly detuned for thickness
    osc2.frequency.linearRampToValueAtTime(87, now + 0.35);
    
    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch (error) {
    console.warn("Could not play audio tone:", error);
  }
}

// Woodblock-like high click sound for game timers
export function playTick() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    playTone(ctx, 900, 0.04, now, 'triangle', 0.08);
  } catch (error) {
    console.warn("Could not play audio tone:", error);
  }
}

// Uplifting multi-frequency synth melody for quiz completions
export function playVictory() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const notes = [
      { f: 523.25, d: 0.25 }, // C5
      { f: 659.25, d: 0.25 }, // E5
      { f: 783.99, d: 0.25 }, // G5
      { f: 1046.50, d: 0.25 }, // C6
      { f: 1318.51, d: 0.35 }, // E6
      { f: 1567.98, d: 0.5 }   // G6
    ];
    
    notes.forEach((note, index) => {
      playTone(ctx, note.f, note.d, now + index * 0.12, 'triangle', 0.1);
    });
  } catch (error) {
    console.warn("Could not play audio tone:", error);
  }
}
