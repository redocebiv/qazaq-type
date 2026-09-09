/**
 * Tests for the transliteration engine and the word corpus.
 * No dependencies. Run with: node tests/translit.test.mjs
 */
import {
  ALPHABET,
  CYRILLIC_TO_LATIN,
  UNMAPPED_CYRILLIC,
  fold,
  hasUnmappedLetter,
  matches,
  toLower,
  toUpper,
  translit,
} from '../js/translit.js';
import { WORDS, draw, tier } from '../js/words.js';

let passed = 0;
const failures = [];

function check(name, actual, expected) {
  const ok = Object.is(actual, expected);
  if (ok) passed += 1;
  else failures.push(`${name}\n    expected: ${JSON.stringify(expected)}\n    actual:   ${JSON.stringify(actual)}`);
}

function ok(name, condition) {
  check(name, Boolean(condition), true);
}

// --- every letter of the alphabet, lower and upper -------------------------

const LETTER_CASES = [
  ['а', 'a'], ['ә', 'ä'], ['б', 'b'], ['в', 'v'], ['г', 'g'], ['ғ', 'ğ'],
  ['д', 'd'], ['е', 'e'], ['ж', 'j'], ['з', 'z'], ['и', 'i'], ['й', 'i'],
  ['і', 'ı'], ['к', 'k'], ['қ', 'q'], ['л', 'l'], ['м', 'm'], ['н', 'n'],
  ['ң', 'ñ'], ['о', 'o'], ['ө', 'ö'], ['п', 'p'], ['р', 'r'], ['с', 's'],
  ['т', 't'], ['у', 'u'], ['ұ', 'ū'], ['ү', 'ü'], ['ф', 'f'], ['х', 'h'],
  ['һ', 'h'], ['ш', 'ş'], ['ы', 'y'],
];

for (const [cyrillic, latin] of LETTER_CASES) {
  check(`translit ${cyrillic}`, translit(cyrillic), latin);
  check(`translit ${cyrillic.toUpperCase()}`, translit(cyrillic.toUpperCase()), toUpper(latin));
}

check('33 Cyrillic letters are mapped', Object.keys(CYRILLIC_TO_LATIN).length, 33);
check('31 distinct Latin letters', new Set(Object.values(CYRILLIC_TO_LATIN)).size, 31);
check('alphabet table has 31 entries', ALPHABET.length, 31);

// --- the two deliberate collisions -----------------------------------------

check('i and y-short both give dotted i', translit('и'), translit('й'));
check('kha and ha both give h', translit('х'), translit('һ'));
check('dotless i is distinct from dotted i', translit('і') === translit('и'), false);

// --- the dotted/dotless case trap ------------------------------------------

check('uppercase of dotted i', toUpper('i'), 'İ');
check('uppercase of dotless i', toUpper('ı'), 'I');
check('lowercase of I-with-dot', toLower('İ'), 'i');
check('lowercase of plain I', toLower('I'), 'ı');
check('lowercasing İ stays one code point', toLower('İ').length, 1);

// --- whole words ------------------------------------------------------------

const WORD_CASES = [
  ['шаңырақ', 'şañyraq'],
  ['сәлем', 'sälem'],
  ['рахмет', 'rahmet'],
  ['қазақ', 'qazaq'],
  ['жұлдыз', 'jūldyz'],
  ['мұғалім', 'mūğalım'],
  ['күміс', 'kümıs'],
  ['өзен', 'özen'],
  ['тәуелсіздік', 'täuelsızdık'],
  ['ұлы дала', 'ūly dala'],
];

for (const [cyrillic, latin] of WORD_CASES) {
  check(`translit "${cyrillic}"`, translit(cyrillic), latin);
}

check('capitalisation is preserved', translit('Астана'), 'Astana');
check('non-Cyrillic passes through', translit('a-b 1'), 'a-b 1');
check('empty string', translit(''), '');

// --- ASCII folding ----------------------------------------------------------

const FOLD_CASES = [
  ['ä', 'a'], ['ğ', 'g'], ['ı', 'i'], ['i', 'i'], ['ñ', 'n'],
  ['ö', 'o'], ['ş', 's'], ['ū', 'u'], ['ü', 'u'], ['q', 'q'], ['z', 'z'],
];
for (const [letter, base] of FOLD_CASES) {
  check(`fold ${letter}`, fold(letter), base);
}
check('fold is case insensitive', fold('Ş'), 's');
check('fold of I-with-dot', fold('İ'), 'i');

// --- match logic ------------------------------------------------------------

ok('lenient accepts the ASCII base', matches('s', 'ş', false));
ok('lenient accepts the exact letter', matches('ş', 'ş', false));
ok('lenient ignores case', matches('S', 'ş', false));
ok('lenient rejects a wrong letter', !matches('t', 'ş', false));
ok('lenient conflates the two i letters', matches('i', 'ı', false));
ok('strict rejects the ASCII base', !matches('s', 'ş', true));
ok('strict accepts the exact letter', matches('ş', 'ş', true));
ok('strict separates the two i letters', !matches('i', 'ı', true));
ok('strict still ignores case', matches('Ş', 'ş', true));
ok('undefined never matches', !matches(undefined, 'a', false));

// --- unmapped letters -------------------------------------------------------

check('nine letters are unmapped', UNMAPPED_CYRILLIC.length, 9);
for (const ch of UNMAPPED_CYRILLIC) {
  ok(`${ch} is absent from the map`, CYRILLIC_TO_LATIN[ch] === undefined);
  ok(`${ch} is detected`, hasUnmappedLetter(`ат${ch}ат`));
}
ok('a clean word is not flagged', !hasUnmappedLetter('шаңырақ'));

// --- word corpus ------------------------------------------------------------

ok('corpus is large enough', WORDS.length >= 240);

const seen = new Set();
for (const word of WORDS) {
  if (seen.has(word.cy)) failures.push(`duplicate word: ${word.cy}`);
  seen.add(word.cy);

  if (hasUnmappedLetter(word.cy)) {
    failures.push(`word uses a letter with no Latin form: ${word.cy}`);
  }
  if (!word.en || !word.en.trim()) {
    failures.push(`word has no gloss: ${word.cy}`);
  }
  for (const ch of word.cy.replace(/[ -]/g, '')) {
    if (CYRILLIC_TO_LATIN[ch] === undefined) {
      failures.push(`unmappable character "${ch}" in ${word.cy}`);
    }
  }
  if (word.cy !== word.cy.toLowerCase()) {
    failures.push(`word is not lowercase: ${word.cy}`);
  }
}
passed += 1; // corpus sweep counts as one assertion when it adds no failures

check('every tier is populated', [1, 2, 3].every((t) => WORDS.some((w) => tier(w) === t)), true);
check('tier 1 is short', tier({ cy: 'тау' }), 1);
check('tier 2 is medium', tier({ cy: 'сәлем' }), 2);
check('tier 3 is long', tier({ cy: 'тәуелсіздік' }), 3);

const drawn = draw(1, 10);
check('draw returns the requested count', drawn.length, 10);
ok('draw returns words from the corpus', drawn.every((w) => seen.has(w.cy)));
ok('draw respects the tier ceiling', draw(1, 20).every((w) => tier(w) <= 1));

// --- report -----------------------------------------------------------------

if (failures.length) {
  console.error(`\n${failures.length} failing:\n`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  console.error(`\n${passed} passed, ${failures.length} failed\n`);
  process.exit(1);
}
console.log(`\n  ✓ ${passed} assertions passed\n`);
