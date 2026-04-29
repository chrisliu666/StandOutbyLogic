(function () {
  "use strict";

  const STORAGE_RECORDS = "stand-out-by-logic.records";

  const difficultyBlanks = {
    easy: 36,
    medium: 44,
    hard: 52,
    expert: 58,
  };

  const difficultyNames = {
    easy: "简单",
    medium: "普通",
    hard: "困难",
    expert: "专家",
  };

  const els = {
    board: document.getElementById("board"),
    numberProgress: document.getElementById("numberProgress"),
    timer: document.getElementById("timer"),
    mistakes: document.getElementById("mistakes"),
    hints: document.getElementById("hints"),
    seedInput: document.getElementById("seedInput"),
    loadSeedBtn: document.getElementById("loadSeedBtn"),
    difficulty: document.getElementById("difficulty"),
    newGameBtn: document.getElementById("newGameBtn"),
    confirmBtn: document.getElementById("confirmBtn"),
    hintBtn: document.getElementById("hintBtn"),
    completeBtn: document.getElementById("completeBtn"),
    undoBtn: document.getElementById("undoBtn"),
    redoBtn: document.getElementById("redoBtn"),
    resetBtn: document.getElementById("resetBtn"),
    undoResetBtn: document.getElementById("undoResetBtn"),
    againBtn: document.getElementById("againBtn"),
    clearRecordsBtn: document.getElementById("clearRecordsBtn"),
    recordsList: document.getElementById("recordsList"),
    mascotLine: document.getElementById("mascotLine"),
    toast: document.getElementById("toast"),
    classicModeBtn: document.getElementById("classicModeBtn"),
    battleModeBtn: document.getElementById("battleModeBtn"),
    battleDashboard: document.getElementById("battleDashboard"),
    battleScore: document.getElementById("battleScore"),
    battleLevel: document.getElementById("battleLevel"),
    battleInterval: document.getElementById("battleInterval"),
    battleSkills: document.getElementById("battleSkills"),
    skillModal: document.getElementById("skillModal"),
    skillChoices: document.getElementById("skillChoices"),
    guidePanel: document.querySelector(".guide-panel ul"),
    guideTitle: document.querySelector(".guide-panel .panel-title"),
    seedRow: document.querySelector(".seed-row"),
    settings: document.querySelector(".settings"),
  };

  const state = {
    puzzle: [],
    solution: [],
    values: [],
    statuses: [],
    selected: null,
    highlightedValue: 0,
    mistakes: 0,
    hints: 3,
    seed: "",
    difficulty: "medium",
    startedAt: Date.now(),
    elapsedBeforePause: 0,
    timerPaused: false,
    ended: false,
    timerId: null,
    undoStack: [],
    redoStack: [],
    resetSnapshot: null,
    records: loadJson(STORAGE_RECORDS, []),
    longPressTimer: null,
    longPressTriggered: false,
    mode: "classic",
    battle: {
      timerId: null,
      score: 0,
      level: 1,
      nextLevelScore: 5,
      interval: 2000,
      paused: false,
      choosingSkill: false,
      rng: Math.random,
      skills: { speed: 0, chain: 0, power: 0 },
      selectedSkills: [],
      completedRows: new Set(),
      completedCols: new Set(),
      completedBoxes: new Set(),
    },
  };

  const battleSkillPool = [
    { id: "speed", name: "加速", description: "自动填数间隔减少 0.3 秒，最低 0.5 秒。" },
    { id: "chain", name: "连锁", description: "完成一行时，额外随机自动填入 1 个正确格子。" },
    { id: "power", name: "强化", description: "完成行、列、宫时额外 +1 分。" },
  ];

  const guideCopy = {
    classic: [
      ["左键单击", "选中格子，并高亮所有相同数字"],
      ["滚轮", "上滚 +1，下滚 -1"],
      ["长按", "清除当前格"],
      ["右键长按", "确认当前临时数字"],
      ["确认", "正确则固定，错误扣 1 次机会"],
      ["提示", "每局 3 次，直接填入正确数字"],
    ],
    battle: [
      ["玩法", "棋盘按当前难度生成部分题面"],
      ["自动填数", "系统每隔一段时间随机补 1 个空格"],
      ["得分", "完成行/列 +1，完成宫 +2"],
      ["升级", "每 5 分弹出三选一技能"],
      ["暂停", "选技能或页面离开前台时完全暂停"],
      ["循环", "整盘填满后保留技能并进入下一轮"],
    ],
  };

  const mascotLines = {
    ready: "选一个格子，我会帮你盯住同样的数字。",
    good: "答案正确，逻辑闪闪发光。",
    bad: "这个数字不对，再观察一下宫和列。",
    hint: "提示已经填好啦，继续保持节奏。",
    fail: "这局失败了，换个种子重新来过。",
    win: "通关成功，今天的推理也很漂亮。",
    battle: "自动破阵启动，我会随机填数；你负责升级时选技能。",
  };

  init();

  function init() {
    buildBoard();
    buildNumberProgress();
    bindActions();
    renderRecords();
    startGame();
  }

  function buildBoard() {
    els.board.innerHTML = "";
    for (let index = 0; index < 81; index += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.index = String(index);
      cell.setAttribute("aria-label", `第 ${Math.floor(index / 9) + 1} 行第 ${(index % 9) + 1} 列`);
      if ((index % 9) === 2 || (index % 9) === 5) {
        cell.classList.add("box-right");
      }
      if (Math.floor(index / 9) === 2 || Math.floor(index / 9) === 5) {
        cell.classList.add("box-bottom");
      }
      cell.addEventListener("click", handleCellClick);
      cell.addEventListener("contextmenu", (event) => event.preventDefault());
      cell.addEventListener("mousedown", handleCellMouseDown);
      cell.addEventListener("mouseup", handleCellMouseUp);
      cell.addEventListener("mouseleave", clearLongPress);
      cell.addEventListener("wheel", handleCellWheel, { passive: false });
      els.board.appendChild(cell);
    }
  }

  function buildNumberProgress() {
    els.numberProgress.innerHTML = "";
    for (let value = 1; value <= 9; value += 1) {
      const item = document.createElement("div");
      item.className = "number-progress-item";
      item.dataset.value = String(value);
      item.innerHTML = `<strong>${value}</strong><span>0/9</span>`;
      els.numberProgress.appendChild(item);
    }
  }

  function bindActions() {
    els.classicModeBtn?.addEventListener("click", () => startGame());
    els.battleModeBtn?.addEventListener("click", () => startBattle());
    els.newGameBtn.addEventListener("click", () => {
      interruptCurrentGame();
      if (state.mode === "battle") {
        startBattle();
      } else {
        startGame();
      }
    });
    els.againBtn.addEventListener("click", () => startGame());
    els.confirmBtn.addEventListener("click", confirmSelected);
    els.hintBtn.addEventListener("click", useHint);
    els.completeBtn.addEventListener("click", completeGame);
    els.undoBtn?.addEventListener("click", undo);
    els.redoBtn?.addEventListener("click", redo);
    els.resetBtn?.addEventListener("click", resetGame);
    els.undoResetBtn?.addEventListener("click", undoReset);
    els.loadSeedBtn.addEventListener("click", () => {
      const seed = els.seedInput.value.trim();
      if (!seed) {
        showToast("请输入种子码");
        return;
      }
      startGame(seed);
    });
    els.clearRecordsBtn.addEventListener("click", () => {
      state.records = [];
      saveJson(STORAGE_RECORDS, state.records);
      renderRecords();
    });
    document.addEventListener("visibilitychange", handleForegroundChange);
    window.addEventListener("blur", handleForegroundChange);
    window.addEventListener("focus", handleForegroundChange);
  }

  function startGame(requestedSeed) {
    stopBattleTimer();
    state.battle.choosingSkill = false;
    els.skillModal?.classList.add("hidden");
    state.mode = "classic";
    state.difficulty = els.difficulty.value;
    state.seed = requestedSeed || createSeed(state.difficulty);
    state.selected = null;
    state.highlightedValue = 0;
    state.mistakes = 0;
    state.hints = 3;
    state.ended = false;
    state.undoStack = [];
    state.redoStack = [];
    state.resetSnapshot = null;
    els.againBtn.classList.add("hidden");
    els.seedInput.value = state.seed;
    setMascot("ready");
    showToast("正在准备本地题目");

    const game = createSeededGame(state.seed, state.difficulty);

    state.puzzle = game.puzzle.slice();
    state.solution = game.solution.slice();
    state.values = game.puzzle.slice();
    state.statuses = game.puzzle.map((value) => (value ? "given" : "empty"));
    restartTimer();
    render();
  }

  function startBattle() {
    window.clearInterval(state.timerId);
    state.mode = "battle";
    state.difficulty = els.difficulty.value;
    state.seed = createSeed("battle");
    resetBattleState();
    const game = createSeededGame(state.seed, state.difficulty);
    state.puzzle = game.puzzle.slice();
    state.solution = game.solution.slice();
    state.values = game.puzzle.slice();
    state.statuses = game.puzzle.map((value) => (value ? "given" : "empty"));
    collectInitialBattleCompletions();
    state.selected = null;
    state.highlightedValue = 0;
    state.ended = false;
    state.undoStack = [];
    state.redoStack = [];
    state.resetSnapshot = null;
    els.againBtn.classList.add("hidden");
    els.seedInput.value = state.seed;
    setMascot("battle");
    showToast("自动破阵开始");
    render();
    resumeBattleTimer();
  }

  function resetBattleState() {
    stopBattleTimer();
    state.battle.score = 0;
    state.battle.level = 1;
    state.battle.nextLevelScore = 5;
    state.battle.interval = 2000;
    state.battle.paused = false;
    state.battle.choosingSkill = false;
    state.battle.rng = mulberry32(hashString(`battle-${Date.now()}-${Math.random()}`));
    state.battle.skills = { speed: 0, chain: 0, power: 0 };
    state.battle.selectedSkills = [];
    state.battle.completedRows = new Set();
    state.battle.completedCols = new Set();
    state.battle.completedBoxes = new Set();
    els.skillModal?.classList.add("hidden");
  }

  function createSeededGame(seed, difficulty) {
    const rng = mulberry32(hashString(seed));
    const base = [
      1, 2, 3, 4, 5, 6, 7, 8, 9,
      4, 5, 6, 7, 8, 9, 1, 2, 3,
      7, 8, 9, 1, 2, 3, 4, 5, 6,
      2, 3, 4, 5, 6, 7, 8, 9, 1,
      5, 6, 7, 8, 9, 1, 2, 3, 4,
      8, 9, 1, 2, 3, 4, 5, 6, 7,
      3, 4, 5, 6, 7, 8, 9, 1, 2,
      6, 7, 8, 9, 1, 2, 3, 4, 5,
      9, 1, 2, 3, 4, 5, 6, 7, 8,
    ];
    const digitMap = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
    let solution = base.map((value) => digitMap[value - 1]);
    solution = shuffleRowsAndColumns(solution, rng);
    const puzzle = solution.slice();
    const holes = difficultyBlanks[difficulty] || difficultyBlanks.medium;
    const positions = shuffle([...Array(81).keys()], rng).slice(0, holes);
    positions.forEach((index) => {
      puzzle[index] = 0;
    });
    return { puzzle, solution, difficulty };
  }

  function shuffleRowsAndColumns(grid, rng) {
    const rowBands = shuffle([0, 1, 2], rng);
    const colBands = shuffle([0, 1, 2], rng);
    const rows = rowBands.flatMap((band) => shuffle([0, 1, 2], rng).map((row) => band * 3 + row));
    const cols = colBands.flatMap((band) => shuffle([0, 1, 2], rng).map((col) => band * 3 + col));
    const output = [];
    rows.forEach((row) => {
      cols.forEach((col) => output.push(grid[row * 9 + col]));
    });
    return output;
  }

  function handleCellClick(event) {
    if (state.mode === "battle") {
      return;
    }
    if (state.longPressTriggered) {
      state.longPressTriggered = false;
      return;
    }
    const index = Number(event.currentTarget.dataset.index);
    selectCell(index);
  }

  function handleCellMouseDown(event) {
    if (state.mode === "battle") {
      return;
    }
    const index = Number(event.currentTarget.dataset.index);
    selectCell(index);
    if (event.button === 2) {
      event.preventDefault();
      startLongPress(() => confirmCell(index));
      return;
    }
    if (event.button === 0) {
      startLongPress(() => clearCell(index));
    }
  }

  function handleCellMouseUp(event) {
    const index = Number(event.currentTarget.dataset.index);
    const wasLongPress = state.longPressTriggered;
    clearLongPress();
    if (event.button === 2 && !wasLongPress) {
      event.preventDefault();
    } else if (event.button === 2 && wasLongPress) {
      state.longPressTriggered = false;
    }
  }

  function handleCellWheel(event) {
    event.preventDefault();
    if (state.mode === "battle") {
      return;
    }
    const index = Number(event.currentTarget.dataset.index);
    selectCell(index);
    changeCell(index, event.deltaY < 0 ? 1 : -1);
  }

  function startLongPress(action) {
    clearLongPress();
    state.longPressTriggered = false;
    state.longPressTimer = window.setTimeout(() => {
      state.longPressTriggered = true;
      action();
    }, 620);
  }

  function clearLongPress() {
    if (state.longPressTimer) {
      window.clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }
  }

  function selectCell(index) {
    state.selected = index;
    state.highlightedValue = state.values[index] || 0;
    render();
  }

  function changeCell(index, delta) {
    if (!canEdit(index)) {
      return;
    }
    const next = cycleValue(state.values[index] + delta);
    setCellValue(index, next);
  }

  function setCellValue(index, value) {
    if (!canEdit(index)) {
      return;
    }
    const before = snapshotCell(index);
    state.values[index] = value;
    state.statuses[index] = value ? "draft" : "empty";
    state.highlightedValue = value;
    pushHistory({ type: "cell", index, before, after: snapshotCell(index) });
    state.redoStack = [];
    render();
    animateCell(index, "bump");
  }

  function clearCell(index) {
    if (!canEdit(index)) {
      return;
    }
    const before = snapshotCell(index);
    state.values[index] = 0;
    state.statuses[index] = "empty";
    state.highlightedValue = 0;
    pushHistory({ type: "cell", index, before, after: snapshotCell(index) });
    state.redoStack = [];
    showToast("已清除");
    render();
  }

  function confirmSelected() {
    if (state.selected === null) {
      showToast("请先选择一个格子");
      return;
    }
    confirmCell(state.selected);
  }

  function confirmCell(index) {
    if (state.ended || state.statuses[index] === "given" || state.statuses[index] === "hinted") {
      return;
    }
    let confirmed = false;
    const value = state.values[index];
    if (!value) {
      showToast("空格不能确认");
      return;
    }
    if (value === state.solution[index]) {
      const before = snapshotCell(index);
      state.statuses[index] = "confirmed";
      pushHistory({ type: "cell", index, before, after: snapshotCell(index) });
      state.redoStack = [];
      confirmed = true;
      setMascot("good");
      showToast("正确");
      checkWin();
    } else {
      state.mistakes += 1;
      setMascot("bad");
      showToast(`错误，还剩 ${Math.max(0, 3 - state.mistakes)} 次机会`);
      if (state.mistakes >= 3) {
        finishGame("失败");
      }
    }
    render();
    if (confirmed) {
      animateCell(index, "spark");
    }
  }

  function useHint() {
    if (state.ended) {
      return;
    }
    if (state.hints <= 0) {
      showToast("提示次数已用完");
      return;
    }
    const index = pickHintIndex();
    if (index === null) {
      showToast("没有可提示的格子");
      return;
    }
    const before = snapshotCell(index);
    state.values[index] = state.solution[index];
    state.statuses[index] = "hinted";
    state.hints -= 1;
    state.selected = index;
    state.highlightedValue = state.values[index];
    pushHistory({ type: "hint", index, before, after: snapshotCell(index), hintsBefore: state.hints + 1, hintsAfter: state.hints });
    state.redoStack = [];
    setMascot("hint");
    showToast("提示已填入");
    checkWin();
    render();
    animateCell(index, "spark");
  }

  function pickHintIndex() {
    if (state.selected !== null && canEdit(state.selected)) {
      return state.selected;
    }
    return state.values.findIndex((value, index) => value !== state.solution[index] && state.statuses[index] !== "given");
  }

  function completeGame() {
    if (state.ended) {
      return;
    }
    const before = snapshotGame();
    state.values = state.solution.slice();
    state.statuses = state.solution.map((_, index) => (state.puzzle[index] ? "given" : "confirmed"));
    state.selected = null;
    state.highlightedValue = 0;
    pushHistory({ type: "game", before, after: snapshotGame() });
    state.redoStack = [];
    showToast("已一键完成");
    finishGame("成功");
    render();
  }

  function resetGame() {
    if (state.ended) {
      return;
    }
    state.resetSnapshot = snapshotGame();
    state.values = state.puzzle.slice();
    state.statuses = state.puzzle.map((value) => (value ? "given" : "empty"));
    state.selected = null;
    state.highlightedValue = 0;
    state.hints = 3;
    state.mistakes = 0;
    state.undoStack = [];
    state.redoStack = [];
    showToast("已重置，可撤销重置");
    render();
  }

  function undoReset() {
    if (!state.resetSnapshot) {
      showToast("没有可撤销的重置");
      return;
    }
    restoreGame(state.resetSnapshot);
    state.resetSnapshot = null;
    showToast("已撤销重置");
    render();
  }

  function undo() {
    const action = state.undoStack.pop();
    if (!action || state.ended) {
      return;
    }
    applyHistory(action, "before");
    state.redoStack.push(action);
    render();
  }

  function redo() {
    const action = state.redoStack.pop();
    if (!action || state.ended) {
      return;
    }
    applyHistory(action, "after");
    state.undoStack.push(action);
    render();
  }

  function applyHistory(action, side) {
    if (action.type === "game") {
      restoreGame(action[side]);
      return;
    }
    if (action.type === "hint") {
      state.hints = side === "before" ? action.hintsBefore : action.hintsAfter;
    }
    state.values[action.index] = action[side].value;
    state.statuses[action.index] = action[side].status;
    state.selected = action.index;
    state.highlightedValue = state.values[action.index];
  }

  function checkWin() {
    const solved = state.values.every((value, index) => value === state.solution[index]);
    if (solved) {
      finishGame("成功");
    }
  }

  function finishGame(result) {
    if (state.ended) {
      return;
    }
    state.ended = true;
    window.clearInterval(state.timerId);
    recordGame(result);
    if (result === "失败") {
      els.againBtn.classList.remove("hidden");
      setMascot("fail");
    } else {
      setMascot("win");
    }
  }

  function resumeBattleTimer() {
    stopBattleTimer();
    if (state.mode !== "battle" || state.battle.choosingSkill || shouldPauseTimer()) {
      state.battle.paused = true;
      return;
    }
    state.battle.paused = false;
    state.battle.timerId = window.setInterval(() => {
      autoFillBattleCell(true);
    }, state.battle.interval);
  }

  function stopBattleTimer() {
    window.clearInterval(state.battle?.timerId);
    if (state.battle) {
      state.battle.timerId = null;
    }
  }

  function pauseBattleTimer() {
    if (state.mode !== "battle") {
      return;
    }
    state.battle.paused = true;
    stopBattleTimer();
  }

  function autoFillBattleCell(allowLevelUp) {
    if (state.mode !== "battle" || state.battle.choosingSkill || shouldPauseTimer()) {
      pauseBattleTimer();
      return;
    }
    const emptyIndexes = getBattleEmptyIndexes();
    if (emptyIndexes.length === 0) {
      resetBattleRound();
      return;
    }
    const index = emptyIndexes[Math.floor(state.battle.rng() * emptyIndexes.length)];
    state.values[index] = state.solution[index];
    state.statuses[index] = "auto";
    state.selected = index;
    state.highlightedValue = state.values[index];
    const gained = collectBattleScore(index);
    render();
    animateCell(index, gained > 0 ? "spark" : "bump");
    if (allowLevelUp) {
      checkBattleLevelUp();
    }
  }

  function getBattleEmptyIndexes() {
    return state.values
      .map((value, index) => (!value && state.statuses[index] === "empty" ? index : null))
      .filter((index) => index !== null);
  }

  function collectBattleScore(index) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    let gained = 0;
    if (!state.battle.completedRows.has(row) && isBattleRowComplete(row)) {
      state.battle.completedRows.add(row);
      gained += 1 + state.battle.skills.power;
      for (let count = 0; count < state.battle.skills.chain; count += 1) {
        autoFillBattleCell(false);
      }
    }
    if (!state.battle.completedCols.has(col) && isBattleColComplete(col)) {
      state.battle.completedCols.add(col);
      gained += 1 + state.battle.skills.power;
    }
    if (!state.battle.completedBoxes.has(box) && isBattleBoxComplete(box)) {
      state.battle.completedBoxes.add(box);
      gained += 2 + state.battle.skills.power;
    }
    if (gained > 0) {
      state.battle.score += gained;
      showToast(`+${gained}`);
    }
    return gained;
  }

  function isBattleRowComplete(row) {
    return state.values.slice(row * 9, row * 9 + 9).every(Boolean);
  }

  function isBattleColComplete(col) {
    for (let row = 0; row < 9; row += 1) {
      if (!state.values[row * 9 + col]) {
        return false;
      }
    }
    return true;
  }

  function isBattleBoxComplete(box) {
    const rowStart = Math.floor(box / 3) * 3;
    const colStart = (box % 3) * 3;
    for (let row = rowStart; row < rowStart + 3; row += 1) {
      for (let col = colStart; col < colStart + 3; col += 1) {
        if (!state.values[row * 9 + col]) {
          return false;
        }
      }
    }
    return true;
  }

  function resetBattleRound() {
    const game = createSeededGame(createSeed("battle"), state.difficulty);
    state.puzzle = game.puzzle.slice();
    state.solution = game.solution.slice();
    state.values = game.puzzle.slice();
    state.statuses = game.puzzle.map((value) => (value ? "given" : "empty"));
    collectInitialBattleCompletions();
    state.selected = null;
    state.highlightedValue = 0;
    state.battle.completedRows = new Set();
    state.battle.completedCols = new Set();
    state.battle.completedBoxes = new Set();
    showToast("新一轮");
    render();
  }

  function checkBattleLevelUp() {
    if (state.battle.score < state.battle.nextLevelScore || state.battle.choosingSkill) {
      return;
    }
    state.battle.choosingSkill = true;
    pauseBattleTimer();
    showSkillChoices();
  }

  function showSkillChoices() {
    els.skillChoices.innerHTML = "";
    shuffle(battleSkillPool, state.battle.rng).forEach((skill) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "skill-card";
      button.innerHTML = `<strong>${skill.name}</strong><span>${skill.description}</span>`;
      button.addEventListener("click", () => chooseBattleSkill(skill));
      els.skillChoices.appendChild(button);
    });
    els.skillModal.classList.remove("hidden");
  }

  function chooseBattleSkill(skill) {
    if (skill.id === "speed") {
      state.battle.skills.speed += 1;
      state.battle.interval = Math.max(500, state.battle.interval - 300);
    }
    if (skill.id === "chain") {
      state.battle.skills.chain += 1;
    }
    if (skill.id === "power") {
      state.battle.skills.power += 1;
    }
    state.battle.selectedSkills.push(skill.name);
    state.battle.level += 1;
    state.battle.nextLevelScore += 5;
    state.battle.choosingSkill = false;
    els.skillModal.classList.add("hidden");
    renderBattleDashboard();
    resumeBattleTimer();
  }

  function collectInitialBattleCompletions() {
    state.battle.completedRows = new Set();
    state.battle.completedCols = new Set();
    state.battle.completedBoxes = new Set();
    for (let index = 0; index < 9; index += 1) {
      if (isBattleRowComplete(index)) {
        state.battle.completedRows.add(index);
      }
      if (isBattleColComplete(index)) {
        state.battle.completedCols.add(index);
      }
      if (isBattleBoxComplete(index)) {
        state.battle.completedBoxes.add(index);
      }
    }
  }

  function interruptCurrentGame() {
    if (state.ended || !state.seed || state.solution.length === 0) {
      return;
    }
    state.ended = true;
    window.clearInterval(state.timerId);
    recordGame("中断");
  }

  function recordGame(result) {
    const seconds = elapsedSeconds();
    state.records.unshift({
      result,
      seconds,
      seed: state.seed,
      difficulty: state.difficulty,
      at: new Date().toISOString(),
    });
    state.records = state.records.slice(0, 20);
    saveJson(STORAGE_RECORDS, state.records);
    renderRecords();
  }

  function render() {
    [...els.board.children].forEach((cell, index) => {
      const value = state.values[index];
      const status = state.statuses[index];
      cell.textContent = value ? String(value) : "";
      cell.disabled = state.ended;
      cell.setAttribute("aria-disabled", String(status === "given" || status === "confirmed" || status === "hinted"));
      cell.className = "cell";
      if ((index % 9) === 2 || (index % 9) === 5) {
        cell.classList.add("box-right");
      }
      if (Math.floor(index / 9) === 2 || Math.floor(index / 9) === 5) {
        cell.classList.add("box-bottom");
      }
      if (status !== "empty") {
        cell.classList.add(status);
      }
      if (index === state.selected) {
        cell.classList.add("selected");
      }
      if (state.selected !== null && isRelated(index, state.selected)) {
        cell.classList.add("related");
      }
      if (state.highlightedValue && value === state.highlightedValue) {
        cell.classList.add("same");
      }
    });
    els.mistakes.textContent = `错误 ${state.mistakes}/3`;
    els.hints.textContent = `提示 ${state.hints}`;
    const isBattle = state.mode === "battle";
    if (isBattle) {
      els.timer.textContent = "自动";
      els.mistakes.textContent = `等级 ${state.battle.level}`;
      els.hints.textContent = `分数 ${state.battle.score}`;
    }
    document.body.classList.toggle("battle-mode", isBattle);
    els.classicModeBtn?.classList.toggle("active", !isBattle);
    els.battleModeBtn?.classList.toggle("active", isBattle);
    els.battleDashboard?.classList.toggle("hidden", !isBattle);
    els.numberProgress?.closest(".number-progress")?.classList.toggle("hidden", isBattle);
    els.confirmBtn.classList.toggle("hidden", isBattle);
    els.hintBtn.classList.toggle("hidden", isBattle);
    els.completeBtn.classList.toggle("hidden", isBattle);
    els.seedRow?.classList.toggle("hidden", isBattle);
    els.loadSeedBtn.disabled = isBattle;
    els.difficulty.disabled = false;
    els.newGameBtn.textContent = isBattle ? "新一轮破阵" : "新题目";
    els.hintBtn.disabled = isBattle || state.hints <= 0 || state.ended;
    els.confirmBtn.disabled = isBattle || state.ended;
    els.completeBtn.disabled = isBattle || state.ended;
    if (els.undoBtn) {
      els.undoBtn.disabled = state.undoStack.length === 0 || state.ended;
    }
    if (els.redoBtn) {
      els.redoBtn.disabled = state.redoStack.length === 0 || state.ended;
    }
    if (els.undoResetBtn) {
      els.undoResetBtn.disabled = !state.resetSnapshot || state.ended;
    }
    renderNumberProgress();
    renderBattleDashboard();
    renderGuide(isBattle ? "battle" : "classic");
  }

  function renderBattleDashboard() {
    if (!els.battleDashboard) {
      return;
    }
    els.battleScore.textContent = String(state.battle.score);
    els.battleLevel.textContent = String(state.battle.level);
    els.battleInterval.textContent = `${(state.battle.interval / 1000).toFixed(1)}s`;
    els.battleSkills.innerHTML = "";
    if (state.battle.selectedSkills.length === 0) {
      const item = document.createElement("li");
      item.textContent = "暂未选择";
      els.battleSkills.appendChild(item);
      return;
    }
    state.battle.selectedSkills.forEach((name) => {
      const item = document.createElement("li");
      item.textContent = name;
      els.battleSkills.appendChild(item);
    });
  }

  function renderGuide(mode) {
    if (!els.guidePanel) {
      return;
    }
    els.guideTitle.textContent = mode === "battle" ? "破阵说明" : "操作说明";
    els.guidePanel.innerHTML = "";
    guideCopy[mode].forEach(([title, text]) => {
      const item = document.createElement("li");
      const strong = document.createElement("strong");
      const span = document.createElement("span");
      strong.textContent = title;
      span.textContent = text;
      item.append(strong, span);
      els.guidePanel.appendChild(item);
    });
  }

  function renderNumberProgress() {
    const counts = Array(10).fill(0);
    state.values.forEach((value, index) => {
      const fixed = state.statuses[index] === "given" || state.statuses[index] === "confirmed" || state.statuses[index] === "hinted";
      if (fixed && value >= 1 && value <= 9) {
        counts[value] += 1;
      }
    });
    [...els.numberProgress.children].forEach((item) => {
      const value = Number(item.dataset.value);
      const count = counts[value];
      item.querySelector("span").textContent = `${count}/9`;
      item.classList.toggle("filled", count >= 9);
    });
  }

  function renderRecords() {
    els.recordsList.innerHTML = "";
    if (state.records.length === 0) {
      const empty = document.createElement("li");
      empty.textContent = "暂无记录";
      els.recordsList.appendChild(empty);
      return;
    }
    state.records.forEach((record) => {
      const item = document.createElement("li");
      item.textContent = `${record.result}｜${difficultyNames[record.difficulty] || record.difficulty}｜${formatTime(record.seconds)}｜${record.seed}`;
      item.title = "点击复制种子码";
      item.addEventListener("click", async () => {
        els.seedInput.value = record.seed;
        try {
          await navigator.clipboard.writeText(record.seed);
          showToast("种子码已复制");
        } catch {
          showToast("种子码已填入输入框");
        }
      });
      els.recordsList.appendChild(item);
    });
  }

  function restartTimer() {
    window.clearInterval(state.timerId);
    state.startedAt = Date.now();
    state.elapsedBeforePause = 0;
    state.timerPaused = false;
    els.timer.textContent = "00:00";
    if (shouldPauseTimer()) {
      pauseTimer();
      return;
    }
    startTimerInterval();
  }

  function elapsedSeconds() {
    const activeElapsed = state.timerPaused ? 0 : Date.now() - state.startedAt;
    return Math.floor((state.elapsedBeforePause + activeElapsed) / 1000);
  }

  function startTimerInterval() {
    window.clearInterval(state.timerId);
    state.timerId = window.setInterval(() => {
      els.timer.textContent = formatTime(elapsedSeconds());
    }, 500);
  }

  function pauseTimer() {
    if (state.ended || state.timerPaused) {
      return;
    }
    state.elapsedBeforePause += Date.now() - state.startedAt;
    state.timerPaused = true;
    window.clearInterval(state.timerId);
    els.timer.textContent = formatTime(elapsedSeconds());
  }

  function resumeTimer() {
    if (state.ended || !state.timerPaused) {
      return;
    }
    state.startedAt = Date.now();
    state.timerPaused = false;
    startTimerInterval();
    els.timer.textContent = formatTime(elapsedSeconds());
  }

  function handleForegroundChange() {
    if (shouldPauseTimer()) {
      pauseTimer();
      pauseBattleTimer();
    } else {
      resumeTimer();
      if (state.mode === "battle" && !state.battle.choosingSkill) {
        resumeBattleTimer();
      }
    }
  }

  function shouldPauseTimer() {
    return document.hidden || (typeof document.hasFocus === "function" && !document.hasFocus());
  }

  function formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function canEdit(index) {
    return state.mode === "classic" && !state.ended && state.statuses[index] !== "given" && state.statuses[index] !== "confirmed" && state.statuses[index] !== "hinted";
  }

  function cycleValue(value) {
    if (value > 9) {
      return 0;
    }
    if (value < 0) {
      return 9;
    }
    return value;
  }

  function isRelated(a, b) {
    if (a === b) {
      return false;
    }
    const rowA = Math.floor(a / 9);
    const rowB = Math.floor(b / 9);
    const colA = a % 9;
    const colB = b % 9;
    const boxA = Math.floor(rowA / 3) * 3 + Math.floor(colA / 3);
    const boxB = Math.floor(rowB / 3) * 3 + Math.floor(colB / 3);
    return rowA === rowB || colA === colB || boxA === boxB;
  }

  function snapshotCell(index) {
    return {
      value: state.values[index],
      status: state.statuses[index],
    };
  }

  function snapshotGame() {
    return {
      values: state.values.slice(),
      statuses: state.statuses.slice(),
      selected: state.selected,
      highlightedValue: state.highlightedValue,
      hints: state.hints,
      mistakes: state.mistakes,
    };
  }

  function restoreGame(snapshot) {
    state.values = snapshot.values.slice();
    state.statuses = snapshot.statuses.slice();
    state.selected = snapshot.selected;
    state.highlightedValue = snapshot.highlightedValue;
    state.hints = snapshot.hints;
    state.mistakes = snapshot.mistakes;
  }

  function pushHistory(action) {
    const before = JSON.stringify(action.before);
    const after = JSON.stringify(action.after);
    if (before !== after) {
      state.undoStack.push(action);
    }
  }

  function animateCell(index, className) {
    const cell = els.board.children[index];
    if (!cell) {
      return;
    }
    cell.classList.remove(className);
    void cell.offsetWidth;
    cell.classList.add(className);
    window.setTimeout(() => cell.classList.remove(className), 560);
  }

  function setMascot(kind) {
    els.mascotLine.textContent = mascotLines[kind] || mascotLines.ready;
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      els.toast.classList.remove("show");
    }, 1000);
  }

  function createSeed(difficulty) {
    const date = new Date();
    const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    return `${difficulty.toUpperCase()}-${stamp}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  function shuffle(items, rng) {
    const output = items.slice();
    for (let index = output.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(rng() * (index + 1));
      [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
    }
    return output;
  }

  function hashString(input) {
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    return function next() {
      let value = seed += 0x6d2b79f5;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
})();
