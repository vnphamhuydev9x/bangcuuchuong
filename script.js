document.addEventListener('DOMContentLoaded', () => {
  // Localization System
  const translations = {
    vi: {
      app_title: "Bé luyện bảng cửu chương",
      nav_multi: "Bảng Cửu Chương",
      nav_addsub: "Luyện Cộng Trừ",
      nav_findx: "Tìm Số Còn Thiếu",
      title_multi: "Bé luyện bảng cửu chương",
      title_addsub: "Bé Luyện Phép Cộng Trừ",
      title_findx: "Bé Luyện Tìm Số Còn Thiếu",
      instr_multi: "Nhấn vào nút số (2-9) để luyện tập chỉ với số đó. Nhấn lại để tắt chế độ luyện tập.",
      label_correct: "Đúng:",
      label_wrong: "Sai:",
      header_history: "Lịch sử làm bài",
      label_time: "Thời gian suy nghĩ (giây):",
      instr_bottom: "Bé nhập kết quả và nhấn Enter hoặc nút Kiểm Tra. Nếu đúng, hiện \"Chính xác!\", rồi nhấn Enter/Câu Khác lần nữa để sang câu mới.",
      msg_empty: "Bạn chưa nhập đáp án.",
      msg_invalid: "Vui lòng nhập số hợp lệ.",
      msg_correct: "Chính xác! 🎉",
      msg_wrong: "Sai rồi — thử lại nhé.",
      msg_timeout: "Hết giờ! ⏰",
      label_correct_ans: "Đáp án đúng:",
      btn_check: "Kiểm Tra",
      btn_next: "Câu Khác",
      placeholder_ans: "Nhập đáp án",
      btn_start_game: "Bắt Đầu! 🚀"
    },
    en: {
      app_title: "Math Practice",
      nav_multi: "Multiplication",
      nav_addsub: "Addition & Subtraction",
      nav_findx: "Find Missing Number",
      title_multi: "Multiplication Practice",
      title_addsub: "Addition & Subtraction Practice",
      title_findx: "Find the Missing Number",
      instr_multi: "Click a number (2-9) to practice only that number. Click again to disable.",
      label_correct: "Correct:",
      label_wrong: "Wrong:",
      header_history: "History",
      label_time: "Thinking time (seconds):",
      instr_bottom: "Enter answer and press Enter or Check. If correct, press Enter/Next Question again for next question.",
      msg_empty: "Please enter an answer.",
      msg_invalid: "Please enter a valid number.",
      msg_correct: "Correct! 🎉",
      msg_wrong: "Wrong — try again.",
      msg_timeout: "Time's up! ⏰",
      label_correct_ans: "Correct answer:",
      btn_check: "Check",
      btn_next: "Next Question",
      placeholder_ans: "Answer",
      btn_start_game: "Start! 🚀"
    }
  };

  let currentLang = localStorage.getItem('bcc_lang') || 'vi';
  const t = (key) => translations[currentLang][key] || key;

  function updateLanguageUI() {
    document.title = t('app_title');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      // Handle placeholder for inputs if needed, or just textContent
      if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
        // Logic for placeholders if we had static ones, but ours is dynamic
      } else {
        el.textContent = t(key);
      }
    });

    // Update dynamic elements if they exist
    const pageTitle = document.getElementById('pageTitle');
    if (currentMode === 'multiplication') pageTitle.textContent = t('title_multi');
    else if (currentMode === 'addsub') pageTitle.textContent = t('title_addsub');
    else pageTitle.textContent = t('title_findx');

    // Update button text if it exists
    if (typeof submitBtn !== 'undefined' && submitBtn) {
      submitBtn.textContent = awaitingNext ? t('btn_next') : t('btn_check');
    }

    // Update aria-labels or placeholders dynamically created
    if (typeof answerEl !== 'undefined' && answerEl) {
      answerEl.ariaLabel = t('placeholder_ans');
    }

    // Update Custom Dropdown UI
    const selectedFlag = document.getElementById('selectedFlag');
    const selectedText = document.getElementById('selectedText');
    if (selectedFlag && selectedText) {
      if (currentLang === 'vi') {
        selectedFlag.src = 'Flag_of_Vietnam.svg.webp';
        selectedText.textContent = 'Tiếng Việt';
      } else {
        selectedFlag.src = 'en.svg';
        selectedText.textContent = 'English';
      }
    }
  }

  // ... existing code ...



  const questionBox = document.getElementById('questionBox');
  const card = document.querySelector('.card'); // Get card reference
  const msgEl = document.getElementById('message');
  const correctEl = document.getElementById('correctCount');
  const wrongEl = document.getElementById('wrongCount');
  const historyList = document.getElementById('historyList');
  const numberButtonsContainer = document.querySelector('.number-buttons');
  const pageTitle = document.getElementById('pageTitle');
  const navButtons = document.querySelectorAll('.nav-btn');
  // Sound Effects System
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();

  function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const gain = audioCtx.createGain();
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    osc.connect(gain);

    if (type === 'correct') {
      // Ding! (High sine wave)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.1); // D6
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'timeout') {
      // Time's up! (Descending sine slide)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.6); // A2
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else {
      // Buzz (Low sawtooth) - Original Sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  }



  // Elements created dynamically
  let aEl, bEl, opEl, eqEl, answerEl, submitBtn;

  let currentMode = 'multiplication';
  let current = { a: 6, b: 7, op: '×', result: 42, missingPos: 2 }; // missingPos: 0 (a), 1 (b), 2 (result)
  let awaitingNext = false;
  let correctCount = 0;
  let wrongCount = 0;
  let focusedNumber = null;

  // Timer System
  let timerDuration = 30;
  let timeLeft = 30;
  let timerRaf = null;
  let timerBar = null;
  let timerText = null;

  function initTimer() {
    const saved = localStorage.getItem('bcc_timer');
    if (saved) {
      timerDuration = parseInt(saved);
    }
  }

  function updateTimerDisplay(remainingSec) {
    if (!timerText || !timerBar) return;
    // Text: Ceiling to show "30s" until it hits 29.xxx
    timerText.textContent = Math.ceil(remainingSec) + 's';

    // Bar: Use exact value for smooth animation
    // Clamp between 0 and 100
    const pct = Math.max(0, Math.min(100, (remainingSec / timerDuration) * 100));
    timerBar.style.width = pct + '%';

    if (remainingSec <= 5) timerBar.style.background = 'var(--warning)';
    else timerBar.style.background = 'var(--secondary)';
  }

  function startTimer() {
    if (timerRaf) cancelAnimationFrame(timerRaf);

    const startTime = Date.now();
    const endTime = startTime + timerDuration * 1000;

    function tick() {
      const now = Date.now();
      const remainingMs = endTime - now;

      if (remainingMs <= 0) {
        updateTimerDisplay(0);
        handleTimeout();
        return;
      }

      updateTimerDisplay(remainingMs / 1000);
      timerRaf = requestAnimationFrame(tick);
    }

    tick();
  }

  function stopTimer() {
    if (timerRaf) cancelAnimationFrame(timerRaf);
  }

  function handleTimeout() {
    stopTimer();
    playSound('timeout'); // distinct sound
    msgEl.innerHTML = `<span class="err">${t('msg_timeout')}</span>`;

    let correctValue;
    if (current.missingPos === 0) correctValue = current.a;
    else if (current.missingPos === 1) correctValue = current.b;
    else correctValue = current.result;

    msgEl.innerHTML += `<span class="correct-answer">${t('label_correct_ans')} ${correctValue}</span>`;

    // Log as wrong
    wrongCount++;
    wrongEl.textContent = wrongCount;
    addHistory(`${current.a} ${current.op} ${current.b}`, '?', false, correctValue);

    awaitingNext = true;
    if (submitBtn) submitBtn.textContent = 'Câu Khác';
    // Use readOnly instead of disabled to keep focus for Enter key
    if (answerEl) {
      answerEl.readOnly = true;
      answerEl.classList.add('input-readonly');
    }
  }

  initTimer();

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

  function renderEquation() {
    questionBox.innerHTML = '';

    // Create Timer UI inside Box
    const tContainer = document.createElement('div');
    tContainer.className = 'timer-container';

    timerBar = document.createElement('div');
    timerBar.className = 'timer-bar';
    // Set initial width
    timerBar.style.width = (timeLeft / timerDuration) * 100 + '%';
    timerBar.style.background = timeLeft <= 5 ? 'var(--warning)' : 'var(--secondary)';

    timerText = document.createElement('div');
    timerText.className = 'timer-text';
    timerText.textContent = timeLeft + 's';

    tContainer.appendChild(timerBar);
    questionBox.appendChild(tContainer);
    questionBox.appendChild(timerText);

    // Helper to create text span
    const createSpan = (text, className) => {
      const s = document.createElement('span');
      s.textContent = text;
      if (className) s.className = className;
      return s;
    };

    // Create Input and Button (reused references)
    answerEl = document.createElement('input');
    answerEl.id = 'answer';
    answerEl.type = 'number';
    answerEl.inputMode = 'numeric';
    answerEl.autocomplete = 'off';
    answerEl.ariaLabel = 'Nhập đáp án';

    // Re-attach event listeners to new elements
    answerEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault(); checkAnswer();
      }
    });

    submitBtn = document.createElement('button');
    submitBtn.id = 'submitBtn';
    submitBtn.className = 'submit-btn';
    submitBtn.textContent = awaitingNext ? t('btn_next') : t('btn_check');
    submitBtn.addEventListener('click', function () { checkAnswer(); });


    // Build DOM based on missingPos
    // Scheme: [Part1] [Op] [Part2] [=] [Part3]
    // But logic is simpler: we always have a, op, b, =, result.
    // One of a, b, result is the input.

    // Create a container for the equation to keep it on one line/flex row
    const equationRow = document.createElement('div');
    equationRow.className = 'equation-row';
    // Style for equation row to match previous .box flex behavior
    equationRow.style.display = 'flex';
    equationRow.style.justifyContent = 'center';
    equationRow.style.alignItems = 'center';
    equationRow.style.gap = '14px';
    equationRow.style.flexWrap = 'wrap';

    const parts = [];

    // Part A
    if (current.missingPos === 0) parts.push(answerEl);
    else parts.push(createSpan(current.a));

    // Operator
    parts.push(createSpan(current.op, 'operator'));

    // Part B
    if (current.missingPos === 1) parts.push(answerEl);
    else parts.push(createSpan(current.b));

    // Equals
    parts.push(createSpan('=', 'operator'));

    // Result
    if (current.missingPos === 2) parts.push(answerEl);
    else parts.push(createSpan(current.result));

    parts.forEach(p => equationRow.appendChild(p));

    // Button container
    const btnContainer = document.createElement('div');
    btnContainer.className = 'btn-container';
    btnContainer.style.width = '100%';
    btnContainer.style.marginTop = '4px';
    btnContainer.style.display = 'flex';
    btnContainer.style.justifyContent = 'center';
    btnContainer.style.alignItems = 'center';
    btnContainer.appendChild(submitBtn);

    // Append to Box
    questionBox.appendChild(equationRow);
    questionBox.appendChild(btnContainer);

    answerEl.focus();
  }

  function newQuestion(autoStart = true) {
    awaitingNext = false;
    timeLeft = timerDuration; // Reset here
    current.missingPos = 2; // Default to finding result

    if (currentMode === 'multiplication') {
      current.op = '×';
      const range = { min: 1, max: 9 };
      let a, b;

      if (focusedNumber !== null) {
        if (Math.random() < 0.5) {
          a = focusedNumber;
          b = randInt(range.min, range.max);
        } else {
          a = randInt(range.min, range.max);
          b = focusedNumber;
        }
      } else {
        a = randInt(range.min, range.max);
        b = randInt(range.min, range.max);
      }
      current.a = a;
      current.b = b;
      current.result = a * b;

    } else if (currentMode === 'addsub' || currentMode === 'findx') {
      // Add/Sub or FindX logic
      current.op = Math.random() < 0.5 ? '+' : '-';
      let a, b, res;

      if (current.op === '+') {
        // Guarantee: a + b <= 19, and no zeros (min 1)
        // min sum = 1+1 = 2. max sum = 19.
        // a can be 1 to 18.
        a = randInt(1, 18);
        b = randInt(1, 19 - a);
        res = a + b;
      } else {
        // Guarantee: a - b >= 1 (no zero result)
        // a must be at least 2 to have a valid b >= 1
        a = randInt(2, 19);
        b = randInt(1, a - 1);
        res = a - b;
      }
      current.a = a;
      current.b = b;
      current.result = res;

      if (currentMode === 'findx') {
        // Weighted Random for Missing Position
        // Bias towards finding operands (0 or 1) rather than result (2)
        // Specifically favor a - x = b (Pos 1) for subtraction

        const r = Math.random();
        if (current.op === '-') {
          // Subtraction: High chance for x (Pos 1: a - [?] = b)
          // 0.0 - 0.5: Pos 1 (50%) -> a - [?] = b
          // 0.5 - 0.8: Pos 0 (30%) -> [?] - b = c
          // 0.8 - 1.0: Pos 2 (20%) -> a - b = [?]
          if (r < 0.5) current.missingPos = 1;
          else if (r < 0.8) current.missingPos = 0;
          else current.missingPos = 2;
        } else {
          // Addition: Equal chance for a or b, low for result
          // 0.0 - 0.4: Pos 0 (40%) -> [?] + b = c
          // 0.4 - 0.8: Pos 1 (40%) -> a + [?] = c
          // 0.8 - 1.0: Pos 2 (20%) -> a + b = [?]
          if (r < 0.4) current.missingPos = 0;
          else if (r < 0.8) current.missingPos = 1;
          else current.missingPos = 2;
        }
      }
    }

    renderEquation();

    msgEl.textContent = '';
    if (autoStart) startTimer();
    else stopTimer(); // Ensure timer is stopped if autoStart is false
  }

  function throwConfetti() {
    for (let i = 0; i < 20; i++) {
      const conf = document.createElement('div');
      conf.className = 'confetti';
      conf.style.left = Math.random() * 100 + '%';
      conf.style.background = `hsl(${Math.random() * 360},80%,60%)`;
      conf.style.animationDuration = (2 + Math.random() * 2) + 's';
      document.body.appendChild(conf);
      setTimeout(() => conf.remove(), 3000);
    }
  }

  // Actually, wait. I can't redefine the function signature easily without matching calls.
  // I'll stick to the existing signature: addHistory(expr, result, correct, correctAnswer)
  // modifying the body to adapt.

  function addHistory(expr, result, correct, correctAnswer) {
    // Show history container if hidden
    const histContainer = document.querySelector('.history');
    if (histContainer.style.display === 'none') {
      histContainer.style.display = 'block';
    }

    const li = document.createElement('li');
    if (correct) {
      li.textContent = expr + ' = ' + result + ' ✔️';
      li.className = 'correct';
    } else {
      let userEq = '';

      const userVal = result;
      const rightVal = correctAnswer;

      if (current.missingPos === 0) {
        userEq = `${userVal} ${current.op} ${current.b} = ${current.result}`;
      } else if (current.missingPos === 1) {
        userEq = `${current.a} ${current.op} ${userVal} = ${current.result}`;
      } else {
        userEq = `${current.a} ${current.op} ${current.b} = ${userVal}`;
      }

      // If correctAnswer is null/undefined, don't show the correction
      if (rightVal === null || rightVal === undefined) {
        li.textContent = userEq + ' ❌';
      } else {
        li.textContent = userEq + ' ❌ (Đúng: ' + rightVal + ')';
      }
      li.className = 'wrong';
    }
    historyList.insertBefore(li, historyList.firstChild);
  }

  function handleTimeout() {
    stopTimer();
    playSound('timeout'); // distinct sound
    msgEl.innerHTML = `<span class="err">${t('msg_timeout')}</span>`;

    let correctValue;
    if (current.missingPos === 0) correctValue = current.a;
    else if (current.missingPos === 1) correctValue = current.b;
    else correctValue = current.result;

    // Show answer in input
    if (answerEl) {
      answerEl.value = correctValue;
      answerEl.readOnly = true; // Allow Enter key
      answerEl.classList.add('revealed');
    }

    // Log as wrong/timeout
    wrongCount++;
    wrongEl.textContent = wrongCount;
    // We provide the correct answer here as the question is over
    addHistory(`${current.a} ${current.op} ${current.b}`, '?', false, correctValue);

    awaitingNext = true;
    if (submitBtn) submitBtn.textContent = t('btn_next');
  }

  function checkAnswer() {
    if (awaitingNext) {
      newQuestion();
      return;
    }
    const val = answerEl.value.trim();
    if (val === '') { msgEl.textContent = t('msg_empty'); return }

    const num = Number(val);

    let correctValue;
    if (current.missingPos === 0) correctValue = current.a;
    else if (current.missingPos === 1) correctValue = current.b;
    else correctValue = current.result;

    if (Number.isNaN(num)) {
      msgEl.textContent = t('msg_invalid');
      answerEl.value = '';
      answerEl.focus();
      return;
    }
    if (num === correctValue) {
      stopTimer(); // Only stop if correct
      correctCount++;
      correctEl.textContent = correctCount;
      msgEl.innerHTML = `<span class="ok">${t('msg_correct')}</span>`;
      playSound('correct');
      throwConfetti();
      addHistory(`${current.a} ${current.op} ${current.b}`, current.result, true); // Log full equation
      awaitingNext = true;
      submitBtn.textContent = t('btn_next');
      if (answerEl) {
        answerEl.readOnly = true; // Allow Enter key
        answerEl.classList.add('input-readonly');
      }
    } else {
      // Wrong answer logic:
      // 1. Play sound & Message
      // 2. Log attempt (no correction)
      // 3. Reset timer
      // 4. Input clear & shake

      wrongCount++;
      wrongEl.textContent = wrongCount;

      msgEl.innerHTML = `<span class="err">${t('msg_wrong')}</span>`;
      playSound('wrong');

      // Pass null for correctValue so history doesn't reveal it
      addHistory(`${current.a} ${current.op} ${current.b}`, num, false, null);

      answerEl.value = '';
      void answerEl.offsetWidth;
      answerEl.classList.add('shake');
      answerEl.focus();

      // Restart timer logic
      timeLeft = timerDuration;
      startTimer();
    }
  }

  // Removed individual submitBtn / answerEl listeners because they are now dynamic
  // and attached inside renderEquation()

  navButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const mode = this.dataset.mode;
      if (mode === currentMode) return;

      currentMode = mode;
      navButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      if (currentMode === 'multiplication') {
        pageTitle.textContent = t('title_multi');
        numberButtonsContainer.classList.remove('hidden');
        document.querySelector('.lead').classList.remove('hidden');
      } else if (currentMode === 'addsub') {
        pageTitle.textContent = t('title_addsub');
        numberButtonsContainer.classList.add('hidden');
        document.querySelector('.lead').classList.add('hidden');
        focusedNumber = null;
        document.querySelectorAll('.num-btn').forEach(b => b.classList.remove('active'));
      } else {
        pageTitle.textContent = t('title_findx');
        numberButtonsContainer.classList.add('hidden');
        document.querySelector('.lead').classList.add('hidden');
        focusedNumber = null;
        document.querySelectorAll('.num-btn').forEach(b => b.classList.remove('active'));
      }

      // Reset to Start Screen
      stopTimer();
      const startOverlay = document.getElementById('start-overlay');
      if (startOverlay) startOverlay.classList.remove('hidden');

      // Generate new question but don't start timer
      newQuestion(false);
    });
  });

  // Number button handlers
  const numButtons = document.querySelectorAll('.num-btn');
  numButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const num = parseInt(this.dataset.num);

      // Toggle: if clicking the same button, deactivate
      if (focusedNumber === num) {
        focusedNumber = null;
        this.classList.remove('active');
      } else {
        // Remove active class from all buttons
        numButtons.forEach(b => b.classList.remove('active'));
        // Set new focused number
        focusedNumber = num;
        this.classList.add('active');
      }

      // Only start timer if overlay is hidden (game is active)
      const overlay = document.getElementById('start-overlay');
      const isRunning = overlay && overlay.classList.contains('hidden');
      newQuestion(isRunning);
    });
  });

  // Settings Handler
  const timeSettingInput = document.getElementById('timeSetting');
  timeSettingInput.value = timerDuration;
  timeSettingInput.addEventListener('change', function () {
    let val = parseInt(this.value);
    if (val < 5) val = 5;
    if (val > 300) val = 300;
    this.value = val;
    timerDuration = val;
    localStorage.setItem('bcc_timer', val);
  });

  // Language Handler (Custom Dropdown)
  const langDropdown = document.querySelector('.custom-dropdown');
  const langOptions = document.querySelector('.dropdown-options');
  const langItems = document.querySelectorAll('.dropdown-item');

  if (langDropdown) {
    langDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      langOptions.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!langDropdown.contains(e.target)) {
        langOptions.classList.remove('show');
      }
    });

    langItems.forEach(item => {
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        currentLang = this.dataset.value;
        localStorage.setItem('bcc_lang', currentLang);
        updateLanguageUI();
        langOptions.classList.remove('show');
      });
    });
  }

  // Initial Localization
  updateLanguageUI();

  // Hide history initially
  document.querySelector('.history').style.display = 'none';

  // Start Game Handler
  const startOverlay = document.getElementById('start-overlay');
  const btnStart = document.getElementById('btn-start-game');

  if (btnStart) {
    btnStart.addEventListener('click', () => {
      // Resume audio context
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Hide overlay
      startOverlay.classList.add('hidden');

      // Start timer
      startTimer();

      // Auto-focus input
      if (answerEl) answerEl.focus();
    });
  }

  // Load first question but DO NOT start timer yet
  newQuestion(false);
});
