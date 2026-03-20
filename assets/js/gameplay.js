import { CHARACTER_ORDER, CHARACTER_PROFILES, DEFAULT_CHARACTER, getEventsForCharacter } from './data/events.js';

const PROGRESS_KEY = 'cidadeV3Progress';
const UNLOCK_RULES = {
  trabalhador: { next: 'cadeirante', minScore: 320 },
  cadeirante: { next: 'def_visual', minScore: 370 },
  def_visual: { next: 'mae_solo', minScore: 420 },
};

const state = {
  phase: 'menu',
  running: false,
  energy: 100,
  social: 20,
  distance: 0,
  totalDist: 500,
  eventsTriggered: [],
  currentEvent: null,
  eventTimer: null,
  eventTimerPct: 1,
  eventTimerDuration: 20000,
  eventQueue: [],
  playerX: 80,
  playerFrame: 0,
  playerFrameTimer: 0,
  playerState: 'run',
  nextEventAt: 80,
  scoreSaved: false,
  totalScore: 0,
  characterId: DEFAULT_CHARACTER,
  eventGap: 60,
};

let startTime = 0;
let totalGameTime = 0;
let playerName = 'JOGADOR';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let bgOffset = 0;
let buildings = [];
let clouds = [];
let particles = [];
let raf;
let _n;

function getProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    const unlocked = Array.isArray(raw.unlocked) ? raw.unlocked.filter((id) => CHARACTER_PROFILES[id]) : [DEFAULT_CHARACTER];
    const safeUnlocked = unlocked.length ? unlocked : [DEFAULT_CHARACTER];
    return {
      unlocked: safeUnlocked,
      selected: CHARACTER_PROFILES[raw.selected] ? raw.selected : safeUnlocked[0],
    };
  } catch {
    return { unlocked: [DEFAULT_CHARACTER], selected: DEFAULT_CHARACTER };
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {}
}

function renderCharacterSelect() {
  const select = document.getElementById('menuCharacterSelect');
  if (!select) return;

  const progress = getProgress();
  const isUnlocked = (id) => progress.unlocked.includes(id);

  const optionsHtml = CHARACTER_ORDER.map((id) => {
    const profile = CHARACTER_PROFILES[id];
    const unlocked = isUnlocked(id);
    const rule = UNLOCK_RULES[CHARACTER_ORDER[CHARACTER_ORDER.indexOf(id) - 1]];
    const lockHint = unlocked || !rule
      ? ''
      : ` (🔒 ${rule.minScore} pts com ${CHARACTER_PROFILES[CHARACTER_ORDER[CHARACTER_ORDER.indexOf(id) - 1]].label})`;
    return `<option value="${id}" ${unlocked ? '' : 'disabled'}>${profile.icon} ${profile.label}${lockHint}</option>`;
  }).join('');

  select.innerHTML = optionsHtml;
  const currentValue = progress.unlocked.includes(progress.selected) ? progress.selected : progress.unlocked[0];
  select.value = currentValue;
  state.characterId = currentValue;
}

function persistSelectedCharacter(characterId) {
  const progress = getProgress();
  if (!progress.unlocked.includes(characterId)) return;
  progress.selected = characterId;
  saveProgress(progress);
}

function tryUnlockNextCharacter() {
  const rule = UNLOCK_RULES[state.characterId];
  if (!rule || state.totalScore < rule.minScore) return;

  const progress = getProgress();
  if (progress.unlocked.includes(rule.next)) return;

  progress.unlocked.push(rule.next);
  progress.selected = rule.next;
  saveProgress(progress);

  const unlockedProfile = CHARACTER_PROFILES[rule.next];
  notify(`🔓 Novo personagem: ${unlockedProfile.label}!`);
}

function normalizePlayerName() {
  return (document.getElementById('menuNameInput').value.trim().toUpperCase() || 'JOGADOR').slice(0, 12);
}

function normalizeCharacterId() {
  const selectedId = document.getElementById('menuCharacterSelect')?.value || state.characterId || DEFAULT_CHARACTER;
  return CHARACTER_PROFILES[selectedId] ? selectedId : DEFAULT_CHARACTER;
}

function buildIntroStory() {
  const profile = CHARACTER_PROFILES[state.characterId] || CHARACTER_PROFILES[DEFAULT_CHARACTER];
  const openers = [
    `${profile.icon} ${playerName} acordou cedo, com o dia ainda cinza sobre os prédios da cidade.`,
    `${profile.icon} ${playerName} saiu antes do sol abrir direito e já encontrou o ritmo duro da rua.`,
    `${profile.icon} No começo da manhã, ${playerName} percebeu que chegar seria mais do que uma questão de tempo.`,
  ];

  const endings = [
    `${profile.intro} Cada decisão pode custar tempo, energia ou autonomia.`,
    'Até chegar ao destino, cada escolha deixa marca no corpo e na forma de ver a cidade.',
    'O trajeto de hoje não é só distância: é uma sequência de dilemas sem resposta perfeita.',
  ];

  return `${openers[Math.floor(Math.random() * openers.length)]} ${endings[Math.floor(Math.random() * endings.length)]}`;
}

function buildEndingStory() {
  const profile = CHARACTER_PROFILES[state.characterId] || CHARACTER_PROFILES[DEFAULT_CHARACTER];
  const socialTone = state.social >= 60
    ? 'mesmo cansado, você escolheu olhar para os outros quando era mais fácil ignorar'
    : state.social >= 35
      ? 'você oscilou entre pressa e cuidado, tentando sobreviver sem se perder totalmente'
      : 'a urgência venceu quase sempre, e isso deixou um peso que não cabe no placar';

  const energyTone = state.energy >= 50
    ? 'Ainda há fôlego para amanhã.'
    : state.energy >= 20
      ? 'Você chegou no limite, mas chegou.'
      : 'Você cruzou a linha final no resto do que tinha.';

  return `${profile.icon} ${playerName} terminou o dia atravessando uma cidade que exige escolhas impossíveis para quem é ${profile.label.toLowerCase()}. No fim, ${socialTone}. ${energyTone}`;
}

function initBg() {
  buildings = [];
  const pals = [['#0f0f2e', '#1a1040'], ['#1e0a3c', '#0d0520'], ['#0a1a0f', '#0d2010']];
  for (let i = 0; i < 22; i++) {
    const p = pals[i % pals.length];
    const h = 50 + Math.random() * 140;
    const w = 28 + Math.random() * 48;
    const wins = [];

    for (let wy = h - 14; wy > 12; wy -= 16) {
      for (let wx = 3; wx < w - 3; wx += 11) {
        wins.push({ dx: wx, dy: wy, on: Math.random() > 0.45, fl: Math.random() > 0.88 });
      }
    }

    buildings.push({ x: i * 75 + Math.random() * 30, h, w, color: p[Math.floor(Math.random() * p.length)], windows: wins });
  }

  clouds = Array.from({ length: 6 }, () => ({
    x: Math.random() * 900,
    y: 30 + Math.random() * 70,
    w: 50 + Math.random() * 90,
    spd: 0.15 + Math.random() * 0.25,
  }));
}

function pr(x) {
  return Math.round(x);
}

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, 240);
  g.addColorStop(0, '#02020e');
  g.addColorStop(0.6, '#0e0e2e');
  g.addColorStop(1, '#1e1040');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 800, 240);

  for (let i = 0; i < 50; i++) {
    const sx = (i * 131 + bgOffset * 0.08) % 820;
    const sy = (i * 47) % 190;
    ctx.fillStyle = i % 7 === 0 ? '#ffe' : '#888';
    ctx.fillRect(pr(sx), pr(sy), i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1);
  }
}

function drawBuildings() {
  buildings.forEach((b) => {
    const bx = ((b.x - bgOffset * 0.35) % 1650 + 1650) % 1650 - 60;
    const by = 240 - b.h;

    ctx.fillStyle = b.color;
    ctx.fillRect(pr(bx), pr(by), b.w, b.h);
    ctx.strokeStyle = '#090912';
    ctx.lineWidth = 2;
    ctx.strokeRect(pr(bx), pr(by), b.w, b.h);

    b.windows.forEach((w) => {
      const on = w.on && !(w.fl && Math.floor(Date.now() / 700) % 3 === 0);
      ctx.fillStyle = on ? '#f5c842' : '#08081a';
      ctx.fillRect(pr(bx + w.dx), pr(by + w.dy), 5, 7);
    });
  });
}

function drawClouds() {
  clouds.forEach((c) => {
    c.x -= c.spd;
    if (c.x < -110) c.x = 910;

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(pr(c.x), pr(c.y), c.w, 14);
    ctx.fillRect(pr(c.x + 10), pr(c.y - 7), c.w - 20, 10);
  });
}

function drawGround() {
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 348, 800, 22);
  ctx.fillStyle = '#181818';
  ctx.fillRect(0, 370, 800, 80);
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 348, 800, 3);
  ctx.fillStyle = '#2e2e2e';
  ctx.fillRect(0, 368, 800, 3);

  for (let i = 0; i < 14; i++) {
    const lx = ((i * 75 - bgOffset * 1.5) % 1050 + 1050) % 1050;
    ctx.fillStyle = '#f5c842';
    ctx.fillRect(pr(lx), 408, 44, 4);
  }

  for (let i = 0; i < 5; i++) {
    const px = ((i * 200 - bgOffset * 0.9) % 1000 + 1000) % 1000;
    ctx.fillStyle = '#666';
    ctx.fillRect(pr(px) + 6, 258, 4, 92);
    ctx.fillStyle = '#888';
    ctx.fillRect(pr(px), 254, 18, 7);
    ctx.fillStyle = 'rgba(255,240,120,0.15)';
    ctx.beginPath();
    ctx.arc(pr(px) + 9, 262, 22, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDestination() {
  const tx = 690;
  const ty = 278;

  ctx.fillStyle = '#555';
  ctx.fillRect(tx, ty, 4, 72);
  ctx.fillStyle = '#2dc653';
  ctx.fillRect(tx + 4, ty, 22, 14);
  ctx.fillStyle = '#fff';
  ctx.font = '10px serif';
  ctx.fillText('🏁', tx + 5, ty + 12);
  ctx.fillStyle = 'rgba(45,198,83,0.08)';
  ctx.beginPath();
  ctx.arc(tx + 6, ty + 36, 20, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer() {
  if (!['game', 'event', 'result'].includes(state.phase)) return;

  const px = state.playerX;
  const py = 308;

  state.playerFrameTimer++;
  const spd = state.playerState === 'run' ? 7 : 14;
  const maxF = state.playerState === 'run' ? 4 : 2;

  if (state.playerFrameTimer >= spd) {
    state.playerFrame = (state.playerFrame + 1) % maxF;
    state.playerFrameTimer = 0;
  }

  const f = state.playerFrame;
  const R = '#c0392b';
  const S = '#e8b87a';
  const P = '#2c3e7f';
  const SH = '#e08010';
  const H = '#3d2200';

  ctx.save();

  if (state.playerState === 'run') {
    ctx.fillStyle = H;
    ctx.fillRect(px + 7, py, 10, 3);
    ctx.fillStyle = S;
    ctx.fillRect(px + 7, py + 2, 10, 9);
    ctx.fillStyle = '#111';
    ctx.fillRect(px + 13, py + 5, 2, 2);
    ctx.fillStyle = R;
    ctx.fillRect(px + 8, py + 11, 8, 11);
    ctx.fillStyle = P;
    ctx.fillRect(px + 8, py + 22, 8, 10);

    const ao = [0, 3, 0, -3][f];
    ctx.fillStyle = S;
    ctx.fillRect(px + 4, py + 13 + ao, 4, 3);
    ctx.fillRect(px + 16, py + 13 - ao, 4, 3);

    const le = [[0, 7], [3, 4], [0, 7], [-3, 4]][f];
    ctx.fillStyle = P;
    ctx.fillRect(px + 8, py + 22 + le[0], 4, 9);
    ctx.fillRect(px + 12, py + 22 + le[1], 4, 9);
    ctx.fillStyle = SH;
    ctx.fillRect(px + 7, py + 29 + le[0], 5, 3);
    ctx.fillRect(px + 11, py + 29 + le[1], 5, 3);
    ctx.fillStyle = '#444';
    ctx.fillRect(px + 2, py + 13, 4, 7);
  } else if (state.playerState === 'idle') {
    const by = f === 0 ? 0 : 1;
    ctx.fillStyle = H;
    ctx.fillRect(px + 7, py - by, 10, 3);
    ctx.fillStyle = S;
    ctx.fillRect(px + 7, py + 2 - by, 10, 9);
    ctx.fillStyle = '#111';
    ctx.fillRect(px + 13, py + 5 - by, 2, 2);
    ctx.fillStyle = R;
    ctx.fillRect(px + 8, py + 11, 8, 11);
    ctx.fillStyle = P;
    ctx.fillRect(px + 8, py + 22, 8, 10);
    ctx.fillStyle = S;
    ctx.fillRect(px + 4, py + 14, 4, 3);
    ctx.fillRect(px + 16, py + 14, 4, 3);
    ctx.fillStyle = P;
    ctx.fillRect(px + 8, py + 22, 4, 10);
    ctx.fillRect(px + 12, py + 22, 4, 10);
    ctx.fillStyle = SH;
    ctx.fillRect(px + 7, py + 30, 5, 3);
    ctx.fillRect(px + 11, py + 30, 5, 3);
    ctx.fillStyle = '#444';
    ctx.fillRect(px + 2, py + 13, 4, 7);
  } else if (state.playerState === 'tired') {
    const by = f === 0 ? 0 : 1;
    ctx.fillStyle = H;
    ctx.fillRect(px + 6, py + 2 - by, 10, 3);
    ctx.fillStyle = S;
    ctx.fillRect(px + 6, py + 4 - by, 10, 9);
    ctx.fillStyle = '#111';
    ctx.fillRect(px + 11, py + 7 - by, 2, 2);
    ctx.fillStyle = R;
    ctx.fillRect(px + 7, py + 13, 10, 10);
    ctx.fillStyle = P;
    ctx.fillRect(px + 7, py + 23, 8, 10);
    ctx.fillStyle = S;
    ctx.fillRect(px + 3, py + 16, 4, 3);
    ctx.fillRect(px + 15, py + 16, 4, 3);
    ctx.fillStyle = P;
    ctx.fillRect(px + 7, py + 23, 4, 10);
    ctx.fillRect(px + 11, py + 23, 4, 10);
    ctx.fillStyle = SH;
    ctx.fillRect(px + 6, py + 31, 5, 3);
    ctx.fillRect(px + 10, py + 31, 5, 3);
    ctx.fillStyle = '#f5c842';
    ctx.font = '9px serif';
    ctx.fillText('💫', px + 17, py + 6);
  } else if (state.playerState === 'victory') {
    ctx.fillStyle = H;
    ctx.fillRect(px + 7, py, 10, 3);
    ctx.fillStyle = S;
    ctx.fillRect(px + 7, py + 2, 10, 9);
    ctx.fillStyle = '#111';
    ctx.fillRect(px + 13, py + 5, 2, 2);
    ctx.fillStyle = R;
    ctx.fillRect(px + 8, py + 11, 8, 11);
    ctx.fillStyle = P;
    ctx.fillRect(px + 8, py + 22, 8, 10);

    const au = f === 0 ? -9 : -7;
    ctx.fillStyle = S;
    ctx.fillRect(px + 2, py + au, 4, 3);
    ctx.fillRect(px + 18, py + au, 4, 3);
    ctx.fillStyle = P;
    ctx.fillRect(px + 8, py + 22, 4, 10);
    ctx.fillRect(px + 12, py + 22, 4, 10);
    ctx.fillStyle = SH;
    ctx.fillRect(px + 7, py + 30, 5, 3);
    ctx.fillRect(px + 11, py + 30, 5, 3);
  }

  ctx.restore();
}

function drawParticles() {
  particles = particles.filter((p) => p.life > 0);
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    const a = Math.floor((p.life / p.maxLife) * 255).toString(16).padStart(2, '0');
    ctx.fillStyle = p.color + a;
    ctx.fillRect(pr(p.x), pr(p.y), p.size, p.size);
  });
}

function spawnParticles(x, y, color, n = 10) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 4 - 1,
      color,
      size: 2 + Math.random() * 4,
      life: 18 + Math.random() * 22,
      maxLife: 40,
    });
  }
}

function drawProgressBar() {
  if (state.phase !== 'game') return;

  const pct = state.distance / state.totalDist;
  const bW = 200;
  const bX = 300;
  const bY = 461;

  ctx.fillStyle = '#0e0e0e';
  ctx.fillRect(bX, bY, bW, 7);
  ctx.fillStyle = '#2dc653';
  ctx.fillRect(bX, bY, pr(bW * pct), 7);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.strokeRect(bX, bY, bW, 7);
  ctx.fillStyle = '#f5c842';
  ctx.fillRect(pr(bX + bW * pct) - 2, bY - 2, 4, 11);
  ctx.fillStyle = '#555';
  ctx.font = '5px monospace';
  ctx.fillText('INÍCIO', bX, bY + 18);
  ctx.fillText('DESTINO', bX + bW - 28, bY + 18);
}

function gameLoop() {
  ctx.clearRect(0, 0, 800, 480);
  drawSky();
  drawClouds();
  drawBuildings();
  drawGround();
  drawDestination();
  drawPlayer();
  drawParticles();
  drawProgressBar();

  if (state.running && state.phase === 'game') {
    bgOffset += 2.2;
    state.distance += 0.55;

    if (state.distance >= state.nextEventAt && state.eventQueue.length > 0) triggerNextEvent();
    if (state.distance >= state.totalDist) endGame();
    if (state.energy <= 0) gameOver();

    updateHUD();
  }

  raf = requestAnimationFrame(gameLoop);
}

function updateHUD() {
  document.getElementById('hudDist').textContent = Math.round(state.totalDist - state.distance) + 'm';
  document.getElementById('hudTime').textContent = Math.round((Date.now() - startTime) / 1000) + 's';

  const ep = state.energy;
  document.getElementById('energyFill').style.width = ep + '%';
  document.getElementById('energyFill').style.background = ep > 60 ? '#e63946' : ep > 30 ? '#ff6b35' : '#f5c842';
  document.getElementById('socialFill').style.width = Math.max(0, state.social) + '%';
  document.getElementById('timerFill').style.width = (state.eventTimerPct * 100) + '%';
  document.getElementById('timerFill').style.background = state.eventTimerPct > 0.5 ? '#2dc653' : state.eventTimerPct > 0.25 ? '#ff6b35' : '#e63946';
}

function showMenu() {
  state.phase = 'menu';
  state.running = false;
  renderCharacterSelect();
  ['hud', 'introScreen', 'eventScreen', 'resultScreen', 'endScreen', 'rankingScreen', 'gameOverScreen', 'confirmDialog'].forEach(hide);
  show('menuScreen');
  drawMenuCity();
}

function startGame() {
  playerName = normalizePlayerName();
  state.characterId = normalizeCharacterId();
  persistSelectedCharacter(state.characterId);
  state.phase = 'intro';
  state.running = false;

  document.getElementById('introStory').textContent = buildIntroStory();

  ['menuScreen', 'eventScreen', 'resultScreen', 'endScreen', 'rankingScreen', 'gameOverScreen', 'confirmDialog', 'hud'].forEach(hide);
  show('introScreen');
}

function beginJourney() {
  playerName = playerName || normalizePlayerName();

  launchGameRound();
}

function restartGame() {
  launchGameRound();
}

function launchGameRound() {
  const profile = CHARACTER_PROFILES[state.characterId] || CHARACTER_PROFILES[DEFAULT_CHARACTER];
  const difficulty = profile.difficulty || { startEnergy: 100, totalDist: 500, socialBonus: 0, scoreMultiplier: 1 };

  state.phase = 'game';
  state.running = true;
  state.energy = difficulty.startEnergy;
  state.social = 20;
  state.distance = 0;
  state.totalDist = difficulty.totalDist;
  state.time = 0;
  state.eventsTriggered = [];
  state.playerState = 'run';
  state.playerFrame = 0;
  state.scoreSaved = false;
  state.totalScore = 0;

  bgOffset = 0;
  particles = [];
  state.eventQueue = getEventsForCharacter(state.characterId);
  state.eventGap = Math.max(36, Math.round(state.totalDist / (state.eventQueue.length + 1)));
  state.nextEventAt = state.eventGap;
  startTime = Date.now();

  ['menuScreen', 'introScreen', 'eventScreen', 'resultScreen', 'endScreen', 'rankingScreen', 'gameOverScreen', 'confirmDialog'].forEach(hide);
  show('hud');
}

function triggerNextEvent() {
  if (!state.eventQueue.length) {
    state.nextEventAt = Infinity;
    return;
  }

  const ev = state.eventQueue.shift();
  state.currentEvent = ev;
  state.running = false;
  state.phase = 'event';
  state.playerState = 'idle';

  document.getElementById('evIcon').textContent = ev.icon;
  document.getElementById('evTitle').textContent = ev.title;
  document.getElementById('evDesc').textContent = ev.desc;
  document.getElementById('evDilema').textContent = ev.dilema;

  const choicesEl = document.getElementById('evChoices');
  choicesEl.innerHTML = '';

  ev.choices.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `<span class="choice-num">${i + 1}</span><span>${c.text}</span>`;
    btn.onclick = () => makeChoice(i, c, false);
    choicesEl.appendChild(btn);
  });

  show('eventScreen');

  state.eventTimerPct = 1;
  const start = Date.now();
  const dur = ev.duration || state.eventTimerDuration;

  if (state.eventTimer) clearInterval(state.eventTimer);
  state.eventTimer = setInterval(() => {
    const elapsed = Date.now() - start;
    state.eventTimerPct = Math.max(0, 1 - elapsed / dur);
    document.getElementById('eventTimerFill').style.width = (state.eventTimerPct * 100) + '%';
    document.getElementById('eventTimerFill').style.background = state.eventTimerPct > 0.5 ? '#2dc653' : state.eventTimerPct > 0.25 ? '#ff6b35' : '#e63946';
    document.getElementById('evTimerSecs').textContent = Math.ceil((state.eventTimerPct * dur) / 1000) + 's';

    if (state.eventTimerPct <= 0) {
      clearInterval(state.eventTimer);
      makeChoiceTimeout();
    }
  }, 50);
}

function makeChoiceTimeout() {
  if (state.eventTimer) clearInterval(state.eventTimer);

  const ev = state.currentEvent;
  state.energy = Math.max(0, state.energy - 20);
  state.social = Math.max(0, state.social - 10);
  state.totalScore -= 18;
  state.eventsTriggered.push({ ev: ev.id, choiceIdx: -1 });
  state.phase = 'result';
  hide('eventScreen');

  document.getElementById('resIcon').textContent = '⏰';
  document.getElementById('resTitle').textContent = 'PARALISIA';
  document.getElementById('resMsg').textContent = 'O tempo passou. Você ficou parado. A situação se resolveu sem você — e de forma pior.';
  document.getElementById('resTension').textContent = '💭 "A incapacidade de decidir sob pressão é ela mesma uma decisão. Às vezes a mais cara de todas."';
  document.getElementById('resEffects').innerHTML =
    '<span class="effect-chip effect-bad">-20 ENERGIA</span>' +
    '<span class="effect-chip effect-bad">-10 IMPACTO</span>' +
    '<span class="effect-chip effect-bad">-18 PONTOS</span>';
  document.getElementById('resFact').textContent = ev.fact;

  state.playerState = 'tired';
  spawnParticles(state.playerX + 12, 310, '#e63946');
  show('resultScreen');
}

function makeChoice(idx, choice) {
  if (state.eventTimer) clearInterval(state.eventTimer);

  const profile = CHARACTER_PROFILES[state.characterId] || CHARACTER_PROFILES[DEFAULT_CHARACTER];
  const difficulty = profile.difficulty || { socialBonus: 0, scoreMultiplier: 1 };
  const socialDelta = choice.social > 0 ? choice.social + (difficulty.socialBonus || 0) : choice.social;
  const scoreDelta = Math.round(choice.score * (difficulty.scoreMultiplier || 1));

  state.energy = Math.max(0, Math.min(100, state.energy + choice.energy));
  state.social = Math.max(0, Math.min(100, state.social + socialDelta));
  state.distance = Math.max(0, state.distance - choice.time);
  state.totalScore += scoreDelta;
  state.eventsTriggered.push({ ev: state.currentEvent.id, choiceIdx: idx });
  state.phase = 'result';
  hide('eventScreen');

  document.getElementById('resIcon').textContent = '💭';
  document.getElementById('resTitle').textContent = 'VOCÊ DECIDIU';
  document.getElementById('resMsg').textContent = choice.msg;
  document.getElementById('resTension').textContent = '💭 ' + choice.tension;

  const ef = [];
  if (choice.energy !== 0) ef.push(`<span class="effect-chip ${choice.energy < 0 ? 'effect-bad' : 'effect-good'}">${choice.energy > 0 ? '+' : ''}${choice.energy} ENERGIA</span>`);
  if (socialDelta !== 0) ef.push(`<span class="effect-chip ${socialDelta < 0 ? 'effect-bad' : 'effect-good'}">${socialDelta > 0 ? '+' : ''}${socialDelta} IMPACTO</span>`);
  if (choice.time > 0) ef.push(`<span class="effect-chip effect-warn">-${choice.time}m NO PERCURSO</span>`);
  if (scoreDelta !== 0) ef.push(`<span class="effect-chip ${scoreDelta < 0 ? 'effect-bad' : 'effect-good'}">${scoreDelta > 0 ? '+' : ''}${scoreDelta} PONTOS</span>`);
  document.getElementById('resEffects').innerHTML = ef.join('');
  document.getElementById('resFact').textContent = state.currentEvent.fact;

  if (state.energy <= 20) {
    state.playerState = 'tired';
    spawnParticles(state.playerX + 12, 310, '#e63946');
  } else {
    state.playerState = 'idle';
    if (choice.score > 5) spawnParticles(state.playerX + 12, 310, '#2dc653', 6);
  }

  show('resultScreen');
}

function continueGame() {
  hide('resultScreen');
  if (state.energy <= 0) {
    gameOver();
    return;
  }

  state.phase = 'game';
  state.running = true;
  state.playerState = state.energy > 25 ? 'run' : 'tired';
  state.nextEventAt = Math.min(state.totalDist, state.nextEventAt + state.eventGap);
}

function endGame() {
  state.running = false;
  state.phase = 'end';
  state.playerState = 'victory';
  totalGameTime = Math.round((Date.now() - startTime) / 1000);

  const timeBonus = Math.max(0, 200 - totalGameTime);
  const eBonus = Math.round(state.energy * 0.8);
  const sBonus = Math.round(state.social * 1.2);
  state.totalScore += timeBonus + eBonus + sBonus;

  ['hud', 'eventScreen', 'resultScreen', 'confirmDialog'].forEach(hide);
  show('endScreen');

  document.getElementById('statTime').textContent = totalGameTime + 's';
  document.getElementById('statEnergy').textContent = state.energy + '%';
  document.getElementById('statScore').textContent = state.totalScore + 'pts';

  const qs = [
    'Você chegou. Mas a cidade que você cruzou segue aqui — com as mesmas feridas.',
    'Cada escolha foi um espelho. O que você viu nele?',
    'Chegou ao destino. Mas alguém não chegou hoje. Você sabe por quê.',
    'Nenhuma decisão foi fácil. E era isso o ponto.',
  ];

  document.getElementById('endQuote').textContent = qs[Math.floor(Math.random() * qs.length)];
  document.getElementById('endStory').textContent = buildEndingStory();
  tryUnlockNextCharacter();
  renderCharacterSelect();
  spawnParticles(400, 300, '#f5c842', 30);
}

function gameOver() {
  state.running = false;
  state.phase = 'gameover';
  state.playerState = 'tired';
  totalGameTime = Math.round((Date.now() - startTime) / 1000);

  ['hud', 'eventScreen', 'resultScreen', 'endScreen', 'confirmDialog'].forEach(hide);
  show('gameOverScreen');

  document.getElementById('goTime').textContent = totalGameTime + 's';
  document.getElementById('goDist').textContent = Math.round((state.distance / state.totalDist) * 100) + '%';
  document.getElementById('goSocial').textContent = state.social + '%';

  const ms = [
    'A cidade te desgastou antes de você chegar. Isso acontece com muita gente todos os dias.',
    'Cada obstáculo cobrou o que você não tinha de sobra.',
    'Você foi erodido pelas decisões impossíveis que o sistema empurra pra você.',
  ];

  document.getElementById('gameOverMsg').textContent = ms[Math.floor(Math.random() * ms.length)];
}

function confirmQuit() {
  if (state.eventTimer) clearInterval(state.eventTimer);
  state.running = false;
  show('confirmDialog');
}

function cancelQuit() {
  hide('confirmDialog');
  if (state.phase === 'game') state.running = true;
}

function doQuit() {
  hide('confirmDialog');
  if (state.eventTimer) clearInterval(state.eventTimer);
  showMenu();
}

function getScores() {
  try {
    return JSON.parse(localStorage.getItem('cidadeV3') || '[]');
  } catch {
    return [];
  }
}

function saveScores(scores) {
  try {
    localStorage.setItem('cidadeV3', JSON.stringify(scores));
  } catch {}
}

function saveAndRanking() {
  if (!state.scoreSaved) {
    const scores = getScores();
    scores.push({
      name: playerName,
      characterId: state.characterId,
      characterIcon: (CHARACTER_PROFILES[state.characterId] || CHARACTER_PROFILES[DEFAULT_CHARACTER]).icon,
      time: totalGameTime,
      score: state.totalScore,
      social: state.social,
    });
    scores.sort((a, b) => b.score - a.score);
    saveScores(scores.slice(0, 20));
    state.scoreSaved = true;
    notify('✅ Score salvo!');
  }

  setTimeout(showRanking, 380);
}

function showRanking() {
  ['menuScreen', 'introScreen', 'endScreen', 'eventScreen', 'resultScreen', 'hud', 'confirmDialog'].forEach(hide);
  show('rankingScreen');
  state.phase = 'ranking';

  const scores = getScores();
  const list = document.getElementById('rankList');

  if (!scores.length) {
    list.innerHTML = '<div class="no-scores">Nenhum score ainda.<br>Jogue e seja o primeiro!</div>';
    return;
  }

  const medals = ['gold', 'silver', 'bronze'];
  const pos = ['🥇', '🥈', '🥉'];

  list.innerHTML = scores.map((s, i) => `
    <div class="rank-item ${medals[i] || ''}">
      <span class="rank-pos">${pos[i] || (i + 1) + '.'}</span>
      <span class="rank-name">${s.characterIcon || '👤'} ${s.name}</span>
      <span class="rank-time">⏱${s.time}s</span>
      <span class="rank-score">${s.score}pts</span>
    </div>
  `).join('');
}

function show(id) {
  const e = document.getElementById(id);
  if (e) e.classList.remove('hidden');
}

function hide(id) {
  const e = document.getElementById(id);
  if (e) e.classList.add('hidden');
}

function notify(msg) {
  const e = document.getElementById('notification');
  e.textContent = msg;
  e.classList.add('show');
  if (_n) clearTimeout(_n);
  _n = setTimeout(() => e.classList.remove('show'), 2000);
}

function drawMenuCity() {
  const c = document.getElementById('menuCity');
  if (!c) return;

  const x = c.getContext('2d');
  x.clearRect(0, 0, 800, 90);

  const cols = ['#0f0f2e', '#1a1040', '#0a1530', '#1e0a3c'];
  const hs = [45, 65, 38, 55, 75, 50, 62, 40, 70, 32, 52, 68, 58, 48, 78, 38, 63, 68, 48, 58, 44, 60, 35];

  hs.forEach((h, i) => {
    const bx = i * 36;
    const col = cols[i % cols.length];

    x.fillStyle = col;
    x.fillRect(bx, 90 - h, 33, h);
    x.strokeStyle = '#0a0a1a';
    x.lineWidth = 1;
    x.strokeRect(bx, 90 - h, 33, h);

    for (let wy = 90 - h + 5; wy < 85; wy += 13) {
      for (let wx = 3; wx < 28; wx += 9) {
        x.fillStyle = Math.random() > 0.5 ? '#f5c842' : '#0a0a1a';
        x.fillRect(bx + wx, wy, 5, 7);
      }
    }
  });

  x.fillStyle = '#111';
  x.fillRect(0, 82, 800, 8);
  x.fillStyle = '#f5c842';
  for (let i = 0; i < 20; i++) x.fillRect(i * 45 + 10, 84, 28, 2);
}

function bindKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.phase === 'ranking') showMenu();
      else if (state.phase === 'intro') showMenu();
      else if (['game', 'event', 'result'].includes(state.phase)) confirmQuit();
    }

    if (e.key === 'Enter' && state.phase === 'result') continueGame();
    if (e.key === 'Enter' && state.phase === 'intro') beginJourney();

    if (state.phase === 'event') {
      const map = { '1': 0, '2': 1, '3': 2 };
      if (map[e.key] !== undefined) {
        const btns = document.querySelectorAll('.choice-btn');
        if (btns[map[e.key]]) btns[map[e.key]].click();
      }
    }
  });
}

function exposeGlobalActions() {
  window.startGame = startGame;
  window.beginJourney = beginJourney;
  window.restartGame = restartGame;
  window.showRanking = showRanking;
  window.continueGame = continueGame;
  window.confirmQuit = confirmQuit;
  window.saveAndRanking = saveAndRanking;
  window.showMenu = showMenu;
  window.doQuit = doQuit;
  window.cancelQuit = cancelQuit;
}

export function initializeGame() {
  renderCharacterSelect();
  initBg();
  bindKeyboard();
  gameLoop();
  showMenu();
  exposeGlobalActions();
}

export function destroyGame() {
  if (raf) cancelAnimationFrame(raf);
  if (state.eventTimer) clearInterval(state.eventTimer);
}
