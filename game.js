const INIT_SETTINGS = document.querySelector('#init_settings');
const INIT_GAME = document.querySelector('#game');
const CHOICE_OF_TYPE = document.querySelector('#game_mode');
const CHOICE_OF_DIFFICULTY = document.querySelector('#difficulty_level');
const GAME_TYPE_TITILE = document.querySelector('#type_game');
const BUTTON_START = document.querySelector('#game_start');
const RESET_BUTTON = document.querySelector('#reset_button');
const RESET_SETTINGS = document.querySelector('#reset_settings');
const BEST_RESULTS = document.querySelector('#best_results');
const GAME_BORDER = document.querySelector('.game_border');
const CARD_TEMPLATE = document.querySelector('#card_template');
const FLIPPED_CARDS_TIMEOUT = 500;
const CUR_RESULT = document.querySelector('#count_pairs');
const CUR_TIME = document.querySelector('#cur_time');
const RESULTS = document.querySelector('#results');
const ITOG_TIME = RESULTS.querySelector('#itog_time');
const RESET_BUTTON_RESULTS = document.querySelector('#reset_from_results');
const RESET_SETTINGS_RESULTS = document.querySelector('#change_mode_from_results');
const RESULR_TITLE = RESULTS.querySelector('#title_result');
const DOP_WINDOW = CUR_TIME.closest('#cur_result');
const BORDER_BEST = BEST_RESULTS.querySelector('.border_best');
const RECORD = RESULTS.querySelector('#record');


let FLIPPED_CARDS = [];
let count_flipped = 0;
let curTime = 0;
let IntervalId = null;
let cur_attempts = 0;
let run_game = true;

BUTTON_START.addEventListener('click', startGame);
RESET_BUTTON.addEventListener('click', resetGame);
RESET_SETTINGS.addEventListener('click', game);
RESET_BUTTON_RESULTS.addEventListener('click', resetGame);
RESET_SETTINGS_RESULTS.addEventListener('click', game);
CHOICE_OF_TYPE.addEventListener('change', loadBestScores);
CHOICE_OF_DIFFICULTY.addEventListener('change', loadBestScores);

const DIFFICULTY_SETTINGS = {
  easy: { pairs: 6, attempts: 24, time: 60 },
  medium: { pairs: 8, attempts: 28, time: 120 },
  hard: { pairs: 12, attempts: 36, time: 120 },
};
const ICONS_ARRAY = [
  '🐶',
  '🐱',
  '🐭',
  '🐹',
  '🐰',
  '🦊',
  '🐻',
  '🐼',
  '🐨',
  '🐯',
  '🦁',
  '🐮',
  '🐷',
  '🐸',
  '🐵',
  '🐔',
];

function time_calc(curTime) {
  let minutes = Math.floor(curTime / 60);
  let seconds = curTime % 60;
  minutes = String(minutes).padStart(2, '0');
  seconds = String(seconds).padStart(2, '0');
  return [minutes, seconds];
}

function game() {
  INIT_GAME.classList.replace('show', 'hidden');
  RESULTS.classList.replace('show', 'hidden');
  INIT_SETTINGS.classList.replace('hidden', 'show');
  loadBestScores();
}

function startGame() {
  FLIPPED_CARDS = [];
  GAME_BORDER.innerHTML = '';
  count_flipped = 0;
  clearInterval(IntervalId);
  IntervalId = null;
  CUR_RESULT.textContent = 'Найдено пар: 0';
  CUR_TIME.textContent = '';
  run_game = true;
  curTime = 0;
  if (CHOICE_OF_TYPE.value === 'times') {
    DOP_WINDOW.classList.replace('hidden', 'show');
    curTime = DIFFICULTY_SETTINGS[CHOICE_OF_DIFFICULTY.value].time;
    const [minutes, seconds] = time_calc(curTime);
    CUR_TIME.textContent = `Оставшееся количество времени: ${minutes}:${seconds}`;
  } else if (CHOICE_OF_TYPE.value === 'tries') {
    DOP_WINDOW.classList.replace('hidden', 'show');
    cur_attempts = DIFFICULTY_SETTINGS[CHOICE_OF_DIFFICULTY.value].attempts;
    CUR_TIME.textContent = `Оставшееся количество попыток: ${cur_attempts}`;
  } else {
    DOP_WINDOW.classList.replace('show', 'hidden');
  }
  let DIFFICULTY = '';
  switch (CHOICE_OF_DIFFICULTY.value) {
    case 'easy':
      DIFFICULTY = 'легкая';
      break;
    case 'medium':
      DIFFICULTY = 'средняя';
      break;
    case 'hard':
      DIFFICULTY = 'сложная';
      break;
  };
  GAME_TYPE_TITILE.textContent = `Сложность: ${DIFFICULTY}`;
  const classes = GAME_BORDER.classList;
  if (classes.length < 2) {
    GAME_BORDER.classList.add(CHOICE_OF_DIFFICULTY.value);
  } else {
    last_class = classes.item(classes.length - 1);
    classes.replace(last_class, CHOICE_OF_DIFFICULTY.value);
  };
  INIT_SETTINGS.classList.replace('show', 'hidden');
  INIT_GAME.classList.replace('hidden', 'show');
  RESULTS.classList.replace('show', 'hidden');
  createCards();
}

function createCards() {
  const resultArray = [];
  const count = DIFFICULTY_SETTINGS[CHOICE_OF_DIFFICULTY.value].pairs;
  const elements = {}

  while (resultArray.length < count * 2) {
    const randomIndex = Math.floor(Math.random() * ICONS_ARRAY.length)
    const randomElement = ICONS_ARRAY[randomIndex];
    if (!elements[randomElement]) {
      elements[randomElement] = 2;
      resultArray.push(randomElement, randomElement);
    }
  }

  for (let i = resultArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultArray[i], resultArray[j]] = [resultArray[j], resultArray[i]];
  };
  resultArray.forEach((el) => {
    const CARD = CARD_TEMPLATE.content.cloneNode(true).querySelector('.card');
    CARD.addEventListener('click', function()  {
      flipCard(this);
    })
    CARD.querySelector('.card_back').textContent = el;
    GAME_BORDER.appendChild(CARD);
  })
}

function flipCard(card) {
  parent = card.closest('.card');
  if (parent.classList.contains('flipped')) {
    return;
  }
  parent.classList.add('flipped');
  FLIPPED_CARDS.push(parent);
  if (CHOICE_OF_TYPE.value === 'times' || CHOICE_OF_TYPE.value === 'simple') {
    updateTimeDisplay();
  };
  count_flipped++;
  if (CHOICE_OF_TYPE.value === 'tries') {
    if (FLIPPED_CARDS.length % 2 === 0) {
      cur_attempts--;
    }
    CUR_TIME.textContent = `Оставшееся количество попыток: ${cur_attempts}`;
  };

  parent
    .querySelector('.card_inner')
    .addEventListener('transitionend', checkMatch);
  if (FLIPPED_CARDS.length % 2 !== 0) {
    return;
  }
  const [prelastCard, lastCard] = FLIPPED_CARDS.slice(-2);
  if (prelastCard.textContent !== lastCard.textContent) {
    FLIPPED_CARDS = FLIPPED_CARDS.slice(0, FLIPPED_CARDS.length - 2);
    setTimeout(() => {
      [lastCard, prelastCard].forEach(card => {
        card.classList.remove('flipped');
        count_flipped--;
      });
    }, FLIPPED_CARDS_TIMEOUT);
  } else {
    CUR_RESULT.textContent = `Найдено пар: ${Math.floor(count_flipped / 2)}`
  }
}
function checkMatch() {
  const flippedcards = document.querySelectorAll('.flipped');
    if (flippedcards.length === DIFFICULTY_SETTINGS[CHOICE_OF_DIFFICULTY.value].pairs * 2) {
      clearInterval(IntervalId);
      endGame(true, Math.floor(count_flipped / 2), curTime);
      run_game = false;
    };
    if (cur_attempts === 0 && run_game && CHOICE_OF_TYPE.value === 'tries') {
      endGame(false, Math.floor(count_flipped / 2));
      run_game = false;
    }
}

function updateTimeDisplay() {
  if (!IntervalId && CHOICE_OF_TYPE.value === 'simple') {
    IntervalId = setInterval(() => {
    curTime++;
}, 1000);
  }

  if (!IntervalId) {
    IntervalId = setInterval(() => {
    curTime--;
    const [minutes, seconds] = time_calc(curTime);
    CUR_TIME.textContent = `Оставшееся количество времени: ${minutes}:${seconds}`;


    if (curTime < 0 && run_game) {
        CUR_TIME.textContent = `Оставшееся количество времени: 00:00`;
        clearInterval(IntervalId);
        endGame(false, Math.floor(count_flipped / 2));
        run_game = false;
    }
}, 1000);
  }
}

function endGame(isWin, attempts = 0, gameTime = 0) {
  setTimeout(() => {
    INIT_GAME.classList.replace('show', 'hidden');
    RESULTS.classList.replace('hidden', 'show');
    if (CHOICE_OF_TYPE.value === 'times') {
    curTime = DIFFICULTY_SETTINGS[CHOICE_OF_DIFFICULTY.value].time - curTime;
    saveBestScore(CHOICE_OF_DIFFICULTY.value, [curTime, attempts, isWin], 'times');
    if (!isWin) {
      RESULR_TITLE.textContent = 'Вы проиграли';
      ITOG_TIME.textContent = `Ваш результат: ${attempts}`;
  } else {
      RESULR_TITLE.textContent = 'Вы выиграли';
      const [minutes, seconds] = time_calc(curTime);
      ITOG_TIME.textContent = `Ваше время: ${minutes}:${seconds}`;
  };
  } else if (CHOICE_OF_TYPE.value === 'tries') {
    saveBestScore(CHOICE_OF_DIFFICULTY.value, [cur_attempts, attempts, isWin], 'tries');
    if (!isWin) {
      RESULR_TITLE.textContent = 'Вы проиграли';
      ITOG_TIME.textContent = `Ваш результат: ${attempts}`;
    } else {
      RESULR_TITLE.textContent = 'Вы выиграли';
      ITOG_TIME.textContent = `Отсавшиеся попытки: ${cur_attempts}`;
    }
  } else {
      saveBestScore(CHOICE_OF_DIFFICULTY.value, curTime, 'simple'); 
      RESULR_TITLE.textContent = 'Вы выиграли';
      const [minutes, seconds] = time_calc(curTime);
      ITOG_TIME.textContent = `Ваш результат: ${minutes}:${seconds}`;
  }
  const best_result = localStorage.getItem(`${CHOICE_OF_TYPE.value} - ${CHOICE_OF_DIFFICULTY.value}`);
  if (!best_result) {
      RECORD.textContent = 'Нет результатов';
  } else {
    if (best_result.endsWith('false')) {
      RECORD.textContent = `Количество отгаданных пар: ${best_result.split(' ')[0]}`;
    } else {
      if (CHOICE_OF_TYPE.value === 'tries') {
        RECORD.textContent = `Оставшиеся попытки: ${best_result}`;
      } else {
        const [minutes, seconds] = time_calc(best_result);
        RECORD.textContent = `Лучшее время: ${minutes}:${seconds}`;
      }
    }
  }
  }, 250);
}

function saveBestScore(mode, value, valueType) {
  const best_result = localStorage.getItem(`${valueType} - ${mode}`);
  if (valueType === 'simple') {
    if (!best_result) {
      localStorage.setItem(`${valueType} - ${mode}`, value);
    } else {
      if (Number(best_result) > value) {
        localStorage.setItem(`${valueType} - ${mode}`, value);
      };
    };
  } else {
    if (value[2] === true) {
      if (!best_result || best_result.endsWith('false')) {
          localStorage.setItem(`${valueType} - ${mode}`, value[0]);
        } else {
          if (Number(best_result) < value[0] && valueType === 'tries') {
            localStorage.setItem(`${valueType} - ${mode}`, value[0]);
          } else if (Number(best_result) > value[0] && valueType === 'times') {
            localStorage.setItem(`${valueType} - ${mode}`, value[0]);
          };
       };
    }
    else {
      if (!best_result) {
        localStorage.setItem(`${valueType} - ${mode}`, `${value[1]} false`);
      } else {
        if (Number(best_result) < value[1]) {
          localStorage.setItem(`${valueType} - ${mode}`, `${value[1]} false`);
        };
      };
    };
  };
}

function loadBestScores() {
  const best_result = localStorage.getItem(`${CHOICE_OF_TYPE.value} - ${CHOICE_OF_DIFFICULTY.value}`);
  if (!best_result) {
      BORDER_BEST.textContent = 'Нет результатов';
  } else {
    if (best_result.endsWith('false')) {
      BORDER_BEST.textContent = `Количество отгаданных пар: ${best_result.split(' ')[0]}`;
    } else {
      if (CHOICE_OF_TYPE.value === 'tries') {
        BORDER_BEST.textContent = `Оставшиеся попытки: ${best_result}`;
      } else {
        const [minutes, seconds] = time_calc(best_result);
        BORDER_BEST.textContent = `Лучшее время: ${minutes}:${seconds}`;
      }
    }
  }
}


function resetGame() {
  startGame();
}

document.addEventListener('DOMContentLoaded', () => {
  game();
});
