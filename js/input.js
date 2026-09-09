/**
 * The typing model and the single source of keystrokes.
 *
 * Keystrokes come from one hidden <input>'s `input` event rather than from
 * `keydown`. Android soft keyboards routinely emit unusable `key` values on
 * keydown, and reading the input's value works identically everywhere.
 */

import { matches, translit } from './translit.js';

/** Tracks progress through the Latin spelling of one word. */
export class WordProgress {
  constructor(word, strict = false) {
    this.word = word;
    this.latin = translit(word.cy);
    this.strict = strict;
    this.index = 0;
    this.errors = 0;
  }

  get done() {
    return this.index >= this.latin.length;
  }

  get expected() {
    return this.latin[this.index];
  }

  /** Feed one character. Returns 'hit', 'complete', 'miss' or 'done'. */
  press(ch) {
    if (this.done) return 'done';
    if (matches(ch, this.expected, this.strict)) {
      this.index += 1;
      return this.done ? 'complete' : 'hit';
    }
    this.errors += 1;
    return 'miss';
  }
}

/**
 * Route printable characters from the hidden input to a handler.
 * Returns a function that stops listening.
 */
export function createKeySource(inputEl, onKey) {
  const handler = () => {
    const value = inputEl.value;
    inputEl.value = '';
    for (const ch of value) {
      if (ch.trim()) onKey(ch);
    }
  };
  inputEl.addEventListener('input', handler);
  return () => inputEl.removeEventListener('input', handler);
}

/** Words per minute, using the standard five-characters-per-word convention. */
export function wpm(characters, seconds) {
  if (seconds <= 0) return 0;
  return Math.round((characters / 5) / (seconds / 60));
}

/** Correct keystrokes as a percentage of all keystrokes. */
export function accuracy(correct, errors) {
  const total = correct + errors;
  return total === 0 ? 100 : Math.round((correct / total) * 100);
}
