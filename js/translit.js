/**
 * Kazakh Cyrillic to Latin transliteration.
 *
 * Implements the 31-letter Latin alphabet approved in Kazakhstan in 2021
 * (the 22 April revision, which uses "n with tilde" rather than "eng").
 *
 * Two collisions in the table are correct and deliberate:
 *   - "i" and "y-short" both become dotted i
 *   - "kha" and "ha" both become h
 *
 * The nine Cyrillic letters that exist only in Russian loanwords
 * (yo, tse, che, shcha, hard sign, soft sign, e, yu, ya) have no letter in the
 * 2021 alphabet. They are deliberately absent from the map: the word corpus
 * excludes any word containing them rather than inventing a rule.
 */

/** Lowercase Cyrillic to lowercase Latin. */
export const CYRILLIC_TO_LATIN = Object.freeze({
  а: 'a', ә: 'ä', б: 'b', в: 'v', г: 'g', ғ: 'ğ', д: 'd', е: 'e',
  ж: 'j', з: 'z', и: 'i', й: 'i', і: 'ı', к: 'k', қ: 'q', л: 'l',
  м: 'm', н: 'n', ң: 'ñ', о: 'o', ө: 'ö', п: 'p', р: 'r', с: 's',
  т: 't', у: 'u', ұ: 'ū', ү: 'ü', ф: 'f', х: 'h', һ: 'h', ш: 'ş',
  ы: 'y',
});

/**
 * Explicit case tables. String.prototype.toUpperCase cannot be used here:
 * the uppercase of dotless i is I, the uppercase of dotted i is I-with-dot,
 * and lowercasing I-with-dot in JavaScript yields a two-code-point sequence.
 */
const LATIN_UPPER = Object.freeze({
  a: 'A', ä: 'Ä', b: 'B', d: 'D', e: 'E', f: 'F', g: 'G', ğ: 'Ğ',
  h: 'H', ı: 'I', i: 'İ', j: 'J', k: 'K', l: 'L', m: 'M', n: 'N',
  ñ: 'Ñ', o: 'O', ö: 'Ö', p: 'P', q: 'Q', r: 'R', s: 'S', ş: 'Ş',
  t: 'T', u: 'U', ū: 'Ū', ü: 'Ü', v: 'V', y: 'Y', z: 'Z',
});

const LATIN_LOWER = Object.freeze(
  Object.fromEntries(Object.entries(LATIN_UPPER).map(([lo, up]) => [up, lo])),
);

/** Latin letters carrying a diacritic, reduced to their ASCII base. */
const ASCII_FOLD = Object.freeze({
  ä: 'a', ğ: 'g', ı: 'i', i: 'i', ñ: 'n', ö: 'o', ş: 's', ū: 'u', ü: 'u',
});

/** Cyrillic letters with no counterpart in the 2021 Latin alphabet. */
export const UNMAPPED_CYRILLIC = 'ёцчщъьэюя';

/** Lowercase a single Latin character without tripping over dotted i. */
export function toLower(ch) {
  return LATIN_LOWER[ch] ?? ch.toLowerCase();
}

/** Uppercase a single Latin character without tripping over dotless i. */
export function toUpper(ch) {
  return LATIN_UPPER[ch] ?? ch.toUpperCase();
}

/** Reduce a character to the ASCII letter a plain keyboard can produce. */
export function fold(ch) {
  const lower = toLower(ch);
  return ASCII_FOLD[lower] ?? lower;
}

/** Transliterate Kazakh Cyrillic text into the 2021 Latin alphabet. */
export function translit(text) {
  let out = '';
  for (const ch of text) {
    const lower = ch.toLowerCase();
    const latin = CYRILLIC_TO_LATIN[lower];
    if (latin === undefined) {
      out += ch; // spaces, hyphens, anything already Latin
    } else if (ch === lower) {
      out += latin;
    } else {
      out += toUpper(latin);
    }
  }
  return out;
}

/**
 * Does a typed character satisfy the expected one?
 * Strict mode demands the exact letter; lenient mode accepts the ASCII base.
 * Case is never significant in either mode.
 */
export function matches(typed, expected, strict = false) {
  if (typed === undefined || typed === null) return false;
  return strict
    ? toLower(typed) === toLower(expected)
    : fold(typed) === fold(expected);
}

/** True if the text contains a Cyrillic letter the 2021 alphabet cannot spell. */
export function hasUnmappedLetter(text) {
  for (const ch of text.toLowerCase()) {
    if (UNMAPPED_CYRILLIC.includes(ch)) return true;
  }
  return false;
}

/**
 * The alphabet in its official order, for the reference screen.
 * `cyrillic` lists every Cyrillic letter that produces this Latin letter.
 */
export const ALPHABET = Object.freeze([
  { latin: 'a', cyrillic: ['а'], hint: 'a in father' },
  { latin: 'ä', cyrillic: ['ә'], hint: 'a in cat' },
  { latin: 'b', cyrillic: ['б'], hint: 'b in book' },
  { latin: 'd', cyrillic: ['д'], hint: 'd in door' },
  { latin: 'e', cyrillic: ['е'], hint: 'e in met' },
  { latin: 'f', cyrillic: ['ф'], hint: 'f in fun' },
  { latin: 'g', cyrillic: ['г'], hint: 'g in go' },
  { latin: 'ğ', cyrillic: ['ғ'], hint: 'g from the throat' },
  { latin: 'h', cyrillic: ['х', 'һ'], hint: 'ch in loch, or h in hat' },
  { latin: 'ı', cyrillic: ['і'], hint: 'i in bit — no dot' },
  { latin: 'i', cyrillic: ['и', 'й'], hint: 'ee in see, or y in boy' },
  { latin: 'j', cyrillic: ['ж'], hint: 's in pleasure' },
  { latin: 'k', cyrillic: ['к'], hint: 'k in kite' },
  { latin: 'l', cyrillic: ['л'], hint: 'l in lamp' },
  { latin: 'm', cyrillic: ['м'], hint: 'm in map' },
  { latin: 'n', cyrillic: ['н'], hint: 'n in note' },
  { latin: 'ñ', cyrillic: ['ң'], hint: 'ng in sing' },
  { latin: 'o', cyrillic: ['о'], hint: 'o in more' },
  { latin: 'ö', cyrillic: ['ө'], hint: 'German ö' },
  { latin: 'p', cyrillic: ['п'], hint: 'p in pet' },
  { latin: 'q', cyrillic: ['қ'], hint: 'k from deep in the throat' },
  { latin: 'r', cyrillic: ['р'], hint: 'rolled r' },
  { latin: 's', cyrillic: ['с'], hint: 's in sun' },
  { latin: 'ş', cyrillic: ['ш'], hint: 'sh in shut' },
  { latin: 't', cyrillic: ['т'], hint: 't in top' },
  { latin: 'u', cyrillic: ['у'], hint: 'oo in boot' },
  { latin: 'ū', cyrillic: ['ұ'], hint: 'u in put' },
  { latin: 'ü', cyrillic: ['ү'], hint: 'German ü' },
  { latin: 'v', cyrillic: ['в'], hint: 'v in vine' },
  { latin: 'y', cyrillic: ['ы'], hint: 'a quick uh' },
  { latin: 'z', cyrillic: ['з'], hint: 'z in zoo' },
]);
