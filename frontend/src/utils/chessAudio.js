// Web Audio API Synthesizer for Chess Sound Effects (Zero External Asset Overhead)
let audioCtx = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const getSoundVolume = () => {
  const saved = localStorage.getItem('chess_arena_volume');
  return saved !== null ? parseFloat(saved) : 0.7;
};

export const setSoundVolume = (volume) => {
  localStorage.setItem('chess_arena_volume', String(Math.max(0, Math.min(1, volume))));
};

export const playMoveSound = () => {
  const vol = getSoundVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

  gain.gain.setValueAtTime(0.3 * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
};

export const playCaptureSound = () => {
  const vol = getSoundVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

  gain.gain.setValueAtTime(0.4 * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
};

export const playCheckSound = () => {
  const vol = getSoundVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [587.33, 880].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.06);

    gain.gain.setValueAtTime(0.3 * vol, now + idx * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.06);
    osc.stop(now + idx * 0.06 + 0.18);
  });
};

export const playEndGameSound = (won = true) => {
  const vol = getSoundVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = won ? [523.25, 659.25, 783.99, 1046.5] : [440, 392, 349.23, 293.66];
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gain.gain.setValueAtTime(0.35 * vol, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.3);
  });
};

export const chessAudio = {
  playMove: playMoveSound,
  playCapture: playCaptureSound,
  playCheck: playCheckSound,
  playGameOver: playEndGameSound,
};

export default chessAudio;
