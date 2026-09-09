/**
 * Synthesised sound. No audio files: every effect is a short oscillator burst,
 * so there is nothing to download and nothing to 404.
 *
 * The AudioContext is created on first use, which is always inside a user
 * gesture (pressing Play), satisfying browser autoplay policy.
 */

let context = null;
let enabled = true;

function ensureContext() {
  if (context === null) {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

export function setEnabled(value) {
  enabled = Boolean(value);
}

function tone({ freq, duration = 0.08, type = 'sine', gain = 0.06, delay = 0, slideTo = null }) {
  if (!enabled) return;
  const ctx = ensureContext();
  if (!ctx) return;

  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);

  // A tiny attack and a smooth decay; a bare square wave clicks unpleasantly.
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(amp).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sfx = {
  key: () => tone({ freq: 660, duration: 0.045, type: 'triangle', gain: 0.035 }),
  miss: () => tone({ freq: 150, duration: 0.12, type: 'sawtooth', gain: 0.05 }),
  word: () => {
    tone({ freq: 587.33, duration: 0.09, type: 'sine', gain: 0.06 });
    tone({ freq: 880, duration: 0.12, type: 'sine', gain: 0.05, delay: 0.06 });
  },
  levelUp: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      tone({ freq, duration: 0.12, type: 'triangle', gain: 0.05, delay: i * 0.07 });
    });
  },
  lifeLost: () => tone({ freq: 320, duration: 0.3, type: 'sawtooth', gain: 0.06, slideTo: 110 }),
  gameOver: () => {
    [440, 349.23, 261.63].forEach((freq, i) => {
      tone({ freq, duration: 0.3, type: 'triangle', gain: 0.06, delay: i * 0.16 });
    });
  },
  start: () => {
    [392, 523.25, 659.25].forEach((freq, i) => {
      tone({ freq, duration: 0.14, type: 'sine', gain: 0.05, delay: i * 0.06 });
    });
  },
};
