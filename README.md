# Qazaq Type

A browser typing game for the 31-letter Kazakh Latin alphabet adopted in 2021.

**Play it: https://redocebiv.github.io/qazaq-type/**

Kazakh words appear in Cyrillic. You type them in Latin. The point is muscle
memory: plenty of people read Kazakh fluently but cannot yet type the new
alphabet, because nine of its letters — `ä ğ ı ñ ö ş ū ü` and dotted `i` — are
nowhere on a normal keyboard.

No install, no build step, no account, no server. It is static files.

## How to play

Pick a mode from the menu and start typing. There is nothing to click during a
round.

**Arcade** — words fall from the top. The first letter you press locks onto the
lowest word that starts with it, and the rest of your keystrokes go to that word
until it is finished. Let three words reach the ground and the run is over.
Speed, spawn rate and word length all climb as you level up.

**Sprint** — sixty seconds, one word at a time, as many as you can. This is the
mode that gives you a WPM figure worth comparing.

**Alphabet** — the full reference chart: every Latin letter, the Cyrillic letter
or letters it replaces, and a pronunciation hint.

### You do not need a Kazakh keyboard

By default you can type the plain ASCII letter in place of any accented one —
`s` for `ş`, `n` for `ñ`, `u` for `ū` and `ü`, and so on. The word on screen
still shows the correct spelling and fills in as you type, so you learn the real
orthography even while typing `sanyraq` for `şañyraq`.

If you do have a Kazakh Latin layout, turn on **Strict letters** in Settings and
the game will require the exact characters.

**Latin hint** (on by default) shows the Latin spelling under each word. Turn it
off and the letters become dots — then you have to know the mapping yourself.

## The alphabet

The 2021 revision, in official order:

| Latin | Cyrillic | | Latin | Cyrillic | | Latin | Cyrillic |
|---|---|---|---|---|---|---|---|
| A a | А а | | İ i | И и, Й й | | R r | Р р |
| Ä ä | Ә ә | | J j | Ж ж | | S s | С с |
| B b | Б б | | K k | К к | | Ş ş | Ш ш |
| D d | Д д | | L l | Л л | | T t | Т т |
| E e | Е е | | M m | М м | | U u | У у |
| F f | Ф ф | | N n | Н н | | Ū ū | Ұ ұ |
| G g | Г г | | Ñ ñ | Ң ң | | Ü ü | Ү ү |
| Ğ ğ | Ғ ғ | | O o | О о | | V v | В в |
| H h | Х х, Һ һ | | Ö ö | Ө ө | | Y y | Ы ы |
| I ı | І і | | P p | П п | | Z z | З з |
| | | | Q q | Қ қ | | | |

Two merges are deliberate: `И` and `Й` both become dotted `i`, and `Х` and `Һ`
both become `h`. Dotless `ı` (from `І`) and dotted `i` are different letters, and
their capitals swap accordingly — `I` is the capital of `ı`, `İ` the capital
of `i`.

### Nine letters are missing on purpose

`Ё Ц Ч Щ Ъ Ь Э Ю Я` have no counterpart in the 2021 alphabet. They occur only in
words borrowed from Russian, which are respelled rather than transliterated
letter by letter. Rather than invent a rule and teach the wrong thing, every word
containing one is excluded from the game's vocabulary. A test enforces this, so
it cannot drift.

## The word list

358 common Kazakh words, each with an English meaning that appears when you
clear it — nature, animals, the body, family, food, the home, clothing, school
and work, culture, qualities, time, numbers, colours, places and everyday
speech. Difficulty is derived from word length, and arcade levels work upward
through the tiers.

## Running it locally

Any static file server will do. The one caveat is that opening `index.html`
straight from the filesystem will not work, because browsers refuse to load ES
modules over `file://`.

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Tests

The transliteration engine and the word list are covered by a dependency-free
test file — every letter in both cases, the dotted/dotless capital rules, ASCII
folding, strict and lenient matching, and a sweep asserting no word in the corpus
uses a letter the alphabet cannot spell.

```bash
node tests/translit.test.mjs
```

## Built with

Vanilla JavaScript ES modules, no dependencies and no build step. Words are
positioned DOM nodes rather than canvas drawing, so each character can carry its
own typed/active/error state in CSS. Sound is synthesised at runtime with the Web
Audio API. The ornament throughout is *qoshqar muiiz*, the ram's-horn motif, drawn
once as an SVG symbol and reused.

## Licence

MIT
