/**
 * Arcade mode: words fall, you type them before they reach the ground.
 *
 * Targeting follows the convention set by ZType — the first keystroke locks
 * onto the lowest word that starts with that letter, and every subsequent
 * keystroke goes to that word until it is finished or lost.
 */

import { sfx } from './audio.js';
import { WordProgress, accuracy, wpm } from './input.js';
import { matches, translit } from './translit.js';
import { randomWord } from './words.js';

const LIVES = 3;
const WORDS_PER_LEVEL = 8;
const BOTTOM_MARGIN = 56;

/** Difficulty ceiling rises with the level. */
function tierForLevel(level) {
  if (level <= 3) return 1;
  if (level <= 7) return 2;
  return 3;
}

function fallSpeed(level) {
  return 26 + level * 5; // pixels per second
}

function spawnInterval(level) {
  return Math.max(2500 - level * 150, 850); // milliseconds
}

export function startArcade({ root, settings, onHud, onEnd }) {
  root.replaceChildren();
  root.classList.add('arcade');

  const entities = [];
  let locked = null;
  let lives = LIVES;
  let score = 0;
  let level = 1;
  let wordsDone = 0;
  let correctKeys = 0;
  let errorKeys = 0;
  let lastLane = -1;
  let sinceSpawn = 0;
  let lastFrame = 0;
  let frame = 0;
  let running = true;
  const startedAt = performance.now();

  function pushHud() {
    onHud({ score, level, lives, words: wordsDone });
  }

  function makeEntity() {
    const word = randomWord(tierForLevel(level));
    const progress = new WordProgress(word, settings.strict);

    const el = document.createElement('div');
    el.className = 'word';

    const cy = document.createElement('div');
    cy.className = 'word-cy';
    cy.textContent = word.cy;

    const la = document.createElement('div');
    la.className = settings.hint ? 'word-la' : 'word-la masked';
    const spans = [...progress.latin].map((ch) => {
      const span = document.createElement('span');
      span.textContent = ch;
      la.append(span);
      return span;
    });

    el.append(cy, la);

    // Keep consecutive spawns apart so words do not stack in one column.
    let lane = Math.floor(Math.random() * 5);
    if (lane === lastLane) lane = (lane + 1) % 5;
    lastLane = lane;
    el.style.setProperty('--x', `${12 + lane * 19}%`);

    root.append(el);
    return { word, progress, el, spans, y: -40 };
  }

  function paint(entity) {
    entity.spans.forEach((span, i) => {
      span.classList.toggle('typed', i < entity.progress.index);
      span.classList.toggle('next', i === entity.progress.index);
    });
  }

  function remove(entity) {
    entity.el.remove();
    const i = entities.indexOf(entity);
    if (i !== -1) entities.splice(i, 1);
    if (locked === entity) locked = null;
  }

  function loseLife(entity) {
    entity.el.classList.add('lost');
    lives -= 1;
    sfx.lifeLost();
    remove(entity);
    pushHud();
    if (lives <= 0) finish();
  }

  function completeWord(entity) {
    score += entity.progress.latin.length * level;
    wordsDone += 1;
    sfx.word();

    // Show the meaning briefly where the word was cleared.
    const flash = document.createElement('div');
    flash.className = 'gloss-flash';
    flash.style.setProperty('--x', entity.el.style.getPropertyValue('--x'));
    flash.style.setProperty('--y', `${entity.y}px`);
    flash.textContent = `${translit(entity.word.cy)} · ${entity.word.en}`;
    root.append(flash);
    setTimeout(() => flash.remove(), 900);

    remove(entity);

    if (wordsDone % WORDS_PER_LEVEL === 0) {
      level += 1;
      sfx.levelUp();
      root.classList.add('level-up');
      setTimeout(() => root.classList.remove('level-up'), 600);
    }
    pushHud();
  }

  function press(ch) {
    if (!running) return;

    if (!locked) {
      // Lowest matching word first: it is the most urgent. Test with `matches`
      // rather than `press` so rejected candidates are not charged an error.
      const target = entities
        .filter((e) => e.progress.index === 0)
        .filter((e) => matches(ch, e.progress.expected, settings.strict))
        .sort((a, b) => b.y - a.y)[0];

      if (!target) {
        errorKeys += 1;
        sfx.miss();
        root.classList.add('shake');
        setTimeout(() => root.classList.remove('shake'), 200);
        return;
      }

      locked = target;
      locked.progress.press(ch);
      correctKeys += 1;
      locked.el.classList.add('locked');
      paint(locked);
      sfx.key();
      if (locked.progress.done) completeWord(locked);
      return;
    }

    const active = locked;
    const result = active.progress.press(ch);
    if (result === 'miss') {
      errorKeys += 1;
      sfx.miss();
      active.el.classList.add('wrong');
      setTimeout(() => active.el.classList.remove('wrong'), 180);
      return;
    }
    correctKeys += 1;
    sfx.key();
    paint(active);
    if (result === 'complete') completeWord(active);
  }

  function tick(now) {
    if (!running) return;
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 0;
    lastFrame = now;

    sinceSpawn += dt * 1000;
    if (sinceSpawn >= spawnInterval(level)) {
      sinceSpawn = 0;
      entities.push(makeEntity());
    }

    const floor = root.clientHeight - BOTTOM_MARGIN;
    const speed = fallSpeed(level);
    for (const entity of [...entities]) {
      entity.y += speed * dt;
      entity.el.style.setProperty('--y', `${entity.y}px`);
      if (entity.y >= floor) loseLife(entity);
    }

    frame = requestAnimationFrame(tick);
  }

  function finish() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(frame);
    sfx.gameOver();
    const seconds = (performance.now() - startedAt) / 1000;
    onEnd({
      mode: 'arcade',
      titleKey: 'results.gameOver',
      score,
      stats: [
        { labelKey: 'hud.score', value: score },
        { labelKey: 'hud.words', value: wordsDone },
        { labelKey: 'hud.level', value: level },
        { labelKey: 'hud.wpm', value: wpm(correctKeys, seconds) },
        { labelKey: 'hud.accuracy', value: `${accuracy(correctKeys, errorKeys)}%` },
      ],
    });
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frame);
    root.replaceChildren();
    root.classList.remove('arcade');
  }

  entities.push(makeEntity());
  pushHud();
  sfx.start();
  frame = requestAnimationFrame(tick);

  return { press, stop };
}
