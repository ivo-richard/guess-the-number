document.addEventListener('DOMContentLoaded', function () {

  // =========================
  // ELEMENTS
  // =========================

  const firstBtn = document.getElementById('firstBtn');
  const secondBtn = document.getElementById('secondBtn');
  const thirdBtn = document.getElementById('thirdBtn');

  const randomNumDisp = document.getElementById('randomNumDisp');
  const para = document.getElementById('para');

  const nextBtn = document.getElementById('next');
  const refreshBtn = document.getElementById('refresh');

  const scoreSpan = document.querySelector('.score-value');
  const streakSpan = document.querySelector('.streak-value');
  const bestSpan = document.querySelector('.best-value');

  const scoreForm = document.getElementById('scoreForm');
  const nameInput = document.getElementById('nameInput');
  const removeBtn = document.getElementById('removeBtn');
  const overlay = document.getElementById('overlay');

  // =========================
  // AUDIO
  // =========================

  const btnSound = new Audio('btnSound.mp3');
  const correctSound = new Audio('correctSound.mp3');


  // =========================
  // CHECK ELEMENTS
  // =========================

  if (
    !firstBtn ||
    !secondBtn ||
    !thirdBtn ||
    !randomNumDisp ||
    !para ||
    !nextBtn ||
    !refreshBtn ||
    !scoreSpan ||
    !streakSpan ||
    !bestSpan ||
    !scoreForm ||
    !nameInput ||
    !removeBtn ||
    !overlay
  ) {
    console.error('One or more elements not found!');
    return;
  }


  // =========================
  // GAME STATE
  // =========================

  let randomNum;

  let firstBtnVal;
  let secondBtnVal;
  let thirdBtnVal;

  let rounds = 0;
  let name = 'player';


  // =========================
  // LOAD BEST SCORE
  // =========================

  function loadBestScore() {

    const savedData = localStorage.getItem('bestScore');

    if (!savedData) {
      bestSpan.textContent = '0';
      return;
    }

    try {

      const parsedData = JSON.parse(savedData);

      bestSpan.textContent = parsedData.Best || '0';

    } catch (error) {

      bestSpan.textContent = '0';

    }
  }


  // =========================
  // GENERATE ROUND
  // =========================

  function generateRound() {

    // Generate a number between 1 and 80

    randomNum = Math.floor(Math.random() * 80) + 1;


    // Create multipliers from 0.1 to 2.0

    const multipliersList = [];

    for (let i = 1; i <= 20; i++) {
      multipliersList.push(i / 10);
    }


    // Generate three different multipliers.
    // One of them must always be 1.

    let multipliers;

    do {

      multipliers = [
        multipliersList[
          Math.floor(Math.random() * multipliersList.length)
        ],

        multipliersList[
          Math.floor(Math.random() * multipliersList.length)
        ],

        multipliersList[
          Math.floor(Math.random() * multipliersList.length)
        ]
      ];

    } while (
      new Set(multipliers).size !== 3 ||
      !multipliers.includes(1)
    );


    // Calculate answer choices

    firstBtnVal = Math.round(
      randomNum * multipliers[0]
    );

    secondBtnVal = Math.round(
      randomNum * multipliers[1]
    );

    thirdBtnVal = Math.round(
      randomNum * multipliers[2]
    );


    // Display answer choices

    firstBtn.textContent = firstBtnVal;
    secondBtn.textContent = secondBtnVal;
    thirdBtn.textContent = thirdBtnVal;
  }


  // =========================
  // CHECK ANSWER
  // =========================

  function checkMatch(value) {

    return value === randomNum
      ? 'Correct!'
      : 'Wrong!';
  }


  // =========================
  // UPDATE SCORE
  // =========================

  function updateScore(value) {

    let currentScore = Number(
      scoreSpan.textContent
    );

    if (value === randomNum) {

      currentScore++;

      scoreSpan.textContent = currentScore;
    }
  }


  // =========================
  // UPDATE STREAK
  // =========================

  function updateStreak(value) {

    let currentStreak = Number(
      streakSpan.textContent
    );

    if (value === randomNum) {

      currentStreak++;

      streakSpan.textContent = currentStreak;

    } else {

      streakSpan.textContent = '0';
    }
  }


  // =========================
  // UPDATE BEST SCORE
  // =========================

  function updateBestScore() {

    const currentScore = Number(
      scoreSpan.textContent
    );

    const currentBest = Number(
      bestSpan.textContent
    );


    // Only check the best score after 10 rounds

    if (rounds < 10) {
      return;
    }


    // Save a new best score

    if (currentScore > currentBest) {

      bestSpan.textContent = currentScore;


      const saveBestScore = {
        Name: name,
        Best: currentScore.toString()
      };

      localStorage.setItem(
        'bestScore',
        JSON.stringify(saveBestScore)
      );
    }


    // Start a new 10-round session

    scoreSpan.textContent = '0';
    streakSpan.textContent = '0';
    rounds = 0;
  }


  // =========================
  // RESET VISUAL STATE
  // =========================

  function resetNumberDisplay() {

    randomNumDisp.style.backgroundColor =
      'transparent';

    randomNumDisp.style.boxShadow = `
      0 0 25px rgba(108, 92, 231, 0.25),
      inset 0 0 30px rgba(108, 92, 231, 0.08)
    `;
  }


  // =========================
  // START NEW ROUND
  // =========================

  function startNewRound() {

    // Enable answer buttons

    firstBtn.classList.remove('disabled');
    secondBtn.classList.remove('disabled');
    thirdBtn.classList.remove('disabled');


    // Reset display

    randomNumDisp.textContent = '??';

    para.innerHTML = `
      I'm thinking of a number between 1 and 160.
      <br>
      Can you get it?
    `;


    resetNumberDisplay();


    // Generate new answer choices

    generateRound();
  }


  // =========================
  // PLAY AUDIO
  // =========================

  function playAudio(audio, volume) {

    audio.pause();

    audio.currentTime = 0;

    audio.volume = volume;

    audio.play().catch(() => {});
  }


  // =========================
  // HANDLE ANSWER
  // =========================

  function handleAnswer(value) {

    // Reveal the number

    randomNumDisp.textContent = randomNum;


    // Display result

    para.textContent = checkMatch(value);


    // Update score and streak

    updateScore(value);
    updateStreak(value);


    // Count the round

    rounds++;


    // =========================
    // CORRECT / WRONG STATE
    // =========================

    if (value === randomNum) {

      playAudio(correctSound, 0.6);

      randomNumDisp.style.backgroundColor =
        'rgba(108, 92, 231, 0.25)';

      randomNumDisp.style.boxShadow =
        '0 0 45px rgba(108, 92, 231, 0.5)';

    } else {

      playAudio(btnSound, 0.6);

      randomNumDisp.style.backgroundColor =
        'rgba(255, 255, 255, 0.04)';
    }


    // Check the 10-round score

    updateBestScore();


    // Disable answer buttons

    firstBtn.classList.add('disabled');
    secondBtn.classList.add('disabled');
    thirdBtn.classList.add('disabled');
  }


  // =========================
  // INITIAL GAME
  // =========================

  loadBestScore();

  generateRound();


  // =========================
  // ANSWER BUTTON EVENTS
  // =========================

  firstBtn.addEventListener('click', function () {

    handleAnswer(firstBtnVal);

  });


  secondBtn.addEventListener('click', function () {

    handleAnswer(secondBtnVal);

  });


  thirdBtn.addEventListener('click', function () {

    handleAnswer(thirdBtnVal);

  });


  // =========================
  // OPEN RESET FORM
  // =========================

  refreshBtn.addEventListener('click', function () {

    overlay.style.display = 'flex';

    playAudio(btnSound, 0.3);

  });


  // =========================
  // CLOSE RESET FORM
  // =========================

  removeBtn.addEventListener('click', function () {

    overlay.style.display = 'none';

    playAudio(btnSound, 0.3);

  });


  // =========================
  // RESET GAME
  // =========================

  scoreForm.addEventListener('submit', function (event) {

    event.preventDefault();


    const enteredName = nameInput.value.trim();


    // Save username and current best score

    if (enteredName !== '') {

      name = enteredName;

      const saveBestScore = {
        Name: name,
        Best: bestSpan.textContent
      };

      localStorage.setItem(
        'bestScore',
        JSON.stringify(saveBestScore)
      );
    }


    // Close form

    overlay.style.display = 'none';


    // Reset game statistics

    scoreSpan.textContent = '0';
    streakSpan.textContent = '0';
    rounds = 0;


    // Clear input

    nameInput.value = '';


    // Start a fresh round

    startNewRound();
  });


  // =========================
  // NEXT ROUND
  // =========================

  nextBtn.addEventListener('click', function () {

    playAudio(btnSound, 0.3);

    startNewRound();

  });

});