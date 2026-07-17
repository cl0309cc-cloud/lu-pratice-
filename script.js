const storageKey = "lus-practice-jurnal-practice-v13";
let focusStartedAt = 0;
let focusTimer = null;
let focusRunning = false;

const loadState = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch {
    return {};
  }
};

const state = loadState();

const getRealTodayDate = () => {
  const now = new Date();
  if (now.getMonth() !== 6) return null; // calendar only covers July
  const day = now.getDate();
  if (day < 8 || day > 21) return null; // outside the available range
  return `July ${day}`;
};
const realToday = getRealTodayDate();
const savedHtml = state.html || {};

const listeningGate = document.querySelector("[data-listening-gate]");
const listeningTitle = document.querySelector("[data-listening-title]");
const listeningComposer = document.querySelector("[data-listening-composer]");
const listeningBrowser = document.querySelector("[data-listening-browser]");
const listeningPreview = document.querySelector("[data-listening-preview]");
const listeningSubtitle = document.querySelector("[data-listening-subtitle]");
const playerStatus = document.querySelector("[data-player-status]");
const playerTime = document.querySelector("[data-player-time]");
const recordTitle = document.querySelector("[data-record-title]");
const recordComposer = document.querySelector("[data-record-composer]");
const listeningAudio = document.querySelector("[data-listening-audio]");
const playMusic = document.querySelector("[data-play-music]");
const openSpotify = document.querySelector("[data-open-spotify]");
const playNarration = document.querySelector("[data-play-narration]");
const enterJournal = document.querySelector("[data-enter-journal]");
const returnListeningButtons = document.querySelectorAll("[data-return-listening]");
const dashboardShell = document.querySelector(".dashboard");
const navLinks = document.querySelectorAll(".nav-list a");
const pageCards = document.querySelectorAll("[data-page]");
const dailyScope = document.querySelector("[data-progress-scope]");
const planList = document.querySelector("[data-plan-list]");
const pieceList = document.querySelector("[data-piece-list]");
const ideasList = document.querySelector("[data-ideas-list]");

if (savedHtml.planList && planList) planList.innerHTML = savedHtml.planList;
if (savedHtml.pieceList && pieceList) pieceList.innerHTML = savedHtml.pieceList;
if (savedHtml.ideasList && ideasList) ideasList.innerHTML = savedHtml.ideasList;

const ensurePieceGroupButtons = () => {
  pieceList?.querySelectorAll(".piece-group").forEach((group) => {
    if (!group.querySelector("[data-add-piece-to-group]")) {
      const button = document.createElement("button");
      button.className = "text-button";
      button.type = "button";
      button.dataset.addPieceToGroup = "";
      button.textContent = "+ Piece";
      group.appendChild(button);
    }
    if (!group.querySelector("[data-delete-piece-category]")) {
      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-button";
      deleteButton.type = "button";
      deleteButton.dataset.deletePieceCategory = "";
      deleteButton.setAttribute("aria-label", "Delete category");
      deleteButton.textContent = "×";
      group.querySelector("summary")?.appendChild(deleteButton);
    }
  });
};

const ensurePieceGroupNames = () => {
  let changed = false;
  const titles = [...(pieceList?.querySelectorAll(".piece-group summary [contenteditable='true']") || [])];
  titles.forEach((title) => {
    const name = title.textContent.trim();
    if (name === "Solo Piano" || name === "Solo Piece") {
      title.textContent = "Solo pieces";
      changed = true;
    }
    if (name === "Collaborative Piece" || name === "Collaborative Pieces" || name === "Collaborative pieces") {
      title.textContent = "Collaborative – Instrumental";
      changed = true;
      const group = title.closest(".piece-group");
      const existingNames = [...(pieceList?.querySelectorAll(".piece-group summary [contenteditable='true']") || [])]
        .map((item) => item.textContent.trim().toLowerCase());
      if (group && !existingNames.includes("collaborative – vocal")) {
        const vocalGroup = document.createElement("details");
        vocalGroup.className = "piece-group";
        vocalGroup.innerHTML = `
          <summary>
            <span class="chevron">›</span>
            <span contenteditable="true">Collaborative – Vocal</span>
            <button class="delete-button" type="button" data-delete-piece-category aria-label="Delete category">×</button>
          </summary>
          <div class="piece-items">
            <div class="piece-line"><input type="checkbox" /> <input type="text" data-piece-name placeholder="Type piece name" /><button type="button" class="piece-status" data-piece-status="" title="Click to set status"></button><button class="delete-button" type="button" data-delete-piece aria-label="Delete piece">×</button></div>
          </div>
          <button class="text-button" type="button" data-add-piece-to-group>+ Piece</button>
        `;
        group.after(vocalGroup);
      }
    }
  });
  const existingNames = titles.map((title) => title.textContent.trim().toLowerCase());
  if (pieceList && !existingNames.includes("concerto")) {
    const group = document.createElement("details");
    group.className = "piece-group";
    group.innerHTML = `
      <summary>
        <span class="chevron">›</span>
        <span contenteditable="true">Concerto</span>
        <button class="delete-button" type="button" data-delete-piece-category aria-label="Delete category">×</button>
      </summary>
      <div class="piece-items">
        <div class="piece-line"><input type="checkbox" /> <input type="text" data-piece-name placeholder="Type piece name" /><button type="button" class="piece-status" data-piece-status="" title="Click to set status"></button><button class="delete-button" type="button" data-delete-piece aria-label="Delete piece">×</button></div>
        <div class="piece-line"><input type="checkbox" /> <input type="text" data-piece-name placeholder="Type piece name" /><button type="button" class="piece-status" data-piece-status="" title="Click to set status"></button><button class="delete-button" type="button" data-delete-piece aria-label="Delete piece">×</button></div>
      </div>
      <button class="text-button" type="button" data-add-piece-to-group>+ Piece</button>
    `;
    pieceList.appendChild(group);
    changed = true;
  }
  const namesAfterConcerto = [...(pieceList?.querySelectorAll(".piece-group summary [contenteditable='true']") || [])]
    .map((title) => title.textContent.trim().toLowerCase());
  if (pieceList && !namesAfterConcerto.includes("chamber")) {
    const group = document.createElement("details");
    group.className = "piece-group";
    group.innerHTML = `
      <summary>
        <span class="chevron">›</span>
        <span contenteditable="true">Chamber</span>
        <button class="delete-button" type="button" data-delete-piece-category aria-label="Delete category">×</button>
      </summary>
      <div class="piece-items">
        <div class="piece-line"><input type="checkbox" /> <input type="text" data-piece-name placeholder="Type piece name" /><button type="button" class="piece-status" data-piece-status="" title="Click to set status"></button><button class="delete-button" type="button" data-delete-piece aria-label="Delete piece">×</button></div>
      </div>
      <button class="text-button" type="button" data-add-piece-to-group>+ Piece</button>
    `;
    pieceList.appendChild(group);
    changed = true;
  }
  return changed;
};

ensurePieceGroupButtons();
const pieceGroupNamesChanged = ensurePieceGroupNames();

const practiceButtons = document.querySelectorAll("[data-practice-start]");
const focusOverlay = document.querySelector("[data-focus-overlay]");
const focusTime = document.querySelector("[data-focus-time]");
const focusTotal = document.querySelector("[data-focus-total]");
const focusDone = document.querySelector("[data-focus-done]");
const focusSaveReview = document.querySelector("[data-focus-save-review]");
const focusExit = document.querySelector("[data-focus-exit]");
const exitConfirm = document.querySelector("[data-exit-confirm]");
const exitKeep = document.querySelector("[data-exit-keep]");
const exitLeave = document.querySelector("[data-exit-leave]");
const focusSlider = document.querySelector("[data-focus-slider]");
const focusTaskMount = document.querySelector("[data-focus-task-mount]");
const focusReview = document.querySelector("[data-focus-review]");
const focusReflect = document.querySelector("[data-focus-reflect]");
const focusNext = document.querySelector("[data-focus-next]");
const phoneLock = document.querySelector(".phone-lock");
const sliderStatus = document.querySelector("[data-slider-status]");
const dailyPercent = document.querySelector("[data-daily-percent]");
const dailyBar = document.querySelector("[data-daily-bar]");
const dailySticker = document.querySelector("[data-daily-sticker]");
const stickerShelf = document.querySelector("[data-sticker-shelf]");
const stickerCaption = document.querySelector("[data-sticker-caption]");
const shopCollection = document.querySelector("[data-shop-collection]");
const addTask = document.querySelector("[data-add-task]");
const addPlan = document.querySelector("[data-add-plan]");
const addPieceCategory = document.querySelector("[data-add-piece-category]");
const addIdea = document.querySelector("[data-add-idea]");
const dateChip = document.querySelector("[data-current-date]");
const calendar = document.querySelector("[data-calendar]");
const todayTask = document.querySelector("[data-today-task]");
const practiceArchive = document.querySelector("[data-practice-archive]");
const weekStats = document.querySelector("[data-week-stats]");
const formatToolbar = document.querySelector("[data-format-toolbar]");
const formatStyleButtons = document.querySelectorAll("[data-format-style]");
const formatColorButtons = document.querySelectorAll("[data-format-color]");
const completionToast = document.querySelector("[data-completion-toast]");
let activeFormatTarget = null;
let currentDate = state.currentDate || realToday || "July 14";
let currentRoute = "dashboard";
const dailyListeningPieces = [
  {
    title: "Goldberg Variations, Aria",
    composer: "J. S. Bach",
    category: "Keyboard",
    note: "Listen for calm architecture: a simple bass line, gentle ornaments, and a sense of balance that never rushes.",
    audioUrl: "./assets/audio/goldberg-aria.wav",
    spotifyUrl: "https://open.spotify.com/search/J.%20S.%20Bach%20Goldberg%20Variations%20Aria",
    motif: [392, 440, 494, 523, 494, 440, 392],
  },
  {
    title: "Piano Concerto No. 23, II. Adagio",
    composer: "W. A. Mozart",
    category: "Concerto",
    note: "A quiet minor-key aria without words. Notice how the melody breathes before each answer from the orchestra.",
    audioUrl: "./assets/audio/mozart-k488-adagio.wav",
    spotifyUrl: "https://open.spotify.com/search/Mozart%20Piano%20Concerto%20No.%2023%20Adagio%20K.%20488",
    motif: [440, 415, 392, 370, 392, 415, 440],
  },
  {
    title: "Nocturne in E-flat Major, Op. 9 No. 2",
    composer: "Frédéric Chopin",
    category: "Solo Piano",
    note: "Focus on singing tone and flexible timing. The left hand is a soft current; the right hand is the voice.",
    audioUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Frederic_Chopin_-_Nocturne_Eb_major_Opus_9%2C_number_2.ogg",
    spotifyUrl: "https://open.spotify.com/search/Chopin%20Nocturne%20in%20E-flat%20Major%20Op.%209%20No.%202",
    motif: [466, 523, 587, 622, 587, 523, 466],
  },
  {
    title: "Clair de lune",
    composer: "Claude Debussy",
    category: "Solo Piano",
    note: "Listen for color more than pulse. The harmony moves like light across water, never quite landing too heavily.",
    audioUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg",
    spotifyUrl: "https://open.spotify.com/search/Debussy%20Clair%20de%20lune",
    motif: [370, 415, 466, 554, 523, 466, 415],
  },
  {
    title: "Kinderszenen, Träumerei",
    composer: "Robert Schumann",
    category: "Solo Piano",
    note: "A study in tenderness. The phrase endings matter as much as the beginnings; listen for how time softens.",
    audioUrl: "./assets/audio/schumann-traumerei.wav",
    spotifyUrl: "https://open.spotify.com/search/Schumann%20Kinderszenen%20Tr%C3%A4umerei",
    motif: [392, 440, 494, 587, 554, 494, 440],
  },
  {
    title: "Suite bergamasque, Prélude",
    composer: "Claude Debussy",
    category: "Solo Piano",
    note: "Elegant, light, and clear. Notice the touch: bright enough to sparkle, restrained enough to stay graceful.",
    audioUrl: "./assets/audio/debussy-prelude.wav",
    spotifyUrl: "https://open.spotify.com/search/Debussy%20Suite%20bergamasque%20Pr%C3%A9lude",
    motif: [523, 587, 659, 698, 659, 587, 523],
  },
  {
    title: "Pavane pour une infante défunte",
    composer: "Maurice Ravel",
    category: "Orchestral / Piano",
    note: "A slow dance with distance in it. Listen for noble simplicity and the space between each phrase.",
    audioUrl: "./assets/audio/ravel-pavane.wav",
    spotifyUrl: "https://open.spotify.com/search/Ravel%20Pavane%20pour%20une%20infante%20d%C3%A9funte",
    motif: [349, 392, 440, 466, 440, 392, 349],
  },
];
const stickerPool = [
  {
    name: "espresso",
    category: "coffee",
    label: "Espresso",
    svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 30h29v8c0 9-6 15-15 15s-14-6-14-15Z"/><path d="M45 33h4c5 0 6 9-1 10h-3"/><path d="M20 55h25"/><path d="M24 16c-3 4 3 6 0 10M34 14c-3 4 3 6 0 10"/></svg>',
  },
  {
    name: "latte",
    category: "coffee",
    label: "Latte",
    svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M19 23h27l-4 31H23Z"/><path d="M17 23h31"/><path d="M24 16h17l2 7H22Z"/><path d="M28 34c4-5 9-5 13 0-4 5-9 5-13 0Z"/></svg>',
  },
  {
    name: "pour-over",
    category: "coffee",
    label: "Pour over",
    svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22 19h20l-5 19H27Z"/><path d="M20 19h24"/><path d="M25 39h14l4 15H21Z"/><path d="M30 10c-3 4 3 6 0 10M39 8c-3 4 3 6 0 10"/></svg>',
  },
  {
    name: "strawberry",
    category: "fruit",
    label: "Strawberry",
    svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M30 18c13-7 25 7 18 23-5 12-16 17-18 17S17 53 12 41C5 25 17 11 30 18Z"/><path d="M25 18c-1-7 4-12 9-12 0 6-3 10-9 12Z"/><path d="M31 18c3-6 10-8 15-4-4 5-9 7-15 4Z"/><circle cx="24" cy="31" r="1.8"/><circle cx="36" cy="31" r="1.8"/><circle cx="30" cy="42" r="1.8"/></svg>',
  },
  {
    name: "cherry",
    category: "fruit",
    label: "Cherry",
    svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M28 36c0 7-5 13-12 13S5 43 6 37c1-7 7-11 14-10 5 1 8 4 8 9Z"/><path d="M55 38c0 7-5 12-12 12s-11-5-10-12c1-7 7-11 14-10 5 1 8 4 8 10Z"/><path d="M22 28C25 16 34 10 45 9M44 28c-1-10 1-16 8-22"/><path d="M43 9c-7-5-15-2-18 5 8 3 14 1 18-5Z"/></svg>',
  },
  {
    name: "pear",
    category: "fruit",
    label: "Pear",
    svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M33 13c7 7 3 14 10 22 7 9 2 22-11 22S13 44 21 34c7-8 3-15 12-21Z"/><path d="M34 13c1-5 4-8 9-9"/><path d="M41 8c5-1 9 1 11 5-5 3-10 2-11-5Z"/></svg>',
  },
  {
    name: "croissant",
    category: "bakery",
    label: "Croissant",
    svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M9 39c8-19 37-22 46 0-5 9-16 13-23 4-8 9-18 5-23-4Z"/><path d="M19 30c1 8 5 14 13 13M45 30c-1 8-5 14-13 13"/><path d="M14 39c8 3 15 2 18-4 3 6 10 7 18 4"/></svg>',
  },
  {
    name: "baguette",
    category: "bakery",
    label: "Baguette",
    svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 49C5 40 24 12 39 14c14 2 19 13 10 22C39 46 23 58 14 49Z"/><path d="M25 23c4 2 7 4 9 8M35 18c4 2 7 4 9 8M17 35c4 2 7 4 9 8"/></svg>',
  },
  {
    name: "toast",
    category: "bakery",
    label: "Toast",
    svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M17 57V28c0-12 7-20 15-20s15 8 15 20v29Z"/><path d="M24 35c6-5 12-5 16 0M24 43h16"/></svg>',
  },
];
const stickerCategories = [
  {
    id: "coffee",
    title: "Coffee",
    shopName: "Moonlit Coffee",
    shopSvg: '<svg viewBox="0 0 150 100" aria-hidden="true"><path class="shop-fill" d="M20 43h110v45H20Z"/><path d="M20 43h110v45H20Z"/><path d="M28 43l10-22h74l10 22"/><path d="M34 43c3 8 14 8 17 0 3 8 14 8 17 0 3 8 14 8 17 0 3 8 14 8 17 0 3 8 14 8 17 0"/><path d="M42 88V61h23v27M82 60h30v18H82Z"/><path d="M89 66h16M45 28h58"/><path d="M60 13c-4 6 4 9 0 15M76 10c-4 7 5 10 0 18M93 13c-4 6 4 9 0 15"/><path d="M116 21c-7 2-11 7-11 14 8-1 13-6 11-14Z"/></svg>',
  },
  {
    id: "fruit",
    title: "Fruit",
    shopName: "Little Fruit Atelier",
    shopSvg: '<svg viewBox="0 0 150 100" aria-hidden="true"><path class="shop-fill" d="M18 42h114v46H18Z"/><path d="M18 42h114v46H18Z"/><path d="M20 42l15-24h80l15 24"/><path d="M28 42c4 7 14 7 18 0 4 7 14 7 18 0 4 7 14 7 18 0 4 7 14 7 18 0 4 7 14 7 18 0"/><path d="M34 56h82M34 71h82"/><path d="M42 72c6-10 17-10 23 0M72 72c6-10 17-10 23 0"/><path d="M54 29c-5-6-13-4-14 3 6 3 12 2 14-3ZM88 29c-2-8 5-13 12-9-1 8-6 11-12 9Z"/><circle cx="50" cy="63" r="4"/><circle cx="86" cy="63" r="4"/><circle cx="101" cy="63" r="4"/></svg>',
  },
  {
    id: "bakery",
    title: "Bakery",
    shopName: "Soft Bakery",
    shopSvg: '<svg viewBox="0 0 150 100" aria-hidden="true"><path class="shop-fill" d="M18 39h114v49H18Z"/><path d="M18 39h114v49H18Z"/><path d="M28 39c5-20 22-31 47-31s42 11 47 31"/><path d="M31 39c4 7 15 7 19 0 4 7 15 7 19 0 4 7 15 7 19 0 4 7 15 7 19 0 4 7 15 7 19 0"/><path d="M42 88V62h27v26M87 61h26M87 73h26"/><path d="M52 25c12-7 34-7 46 0"/><path d="M35 55c9-7 23-6 31 0M82 53c7-6 18-5 25 0"/><path d="M116 16l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/></svg>',
  },
];
const legacyStickerMap = {
  "🌷": "pear",
  "🍓": "strawberry",
  "🫧": "latte",
  "🎀": "croissant",
  "⭐": "toast",
  "🍒": "cherry",
  "🌙": "espresso",
  "🩰": "baguette",
  "🪞": "pour-over",
  "💌": "latte",
  "🧸": "toast",
  "🌼": "pear",
};
const stickerNames = stickerPool.map((sticker) => sticker.name);
let stickerCollection = Array.isArray(state.stickers)
  ? state.stickers.map((sticker) => legacyStickerMap[sticker] || sticker).filter((sticker) => stickerNames.includes(sticker))
  : [];

const defaultDailyHtml = (date) => `
  <div class="piece-task-group">
    <button class="delete-button floating-delete" type="button" data-delete-task-block aria-label="Delete piece block">×</button>
    <input type="search" class="piece-input" data-piece-select list="piece-name-options" placeholder="Choose piece" autocomplete="off" aria-label="Select piece for daily task" />
    <div class="piece-task-list">
      <div class="task-line"><input type="checkbox" /> <input type="text" data-task-input placeholder="Type task" /><button class="delete-button" type="button" data-delete-task aria-label="Delete task">×</button></div>
    </div>
    <button class="text-button mini-link" type="button" data-add-piece-task>+ Task</button>
    <div class="practice-notes">
      <label><span>Reflect</span><textarea data-reflect-input placeholder="What changed today?"></textarea></label>
      <label><span>Next time</span><textarea data-next-input placeholder="Where should I begin next?"></textarea></label>
    </div>
  </div>
  <div class="piece-task-group">
    <button class="delete-button floating-delete" type="button" data-delete-task-block aria-label="Delete piece block">×</button>
    <input type="search" class="piece-input" data-piece-select list="piece-name-options" placeholder="Choose piece" autocomplete="off" aria-label="Select another piece for daily task" />
    <div class="piece-task-list">
      <div class="task-line"><input type="checkbox" /> <input type="text" data-task-input placeholder="Type task" /><button class="delete-button" type="button" data-delete-task aria-label="Delete task">×</button></div>
    </div>
    <button class="text-button mini-link" type="button" data-add-piece-task>+ Task</button>
    <div class="practice-notes">
      <label><span>Reflect</span><textarea data-reflect-input placeholder="What changed today?"></textarea></label>
      <label><span>Next time</span><textarea data-next-input placeholder="Where should I begin next?"></textarea></label>
    </div>
  </div>
`;

const getDailyStore = () => ({ ...(state.daily || {}) });
let dailyStore = getDailyStore();

const serializeDaily = () => ({
  html: dailyScope?.innerHTML || "",
  taskValues: [...(dailyScope?.querySelectorAll("[data-task-input]") || [])].map(
    (input) => input.value,
  ),
  reflectValues: [...(dailyScope?.querySelectorAll("[data-reflect-input]") || [])].map(
    (input) => input.value,
  ),
  nextValues: [...(dailyScope?.querySelectorAll("[data-next-input]") || [])].map(
    (input) => input.value,
  ),
  pieceValues: getPieceSelects().map((select) => select.value),
  checks: [...(dailyScope?.querySelectorAll('input[type="checkbox"]') || [])].map(
    (checkbox) => checkbox.checked,
  ),
  focusSeconds: dailyStore[currentDate]?.focusSeconds || 0,
  stickerName: dailyStore[currentDate]?.stickerName || "",
});

const getPieceSelects = () => [...document.querySelectorAll("[data-piece-select]")];

const getDailyListeningPiece = () => {
  const now = new Date();
  const daySeed = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  return dailyListeningPieces[daySeed % dailyListeningPieces.length];
};

const todayListening = getDailyListeningPiece();
let activeListening = todayListening;
let playerTimer = null;
let fallbackTimer = null;
let journeyIntroTimer = null;

const getListeningNarration = () =>
  `Before you practice, take a small listening pause. Today, we are listening to ${activeListening.title} by ${activeListening.composer}. This piece is in the ${activeListening.category} world. ${activeListening.note} Try not to analyze too quickly. First, notice the color, the breathing, and where the music seems to lean forward or rest. Then bring one tiny idea from this listening into your own practice today.`;

const animateJourneyHeading = () => {
  const heading = document.querySelector(".journey-heading");
  if (!heading || !listeningGate) return;
  const text = "Start today’s music journey";
  heading.innerHTML = [...text]
    .map((character, index) => {
      if (character === " ") {
        return `<span class="space" style="--letter-index:${index}"></span>`;
      }
      return `<span class="letter" style="--letter-index:${index}">${escapeHtml(character)}</span>`;
    })
    .join("");
  window.clearTimeout(journeyIntroTimer);
  listeningGate.classList.add("is-intro");
  listeningGate.classList.remove("is-ready");
  journeyIntroTimer = window.setTimeout(() => {
    listeningGate.classList.remove("is-intro");
    listeningGate.classList.add("is-turning");
    window.setTimeout(() => {
      listeningGate.classList.remove("is-turning");
      listeningGate.classList.add("is-ready");
    }, 1400);
  }, text.length * 52 + 760);
};

const openSpotifyForActivePiece = () => {
  if (!activeListening?.spotifyUrl) return;
  stopListeningPlayback();
  if (playerStatus) playerStatus.textContent = "opening spotify";
  listeningGate?.classList.add("is-playing");
  window.setTimeout(() => {
    listeningGate?.classList.remove("is-playing");
    if (playerStatus) playerStatus.textContent = "ready";
  }, 900);
  window.open(activeListening.spotifyUrl, "_blank", "noopener,noreferrer");
};

const stopListeningPlayback = () => {
  window.clearInterval(playerTimer);
  window.clearTimeout(fallbackTimer);
  if (listeningAudio) {
    listeningAudio.pause();
    listeningAudio.currentTime = 0;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (playerStatus) playerStatus.textContent = "ready";
  if (playerTime) playerTime.textContent = "00:00";
  listeningGate?.classList.remove("is-playing", "is-speaking");
};

const updateAudioTime = () => {
  if (!listeningAudio || !Number.isFinite(listeningAudio.duration)) return;
  if (playerTime) playerTime.textContent = formatTime(Math.floor(listeningAudio.currentTime));
  const progress = Math.min((listeningAudio.currentTime / listeningAudio.duration) * 100, 100);
  listeningGate?.style.setProperty("--audio-progress", `${progress}%`);
};

const renderListeningPiece = (piece) => {
  stopListeningPlayback();
  activeListening = piece;
  if (listeningTitle) listeningTitle.textContent = piece.title;
  if (listeningComposer) listeningComposer.textContent = `${piece.composer} · ${piece.category}`;
  if (listeningSubtitle) listeningSubtitle.textContent = "Select voice note to hear the introduction.";
  if (playerStatus) playerStatus.textContent = "ready";
  if (playerTime) playerTime.textContent = "00:00";
  if (listeningAudio) {
    listeningAudio.src = piece.audioUrl || "";
    listeningAudio.load();
  }
  listeningGate?.style.setProperty("--audio-progress", "0%");
  listeningGate?.classList.remove("is-playing", "is-speaking");
  if (recordTitle) recordTitle.textContent = piece.title;
  if (recordComposer) recordComposer.textContent = piece.composer;
  if (listeningPreview) {
    listeningPreview.innerHTML = `
      <p class="eyebrow">piece note</p>
      <h2>${escapeHtml(piece.title)}</h2>
      <span>${escapeHtml(piece.composer)} · ${escapeHtml(piece.category)}</span>
      <p>${escapeHtml(piece.note)}</p>
      <a class="spotify-preview-link" href="${escapeHtml(piece.spotifyUrl)}" target="_blank" rel="noreferrer">Open matching Spotify results</a>
    `;
  }
  listeningBrowser?.querySelectorAll("[data-listening-index]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.listeningIndex) === dailyListeningPieces.indexOf(piece));
  });
};

const renderListeningBrowser = () => {
  if (!listeningBrowser) return;
  const grouped = dailyListeningPieces.reduce((group, piece, index) => {
    group[piece.composer] ||= {};
    group[piece.composer][piece.category] ||= [];
    group[piece.composer][piece.category].push({ ...piece, index });
    return group;
  }, {});

  listeningBrowser.innerHTML = Object.entries(grouped)
    .map(
      ([composer, categories]) => `
        <details open>
          <summary>${composer}</summary>
          ${Object.entries(categories)
            .map(
              ([category, pieces]) => `
                <div class="listening-category">
                  <span>${category}</span>
                  ${pieces
                    .map(
                      (piece) =>
                        `<button type="button" data-listening-index="${piece.index}">${piece.title}</button>`,
                    )
                    .join("")}
                </div>
              `,
            )
            .join("")}
        </details>
      `,
    )
    .join("");
};

const setupDailyListening = () => {
  if (!listeningGate) return;
  renderListeningBrowser();
  renderListeningPiece(todayListening);
  document.body.classList.add("listening-open");
  animateJourneyHeading();
};

const closeListeningGate = () => {
  stopListeningPlayback();
  listeningGate?.classList.add("is-closed");
  document.body.classList.remove("listening-open");
};

const openListeningGate = () => {
  listeningGate?.classList.remove("is-closed");
  document.body.classList.add("listening-open");
  stopListeningPlayback();
  animateJourneyHeading();
};

const playListeningMotif = () => {
  if (listeningGate?.classList.contains("is-playing")) {
    stopListeningPlayback();
    return;
  }
  if (listeningAudio && activeListening.audioUrl) {
    stopListeningPlayback();
    listeningAudio.src = activeListening.audioUrl;
    listeningAudio.currentTime = 0;
    const playPromise = listeningAudio.play();
    if (playerStatus) playerStatus.textContent = "listening";
    listeningGate?.classList.add("is-playing");
    playPromise
      ?.then(() => {
        updateAudioTime();
        playerTimer = window.setInterval(updateAudioTime, 250);
      })
      .catch(() => {
        listeningGate?.classList.remove("is-playing");
        playListeningMotifFallback();
      });
    return;
  }
  playListeningMotifFallback();
};

const playListeningMotifFallback = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  if (playerStatus) playerStatus.textContent = "now playing";
  if (playerTime) playerTime.textContent = "00:00";
  listeningGate?.classList.add("is-playing");
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, context.currentTime);
  master.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.08);
  master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 4.2);
  master.connect(context.destination);

  activeListening.motif.forEach((frequency, index) => {
    const start = context.currentTime + index * 0.52;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.48);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + 0.5);
  });
  fallbackTimer = window.setTimeout(() => {
    if (playerTime) playerTime.textContent = "00:02";
  }, 2000);
  fallbackTimer = window.setTimeout(() => {
    if (playerStatus) playerStatus.textContent = "ready";
    if (playerTime) playerTime.textContent = "00:04";
    listeningGate?.classList.remove("is-playing");
  }, 4300);
};

const playListeningNarration = () => {
  if (!("speechSynthesis" in window)) return;
  if (listeningGate?.classList.contains("is-speaking")) {
    stopListeningPlayback();
    return;
  }
  if (listeningAudio) listeningAudio.pause();
  window.clearInterval(playerTimer);
  window.speechSynthesis.cancel();
  const narration = getListeningNarration();
  if (listeningSubtitle) listeningSubtitle.textContent = narration;
  if (playerStatus) playerStatus.textContent = "reading";
  if (playerTime) playerTime.textContent = "voice";
  listeningGate?.classList.add("is-speaking");
  const utterance = new SpeechSynthesisUtterance(narration);
  utterance.rate = 0.88;
  utterance.pitch = 0.96;
  utterance.onend = () => {
    if (playerStatus) playerStatus.textContent = "ready";
    if (playerTime) playerTime.textContent = "00:00";
    listeningGate?.classList.remove("is-speaking");
  };
  window.speechSynthesis.speak(utterance);
};

const saveState = () => {
  const checkboxes = [...document.querySelectorAll('input[type="checkbox"]')].map(
    (checkbox) => checkbox.checked,
  );
  const details = [...document.querySelectorAll("details")].map((item) => item.open);
  const editable = [...document.querySelectorAll('[contenteditable="true"]')].map(
    (item) => item.textContent,
  );
  const pieceNames = [...document.querySelectorAll("[data-piece-name]")].map(
    (input) => input.value,
  );
  const goalValues = [...document.querySelectorAll("[data-goal-input]")].map(
    (input) => input.value,
  );
  const goalDescValues = [...document.querySelectorAll("[data-goal-desc]")].map(
    (input) => input.value,
  );

  localStorage.setItem(
    storageKey,
    JSON.stringify({
      checkboxes,
      details,
      editable,
      pieceNames,
      goalValues,
      goalDescValues,
      stickers: stickerCollection,
      currentDate,
      selectedPieces: getPieceSelects().map((select) => select.value),
      daily: dailyStore,
      html: {
        planList: planList?.innerHTML || "",
        pieceList: pieceList?.innerHTML || "",
        ideasList: ideasList?.innerHTML || "",
      },
    }),
  );
};

if (pieceGroupNamesChanged) saveState();

const updateDailyProgress = () => {
  const boxes = [...(dailyScope?.querySelectorAll('input[type="checkbox"]') || [])];
  const done = boxes.filter((box) => box.checked).length;
  const percent = boxes.length ? Math.round((done / boxes.length) * 100) : 0;

  if (dailyPercent) dailyPercent.textContent = `${percent}%`;
  if (dailyBar) dailyBar.style.width = `${percent}%`;
  updateStickerCollection();
  renderDailySticker();
  renderPracticeArchive();
};

const formatFocusDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
};

const escapeHtml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const getDailySummary = (day = {}) => {
  const taskValues = Array.isArray(day.taskValues) ? day.taskValues : [];
  const checks = Array.isArray(day.checks) ? day.checks : [];
  const pieces = Array.isArray(day.pieceValues) ? day.pieceValues : [];
  const reflects = Array.isArray(day.reflectValues) ? day.reflectValues : [];
  const nexts = Array.isArray(day.nextValues) ? day.nextValues : [];
  const tasks = taskValues
    .map((task, index) => ({
      task: task.trim(),
      done: Boolean(checks[index]),
    }))
    .filter((item) => item.task || item.done);
  const doneCount = tasks.filter((task) => task.done).length;
  const hasRecord = Boolean(
    tasks.length ||
      pieces.filter(Boolean).length ||
      reflects.filter(Boolean).length ||
      nexts.filter(Boolean).length ||
      day.focusSeconds ||
      day.stickerName,
  );

  return {
    tasks,
    hasRecord,
    doneCount,
    taskCount: tasks.length,
    pieces: pieces.filter(Boolean),
    reflect: reflects.filter(Boolean).join("\n"),
    next: nexts.filter(Boolean).join("\n"),
    focusSeconds: day.focusSeconds || 0,
    stickerName: day.stickerName || "",
  };
};

const renderPracticeArchive = () => {
  if (!practiceArchive) return;
  const summary = getDailySummary(dailyStore[currentDate] || serializeDaily());
  if (!summary.hasRecord) {
    practiceArchive.innerHTML = `
      <div class="archive-header">
        <span>${escapeHtml(currentDate)}</span>
        <strong>No record</strong>
      </div>
    `;
    return;
  }
  const taskList = summary.tasks.length
    ? summary.tasks
        .map(
          (item) =>
            `<li class="${item.done ? "is-done" : ""}"><span>${item.done ? "done" : "open"}</span>${escapeHtml(item.task)}</li>`,
        )
        .join("")
    : '<li><span>open</span>未记录 task</li>';

  practiceArchive.innerHTML = `
    <div class="archive-header">
      <span>${escapeHtml(currentDate)}</span>
      <strong>${summary.doneCount}/${summary.taskCount || 0}</strong>
    </div>
    <div class="archive-meta">
      <span>${formatFocusDuration(summary.focusSeconds)} focus</span>
      <span>${summary.pieces.length ? escapeHtml(summary.pieces.join(", ")) : "no piece selected"}</span>
    </div>
    <div class="archive-sticker">
      <span>Sticker</span>
      <strong>${summary.stickerName ? renderSticker(summary.stickerName) : "Not collected yet"}</strong>
    </div>
    <ul>${taskList}</ul>
    <div class="archive-notes">
      <p><b>Reflect</b>${summary.reflect ? escapeHtml(summary.reflect) : "Empty"}</p>
      <p><b>Next time</b>${summary.next ? escapeHtml(summary.next) : "Empty"}</p>
    </div>
  `;
};

const statTotal = document.querySelector("[data-stat-total]");
const statStreak = document.querySelector("[data-stat-streak]");
const statDays = document.querySelector("[data-stat-days]");
const statsPieceList = document.querySelector("[data-stats-piece-list]");
const mascotMessage = document.querySelector("[data-mascot-message]");

const getPracticeStats = () => {
  const dayButtons = [...(calendar?.querySelectorAll("button") || [])];
  const days = dayButtons.map((button) => {
    const date = `July ${button.textContent.trim()}`;
    const raw = date === currentDate ? dailyStore[currentDate] || serializeDaily() : dailyStore[date];
    const summary = getDailySummary(raw || {});
    return { date, seconds: summary.focusSeconds, pieces: summary.pieces };
  });

  const totalSeconds = days.reduce((sum, day) => sum + day.seconds, 0);
  const practicedDays = days.filter((day) => day.seconds > 0).length;

  const todayIndex = days.findIndex((day) => day.date === currentDate);
  let streak = 0;
  if (todayIndex !== -1) {
    for (let i = todayIndex; i >= 0; i -= 1) {
      if (days[i].seconds > 0) streak += 1;
      else break;
    }
  }

  const pieceCounts = {};
  days.forEach((day) => {
    day.pieces.forEach((piece) => {
      if (!piece) return;
      pieceCounts[piece] = (pieceCounts[piece] || 0) + 1;
    });
  });
  const pieceRanking = Object.entries(pieceCounts).sort((a, b) => b[1] - a[1]);

  return { days, totalSeconds, practicedDays, streak, pieceRanking };
};

const renderStatsPage = () => {
  if (!statTotal && !statStreak && !statDays) return;
  const { totalSeconds, practicedDays, streak, pieceRanking } = getPracticeStats();

  if (statTotal) statTotal.textContent = formatFocusDuration(totalSeconds);
  if (statStreak) statStreak.textContent = `${streak} day${streak === 1 ? "" : "s"}`;
  if (statDays) statDays.textContent = String(practicedDays);

  if (statsPieceList) {
    if (!pieceRanking.length) {
      statsPieceList.innerHTML = `<li class="stats-pieces-empty">No record</li>`;
    } else {
      statsPieceList.innerHTML = pieceRanking
        .slice(0, 6)
        .map(
          ([piece, count]) => `
            <li>
              <span>${escapeHtml(piece)}</span>
              <span class="stats-piece-count">${count} day${count === 1 ? "" : "s"}</span>
            </li>
          `,
        )
        .join("");
    }
  }

  if (mascotMessage) {
    if (streak >= 3) {
      mascotMessage.textContent = `${streak} days in a row — you're on a roll!`;
    } else if (streak === 2) {
      mascotMessage.textContent = "Two days running, nice rhythm.";
    } else if (streak === 1) {
      mascotMessage.textContent = "Day one — every streak starts somewhere.";
    } else {
      mascotMessage.textContent = "No streak yet — a quick session today would start one.";
    }
  }
};

const updateFocusTotal = () => {
  if (focusTotal) {
    focusTotal.textContent = formatFocusDuration(dailyStore[currentDate]?.focusSeconds || 0);
  }
  renderWeekStats();
  renderStatsPage();
  renderPieceFreshness();
};

const renderWeekStats = () => {
  if (!weekStats) return;
  const dayButtons = [...(calendar?.querySelectorAll("button") || [])];
  const days = dayButtons.map((button) => {
    const date = `July ${button.textContent.trim()}`;
    return { date, seconds: dailyStore[date]?.focusSeconds || 0 };
  });
  const totalSeconds = days.reduce((sum, day) => sum + day.seconds, 0);
  const maxSeconds = Math.max(...days.map((day) => day.seconds), 1);
  const practicedDays = days.filter((day) => day.seconds > 0).length;

  if (!totalSeconds) {
    weekStats.innerHTML = `
      <div class="week-stats-empty">No record</div>
    `;
    return;
  }

  const bars = days
    .map((day) => {
      const dayNumber = day.date.replace("July ", "");
      const heightPercent = Math.round((day.seconds / maxSeconds) * 100);
      const isToday = day.date === currentDate;
      return `
        <div class="week-bar-col${isToday ? " is-today" : ""}" title="${escapeHtml(day.date)}: ${formatFocusDuration(day.seconds)}">
          <div class="week-bar-track">
            <div class="week-bar-fill" style="height:${day.seconds ? Math.max(heightPercent, 6) : 0}%"></div>
          </div>
          <span class="week-bar-day">${escapeHtml(dayNumber)}</span>
        </div>
      `;
    })
    .join("");

  weekStats.innerHTML = `
    <div class="week-stats-summary">
      <span>${formatFocusDuration(totalSeconds)} total &middot; ${practicedDays} day${practicedDays === 1 ? "" : "s"} practiced</span>
    </div>
    <div class="week-bars">${bars}</div>
  `;
};

const normalizeRoute = (route) => {
  const cleanRoute = (route || "dashboard").replace("#", "");
  return [...pageCards].some((card) => card.dataset.page === cleanRoute) ? cleanRoute : "dashboard";
};

const setRoute = (route, shouldPush = true) => {
  currentRoute = normalizeRoute(route);
  dashboardShell?.classList.add("is-paged");
  if (dashboardShell) dashboardShell.dataset.route = currentRoute;
  pageCards.forEach((card) => {
    card.classList.toggle("is-current-page", card.dataset.page === currentRoute);
  });
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentRoute}`);
  });
  if (shouldPush && window.location.hash !== `#${currentRoute}`) {
    history.pushState(null, "", `#${currentRoute}`);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const isCompletedPracticeDay = (day) =>
  Array.isArray(day?.checks) && day.checks.length > 0 && day.checks.every(Boolean);

const getCompletedDayCount = () =>
  Object.values(dailyStore).filter(isCompletedPracticeDay).length;

const pickSticker = () => {
  const uncollected = stickerPool.filter((sticker) => !stickerCollection.includes(sticker.name));
  const source = uncollected.length ? uncollected : stickerPool;
  return source[Math.floor(Math.random() * source.length)].name;
};

const getSticker = (name) => stickerPool.find((sticker) => sticker.name === name);

const renderSticker = (name) => getSticker(name)?.svg || "";

const ensureDailySticker = (date) => {
  const day = dailyStore[date];
  if (!isCompletedPracticeDay(day)) return "";
  if (!day.stickerName || !getSticker(day.stickerName)) {
    day.stickerName = pickSticker();
  }
  return day.stickerName;
};

const renderDailySticker = () => {
  if (!dailySticker) return;
  const stickerName = ensureDailySticker(currentDate);
  if (!stickerName) {
    dailySticker.classList.remove("has-sticker");
    dailySticker.innerHTML = "<span>Today’s sticker</span><strong>complete all tasks to collect</strong>";
    return;
  }
  const sticker = getSticker(stickerName);
  dailySticker.classList.add("has-sticker");
  dailySticker.innerHTML = `
    <span>Today’s sticker</span>
    <strong>${renderSticker(stickerName)}<em>${escapeHtml(sticker?.label || "Collected")}</em></strong>
  `;
};

const renderStickerSlot = (name) => {
  const sticker = getSticker(name);
  return `<span class="${sticker ? "sticker-item" : "sticker-empty"}" title="${sticker?.label || ""}">${sticker ? sticker.svg : ""}</span>`;
};

const stickersPerShop = 7;

const updateStickerCollection = () => {
  if (!stickerShelf) return;
  const completedEntries = Object.entries(dailyStore).filter(([, day]) => isCompletedPracticeDay(day));
  completedEntries.forEach(([date]) => ensureDailySticker(date));
  stickerCollection = completedEntries
    .map(([, day]) => day.stickerName)
    .filter((name) => getSticker(name));

  const completedDays = completedEntries.length;
  while (stickerCollection.length < completedDays) stickerCollection.push(pickSticker());

  const visibleSlots = Math.max(stickersPerShop, Math.ceil(Math.max(stickerCollection.length, 1) / stickersPerShop) * stickersPerShop);
  stickerShelf.innerHTML = Array.from({ length: visibleSlots }, (_, index) =>
    renderStickerSlot(stickerCollection[index] || ""),
  ).join("");

  if (shopCollection) {
    shopCollection.innerHTML = stickerCategories
      .map((category, index) => {
        const required = (index + 1) * stickersPerShop;
        const unlocked = stickerCollection.length >= required;
        return `
          <article class="shop-card ${unlocked ? "is-unlocked" : ""}">
            <div class="shop-art">${unlocked ? category.shopSvg : ""}</div>
            <span>${unlocked ? category.shopName : `${Math.max(required - stickerCollection.length, 0)} stickers to next shop`}</span>
          </article>
        `;
      })
      .join("");
  }

  if (stickerCaption) {
    stickerCaption.textContent = stickerCollection.length
      ? `${stickerCollection.length} sticker${stickerCollection.length > 1 ? "s" : ""} collected · next shop at ${Math.ceil((stickerCollection.length + 1) / stickersPerShop) * stickersPerShop}`
      : "stickers waiting";
  }
};

const bindCheckbox = (checkbox) => {
  checkbox.addEventListener("change", () => {
    const completedBefore = isCompletedPracticeDay(dailyStore[currentDate]);
    saveCurrentDaily();
    updateDailyProgress();
    if (!completedBefore && isCompletedPracticeDay(dailyStore[currentDate])) {
      showCompletionToast();
    }
    saveState();
  });
};

const showCompletionToast = () => {
  if (!completionToast) return;
  const stickerName = ensureDailySticker(currentDate);
  const sticker = getSticker(stickerName);
  completionToast.innerHTML = `${stickerName ? renderSticker(stickerName) : ""}<span>${sticker?.label || "sticker"} collected</span>`;
  completionToast.classList.remove("is-open");
  window.requestAnimationFrame(() => {
    completionToast.classList.add("is-open");
    completionToast.setAttribute("aria-hidden", "false");
  });
  window.setTimeout(() => {
    completionToast.classList.remove("is-open");
    completionToast.setAttribute("aria-hidden", "true");
  }, 1900);
};

const bindEditable = (item) => {
  item.addEventListener("input", () => {
    updatePieceOptions();
    saveCurrentDaily();
    saveState();
  });
};

const addPieceTaskLine = (groupEl, focusNew = false) => {
  const target = groupEl?.querySelector(".piece-task-list");
  const item = document.createElement("div");
  item.className = "task-line";
  item.innerHTML = '<input type="checkbox" /> <input type="text" data-task-input placeholder="Type task" /><button class="delete-button" type="button" data-delete-task aria-label="Delete task">×</button>';
  bindCheckbox(item.querySelector("input"));
  const newInput = item.querySelector("[data-task-input]");
  bindTaskInput(newInput);
  bindFormatTarget(newInput);
  target?.appendChild(item);
  updateDailyProgress();
  saveCurrentDaily();
  saveState();
  if (focusNew) newInput?.focus();
  return newInput;
};

const bindTaskInput = (item) => {
  item.addEventListener("input", () => {
    saveCurrentDaily();
    saveState();
  });
  if (item.hasAttribute("data-task-input")) {
    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      const group = item.closest(".piece-task-group");
      if (group) addPieceTaskLine(group, true);
    });
  }
};

const bindTextInput = (item) => {
  if (!item) return;
  item.addEventListener("input", saveState);
};

const bindPieceNameInput = (item) => {
  item.addEventListener("input", () => {
    updatePieceOptions();
    saveState();
  });
};

const formatTargetSelector = [
  '[contenteditable="true"]',
  'input[type="text"]',
  "textarea",
].join(",");
const textColorClasses = ["text-color-berry", "text-color-brown", "text-color-blue"];
const colorClassMap = {
  berry: "text-color-berry",
  brown: "text-color-brown",
  blue: "text-color-blue",
};

const isFormatTarget = (item) =>
  item?.matches?.(formatTargetSelector) && !item.closest(".text-format-toolbar");

const saveFormattedTarget = (item) => {
  if (!item) return;
  if (dailyScope?.contains(item)) saveCurrentDaily();
  if (pieceList?.contains(item)) updatePieceOptions();
  saveState();
};

const refreshToolbarState = () => {
  if (!activeFormatTarget || !formatToolbar) return;
  formatStyleButtons.forEach((button) => {
    const style = button.dataset.formatStyle;
    button.classList.toggle("is-active", activeFormatTarget.classList.contains(`formatted-${style}`));
  });
  formatColorButtons.forEach((button) => {
    const color = button.dataset.formatColor;
    const activeColor = colorClassMap[color];
    button.classList.toggle("is-active", Boolean(activeColor && activeFormatTarget.classList.contains(activeColor)));
  });
};

const hasSelectionInside = (item) => {
  const selection = window.getSelection?.();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed || !item?.isContentEditable) {
    return false;
  }
  const range = selection.getRangeAt(0);
  return item.contains(range.commonAncestorContainer);
};

const applySelectionCommand = (item, command, value = null) => {
  if (!hasSelectionInside(item)) return false;
  item.focus();
  document.execCommand(command, false, value);
  saveFormattedTarget(item);
  return true;
};

const showFormatToolbar = (item) => {
  if (!formatToolbar || !isFormatTarget(item)) return;
  activeFormatTarget = item;
  item.classList.add("format-target");
  const rect = item.getBoundingClientRect();
  const top = Math.max(10, rect.top - 48);
  const left = Math.min(window.innerWidth - 250, Math.max(10, rect.left));
  formatToolbar.style.top = `${top}px`;
  formatToolbar.style.left = `${left}px`;
  formatToolbar.classList.add("is-open");
  formatToolbar.setAttribute("aria-hidden", "false");
  refreshToolbarState();
};

const hideFormatToolbar = () => {
  if (!formatToolbar) return;
  formatToolbar.classList.remove("is-open");
  formatToolbar.setAttribute("aria-hidden", "true");
};

const bindFormatTarget = (item) => {
  if (!item || item.dataset.formatBound) return;
  item.dataset.formatBound = "true";
  item.classList.add("format-target");
  item.addEventListener("focus", () => showFormatToolbar(item));
  item.addEventListener("click", () => showFormatToolbar(item));
  item.addEventListener("input", () => saveFormattedTarget(item));
};

const getPreviousNextNoteForPiece = (pieceName) => {
  if (!pieceName) return "";
  const currentDayNum = Number(currentDate.replace("July ", ""));
  const priorDays = [...(calendar?.querySelectorAll("button") || [])]
    .map((button) => Number(button.textContent.trim()))
    .filter((dayNum) => dayNum < currentDayNum)
    .sort((a, b) => b - a);
  for (const dayNum of priorDays) {
    const day = dailyStore[`July ${dayNum}`];
    if (!day) continue;
    const pieces = Array.isArray(day.pieceValues) ? day.pieceValues : [];
    const nexts = Array.isArray(day.nextValues) ? day.nextValues : [];
    const idx = pieces.findIndex((piece) => piece === pieceName);
    if (idx !== -1 && nexts[idx]?.trim()) return nexts[idx].trim();
  }
  return "";
};

const applyNextTimeHints = () => {
  dailyScope?.querySelectorAll(".piece-task-group").forEach((group) => {
    const pieceInput = group.querySelector("[data-piece-select]");
    const nextInput = group.querySelector("[data-next-input]");
    if (!pieceInput || !nextInput) return;
    const hint = getPreviousNextNoteForPiece(pieceInput.value.trim());
    nextInput.placeholder = hint ? `Last time: ${hint}` : "Where should I begin next?";
  });
};

const bindPieceSelect = () => {
  getPieceSelects().forEach((select) => {
    if (select.dataset.bound) return;
    select.dataset.bound = "true";
    select.addEventListener("change", () => {
      saveCurrentDaily();
      saveState();
      applyNextTimeHints();
    });
  });
};

const addDeleteButton = (item, selector, label, floating = false) => {
  if (!item || item.querySelector(selector)) return;
  const button = document.createElement("button");
  button.className = `delete-button${floating ? " floating-delete" : ""}`;
  button.type = "button";
  button.setAttribute(selector.slice(1, -1), "");
  button.setAttribute("aria-label", label);
  button.textContent = "×";
  item.appendChild(button);
};

const ensurePracticeNotes = () => {
  let changed = false;
  document.querySelectorAll(".piece-task-group").forEach((group) => {
    if (group.querySelector(".practice-notes")) return;
    const notes = document.createElement("div");
    notes.className = "practice-notes";
    notes.innerHTML = `
      <label><span>Reflect</span><textarea data-reflect-input placeholder="What changed today?"></textarea></label>
      <label><span>Next time</span><textarea data-next-input placeholder="Where should I begin next?"></textarea></label>
    `;
    group.appendChild(notes);
    changed = true;
  });
  return changed;
};

const ensureGoalDescriptionFields = () => {
  let changed = false;
  document.querySelectorAll(".goal-item").forEach((item) => {
    item.querySelectorAll('.goal-line input[type="checkbox"], .nested-detail input[type="checkbox"]').forEach((checkbox) => {
      checkbox.remove();
      changed = true;
    });
    item.querySelectorAll(".nested-detail input[data-goal-input]").forEach((input) => {
      const description = document.createElement("textarea");
      description.dataset.goalDesc = "";
      description.placeholder = "Detailed description";
      description.value = input.value;
      input.replaceWith(description);
      changed = true;
    });
    const goalLine = item.querySelector(".goal-line");
    if (goalLine && !item.querySelector("[data-goal-desc]")) {
      const description = document.createElement("textarea");
      description.className = "goal-description";
      description.dataset.goalDesc = "";
      description.placeholder = "Detailed description";
      goalLine.insertAdjacentElement("afterend", description);
      changed = true;
    }
  });
  return changed;
};

const ensureDeleteButtons = () => {
  const notesChanged = ensurePracticeNotes();
  const goalsChanged = ensureGoalDescriptionFields();
  document.querySelectorAll(".piece-task-group").forEach((item) => {
    addDeleteButton(item, "[data-delete-task-block]", "Delete piece block", true);
  });
  document.querySelectorAll(".task-line").forEach((item) => {
    addDeleteButton(item, "[data-delete-task]", "Delete task");
  });
  document.querySelectorAll(".piece-line").forEach((item) => {
    addDeleteButton(item, "[data-delete-piece]", "Delete piece");
  });
  document.querySelectorAll(".idea-row").forEach((item) => {
    addDeleteButton(item, "[data-delete-idea]", "Delete idea");
  });
  document.querySelectorAll(".plan-group > summary").forEach((item) => {
    addDeleteButton(item, "[data-delete-plan]", "Delete category");
  });
  document.querySelectorAll(".goal-item").forEach((item) => {
    addDeleteButton(item, "[data-delete-goal-item]", "Delete subtask", true);
  });
  document.querySelectorAll(".nested-detail").forEach((item) => {
    addDeleteButton(item, "[data-delete-detail]", "Delete detail");
  });
  if (notesChanged) saveCurrentDaily();
  if (goalsChanged) saveState();
};

const rebindDynamicControls = () => {
  ensureDeleteButtons();
  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    if (!checkbox.dataset.bound) {
      checkbox.dataset.bound = "true";
      bindCheckbox(checkbox);
    }
  });
  document.querySelectorAll('[contenteditable="true"]').forEach((item) => {
    if (!item.dataset.bound) {
      item.dataset.bound = "true";
      bindEditable(item);
    }
  });
  document.querySelectorAll("[data-task-input]").forEach((item) => {
    if (!item.dataset.bound) {
      item.dataset.bound = "true";
      bindTaskInput(item);
    }
  });
  document.querySelectorAll("[data-reflect-input], [data-next-input]").forEach((item) => {
    if (!item.dataset.bound) {
      item.dataset.bound = "true";
      bindTaskInput(item);
    }
  });
  document.querySelectorAll("[data-goal-input]").forEach((item) => {
    if (!item.dataset.bound) {
      item.dataset.bound = "true";
      bindTextInput(item);
    }
  });
  document.querySelectorAll("[data-goal-desc]").forEach((item) => {
    if (!item.dataset.bound) {
      item.dataset.bound = "true";
      bindTextInput(item);
    }
  });
  document.querySelectorAll("[data-piece-name]").forEach((item) => {
    if (!item.dataset.bound) {
      item.dataset.bound = "true";
      bindPieceNameInput(item);
    }
  });
  document.querySelectorAll(formatTargetSelector).forEach(bindFormatTarget);
  bindPieceSelect();
};

formatToolbar?.addEventListener("mousedown", (event) => {
  event.preventDefault();
});

formatStyleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!activeFormatTarget) return;
    if (applySelectionCommand(activeFormatTarget, button.dataset.formatStyle)) return;
    activeFormatTarget.classList.toggle(`formatted-${button.dataset.formatStyle}`);
    refreshToolbarState();
    saveFormattedTarget(activeFormatTarget);
    activeFormatTarget.focus?.();
  });
});

formatColorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!activeFormatTarget) return;
    const colorValue = {
      berry: "#9c6b5f",
      brown: "#7d564d",
      blue: "#6f7f86",
      reset: null,
    }[button.dataset.formatColor];
    if (button.dataset.formatColor === "reset" && applySelectionCommand(activeFormatTarget, "removeFormat")) return;
    if (colorValue && applySelectionCommand(activeFormatTarget, "foreColor", colorValue)) return;
    activeFormatTarget.classList.remove(...textColorClasses);
    const colorClass = colorClassMap[button.dataset.formatColor];
    if (colorClass) activeFormatTarget.classList.add(colorClass);
    refreshToolbarState();
    saveFormattedTarget(activeFormatTarget);
    activeFormatTarget.focus?.();
  });
});

document.addEventListener("focusin", (event) => {
  if (isFormatTarget(event.target)) showFormatToolbar(event.target);
});

document.addEventListener("mousedown", (event) => {
  if (formatToolbar?.contains(event.target) || isFormatTarget(event.target)) return;
  hideFormatToolbar();
});

window.addEventListener("resize", () => {
  if (activeFormatTarget && formatToolbar?.classList.contains("is-open")) {
    showFormatToolbar(activeFormatTarget);
  }
});

const getPieceNames = () =>
  [...document.querySelectorAll("[data-piece-name]")]
    .map((item) => (item.value ?? item.textContent ?? "").trim())
    .filter(Boolean);

const getPieceNamesByGroup = () =>
  [...(pieceList?.querySelectorAll(".piece-group") || [])].map((group) => {
    const label = group.querySelector("summary [contenteditable='true']")?.textContent?.trim() || "Pieces";
    const pieces = [...group.querySelectorAll("[data-piece-name]")]
      .map((item) => (item.value ?? item.textContent ?? "").trim())
      .filter(Boolean);
    return { label, pieces };
  });

const STALE_PIECE_DAYS = 7;

const getLastPracticedDayMap = () => {
  const dayButtons = [...(calendar?.querySelectorAll("button") || [])];
  const map = {};
  dayButtons.forEach((button) => {
    const dayNum = Number(button.textContent.trim());
    const date = `July ${dayNum}`;
    const raw = date === currentDate ? dailyStore[currentDate] || serializeDaily() : dailyStore[date];
    const summary = getDailySummary(raw || {});
    summary.pieces.forEach((piece) => {
      if (!piece) return;
      if (!map[piece] || dayNum > map[piece]) map[piece] = dayNum;
    });
  });
  return map;
};

const pieceStatusLabels = { "": "Click to set status", learning: "Learning notes", polishing: "Polishing", ready: "Stage ready" };

const renderPieceFreshness = () => {
  const map = getLastPracticedDayMap();
  const referenceDate = realToday || currentDate;
  const todayNum = Number(referenceDate.replace("July ", ""));
  document.querySelectorAll(".piece-line").forEach((line) => {
    const nameInput = line.querySelector("[data-piece-name]");
    const statusButton = line.querySelector("[data-piece-status]");
    if (!nameInput || !statusButton) return;
    const name = nameInput.value.trim();
    const status = statusButton.dataset.pieceStatus || "";
    let title = pieceStatusLabels[status] || pieceStatusLabels[""];
    const lastDay = name ? map[name] : undefined;
    if (name && lastDay !== undefined && todayNum - lastDay >= STALE_PIECE_DAYS) {
      line.classList.add("is-stale");
      title += ` · not practiced in ${todayNum - lastDay} days`;
    } else {
      line.classList.remove("is-stale");
    }
    statusButton.title = title;
  });
};

function updatePieceOptions() {
  const groups = getPieceNamesByGroup();
  const datalist = document.querySelector("[data-piece-datalist]");
  if (datalist) {
    datalist.innerHTML = "";
    groups.forEach(({ pieces }) => {
      pieces.forEach((piece) => {
        const option = document.createElement("option");
        option.value = piece;
        datalist.appendChild(option);
      });
    });
  }
  getPieceSelects().forEach((pieceSelect, index) => {
    if (!pieceSelect.value && state.selectedPieces?.[index]) {
      pieceSelect.value = state.selectedPieces[index];
    }
  });
  renderPieceFreshness();
}

document.querySelectorAll('input[type="checkbox"]').forEach((checkbox, index) => {
  if (typeof state.checkboxes?.[index] === "boolean") {
    checkbox.checked = state.checkboxes[index];
  }
  checkbox.dataset.bound = "true";
  bindCheckbox(checkbox);
});

document.querySelectorAll("details").forEach((item, index) => {
  if (typeof state.details?.[index] === "boolean") {
    item.open = state.details[index];
  }
  item.addEventListener("toggle", saveState);
});

document.querySelectorAll('[contenteditable="true"]').forEach((item, index) => {
  if (typeof state.editable?.[index] === "string") {
    item.textContent = state.editable[index];
  }
  item.dataset.bound = "true";
  bindEditable(item);
});

document.querySelectorAll("[data-piece-name]").forEach((item) => {
  const index = [...document.querySelectorAll("[data-piece-name]")].indexOf(item);
  if (typeof state.pieceNames?.[index] === "string") {
    item.value = state.pieceNames[index];
  }
  item.dataset.bound = "true";
  bindPieceNameInput(item);
});

document.querySelectorAll("[data-goal-input]").forEach((item, index) => {
  if (typeof state.goalValues?.[index] === "string") {
    item.value = state.goalValues[index];
  }
});

document.querySelectorAll("[data-goal-desc]").forEach((item, index) => {
  if (typeof state.goalDescValues?.[index] === "string") {
    item.value = state.goalDescValues[index];
  }
});

const loadDailyForDate = (date) => {
  currentDate = date;
  if (dateChip) dateChip.textContent = date;
  if (dailyScope) {
    dailyScope.innerHTML = dailyStore[date]?.html || defaultDailyHtml(date);
    dailyStore[date]?.checks?.forEach((checked, index) => {
      const checkbox = dailyScope.querySelectorAll('input[type="checkbox"]')[index];
      if (checkbox) checkbox.checked = checked;
    });
    dailyStore[date]?.taskValues?.forEach((value, index) => {
      const input = dailyScope.querySelectorAll("[data-task-input]")[index];
      if (input) input.value = value;
    });
    dailyStore[date]?.reflectValues?.forEach((value, index) => {
      const input = dailyScope.querySelectorAll("[data-reflect-input]")[index];
      if (input) input.value = value;
    });
    dailyStore[date]?.nextValues?.forEach((value, index) => {
      const input = dailyScope.querySelectorAll("[data-next-input]")[index];
      if (input) input.value = value;
    });
  }
  rebindDynamicControls();
  updatePieceOptions();
  dailyStore[date]?.pieceValues?.forEach((value, index) => {
    const select = getPieceSelects()[index];
    if (select) select.value = value;
  });
  updateDailyProgress();
  updateFocusTotal();
  renderPracticeArchive();
  applyNextTimeHints();
};

const saveCurrentDaily = () => {
  dailyStore[currentDate] = serializeDaily();
};

addTask?.addEventListener("click", () => {
  const item = document.createElement("div");
  item.className = "piece-task-group";
  item.innerHTML = `
    <button class="delete-button floating-delete" type="button" data-delete-task-block aria-label="Delete piece block">×</button>
    <input type="search" class="piece-input" data-piece-select list="piece-name-options" placeholder="Choose piece" autocomplete="off" aria-label="Select piece for daily task" />
    <div class="piece-task-list">
      <div class="task-line"><input type="checkbox" /> <input type="text" data-task-input placeholder="Type task" /><button class="delete-button" type="button" data-delete-task aria-label="Delete task">×</button></div>
    </div>
    <button class="text-button mini-link" type="button" data-add-piece-task>+ Task</button>
    <div class="practice-notes">
      <label><span>Reflect</span><textarea data-reflect-input placeholder="What changed today?"></textarea></label>
      <label><span>Next time</span><textarea data-next-input placeholder="Where should I begin next?"></textarea></label>
    </div>
  `;
  dailyScope?.appendChild(item);
  item.querySelectorAll('input[type="checkbox"]').forEach(bindCheckbox);
  item.querySelectorAll("[data-task-input]").forEach(bindTaskInput);
  item.querySelectorAll("[data-reflect-input], [data-next-input]").forEach(bindTaskInput);
  item.querySelectorAll(formatTargetSelector).forEach(bindFormatTarget);
  bindPieceSelect();
  updatePieceOptions();
  updateDailyProgress();
  saveCurrentDaily();
  saveState();
});

dailyScope?.addEventListener("click", (event) => {
  const deleteTaskBlock = event.target.closest("[data-delete-task-block]");
  if (deleteTaskBlock) {
    deleteTaskBlock.closest(".piece-task-group")?.remove();
    updateDailyProgress();
    saveCurrentDaily();
    saveState();
    return;
  }

  const deleteTask = event.target.closest("[data-delete-task]");
  if (deleteTask) {
    deleteTask.closest(".task-line")?.remove();
    updateDailyProgress();
    saveCurrentDaily();
    saveState();
    return;
  }

  const button = event.target.closest("[data-add-piece-task]");
  if (!button) return;
  addPieceTaskLine(button.closest(".piece-task-group"));
});

planList?.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".delete-button");
  if (deleteButton) {
    event.preventDefault();
    event.stopPropagation();
  }

  const deletePlan = event.target.closest("[data-delete-plan]");
  if (deletePlan) {
    deletePlan.closest(".plan-group")?.remove();
    saveState();
    return;
  }

  const deleteGoalItem = event.target.closest("[data-delete-goal-item]");
  if (deleteGoalItem) {
    deleteGoalItem.closest(".goal-item")?.remove();
    saveState();
    return;
  }

  const deleteDetail = event.target.closest("[data-delete-detail]");
  if (deleteDetail) {
    deleteDetail.closest(".nested-detail")?.remove();
    saveState();
    return;
  }

  const nestedButton = event.target.closest("[data-add-nested-detail]");
  if (nestedButton) {
    const target = nestedButton.closest(".goal-item")?.querySelector(".nested-subtasks");
    const item = document.createElement("div");
    item.className = "nested-detail";
    item.innerHTML = '<textarea data-goal-desc placeholder="Detailed description"></textarea><button class="delete-button" type="button" data-delete-detail aria-label="Delete detail">×</button>';
    bindTextInput(item.querySelector("[data-goal-desc]"));
    bindFormatTarget(item.querySelector("[data-goal-desc]"));
    target?.appendChild(item);
    saveState();
    return;
  }

  const button = event.target.closest("[data-add-subtask]");
  if (!button) return;

  const group = button.closest(".plan-group");
  const subtasks = group?.querySelector(".subtasks");
  const item = document.createElement("div");
  item.className = "goal-item";
  item.innerHTML = `
    <button class="delete-button floating-delete" type="button" data-delete-goal-item aria-label="Delete subtask">×</button>
    <div class="goal-line"><input type="text" data-goal-input placeholder="Type goal detail" /></div>
    <textarea class="goal-description" data-goal-desc placeholder="Detailed description"></textarea>
    <div class="nested-subtasks"></div>
    <button class="text-button mini-link" type="button" data-add-nested-detail>+ Detail</button>
  `;
  item.querySelectorAll("[data-goal-input]").forEach(bindTextInput);
  item.querySelectorAll("[data-goal-desc]").forEach(bindTextInput);
  item.querySelectorAll(formatTargetSelector).forEach(bindFormatTarget);
  subtasks?.appendChild(item);
  saveState();
});

addPlan?.addEventListener("click", () => {
  const group = document.createElement("details");
  group.className = "plan-group";
  group.open = true;
  group.innerHTML = `
    <summary>
      <span class="chevron">›</span>
      <span contenteditable="true"></span>
      <small>click to edit</small>
      <button class="delete-button" type="button" data-delete-plan aria-label="Delete category">×</button>
    </summary>
    <div class="subtasks">
      <div class="goal-item">
        <button class="delete-button floating-delete" type="button" data-delete-goal-item aria-label="Delete subtask">×</button>
        <div class="goal-line"><input type="text" data-goal-input placeholder="Type goal detail" /></div>
        <textarea class="goal-description" data-goal-desc placeholder="Detailed description"></textarea>
        <div class="nested-subtasks"></div>
        <button class="text-button mini-link" type="button" data-add-nested-detail>+ Detail</button>
      </div>
    </div>
    <button class="text-button" type="button" data-add-subtask>+ Subtask</button>
  `;
  group.addEventListener("toggle", saveState);
  group.querySelectorAll('[contenteditable="true"]').forEach(bindEditable);
  group.querySelectorAll("[data-goal-input]").forEach(bindTextInput);
  group.querySelectorAll("[data-goal-desc]").forEach(bindTextInput);
  group.querySelectorAll(formatTargetSelector).forEach(bindFormatTarget);
  planList?.appendChild(group);
  saveState();
});

addPieceCategory?.addEventListener("click", () => {
  const group = document.createElement("details");
  group.className = "piece-group";
  group.open = true;
  group.innerHTML = `
    <summary>
      <span class="chevron">›</span>
      <span contenteditable="true">New category</span>
      <button class="delete-button" type="button" data-delete-piece-category aria-label="Delete category">×</button>
    </summary>
    <div class="piece-items">
      <div class="piece-line"><input type="checkbox" /> <input type="text" data-piece-name placeholder="Type piece name" /><button type="button" class="piece-status" data-piece-status="" title="Click to set status"></button><button class="delete-button" type="button" data-delete-piece aria-label="Delete piece">×</button></div>
    </div>
    <button class="text-button" type="button" data-add-piece-to-group>+ Piece</button>
  `;
  group.addEventListener("toggle", saveState);
  group.querySelectorAll('[contenteditable="true"]').forEach(bindEditable);
  const checkbox = group.querySelector('input[type="checkbox"]');
  if (checkbox) bindCheckbox(checkbox);
  group.querySelectorAll("[data-piece-name]").forEach((input) => {
    bindPieceNameInput(input);
    bindFormatTarget(input);
  });
  pieceList?.appendChild(group);
  updatePieceOptions();
  saveState();
});

pieceList?.addEventListener("click", (event) => {
  const statusButton = event.target.closest("[data-piece-status]");
  if (statusButton) {
    const order = ["", "learning", "polishing", "ready"];
    const labels = { "": "Click to set status", learning: "Learning notes", polishing: "Polishing", ready: "Stage ready" };
    const current = statusButton.dataset.pieceStatus || "";
    const next = order[(order.indexOf(current) + 1) % order.length];
    statusButton.dataset.pieceStatus = next;
    statusButton.title = labels[next];
    saveState();
    return;
  }

  const deleteCategory = event.target.closest("[data-delete-piece-category]");
  if (deleteCategory) {
    deleteCategory.closest(".piece-group")?.remove();
    updatePieceOptions();
    saveState();
    return;
  }
  const deletePiece = event.target.closest("[data-delete-piece]");
  if (deletePiece) {
    deletePiece.closest(".piece-line")?.remove();
    updatePieceOptions();
    saveState();
    return;
  }

  const button = event.target.closest("[data-add-piece-to-group]");
  if (!button) return;

  const target = button.closest(".piece-group")?.querySelector(".piece-items");
  const item = document.createElement("div");
  item.className = "piece-line";
  item.innerHTML = '<input type="checkbox" /> <input type="text" data-piece-name placeholder="Type piece name" /><button type="button" class="piece-status" data-piece-status="" title="Click to set status"></button><button class="delete-button" type="button" data-delete-piece aria-label="Delete piece">×</button>';
  bindCheckbox(item.querySelector("input"));
  bindPieceNameInput(item.querySelector("[data-piece-name]"));
  bindFormatTarget(item.querySelector("[data-piece-name]"));
  target?.appendChild(item);
  updatePieceOptions();
  saveState();
});

addIdea?.addEventListener("click", () => {
  const item = document.createElement("div");
  item.className = "idea-row";
  item.innerHTML = '<span contenteditable="true"></span><button class="delete-button" type="button" data-delete-idea aria-label="Delete idea">×</button>';
  bindEditable(item.querySelector('[contenteditable="true"]'));
  bindFormatTarget(item.querySelector('[contenteditable="true"]'));
  ideasList?.appendChild(item);
  saveState();
});

ideasList?.addEventListener("click", (event) => {
  const deleteIdea = event.target.closest("[data-delete-idea]");
  if (!deleteIdea) return;
  deleteIdea.closest(".idea-row")?.remove();
  saveState();
});

bindPieceSelect();

const highlightDailyCard = () => {
  const dailyCard = document.querySelector(".daily-card");
  dailyCard?.scrollIntoView({ behavior: "smooth", block: "start" });
  dailyCard?.classList.add("is-highlighted");
  window.setTimeout(() => dailyCard?.classList.remove("is-highlighted"), 900);
};

const syncCalendarSelection = () => {
  const dayNumber = currentDate.replace("July ", "").trim();
  const todayNumber = realToday ? realToday.replace("July ", "").trim() : null;
  calendar?.querySelectorAll("button").forEach((day) => {
    const label = day.textContent.trim();
    day.classList.toggle("selected", label === dayNumber);
    day.classList.toggle("is-today", label === todayNumber);
  });
};

calendar?.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  saveCurrentDaily();
  loadDailyForDate(`July ${button.textContent.trim()}`);
  syncCalendarSelection();
  saveCurrentDaily();
  saveState();
});

todayTask?.addEventListener("click", () => {
  if (realToday && realToday !== currentDate) {
    saveCurrentDaily();
    loadDailyForDate(realToday);
    syncCalendarSelection();
    saveCurrentDaily();
    saveState();
  }
  setRoute("dashboard");
  highlightDailyCard();
});

const formatTime = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
};

const updateFocusTime = () => {
  const elapsed = Math.floor((Date.now() - focusStartedAt) / 1000);
  if (focusTime) focusTime.textContent = formatTime(elapsed);
};

let dailyCardHome = null;
let dailyCardNext = null;

const moveDailyCardToFocus = () => {
  const dailyCard = document.querySelector(".daily-card");
  if (!dailyCard || !focusTaskMount || focusTaskMount.contains(dailyCard)) return;
  dailyCardHome = dailyCard.parentNode;
  dailyCardNext = dailyCard.nextSibling;
  dailyCard.classList.add("is-in-focus");
  focusTaskMount.appendChild(dailyCard);
};

const restoreDailyCard = () => {
  const dailyCard = focusTaskMount?.querySelector(".daily-card");
  if (!dailyCard || !dailyCardHome) return;
  dailyCard.classList.remove("is-in-focus");
  dailyCardHome.insertBefore(dailyCard, dailyCardNext);
};

const openFocus = () => {
  if (focusRunning) return;
  stopListeningPlayback();
  window.clearInterval(focusTimer);
  focusStartedAt = Date.now();
  focusRunning = true;
  saveCurrentDaily();
  moveDailyCardToFocus();
  focusOverlay?.classList.add("is-open");
  focusOverlay?.classList.remove("is-reviewing");
  focusReview?.setAttribute("aria-hidden", "true");
  exitConfirm?.classList.remove("is-open");
  exitConfirm?.setAttribute("aria-hidden", "true");
  if (focusReflect) focusReflect.value = "";
  if (focusNext) focusNext.value = "";
  focusOverlay?.setAttribute("aria-hidden", "false");
  document.body.classList.add("focus-active");
  if (focusSlider) {
    focusSlider.value = "0";
    updateDeerSlider();
  }
  updateFocusTime();
  focusTimer = window.setInterval(updateFocusTime, 1000);
};

const appendToField = (field, value) => {
  if (!field || !value.trim()) return;
  field.value = field.value.trim() ? `${field.value.trim()}\n${value.trim()}` : value.trim();
  field.dispatchEvent(new Event("input", { bubbles: true }));
};

const openFocusReview = () => {
  window.clearInterval(focusTimer);
  recordFocusSession();
  saveCurrentDaily();
  saveState();
  focusOverlay?.classList.add("is-reviewing");
  focusReview?.setAttribute("aria-hidden", "false");
  focusReflect?.focus();
};

const saveFocusReview = () => {
  appendToField(dailyScope?.querySelector("[data-reflect-input]"), focusReflect?.value || "");
  appendToField(dailyScope?.querySelector("[data-next-input]"), focusNext?.value || "");
  saveCurrentDaily();
  saveState();
  renderPracticeArchive();
  closeFocus();
};

const recordFocusSession = () => {
  if (!focusRunning || !focusStartedAt) return;
  const elapsed = Math.max(Math.floor((Date.now() - focusStartedAt) / 1000), 0);
  dailyStore[currentDate] = {
    ...serializeDaily(),
    focusSeconds: (dailyStore[currentDate]?.focusSeconds || 0) + elapsed,
  };
  focusRunning = false;
  focusStartedAt = 0;
  updateFocusTotal();
};

const updateDeerSlider = () => {
  if (!focusSlider || !phoneLock) return;
  const value = Number(focusSlider.value);
  phoneLock.style.setProperty("--deer-progress", `${value}%`);
  const deer = phoneLock.querySelector(".deer-runner");
  if (deer) {
    const travel = Math.max(phoneLock.clientWidth - 58, 0);
    deer.style.left = `${14 + (travel * value) / 100}px`;
  }
  phoneLock.classList.toggle("is-ready", value >= 96);
  if (sliderStatus) {
    sliderStatus.textContent = value >= 96 ? "ready to focus" : "slide all the way";
  }
};

const showDailyThenFocus = () => {
  setRoute("dashboard");
  const dailyCard = document.querySelector(".daily-card");
  dailyCard?.scrollIntoView({ behavior: "smooth", block: "start" });
  dailyCard?.classList.add("is-highlighted");
  phoneLock?.classList.add("is-highlighted");
  window.setTimeout(() => dailyCard?.classList.remove("is-highlighted"), 900);
  window.setTimeout(() => phoneLock?.classList.remove("is-highlighted"), 1200);
};

const closeFocus = () => {
  window.clearInterval(focusTimer);
  recordFocusSession();
  saveCurrentDaily();
  saveState();
  restoreDailyCard();
  focusOverlay?.classList.remove("is-open");
  focusOverlay?.setAttribute("aria-hidden", "true");
  exitConfirm?.classList.remove("is-open");
  exitConfirm?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("focus-active");
};

practiceButtons.forEach((button) => button.addEventListener("click", showDailyThenFocus));
focusDone?.addEventListener("click", openFocusReview);
focusSaveReview?.addEventListener("click", saveFocusReview);
const exitConfirmCopy = document.querySelector(".exit-confirm-copy");

focusExit?.addEventListener("click", () => {
  if (exitConfirmCopy) {
    const pieces = getDailySummary(dailyStore[currentDate] || serializeDaily()).pieces;
    exitConfirmCopy.textContent = pieces.length
      ? `${pieces[0]} is almost there — your focus time so far is already saved either way.`
      : "Your focus time so far is already saved either way.";
  }
  exitConfirm?.setAttribute("aria-hidden", "false");
  exitConfirm?.classList.add("is-open");
});
exitKeep?.addEventListener("click", () => {
  exitConfirm?.setAttribute("aria-hidden", "true");
  exitConfirm?.classList.remove("is-open");
});
exitLeave?.addEventListener("click", () => {
  exitConfirm?.setAttribute("aria-hidden", "true");
  exitConfirm?.classList.remove("is-open");
  closeFocus();
});
focusSlider?.addEventListener("input", () => {
  updateDeerSlider();
  if (Number(focusSlider.value) >= 96) openFocus();
});

playMusic?.addEventListener("click", playListeningMotif);
openSpotify?.addEventListener("click", openSpotifyForActivePiece);
playNarration?.addEventListener("click", playListeningNarration);
enterJournal?.addEventListener("click", closeListeningGate);
returnListeningButtons.forEach((button) => button.addEventListener("click", openListeningGate));
listeningAudio?.addEventListener("timeupdate", updateAudioTime);
listeningAudio?.addEventListener("ended", stopListeningPlayback);
listeningAudio?.addEventListener("error", () => {
  if (playerStatus) playerStatus.textContent = "audio missing";
  listeningGate?.classList.remove("is-playing");
});
listeningBrowser?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-listening-index]");
  if (!button) return;
  renderListeningPiece(dailyListeningPieces[Number(button.dataset.listeningIndex)]);
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setRoute(link.getAttribute("href"));
  });
});

window.addEventListener("hashchange", () => {
  setRoute(window.location.hash, false);
});

loadDailyForDate(currentDate);
setupDailyListening();
syncCalendarSelection();
updatePieceOptions();
updateDailyProgress();
updateDeerSlider();
renderPracticeArchive();
setRoute(window.location.hash || "dashboard", false);
