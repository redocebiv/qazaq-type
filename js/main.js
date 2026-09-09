/**
 * Bootstrap, screen routing and settings wiring.
 * Modes are started here and fed keystrokes from the single hidden input.
 */

import { renderAlphabet } from './alphabet.js';
import { startArcade } from './arcade.js';
import { setEnabled } from './audio.js';
import { applyTranslations, setLanguage, t } from './i18n.js';
import { createKeySource } from './input.js';
import { divider, ornamentDefs, watermark } from './ornament.js';
import { startSprint } from './sprint.js';
import { getBest, getSettings, recordBest, updateSettings } from './store.js';

const MODES = { arcade: startArcade, sprint: startSprint };

const HUD_LABELS = {
  score: 'hud.score',
  level: 'hud.level',
  lives: 'hud.lives',
  words: 'hud.words',
  time: 'hud.time',
  wpm: 'hud.wpm',
};

const screens = {
  menu: document.getElementById('screen-menu'),
  game: document.getElementById('screen-game'),
  alphabet: document.getElementById('screen-alphabet'),
  results: document.getElementById('screen-results'),
};

const playfield = document.getElementById('playfield');
const hud = document.getElementById('hud');
const capture = document.getElementById('capture');

let settings = getSettings();
let active = null;
let lastMode = 'arcade';

// --- chrome -----------------------------------------------------------------

document.getElementById('ornament-layer').innerHTML = ornamentDefs() + watermark();
document.getElementById('menu-divider').innerHTML = divider();

function refreshBests() {
  for (const el of document.querySelectorAll('[data-best]')) {
    el.textContent = getBest(el.dataset.best);
  }
}

function refreshChrome() {
  document.getElementById('lang-toggle').textContent = settings.lang === 'en' ? 'EN' : 'ҚАЗ';
  document.getElementById('sound-toggle').classList.toggle('off', !settings.sound);
  document.getElementById('opt-strict').checked = settings.strict;
  document.getElementById('opt-hint').checked = settings.hint;
}

// --- routing ----------------------------------------------------------------

function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) el.hidden = key !== name;
  document.body.dataset.screen = name;
  if (name !== 'game') stopActive();
  if (name === 'menu') refreshBests();
}

function stopActive() {
  active?.stop();
  active = null;
  capture.blur();
}

// --- heads-up display -------------------------------------------------------

function renderHud(data) {
  const cells = Object.entries(data).map(([key, value]) => {
    const cell = document.createElement('div');
    cell.className = 'hud-cell';

    const label = document.createElement('span');
    label.className = 'hud-label';
    label.textContent = t(HUD_LABELS[key] ?? key);

    const output = document.createElement('span');
    output.className = 'hud-value';
    if (key === 'lives') {
      output.classList.add('hud-lives');
      output.textContent = '●'.repeat(Math.max(value, 0)) || '—';
    } else {
      output.textContent = value;
    }

    cell.append(label, output);
    return cell;
  });
  hud.replaceChildren(...cells);
}

// --- results ----------------------------------------------------------------

function showResults(result) {
  const isBest = recordBest(result.mode, result.score);

  document.getElementById('result-title').textContent = t(result.titleKey);
  document.getElementById('result-best').hidden = !isBest;

  const list = document.getElementById('result-stats');
  list.replaceChildren();
  for (const stat of result.stats) {
    const dt = document.createElement('dt');
    dt.textContent = t(stat.labelKey);
    const dd = document.createElement('dd');
    dd.textContent = stat.value;
    list.append(dt, dd);
  }

  showScreen('results');
}

// --- modes ------------------------------------------------------------------

function startMode(mode) {
  stopActive();
  lastMode = mode;
  settings = getSettings();
  showScreen('game');
  document.body.dataset.mode = mode;

  active = MODES[mode]({
    root: playfield,
    settings,
    onHud: renderHud,
    onEnd: showResults,
  });

  // Focusing inside the click that started the game is what opens the
  // on-screen keyboard on iOS and Android.
  capture.focus();
}

// --- events -----------------------------------------------------------------

// Both selectors are scoped to `button` on purpose. <body> carries data-mode
// and data-screen as CSS hooks, and an unscoped closest() would walk up to it
// and treat every click in the document as a menu press.
document.addEventListener('click', (event) => {
  const modeButton = event.target.closest('button[data-mode]');
  if (modeButton) {
    startMode(modeButton.dataset.mode);
    return;
  }

  const screenButton = event.target.closest('button[data-screen]');
  if (screenButton) {
    const name = screenButton.dataset.screen;
    if (name === 'alphabet') {
      renderAlphabet(document.getElementById('alphabet-body'));
      applyTranslations(screens.alphabet);
    }
    showScreen(name);
  }
});

document.getElementById('quit').addEventListener('click', () => showScreen('menu'));
document.getElementById('result-again').addEventListener('click', () => startMode(lastMode));

document.getElementById('lang-toggle').addEventListener('click', () => {
  settings = updateSettings({ lang: settings.lang === 'en' ? 'kk' : 'en' });
  setLanguage(settings.lang);
  applyTranslations();
  refreshChrome();
  if (!screens.alphabet.hidden) {
    renderAlphabet(document.getElementById('alphabet-body'));
    applyTranslations(screens.alphabet);
  }
});

document.getElementById('sound-toggle').addEventListener('click', () => {
  settings = updateSettings({ sound: !settings.sound });
  setEnabled(settings.sound);
  refreshChrome();
});

document.getElementById('opt-strict').addEventListener('change', (event) => {
  settings = updateSettings({ strict: event.target.checked });
});

document.getElementById('opt-hint').addEventListener('change', (event) => {
  settings = updateSettings({ hint: event.target.checked });
});

// Tapping the play area brings the mobile keyboard back if it was dismissed.
document.querySelector('.playfield-wrap').addEventListener('pointerdown', () => {
  if (active) capture.focus();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && active) {
    event.preventDefault();
    showScreen('menu');
  }
});

createKeySource(capture, (ch) => active?.press(ch));

// --- start ------------------------------------------------------------------

setLanguage(settings.lang);
setEnabled(settings.sound);
applyTranslations();
refreshChrome();
refreshBests();
showScreen('menu');
