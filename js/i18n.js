/**
 * Interface strings. English and Kazakh.
 * The Kazakh interface is written in Cyrillic — that is what the audience
 * reads today; the Latin alphabet is the thing being taught, not the chrome.
 */

const STRINGS = {
  en: {
    'app.tagline': 'Learn to type the Kazakh Latin alphabet',
    'menu.arcade': 'Arcade',
    'menu.arcadeDesc': 'Words fall. Type them before they land.',
    'menu.sprint': 'Sprint',
    'menu.sprintDesc': 'Sixty seconds. As many words as you can.',
    'menu.alphabet': 'Alphabet',
    'menu.alphabetDesc': 'All 31 letters and where each one comes from.',
    'menu.best': 'Best',
    'menu.how': 'How to play',
    'menu.howBody':
      'Kazakh words appear in Cyrillic. Type them in the 2021 Latin alphabet. ' +
      'You do not need a Kazakh keyboard: plain a, g, i, n, o, s and u are ' +
      'accepted for ä, ğ, ı, ñ, ö, ş, ū and ü, and the correct spelling is ' +
      'shown as you type. Switch on Strict letters if you have a Kazakh Latin layout.',
    'hud.score': 'Score',
    'hud.level': 'Level',
    'hud.lives': 'Lives',
    'hud.time': 'Time',
    'hud.words': 'Words',
    'hud.wpm': 'WPM',
    'hud.accuracy': 'Accuracy',
    'game.tapToType': 'Tap here to type',
    'game.quit': 'Quit',
    'results.gameOver': 'Game over',
    'results.timeUp': 'Time up',
    'results.newBest': 'New personal best',
    'results.again': 'Play again',
    'results.menu': 'Menu',
    'settings.title': 'Settings',
    'settings.lang': 'Language',
    'settings.strict': 'Strict letters',
    'settings.strictDesc': 'Require the real ä ğ ı ñ ö ş ū ü characters',
    'settings.hint': 'Latin hint',
    'settings.hintDesc': 'Show the Latin spelling under each word',
    'settings.sound': 'Sound',
    'alphabet.title': 'The 2021 Latin alphabet',
    'alphabet.subtitle': '31 letters, in official order',
    'alphabet.from': 'from',
    'alphabet.note':
      'Ё Ц Ч Щ Ъ Ь Э Ю Я have no letter in the 2021 alphabet. They occur only ' +
      'in Russian loanwords, so words containing them are left out of this game ' +
      'rather than spelled by an invented rule.',
    'common.back': 'Back',
    'common.on': 'On',
    'common.off': 'Off',
  },
  kk: {
    'app.tagline': 'Қазақ латын әліпбиінде теруді үйрен',
    'menu.arcade': 'Аркада',
    'menu.arcadeDesc': 'Сөздер құлайды. Жерге түспей тер.',
    'menu.sprint': 'Спринт',
    'menu.sprintDesc': 'Алпыс секунд. Мүмкіндігінше көп сөз.',
    'menu.alphabet': 'Әліпби',
    'menu.alphabetDesc': 'Барлық 31 әріп және олардың қайдан шыққаны.',
    'menu.best': 'Рекорд',
    'menu.how': 'Ойнау тәртібі',
    'menu.howBody':
      'Қазақ сөздері кириллицамен шығады. Оларды 2021 жылғы латын әліпбиімен тер. ' +
      'Қазақша пернетақта қажет емес: ä, ğ, ı, ñ, ö, ş, ū, ü орнына кәдімгі ' +
      'a, g, i, n, o, s, u әріптерін теруге болады, ал дұрыс жазылуы экранда ' +
      'көрініп тұрады. Латын пернетақтаң болса, «Қатаң әріптер» режимін қос.',
    'hud.score': 'Ұпай',
    'hud.level': 'Деңгей',
    'hud.lives': 'Өмір',
    'hud.time': 'Уақыт',
    'hud.words': 'Сөз',
    'hud.wpm': 'Сөз/мин',
    'hud.accuracy': 'Дәлдік',
    'game.tapToType': 'Теру үшін осы жерді түрт',
    'game.quit': 'Шығу',
    'results.gameOver': 'Ойын бітті',
    'results.timeUp': 'Уақыт бітті',
    'results.newBest': 'Жаңа рекорд',
    'results.again': 'Қайта ойнау',
    'results.menu': 'Мәзір',
    'settings.title': 'Баптаулар',
    'settings.lang': 'Тіл',
    'settings.strict': 'Қатаң әріптер',
    'settings.strictDesc': 'Нағыз ä ğ ı ñ ö ş ū ü таңбаларын талап ету',
    'settings.hint': 'Латын көмегі',
    'settings.hintDesc': 'Әр сөздің латынша жазылуын көрсету',
    'settings.sound': 'Дыбыс',
    'alphabet.title': '2021 жылғы латын әліпбиі',
    'alphabet.subtitle': 'Ресми тәртіппен, 31 әріп',
    'alphabet.from': 'қайдан',
    'alphabet.note':
      'Ё Ц Ч Щ Ъ Ь Э Ю Я әріптерінің 2021 әліпбиінде баламасы жоқ. Олар тек ' +
      'орыс тілінен енген сөздерде кездеседі, сондықтан ондай сөздер ойлап ' +
      'табылған ережемен жазылмай, ойыннан мүлде алынып тасталды.',
    'common.back': 'Артқа',
    'common.on': 'Қосулы',
    'common.off': 'Өшірулі',
  },
};

export const LANGUAGES = Object.keys(STRINGS);

let current = 'en';

export function setLanguage(lang) {
  current = STRINGS[lang] ? lang : 'en';
  document.documentElement.lang = current;
  return current;
}

export function getLanguage() {
  return current;
}

/** Look up a string, falling back to English and then to the key itself. */
export function t(key) {
  return STRINGS[current][key] ?? STRINGS.en[key] ?? key;
}

/** Fill every [data-i18n] element in a subtree. Call again after a switch. */
export function applyTranslations(root = document) {
  for (const el of root.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.dataset.i18n);
  }
  for (const el of root.querySelectorAll('[data-i18n-label]')) {
    el.setAttribute('aria-label', t(el.dataset.i18nLabel));
  }
}
