/**
 * Sprint mode: sixty seconds, one word at a time, as many as you can.
 * This is the mode that produces a comparable WPM number.
 */

import { sfx } from './audio.js';
import { WordProgress, accuracy, wpm } from './input.js';
import { translit } from './translit.js';
import { randomWord } from './words.js';

const DURATION = 60; // seconds

export function startSprint({ root, settings, onHud, onEnd }) {
  root.replaceChildren();
  root.classList.add('sprint');

  const stage = document.createElement('div');
  stage.className = 'sprint-stage';

  // The word just cleared, kept on screen so the meaning can be read.
  const last = document.createElement('div');
  last.className = 'sprint-last';

  root.append(stage, last);

  let progress = null;
  let spans = [];
  let wordsDone = 0;
  let correctKeys = 0;
  let errorKeys = 0;
  let remaining = DURATION;
  let running = true;
  let timer = 0;
  const startedAt = performance.now();

  function elapsed() {
    return (performance.now() - startedAt) / 1000;
  }

  function pushHud() {
    // Clamp the divisor: in the first second the live figure is dividing by
    // almost nothing and reads as nonsense. The final score always uses the
    // full duration, so only this running display needs the floor.
    const seconds = Math.max(elapsed(), 3);
    onHud({ time: Math.ceil(remaining), words: wordsDone, wpm: wpm(correctKeys, seconds) });
  }

  function nextWord() {
    const word = randomWord(3);
    progress = new WordProgress(word, settings.strict);

    const card = document.createElement('div');
    card.className = 'sprint-word';

    const cy = document.createElement('div');
    cy.className = 'word-cy';
    cy.textContent = word.cy;

    const la = document.createElement('div');
    la.className = settings.hint ? 'word-la' : 'word-la masked';
    spans = [...progress.latin].map((ch) => {
      const span = document.createElement('span');
      span.textContent = ch;
      la.append(span);
      return span;
    });

    const en = document.createElement('div');
    en.className = 'word-en';
    en.textContent = word.en;

    card.append(cy, la, en);
    stage.replaceChildren(card);
    paint();
  }

  function paint() {
    spans.forEach((span, i) => {
      span.classList.toggle('typed', i < progress.index);
      span.classList.toggle('next', i === progress.index);
    });
  }

  function press(ch) {
    if (!running || !progress) return;
    const result = progress.press(ch);

    if (result === 'miss') {
      errorKeys += 1;
      sfx.miss();
      stage.classList.add('wrong');
      setTimeout(() => stage.classList.remove('wrong'), 180);
      return;
    }

    correctKeys += 1;
    paint();

    if (result === 'complete') {
      wordsDone += 1;
      sfx.word();
      last.textContent = `${translit(progress.word.cy)} · ${progress.word.en}`;
      last.classList.remove('flash');
      void last.offsetWidth; // restart the flash animation
      last.classList.add('flash');
      nextWord();
    } else {
      sfx.key();
    }
    pushHud();
  }

  function finish() {
    if (!running) return;
    running = false;
    clearInterval(timer);
    sfx.gameOver();
    onEnd({
      mode: 'sprint',
      titleKey: 'results.timeUp',
      score: wordsDone,
      stats: [
        { labelKey: 'hud.words', value: wordsDone },
        { labelKey: 'hud.wpm', value: wpm(correctKeys, DURATION) },
        { labelKey: 'hud.accuracy', value: `${accuracy(correctKeys, errorKeys)}%` },
      ],
    });
  }

  function stop() {
    running = false;
    clearInterval(timer);
    root.replaceChildren();
    root.classList.remove('sprint');
  }

  timer = setInterval(() => {
    remaining -= 1;
    pushHud();
    if (remaining <= 0) finish();
  }, 1000);

  nextWord();
  pushHud();
  sfx.start();

  return { press, stop };
}
