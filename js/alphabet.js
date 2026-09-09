/**
 * The alphabet reference screen: all 31 letters in official order, each with
 * the Cyrillic letter or letters it replaces and a pronunciation hint.
 */

import { ALPHABET, toUpper } from './translit.js';
import { t } from './i18n.js';

export function renderAlphabet(root) {
  const grid = document.createElement('div');
  grid.className = 'letter-grid';

  for (const entry of ALPHABET) {
    const card = document.createElement('div');
    card.className = 'letter-card';
    if (entry.cyrillic.length > 1) card.classList.add('merged');

    const glyphs = document.createElement('div');
    glyphs.className = 'letter-glyphs';
    glyphs.textContent = `${toUpper(entry.latin)} ${entry.latin}`;

    const from = document.createElement('div');
    from.className = 'letter-from';
    from.textContent = entry.cyrillic
      .map((ch) => `${ch.toUpperCase()} ${ch}`)
      .join('  ·  ');

    const hint = document.createElement('div');
    hint.className = 'letter-hint';
    hint.textContent = entry.hint;

    card.append(glyphs, from, hint);
    grid.append(card);
  }

  const note = document.createElement('p');
  note.className = 'letter-note';
  note.dataset.i18n = 'alphabet.note';
  note.textContent = t('alphabet.note');

  root.replaceChildren(grid, note);
}
