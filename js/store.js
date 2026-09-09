/**
 * Persistence. Everything here degrades to defaults when localStorage is
 * unavailable (private windows, blocked site data), so no caller needs to care.
 */

const SETTINGS_KEY = 'qt.settings';
const BESTS_KEY = 'qt.bests';

const DEFAULT_SETTINGS = { lang: 'en', strict: false, sound: true, hint: true };
const DEFAULT_BESTS = { arcade: 0, sprint: 0 };

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : { ...fallback };
  } catch {
    return { ...fallback };
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the session still works, it just will not persist */
  }
}

let settings = read(SETTINGS_KEY, DEFAULT_SETTINGS);
let bests = read(BESTS_KEY, DEFAULT_BESTS);

export function getSettings() {
  return { ...settings };
}

export function updateSettings(patch) {
  settings = { ...settings, ...patch };
  write(SETTINGS_KEY, settings);
  return { ...settings };
}

export function getBest(mode) {
  return bests[mode] ?? 0;
}

/** Record a score. Returns true when it beat the stored best. */
export function recordBest(mode, score) {
  if (score <= (bests[mode] ?? 0)) return false;
  bests = { ...bests, [mode]: score };
  write(BESTS_KEY, bests);
  return true;
}
