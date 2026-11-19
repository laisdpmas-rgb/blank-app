/* =========================================================
   Minha Novena de Nossa Senhora das Graças
   Aplicativo em JavaScript puro. Tudo é salvo apenas neste
   aparelho (localStorage). Nenhum dado é enviado a servidores.
   ========================================================= */
'use strict';

/* ---------------------------------------------------------
   1. Estado e armazenamento
   --------------------------------------------------------- */
const STORAGE_KEY = 'novena-ns-gracas:v1';
/* Versão publicada como artefato do Claude: sem impressão, downloads ou instalação */
const EMBED = !!window.NOVENA_EMBED;
const NS_IMG = window.NOVENA_IMG || 'img/nossa-senhora.jpg';
const FONT_LEVELS = [1, 1.125, 1.25, 1.4, 1.6];

function defaultState() {
  const days = {};
  for (let i = 1; i <= 9; i++) days[i] = { done: false, doneAt: null, personal: '' };
  return {
    version: 1,
    days,
    sessions: {},
    lastActive: null,
    intentions: [],
    settings: {
      theme: 'auto',
      font: 1,
      spacious: false,
      clean: false,
      jaculatoria: true,
      rosary: 'ave', // novena: 'ave' (terço tradicional), 'jaculatoria' (terço da Medalha) ou 'nenhum'
      wakeLock: true
    }
  };
}

function loadState() {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    return {
      ...base,
      ...saved,
      days: { ...base.days, ...(saved.days || {}) },
      sessions: saved.sessions || {},
      intentions: Array.isArray(saved.intentions) ? saved.intentions : [],
      settings: { ...base.settings, ...(saved.settings || {}) }
    };
  } catch (e) {
    return base;
  }
}

let state = loadState();
let storageOk = true;

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageOk = true;
  } catch (e) {
    if (storageOk) toast('Não foi possível salvar neste navegador (modo privado?). O progresso pode se perder ao fechar.');
    storageOk = false;
  }
}

/* ---------------------------------------------------------
   2. Utilidades
   --------------------------------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const app = () => document.getElementById('app');

function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) { return ''; }
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function todaysMysterySet(date = new Date()) {
  return WEEKDAY_MYSTERY[date.getDay()];
}

function completedCount() {
  let c = 0;
  for (let i = 1; i <= 9; i++) if (state.days[i].done) c++;
  return c;
}

/* Dia atual = primeiro dia ainda não concluído */
function currentDay() {
  for (let i = 1; i <= 9; i++) if (!state.days[i].done) return i;
  return null;
}

function nextDayAfter(n) {
  for (let i = n + 1; i <= 9; i++) if (!state.days[i].done) return i;
  for (let i = 1; i < n; i++) if (!state.days[i].done) return i;
  return null;
}

function novenaStarted() {
  return completedCount() > 0 || Object.keys(state.sessions).some(k => k.startsWith('d'));
}

function renderPrayerText(lines) {
  return lines.map(line => {
    if (/^V\.\s/.test(line)) return `<p class="vr"><b aria-label="Versículo">V.</b> ${esc(line.slice(3))}</p>`;
    if (/^R\.\s/.test(line)) return `<p class="vr"><b aria-label="Resposta">R.</b> ${esc(line.slice(3))}</p>`;
    if (/^\(.*\)$/.test(line)) return `<p class="rubric">${esc(line.slice(1, -1))}</p>`;
    if (/^Oremos:/.test(line)) return `<p><b>Oremos:</b>${esc(line.slice(7))}</p>`;
    return `<p>${esc(line)}</p>`;
  }).join('');
}

const ORNAMENT = `<svg class="ornament" viewBox="0 0 160 20" aria-hidden="true" focusable="false">
  <path d="M8 10 H62" /><path d="M98 10 H152" />
  <path class="leaf" d="M64 10 C68 4, 74 4, 76 10 C74 16, 68 16, 64 10 Z" />
  <path class="leaf" d="M96 10 C92 4, 86 4, 84 10 C86 16, 92 16, 96 10 Z" />
  <circle class="dot" cx="80" cy="10" r="3" />
</svg>`;

/* ---------------------------------------------------------
   3. Sequência do modo guiado (novena + terço)
   --------------------------------------------------------- */
const ROSARY_OPTIONS = [
  ['nenhum', 'Só a novena', 'Sem o terço.'],
  ['ave', 'Novena com terço', 'Terço tradicional, com as Ave-Marias.'],
  ['jaculatoria', 'Novena com terço da Medalha', 'Em cada conta, a jaculatória “Ó Maria concebida sem pecado” no lugar da Ave-Maria.']
];

function buildSteps(session) {
  const steps = [];
  const rosary = session.rosary || 'ave';
  if (rosary === 'nenhum') {
    steps.push({ id: 'sinal-ini', kind: 'prayer', p: 'sinal', section: 'Abertura', seg: 0 });
    steps.push({ id: 'espirito', kind: 'prayer', p: 'espirito', section: 'Abertura', seg: 0 });
    novenaSteps(session, steps);
    return closingStep(steps);
  }
  const sec = 'Abertura do Terço';
  steps.push({ id: 'sinal-ini', kind: 'prayer', p: 'sinal', section: sec, seg: 0 });
  steps.push({ id: 'espirito', kind: 'prayer', p: 'espirito', section: sec, seg: 0 });
  steps.push({ id: 'oferecimento', kind: 'prayer', p: 'oferecimento', section: sec, seg: 0 });
  steps.push({ id: 'credo', kind: 'prayer', p: 'credo', section: sec, seg: 0 });
  steps.push({ id: 'painosso-ini', kind: 'prayer', p: 'painosso', section: sec, seg: 0 });
  steps.push({
    id: 'ave-ini', kind: 'count', p: 'avemaria', total: 3, section: sec, seg: 0,
    title: 'Três Ave-Marias',
    intro: 'Rezamos três Ave-Marias pedindo o aumento da fé, da esperança e da caridade.',
    labels: ['Fé', 'Esperança', 'Caridade']
  });
  steps.push({ id: 'gloria-ini', kind: 'prayer', p: 'gloria', section: sec, seg: 0 });

  const set = MYSTERIES[session.set] || MYSTERIES.gozosos;
  for (let d = 0; d < 5; d++) {
    const s = `${ORDINALS[d]} ${set.singular}`;
    steps.push({ id: `mist-${d}`, kind: 'mystery', decade: d, section: s, seg: d + 1 });
    steps.push({ id: `pn-${d}`, kind: 'prayer', p: 'painosso', section: s, seg: d + 1 });
    steps.push(rosary === 'jaculatoria'
      ? { id: `ave-${d}`, kind: 'count', p: 'jacmaria', unit: 'Jaculatória', total: 10, section: s, seg: d + 1, title: 'Dez jaculatórias' }
      : { id: `ave-${d}`, kind: 'count', p: 'avemaria', total: 10, section: s, seg: d + 1, title: 'Dez Ave-Marias' });
    steps.push({ id: `gl-${d}`, kind: 'prayer', p: 'gloria', section: s, seg: d + 1 });
    steps.push({ id: `jac-${d}`, kind: 'prayer', p: 'jaculatoria', section: s, seg: d + 1, optional: 'jaculatoria' });
  }

  steps.push({ id: 'salve', kind: 'prayer', p: 'salve', section: 'Encerramento do Terço', seg: 6 });
  if (session.mode === 'novena') novenaSteps(session, steps);
  return closingStep(steps);
}

function novenaSteps(session, steps) {
  {
    const sn = `Novena · Dia ${session.day}`;
    steps.push({ id: 'contricao', kind: 'prayer', p: 'contricao', section: sn, seg: 6 });
    steps.push({
      id: 'meditacao', kind: 'prayer', section: sn, seg: 6,
      title: `Meditação do dia · ${DAYS[session.day - 1].meditationTitle}`,
      custom: [DAYS[session.day - 1].meditation]
    });
    steps.push({ id: 'suplica', kind: 'prayer', p: 'suplica', section: sn, seg: 6 });
    steps.push({ id: 'intencao', kind: 'intention', section: sn, seg: 6, title: 'Intenção do dia' });
    steps.push({
      id: 'ave-nov', kind: 'count', p: 'avemaria', total: 3, section: sn, seg: 6,
      title: 'Três Ave-Marias',
      intro: 'Rezamos três Ave-Marias a Nossa Senhora das Graças.'
    });
    steps.push({ id: 'jacmaria', kind: 'prayer', p: 'jacmaria', section: sn, seg: 6 });
    steps.push({ id: 'final', kind: 'prayer', p: 'final', section: sn, seg: 6 });
  }
}

function closingStep(steps) {
  steps.push({
    id: 'sinal-fim', kind: 'prayer', section: 'Encerramento', seg: 6,
    title: 'Sinal da Cruz',
    custom: ['(Para encerrar, faça o sinal da cruz.)', 'Em nome do Pai, e do Filho, e do Espírito Santo. Amém.']
  });
  return steps;
}

function isVisible(step) {
  if (step.optional === 'jaculatoria') return !!state.settings.jaculatoria;
  return true;
}

function stepTitle(step) {
  if (step.title) return step.title;
  if (step.p) return PRAYERS[step.p].title;
  return '';
}

function stepShortName(step, session) {
  if (step.kind === 'mystery') {
    const set = MYSTERIES[session.set];
    return `${ORDINALS[step.decade]} ${set.singular}`;
  }
  return stepTitle(step);
}

/* ---------------------------------------------------------
   4. Configurações visuais
   --------------------------------------------------------- */
function applySettings() {
  const s = state.settings;
  const root = document.documentElement;
  if (s.theme === 'auto') root.removeAttribute('data-app-theme');
  else root.setAttribute('data-app-theme', s.theme);
  root.style.setProperty('--font-scale', FONT_LEVELS[s.font] || 1);
  root.classList.toggle('spacious', !!s.spacious);
  root.classList.toggle('clean', !!s.clean);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const hostTheme = root.getAttribute('data-theme');
    const autoDark = hostTheme ? hostTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = s.theme === 'dark' || (s.theme === 'auto' && autoDark);
    meta.setAttribute('content', dark ? '#121a28' : (s.theme === 'paper' ? '#f4ecdd' : '#fbf8f2'));
  }
}

function settingsControls(context) {
  const s = state.settings;
  const themes = [['auto', 'Automático'], ['light', 'Claro'], ['paper', 'Leitura confortável'], ['dark', 'Noturno']];
  return `
  <div class="setting">
    <span class="setting-label" id="lbl-font">Tamanho da letra</span>
    <div class="font-control" role="group" aria-labelledby="lbl-font">
      <button class="btn btn-round" data-action="font-down" aria-label="Diminuir letra" ${s.font <= 0 ? 'disabled' : ''}>A−</button>
      <span class="font-meter" aria-live="polite">${s.font + 1} de ${FONT_LEVELS.length}</span>
      <button class="btn btn-round" data-action="font-up" aria-label="Aumentar letra" ${s.font >= FONT_LEVELS.length - 1 ? 'disabled' : ''}>A+</button>
    </div>
  </div>
  <div class="setting">
    <span class="setting-label" id="lbl-theme">Aparência</span>
    <div class="segmented" role="radiogroup" aria-labelledby="lbl-theme">
      ${themes.map(([v, l]) => `<button role="radio" aria-checked="${s.theme === v}" class="seg ${s.theme === v ? 'on' : ''}" data-action="theme" data-value="${v}">${l}</button>`).join('')}
    </div>
  </div>
  ${toggleRow('spacious', 'Texto mais espaçado', 'Aumenta o espaço entre linhas e parágrafos.')}
  ${toggleRow('clean', 'Tela de oração limpa', 'Esconde informações extras durante a oração.')}
  ${context === 'flow' ? `<div class="setting"><button class="btn btn-secondary btn-block" data-action="fullscreen">Ler em tela cheia</button></div>` : ''}
  ${context !== 'flow' ? toggleRow('jaculatoria', 'Jaculatória de Fátima', 'Rezar a jaculatória após cada Glória ao Pai.') : ''}
  ${context !== 'flow' ? toggleRow('wakeLock', 'Manter a tela acesa ao rezar', 'Evita que a tela apague no meio da oração (se o aparelho permitir).') : ''}
  `;
}

function toggleRow(key, label, hint) {
  const on = !!state.settings[key];
  return `<div class="setting setting-toggle">
    <div><span class="setting-label">${label}</span><span class="hint">${hint}</span></div>
    <button class="switch" role="switch" aria-checked="${on}" aria-label="${esc(label)}" data-action="toggle" data-key="${key}"><span></span></button>
  </div>`;
}

/* ---------------------------------------------------------
   5. Toast, diálogos e folhas
   --------------------------------------------------------- */
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 4200);
}

let modalReturnFocus = null;
function openModal(html, { label = 'Janela', onClose } = {}) {
  closeModal();
  modalReturnFocus = document.activeElement;
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.id = 'modal';
  wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(label)}">${html}</div>`;
  wrap.addEventListener('click', e => { if (e.target === wrap) closeModal(); });
  wrap._onClose = onClose;
  document.body.appendChild(wrap);
  document.body.classList.add('modal-open');
  const first = wrap.querySelector('[autofocus], button, textarea, input, select');
  if (first) first.focus();
}

function closeModal() {
  const m = document.getElementById('modal');
  if (!m) return;
  const cb = m._onClose;
  m.remove();
  document.body.classList.remove('modal-open');
  if (modalReturnFocus && document.contains(modalReturnFocus)) modalReturnFocus.focus();
  if (cb) cb();
}

function confirmDialog({ title, text, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false }) {
  return new Promise(resolve => {
    let answered = false;
    openModal(`
      <h2 class="modal-title">${esc(title)}</h2>
      <p class="modal-text">${esc(text)}</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" data-confirm="no" autofocus>${esc(cancelLabel)}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-confirm="yes">${esc(confirmLabel)}</button>
      </div>`, { label: title, onClose: () => { if (!answered) resolve(false); } });
    $('#modal').addEventListener('click', e => {
      const b = e.target.closest('[data-confirm]');
      if (!b) return;
      answered = true;
      resolve(b.dataset.confirm === 'yes');
      closeModal();
    });
  });
}

function openDisplaySheet() {
  openModal(`
    <div class="sheet-head">
      <h2 class="modal-title">Leitura</h2>
      <button class="btn btn-text" data-action="close-modal">Fechar</button>
    </div>
    <div class="settings-list" id="sheet-settings">${settingsControls('flow')}</div>`, { label: 'Ajustes de leitura' });
}

function refreshSheet() {
  const el = document.getElementById('sheet-settings');
  if (el) el.innerHTML = settingsControls('flow');
}

/* ---------------------------------------------------------
   6. Cronômetro de oração silenciosa
   --------------------------------------------------------- */
const timer = { total: 0, remaining: 0, running: false, endAt: 0, interval: null, finished: false };

function fmtClock(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function timerWidget() {
  const opts = [1, 3, 5, 10];
  let status = 'Escolha um tempo para ficar em silêncio, se quiser.';
  if (timer.running) status = 'Em silêncio. Fique à vontade.';
  else if (timer.finished) status = 'Tempo de silêncio concluído. Continue quando quiser.';
  else if (timer.total && timer.remaining > 0) status = 'Pausado.';
  return `<section class="timer card" aria-labelledby="timer-h">
    <h2 id="timer-h" class="card-title">Oração silenciosa <span class="optional">(opcional)</span></h2>
    <p class="timer-display" data-timer-display aria-live="off">${fmtClock(timer.remaining || 0)}</p>
    <p class="hint" data-timer-status aria-live="polite">${status}</p>
    <div class="timer-options">
      ${opts.map(m => `<button class="chip ${timer.total === m * 60 ? 'on' : ''}" data-action="timer-set" data-min="${m}">${m} min</button>`).join('')}
    </div>
    <div class="timer-actions">
      ${timer.running
        ? `<button class="btn btn-secondary" data-action="timer-pause">Pausar</button>`
        : `<button class="btn btn-secondary" data-action="timer-start" ${timer.remaining > 0 ? '' : 'disabled'}>Iniciar</button>`}
      <button class="btn btn-text" data-action="timer-reset" ${timer.total ? '' : 'disabled'}>Zerar</button>
    </div>
  </section>`;
}

function refreshTimer() {
  document.querySelectorAll('.timer').forEach(el => { el.outerHTML = timerWidget(); });
}

function timerTick() {
  if (!timer.running) return;
  timer.remaining = Math.max(0, Math.round((timer.endAt - Date.now()) / 1000));
  document.querySelectorAll('[data-timer-display]').forEach(el => { el.textContent = fmtClock(timer.remaining); });
  if (timer.remaining <= 0) {
    timer.running = false;
    timer.finished = true;
    clearInterval(timer.interval);
    refreshTimer();
  }
}

function timerAction(action, min) {
  if (action === 'timer-set') {
    clearInterval(timer.interval);
    timer.total = min * 60; timer.remaining = timer.total; timer.running = false; timer.finished = false;
  } else if (action === 'timer-start' && timer.remaining > 0) {
    timer.running = true; timer.finished = false;
    timer.endAt = Date.now() + timer.remaining * 1000;
    clearInterval(timer.interval);
    timer.interval = setInterval(timerTick, 1000);
  } else if (action === 'timer-pause') {
    timerTick();
    timer.running = false;
    clearInterval(timer.interval);
  } else if (action === 'timer-reset') {
    clearInterval(timer.interval);
    timer.total = 0; timer.remaining = 0; timer.running = false; timer.finished = false;
  }
  refreshTimer();
}

/* ---------------------------------------------------------
   7. Manter a tela acesa durante a oração (se suportado)
   --------------------------------------------------------- */
let wakeLock = null;
async function requestWakeLock() {
  if (!state.settings.wakeLock || !('wakeLock' in navigator) || wakeLock) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
  } catch (e) { wakeLock = null; }
}
function releaseWakeLock() {
  if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
}

/* ---------------------------------------------------------
   8. Telas
   --------------------------------------------------------- */
function topBar(backHref = '#inicio', backLabel = 'Início', title = '') {
  return `<header class="topbar">
    <a class="back-link" href="${backHref}"><span aria-hidden="true">‹</span> ${esc(backLabel)}</a>
    ${title ? `<span class="topbar-title">${esc(title)}</span>` : '<span></span>'}
    <a class="icon-link" href="#ajustes" aria-label="Ajustes"><span aria-hidden="true">Aa</span></a>
  </header>`;
}

function dayDots(highlight) {
  const cur = currentDay();
  let html = '<ol class="day-dots" aria-hidden="true">';
  for (let i = 1; i <= 9; i++) {
    const d = state.days[i];
    const cls = d.done ? 'done' : (i === (highlight || cur) ? 'current' : '');
    html += `<li class="${cls}">${d.done ? '✓' : i}</li>`;
  }
  return html + '</ol>';
}

/* --- Início --- */
function viewHome() {
  const done = completedCount();
  const cur = currentDay();
  const started = novenaStarted();
  const last = state.lastActive && state.sessions[state.lastActive];

  let resumeHint = '';
  if (last) {
    const steps = buildSteps(last);
    const step = steps[Math.min(last.step, steps.length - 1)];
    const where = last.mode === 'novena' ? `Dia ${last.day}` : 'Terço Mariano';
    resumeHint = `${where} · ${stepShortName(step, last)}`;
  } else if (cur) {
    resumeHint = `Dia ${cur} · ${DAYS[cur - 1].title}`;
  }

  let actions;
  if (!cur) {
    actions = `<p class="lead-note">Você concluiu os nove dias da sua novena. Que Nossa Senhora das Graças continue acompanhando você.</p>
      <a class="btn btn-primary btn-block btn-big" href="#dias">VER MEUS NOVE DIAS</a>`;
  } else if (!started) {
    actions = `<a class="btn btn-primary btn-block btn-big" href="#dia-1">COMEÇAR MINHA NOVENA</a>`;
  } else {
    actions = `<button class="btn btn-primary btn-block btn-big" data-action="resume">
        CONTINUAR DE ONDE PAREI
        <small>${esc(resumeHint)}</small>
      </button>
      <a class="btn btn-secondary btn-block" href="#dias">Ver meus nove dias</a>`;
  }

  return `<main class="page home" id="main">
    <figure class="hero">
      <img src="${NS_IMG}" width="240" height="360"
        alt="Ilustração delicada de Nossa Senhora das Graças, de manto azul e braços abertos, com raios de luz saindo de suas mãos.">
    </figure>
    <h1 class="home-title" tabindex="-1">Minha Novena de Nossa Senhora das Graças</h1>
    <p class="subtitle">Nove dias de fé, oração e entrega.</p>
    <p><a class="about-link" href="#sobre">Conheça a história da Medalha Milagrosa</a></p>
    ${ORNAMENT}
    <section class="progress-card" aria-label="Progresso da novena">
      <p class="progress-count"><strong>${done} de 9</strong> dias concluídos</p>
      ${dayDots()}
      ${cur && started ? `<p class="hint">Dia atual: Dia ${cur} — ${esc(DAYS[cur - 1].title)}</p>` : ''}
    </section>
    <div class="actions">${actions}</div>
    <nav class="home-links" aria-label="Outras áreas">
      <a href="#terco" class="home-link"><span class="hl-icon" aria-hidden="true">${ICONS.rosary}</span><span>Terço Mariano</span></a>
      <a href="#intencoes" class="home-link"><span class="hl-icon" aria-hidden="true">${ICONS.heart}</span><span>Minhas intenções</span></a>
      <a href="#oracoes" class="home-link"><span class="hl-icon" aria-hidden="true">${ICONS.book}</span><span>Orações</span></a>
      <a href="#ajustes" class="home-link"><span class="hl-icon" aria-hidden="true">${ICONS.gear}</span><span>Ajustes</span></a>
    </nav>
  </main>`;
}

const ICONS = {
  rosary: '<svg viewBox="0 0 24 24"><circle cx="12" cy="4" r="1.6"/><circle cx="16.6" cy="5.6" r="1.6"/><circle cx="19" cy="9.8" r="1.6"/><circle cx="7.4" cy="5.6" r="1.6"/><circle cx="5" cy="9.8" r="1.6"/><circle cx="17.4" cy="14.2" r="1.6"/><circle cx="6.6" cy="14.2" r="1.6"/><path d="M12 15v7M9.5 18.5h5"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z"/><path d="M12 6v13.5"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><text x="12" y="16.5" text-anchor="middle" font-size="12" font-family="Georgia, serif" stroke="none" fill="currentColor">Aa</text></svg>'
};

/* --- Lista dos nove dias --- */
function viewDays() {
  const cur = currentDay();
  const next = cur ? nextDayAfter(cur) : null;
  const done = completedCount();
  const items = DAYS.map(d => {
    const st = state.days[d.n];
    const inProgress = !!state.sessions['d' + d.n];
    let status = '';
    if (st.done) status = `<span class="badge done">Concluído${st.doneAt ? ' em ' + fmtDate(st.doneAt) : ''}</span>`;
    else if (d.n === cur) status = `<span class="badge current">${inProgress ? 'Dia atual · em andamento' : 'Dia atual'}</span>`;
    else if (d.n === next) status = `<span class="badge">${inProgress ? 'Próximo · em andamento' : 'Próximo dia'}</span>`;
    else if (inProgress) status = `<span class="badge">Em andamento</span>`;
    return `<li><a class="day-item ${st.done ? 'is-done' : ''} ${d.n === cur ? 'is-current' : ''}" href="#dia-${d.n}">
      <span class="day-num" aria-hidden="true">${st.done ? '✓' : d.n}</span>
      <span class="day-info"><span class="day-name">Dia ${d.n} · ${esc(d.title)}</span>${status}</span>
      <span class="chev" aria-hidden="true">›</span>
    </a></li>`;
  }).join('');

  return `${topBar('#inicio', 'Início')}
  <main class="page" id="main">
    <h1 tabindex="-1">Meus nove dias</h1>
    <section class="progress-card">
      <p class="progress-count"><strong>${done} de 9</strong> dias concluídos</p>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="9" aria-valuenow="${done}" aria-label="Progresso geral"><span style="width:${(done / 9) * 100}%"></span></div>
      ${cur ? `<p class="hint">Dia atual: <b>Dia ${cur}</b>${next ? ` · Próximo: Dia ${next}` : ''}</p>` : '<p class="hint">Todos os dias foram concluídos.</p>'}
    </section>
    <p class="hint">Você pode rezar no seu ritmo. Se um dia ficar para depois, é só continuar de onde parou.</p>
    <ol class="day-list">${items}</ol>
    <div class="danger-zone">
      <button class="btn btn-text" data-action="reset-novena">Reiniciar a novena</button>
    </div>
  </main>`;
}

/* --- Tela de um dia --- */
function mysterySelector(selected, auto) {
  const today = new Date();
  return `<div class="mystery-select">
    <label for="mset" class="setting-label">Mistérios do terço</label>
    <select id="mset" data-change="set-mystery">
      ${MYSTERY_ORDER.map(k => `<option value="${k}" ${k === selected ? 'selected' : ''}>${MYSTERIES[k].name}${k === auto ? ' (de hoje)' : ''}</option>`).join('')}
    </select>
    <p class="hint">Hoje é ${WEEKDAY_NAMES[today.getDay()]}: a tradição sugere os ${MYSTERIES[auto].name.toLowerCase()}.</p>
  </div>`;
}

let pendingSet = {}; // escolha manual de mistérios antes de iniciar

function viewDay(n) {
  const d = DAYS[n - 1];
  if (!d) return viewNotFound();
  const st = state.days[n];
  const key = 'd' + n;
  const session = state.sessions[key];
  const auto = todaysMysterySet();
  const selected = session ? session.set : (pendingSet[key] || auto);

  let actions;
  if (session) {
    const steps = buildSteps(session);
    const step = steps[Math.min(session.step, steps.length - 1)];
    actions = `<button class="btn btn-primary btn-block btn-big" data-action="open-session" data-key="${key}">
        CONTINUAR A ORAÇÃO <small>${esc(stepShortName(step, session))}</small></button>
      <button class="btn btn-text" data-action="restart-session" data-key="${key}">Recomeçar este dia do início</button>`;
  } else {
    actions = `<button class="btn btn-primary btn-block btn-big" data-action="start-day" data-day="${n}">
      ${st.done ? 'REZAR ESTE DIA NOVAMENTE' : 'INICIAR A ORAÇÃO'}</button>`;
  }

  return `${topBar('#dias', 'Nove dias', `Dia ${n} de 9`)}
  <main class="page day" id="main">
    <p class="eyebrow">Dia ${n} de 9 ${st.done ? '· <span class="done-text">Concluído ✓</span>' : ''}</p>
    <h1 tabindex="-1">${esc(d.title)}</h1>
    ${ORNAMENT}
    <blockquote class="verse"><p>“${esc(d.verse.text)}”</p><cite>${esc(d.verse.ref)}</cite></blockquote>
    <section class="card">
      <h2 class="card-title">Reflexão</h2>
      <p>${esc(d.reflection)}</p>
    </section>
    <section class="card card-accent">
      <h2 class="card-title">Intenção do dia</h2>
      <p>${esc(d.intention)}</p>
    </section>
    <details class="card">
      <summary class="card-title">Meditação da novena · ${esc(d.meditationTitle)}</summary>
      <p>${esc(d.meditation)}</p>
      <p class="hint">Ela também aparece durante a oração.</p>
    </details>
    <section class="card">
      <label class="card-title" for="personal">Minha intenção pessoal <span class="optional">(opcional)</span></label>
      <textarea id="personal" rows="3" data-input="personal" data-day="${n}" placeholder="Escreva aqui, se quiser, o que deseja confiar a Nossa Senhora hoje.">${esc(st.personal)}</textarea>
      <p class="hint saved-hint" aria-live="polite"></p>
    </section>
    ${session ? sessionSummary(session) : rosaryChoice() + (state.settings.rosary === 'nenhum' ? '' : mysterySelector(selected, auto))}
    <div class="actions sticky-actions">${actions}</div>
  </main>`;
}

function rosaryChoice() {
  const cur = state.settings.rosary;
  return `<div class="setting rosary-choice">
    <span class="setting-label" id="lbl-rosary">Como rezar hoje</span>
    <div class="choice-list" role="radiogroup" aria-labelledby="lbl-rosary">
      ${ROSARY_OPTIONS.map(([v, l, h]) => `<button role="radio" aria-checked="${cur === v}" class="choice ${cur === v ? 'on' : ''}" data-action="rosary" data-value="${v}">
        <b>${l}</b><span>${h}</span></button>`).join('')}
    </div>
  </div>`;
}

function sessionSummary(session) {
  const opt = ROSARY_OPTIONS.find(o => o[0] === (session.rosary || 'ave'));
  return `<p class="hint">Oração em andamento: <b>${opt[1]}</b>${session.rosary === 'nenhum' ? '' : ` · ${MYSTERIES[session.set].name}`}.</p>`;
}

/* --- Terço Mariano (avulso) --- */
function viewTerco() {
  const key = 'terco';
  const session = state.sessions[key];
  const auto = todaysMysterySet();
  const selected = session ? session.set : (pendingSet[key] || auto);
  const set = MYSTERIES[selected];

  const actions = session
    ? `<button class="btn btn-primary btn-block btn-big" data-action="open-session" data-key="terco">CONTINUAR O TERÇO
        <small>${esc(stepShortName(buildSteps(session)[session.step] || {}, session))}</small></button>
       <button class="btn btn-text" data-action="restart-session" data-key="terco">Recomeçar o terço do início</button>`
    : `<button class="btn btn-primary btn-block btn-big" data-action="start-terco">REZAR O TERÇO</button>`;

  return `${topBar('#inicio', 'Início', 'Terço Mariano')}
  <main class="page" id="main">
    <h1 tabindex="-1">Terço Mariano</h1>
    <p class="subtitle">Cinco mistérios, um de cada vez. O aplicativo conta as Ave-Marias por você.</p>
    ${ORNAMENT}
    ${session ? `<p class="hint">Mistérios deste terço: <b>${MYSTERIES[session.set].name}</b>.</p>` : mysterySelector(selected, auto)}
    <section class="card">
      <h2 class="card-title">${esc(set.name)}</h2>
      <p class="hint">${esc(set.days)}</p>
      <ol class="mystery-list">
        ${set.items.map((m, i) => `<li><span class="m-ord">${ORDINALS[i]}</span> ${esc(m.title)}</li>`).join('')}
      </ol>
    </section>
    <div class="actions sticky-actions">${actions}</div>
    <p class="hint center">A Jaculatória de Fátima pode ser ativada ou desativada em <a href="#ajustes">Ajustes</a>.</p>
  </main>`;
}

/* --- Modo guiado --- */
function segmentTracker(step, session) {
  if (session.rosary === 'nenhum') return '';
  const labels = ['Abertura', '1', '2', '3', '4', '5', 'Final'];
  return `<ol class="tracker" aria-hidden="true">${labels.map((l, i) =>
    `<li class="${i < step.seg ? 'past' : ''} ${i === step.seg ? 'now' : ''} ${i >= 1 && i <= 5 ? 'dec' : ''}">${l}</li>`).join('')}</ol>`;
}

function viewFlow(key) {
  const session = state.sessions[key];
  if (!session) {
    location.replace(key === 'terco' ? '#terco' : `#dia-${key.slice(1)}`);
    return '';
  }
  const steps = buildSteps(session);
  if (session.step >= steps.length) session.step = steps.length - 1;
  // se a etapa atual estiver oculta (ex.: jaculatória desativada), avança
  while (!isVisible(steps[session.step]) && session.step < steps.length - 1) session.step++;
  const step = steps[session.step];
  const visible = steps.filter(isVisible);
  const pos = visible.indexOf(step) + 1;
  const total = visible.length;
  const nextStep = visible[pos]; // pode ser undefined
  const isLast = pos === total;

  const context = session.mode === 'novena'
    ? `Dia ${session.day} de 9 · ${DAYS[session.day - 1].title}`
    : `Terço · ${MYSTERIES[session.set].name}`;

  let body = '';
  let primary = '';
  const nextLabel = isLast
    ? (session.mode === 'novena' ? 'CONCLUIR O DIA' : 'CONCLUIR O TERÇO')
    : 'PRÓXIMA ORAÇÃO';
  const nextSub = nextStep ? `<small>a seguir: ${esc(stepShortName(nextStep, session))}</small>` : '';
  const nextBtn = `<button class="btn btn-primary btn-big grow" data-action="next">${nextLabel}${nextSub}</button>`;

  if (step.kind === 'prayer') {
    const lines = step.custom || PRAYERS[step.p].text;
    body = `<p class="eyebrow">${esc(step.section)}</p>
      <h1 tabindex="-1">${esc(stepTitle(step))}</h1>
      <div class="prayer-text">${renderPrayerText(lines)}</div>`;
    primary = nextBtn;
  } else if (step.kind === 'mystery') {
    const m = MYSTERIES[session.set].items[step.decade];
    body = `<p class="eyebrow">${esc(step.section)}</p>
      <h1 tabindex="-1">${esc(m.title)}</h1>
      <p class="ref">${esc(m.ref)}</p>
      ${ORNAMENT}
      <div class="prayer-text"><p>${esc(m.reflection)}</p>
      <p class="rubric">Contemple este mistério por alguns instantes. Quando quiser, siga para o Pai-Nosso.</p></div>`;
    primary = nextBtn;
  } else if (step.kind === 'count') {
    const count = Math.min(session.counts[step.id] || 0, step.total);
    const unit = step.unit || 'Ave-Maria';
    const complete = count >= step.total;
    let beads = '';
    for (let i = 1; i <= step.total; i++) {
      const cls = i <= count ? 'done' : (i === count + 1 ? 'next' : '');
      const lab = step.labels ? `<span class="bead-label">${step.labels[i - 1]}</span>` : '';
      beads += `<li><button class="bead ${cls}" data-action="set-count" data-n="${i}" aria-label="${unit} ${i}${i <= count ? ', rezada' : ''}" aria-pressed="${i <= count}">${i}</button>${lab}</li>`;
    }
    const heading = complete
      ? (step.total === 10 ? 'Dezena completa' : 'Três Ave-Marias rezadas')
      : `${unit} ${count + 1} de ${step.total}`;
    body = `<p class="eyebrow">${esc(step.section)}</p>
      <h1 tabindex="-1">${esc(step.title)}</h1>
      ${step.intro ? `<p class="intro">${esc(step.intro)}</p>` : ''}
      <p class="count-status" aria-live="polite">${heading}</p>
      <ol class="beads beads-${step.total}" aria-label="Contador de Ave-Marias">${beads}</ol>
      <div class="count-tools">
        <button class="btn btn-text" data-action="undo-count" ${count ? '' : 'disabled'}>Desfazer a última</button>
        ${!complete ? `<button class="btn btn-text" data-action="next">Avançar etapa ›</button>` : ''}
      </div>
      <div class="prayer-text ${complete ? 'muted-text' : ''}">${renderPrayerText(PRAYERS[step.p].text)}</div>`;
    primary = complete
      ? nextBtn
      : `<button class="btn btn-primary btn-big grow" data-action="count" aria-label="Rezei: ${unit} ${count + 1} de ${step.total}">REZEI ✓<small>${unit} ${count + 1} de ${step.total}</small></button>`;
  } else if (step.kind === 'intention') {
    const st = state.days[session.day];
    const ints = state.intentions;
    body = `<p class="eyebrow">${esc(step.section)}</p>
      <h1 tabindex="-1">Intenção do dia</h1>
      <p class="intro">Apresente com calma a graça que deseja alcançar. Depois da súplica, reze as três Ave-Marias.</p>
      <section class="card card-accent"><h2 class="card-title">${esc(DAYS[session.day - 1].title)}</h2><p>${esc(DAYS[session.day - 1].intention)}</p></section>
      <section class="card">
        <label class="card-title" for="personal">Minha intenção pessoal <span class="optional">(opcional)</span></label>
        <textarea id="personal" rows="3" data-input="personal" data-day="${session.day}" placeholder="Escreva, se quiser.">${esc(st.personal)}</textarea>
        <p class="hint saved-hint" aria-live="polite"></p>
      </section>
      ${ints.length ? `<details class="card"><summary class="card-title">Minhas intenções salvas (${ints.length})</summary>
        <ul class="int-mini">${ints.map(i => `<li><span class="tag tag-${i.type}">${TYPE_LABEL[i.type]}</span> ${esc(i.text)}</li>`).join('')}</ul></details>` : ''}
      ${timerWidget()}`;
    primary = nextBtn;
  }

  return `<div class="flow" data-kind="${step.kind}">
    <header class="flow-top">
      <div class="flow-bar">
        <button class="btn btn-ghost" data-action="pause" aria-label="Pausar e voltar ao início"><span aria-hidden="true">❙❙</span> Pausar</button>
        <span class="flow-context">${esc(context)}</span>
        <button class="btn btn-ghost" data-action="open-display" aria-label="Ajustes de leitura">Aa</button>
      </div>
      <div class="flow-meta">
        ${segmentTracker(step, session)}
        <p class="flow-where"><span>${esc(step.section)}</span><span>Etapa ${pos} de ${total}</span></p>
        <div class="bar thin" role="progressbar" aria-label="Progresso da oração" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${pos}"><span style="width:${(pos / total) * 100}%"></span></div>
      </div>
    </header>
    <main class="flow-body" id="main">${body}</main>
    <footer class="flow-nav">
      <button class="btn btn-secondary" data-action="prev" ${pos <= 1 ? 'disabled' : ''} aria-label="Voltar para a oração anterior">‹ Voltar</button>
      ${primary}
    </footer>
  </div>`;
}

/* --- Conclusão --- */
function viewDone(which) {
  if (which === 'terco') {
    return `<main class="page done-page" id="main">
      ${ORNAMENT}
      <h1 tabindex="-1">Terço concluído</h1>
      <p class="done-message">Obrigado por este momento de oração. Que Nossa Senhora acompanhe você.</p>
      <div class="actions"><a class="btn btn-primary btn-block btn-big" href="#inicio">VOLTAR AO INÍCIO</a></div>
    </main>`;
  }
  const n = parseInt(which, 10);
  const done = completedCount();
  const next = nextDayAfter(n);
  const all = done === 9;
  return `<main class="page done-page" id="main">
    <img class="done-img" src="${NS_IMG}" alt="" width="120" height="180">
    <p class="eyebrow">Dia ${n} de 9</p>
    <h1 tabindex="-1">${all ? 'Novena concluída' : 'Dia concluído'}</h1>
    ${ORNAMENT}
    <p class="done-message">${esc(COMPLETION_MESSAGE)}</p>
    ${all ? '<p class="done-message">Você rezou os nove dias da sua novena. Entregue tudo nas mãos de Deus, por meio de Nossa Senhora das Graças, e siga em paz.</p>' : ''}
    <section class="progress-card">
      <p class="progress-count"><strong>${done} de 9</strong> dias concluídos</p>
      ${dayDots(next)}
      ${next ? `<p class="hint">Próximo: <b>Dia ${next} — ${esc(DAYS[next - 1].title)}</b>. Quando for o seu momento de oração, é só voltar.</p>` : ''}
    </section>
    <div class="actions"><a class="btn btn-primary btn-block btn-big" href="#inicio">VOLTAR AO INÍCIO</a>
    <a class="btn btn-text" href="#intencoes">Ver minhas intenções</a></div>
  </main>`;
}

/* --- Minhas intenções --- */
const TYPE_LABEL = { pedido: 'Pedido', pessoa: 'Pessoa', agradecimento: 'Agradecimento' };
const TYPE_PLURAL = { pedido: 'Pedidos', pessoa: 'Pessoas', agradecimento: 'Agradecimentos' };
const TYPE_PLACEHOLDER = {
  pedido: 'Escreva o seu pedido de oração.',
  pessoa: 'Nome da pessoa (e, se quiser, por que deseja rezar por ela).',
  agradecimento: 'Pelo que você deseja agradecer?'
};
let intFilter = 'todos';
let intNewType = 'pedido';
let intEditing = null;

function viewIntentions() {
  const list = state.intentions
    .filter(i => intFilter === 'todos' || i.type === intFilter)
    .slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  const personalDays = DAYS.filter(d => state.days[d.n].personal && state.days[d.n].personal.trim());

  const filters = [['todos', 'Todas'], ['pedido', 'Pedidos'], ['pessoa', 'Pessoas'], ['agradecimento', 'Agradecimentos']];

  const items = list.length ? list.map(i => {
    if (intEditing === i.id) {
      return `<li class="int-item editing">
        <div class="segmented small" role="radiogroup" aria-label="Tipo">
          ${Object.keys(TYPE_LABEL).map(t => `<button role="radio" aria-checked="${i.type === t}" class="seg ${i.type === t ? 'on' : ''}" data-action="edit-type" data-id="${i.id}" data-value="${t}">${TYPE_LABEL[t]}</button>`).join('')}
        </div>
        <label class="sr-only" for="edit-${i.id}">Editar texto</label>
        <textarea id="edit-${i.id}" rows="3">${esc(i.text)}</textarea>
        <div class="row-actions">
          <button class="btn btn-text" data-action="cancel-edit">Cancelar</button>
          <button class="btn btn-primary" data-action="save-edit" data-id="${i.id}">Salvar</button>
        </div></li>`;
    }
    return `<li class="int-item">
      <div class="int-head"><span class="tag tag-${i.type}">${TYPE_LABEL[i.type]}</span><span class="hint">${fmtDate(i.createdAt)}</span></div>
      <p class="int-text">${esc(i.text)}</p>
      <div class="row-actions">
        <button class="btn btn-text" data-action="edit-int" data-id="${i.id}">Editar</button>
        <button class="btn btn-text danger" data-action="del-int" data-id="${i.id}">Excluir</button>
      </div></li>`;
  }).join('') : `<li class="empty">${intFilter === 'todos' ? 'Ainda não há intenções registradas. Quando quiser, escreva a primeira acima.' : 'Nada registrado nesta categoria ainda.'}</li>`;

  return `${topBar('#inicio', 'Início', 'Minhas intenções')}
  <main class="page" id="main">
    <h1 tabindex="-1">Minhas intenções</h1>
    <p class="subtitle">Um espaço privado. Tudo fica salvo apenas neste aparelho.</p>
    <section class="card">
      <h2 class="card-title">Nova intenção</h2>
      <div class="segmented" role="radiogroup" aria-label="Tipo de intenção">
        ${Object.keys(TYPE_LABEL).map(t => `<button role="radio" aria-checked="${intNewType === t}" class="seg ${intNewType === t ? 'on' : ''}" data-action="new-type" data-value="${t}">${TYPE_LABEL[t]}</button>`).join('')}
      </div>
      <label class="sr-only" for="new-int">Texto da intenção</label>
      <textarea id="new-int" rows="3" placeholder="${esc(TYPE_PLACEHOLDER[intNewType])}"></textarea>
      <button class="btn btn-primary btn-block" data-action="add-int">Salvar intenção</button>
    </section>
    <div class="segmented filters" role="radiogroup" aria-label="Filtrar">
      ${filters.map(([v, l]) => `<button role="radio" aria-checked="${intFilter === v}" class="seg ${intFilter === v ? 'on' : ''}" data-action="filter-int" data-value="${v}">${l}</button>`).join('')}
    </div>
    <ul class="int-list">${items}</ul>
    ${personalDays.length ? `<section class="card">
      <h2 class="card-title">Intenções escritas nos dias da novena</h2>
      <ul class="int-mini">${personalDays.map(d => `<li><b>Dia ${d.n}:</b> ${esc(state.days[d.n].personal)}</li>`).join('')}</ul>
    </section>` : ''}
    <div class="actions">
      <button class="btn btn-secondary btn-block" data-action="export-int">${EMBED ? 'Exportar intenções (copiar texto)' : 'Exportar intenções (arquivo de texto)'}</button>
    </div>
  </main>`;
}

function intentionsText() {
  const lines = [];
  lines.push('MINHAS INTENÇÕES — Novena de Nossa Senhora das Graças');
  lines.push('Exportado em ' + new Date().toLocaleString('pt-BR'));
  lines.push('');
  ['pedido', 'pessoa', 'agradecimento'].forEach(t => {
    const items = state.intentions.filter(i => i.type === t);
    lines.push(TYPE_PLURAL[t].toUpperCase());
    if (!items.length) lines.push('  (nenhum registro)');
    items.forEach(i => lines.push(`  • ${i.text.replace(/\n/g, '\n    ')}  (${fmtDate(i.createdAt)})`));
    lines.push('');
  });
  const pd = DAYS.filter(d => (state.days[d.n].personal || '').trim());
  if (pd.length) {
    lines.push('INTENÇÕES PESSOAIS DOS DIAS DA NOVENA');
    pd.forEach(d => lines.push(`  Dia ${d.n} (${d.title}): ${state.days[d.n].personal.replace(/\n/g, '\n    ')}`));
    lines.push('');
  }
  return lines.join('\r\n');
}

function exportIntentions() {
  const text = intentionsText();
  if (EMBED) {
    openModal(`
      <div class="sheet-head"><h2 class="modal-title">Minhas intenções em texto</h2>
      <button class="btn btn-text" data-action="close-modal">Fechar</button></div>
      <p class="hint">Copie o texto e cole onde quiser guardar: bloco de notas, e-mail ou mensagem.</p>
      <label class="sr-only" for="export-text">Texto das intenções</label>
      <textarea id="export-text" class="export-text" readonly>${esc(text)}</textarea>
      <button class="btn btn-primary btn-block" data-action="copy-export" autofocus>Copiar texto</button>`, { label: 'Exportar intenções' });
    return;
  }
  const blob = new Blob(['\ufeff' + text], { type: 'text/plain;charset=utf-8' });  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `minhas-intencoes-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast('Arquivo de intenções gerado.');
}

/* --- Todas as orações (consulta e impressão) --- */
function viewPrayers() {
  const prayers = PRAYER_ORDER.map(k => `<article class="prayer-block">
      <h2>${esc(PRAYERS[k].title)}</h2>
      <div class="prayer-text">${renderPrayerText(PRAYERS[k].text)}</div>
    </article>`).join('');
  const mysteries = MYSTERY_ORDER.map(k => {
    const s = MYSTERIES[k];
    return `<article class="prayer-block">
      <h3>${esc(s.name)} <span class="hint">· ${esc(s.days)}</span></h3>
      <ol class="mystery-list">${s.items.map((m, i) => `<li><span class="m-ord">${ORDINALS[i]}</span> ${esc(m.title)} <span class="hint">(${esc(m.ref)})</span></li>`).join('')}</ol>
    </article>`;
  }).join('');
  const days = DAYS.map(d => `<li><b>Dia ${d.n} — ${esc(d.title)}.</b> ${esc(d.intention)}<br><i>Meditação: ${esc(d.meditationTitle)}.</i> ${esc(d.meditation)}</li>`).join('');

  return `${topBar('#inicio', 'Início', 'Orações')}
  <main class="page prayers-page" id="main">
    <h1 tabindex="-1">Orações da novena</h1>
    <p class="subtitle">Todas as orações, completas, para consultar${EMBED ? '' : ' ou imprimir'}.</p>
    ${EMBED ? '' : '<div class="actions no-print"><button class="btn btn-secondary btn-block" data-action="print">Imprimir as orações</button></div>'}
    ${ORNAMENT}
    <section class="card order-card">
      <h2 class="card-title">Como rezar cada dia</h2>
      <ol class="order-list">
        <li>Sinal da Cruz</li><li>Invocação ao Espírito Santo</li><li>Oferecimento do Terço</li><li>Credo</li>
        <li>Pai-Nosso</li><li>Três Ave-Marias</li><li>Glória ao Pai</li>
        <li>Cinco dezenas: anúncio do mistério, Pai-Nosso, dez Ave-Marias (ou dez vezes a jaculatória “Ó Maria concebida sem pecado”, no terço da Medalha), Glória ao Pai e Jaculatória de Fátima</li>
        <li>Salve-Rainha</li><li>Ato de contrição</li><li>Meditação do dia</li><li>Súplica a Nossa Senhora</li>
        <li>Três Ave-Marias e a jaculatória “Ó Maria concebida sem pecado”</li>
        <li>Oração final</li><li>Sinal da Cruz</li>
      </ol>
      <p class="hint">O terço é opcional. Na tela de cada dia você escolhe: só a novena (sem os itens 3 a 9), novena com terço ou novena com o terço da Medalha.</p>
    </section>
    ${prayers}
    <h2 class="section-title">Mistérios do Rosário</h2>
    ${mysteries}
    <h2 class="section-title">Os nove dias</h2>
    <ol class="print-days">${days}</ol>
  </main>`;
}

/* --- Ajustes --- */
let installPrompt = null;
function viewSettings() {
  return `${topBar('#inicio', 'Início', 'Ajustes')}
  <main class="page" id="main">
    <h1 tabindex="-1">Ajustes</h1>
    <section class="card settings-list">${settingsControls('page')}</section>
    <section class="card">
      <h2 class="card-title">Ferramentas</h2>
      <div class="stack">
        <a class="btn btn-secondary btn-block" href="#silencio">Momento de oração silenciosa</a>
        <a class="btn btn-secondary btn-block" href="#oracoes">${EMBED ? 'Ver todas as orações' : 'Ver e imprimir as orações'}</a>
        <a class="btn btn-secondary btn-block" href="#intencoes">Exportar minhas intenções</a>
        ${installPrompt ? '<button class="btn btn-secondary btn-block" data-action="install">Instalar como aplicativo</button>' : ''}
        ${EMBED ? '' : '<a class="btn btn-secondary btn-block" href="#ajuda">Como instalar no celular</a>'}
      </div>
    </section>
    <section class="card">
      <h2 class="card-title">Recomeçar</h2>
      <p class="hint">Apaga o progresso dos nove dias e recomeça do Dia 1. Suas intenções salvas são mantidas.</p>
      <button class="btn btn-secondary btn-block" data-action="reset-novena">Reiniciar a novena</button>
    </section>
    <p class="hint center">Seus dados ficam somente neste aparelho. Nada é enviado para a internet.</p>
  </main>`;
}

function viewSilence() {
  return `${topBar('#ajustes', 'Ajustes', 'Silêncio')}
  <main class="page" id="main">
    <h1 tabindex="-1">Momento de silêncio</h1>
    <p class="subtitle">Escolha um tempo, respire com calma e fique na presença de Deus.</p>
    ${ORNAMENT}
    ${timerWidget()}
  </main>`;
}

function viewAbout() {
  return `${topBar('#inicio', 'Início', 'Sobre')}
  <main class="page" id="main">
    <h1 tabindex="-1">Nossa Senhora das Graças</h1>
    <p class="subtitle">A história da Medalha Milagrosa</p>
    ${ORNAMENT}
    ${ABOUT.map(a => `<section class="card"><h2 class="card-title">${esc(a.h)}</h2><p>${esc(a.p)}</p></section>`).join('')}
    <div class="actions"><a class="btn btn-primary btn-block" href="#inicio">VOLTAR AO INÍCIO</a></div>
  </main>`;
}

function viewHelp() {
  return `${topBar('#ajustes', 'Ajustes', 'Instalar')}
  <main class="page help" id="main">
    <h1 tabindex="-1">Como instalar no celular</h1>
    <section class="card">
      <h2 class="card-title">iPhone (Safari)</h2>
      <ol>
        <li>Abra este endereço no <b>Safari</b>.</li>
        <li>Toque no botão <b>Compartilhar</b> (quadrado com seta para cima).</li>
        <li>Escolha <b>Adicionar à Tela de Início</b>.</li>
        <li>Toque em <b>Adicionar</b>. O ícone da novena aparecerá na sua tela.</li>
      </ol>
    </section>
    <section class="card">
      <h2 class="card-title">Android (Chrome)</h2>
      <ol>
        <li>Abra este endereço no <b>Chrome</b>.</li>
        <li>Toque no menu <b>⋮</b> e escolha <b>Instalar aplicativo</b> ou <b>Adicionar à tela inicial</b>.</li>
      </ol>
    </section>
    <section class="card">
      <h2 class="card-title">Sem internet</h2>
      <p>Depois de aberto uma vez, o aplicativo funciona sem internet. Seu progresso e suas intenções ficam salvos no próprio aparelho.</p>
    </section>
  </main>`;
}

function viewNotFound() {
  return `${topBar('#inicio', 'Início')}
  <main class="page" id="main"><h1 tabindex="-1">Página não encontrada</h1>
  <p>Vamos voltar ao início.</p><a class="btn btn-primary btn-block" href="#inicio">IR PARA O INÍCIO</a></main>`;
}

/* ---------------------------------------------------------
   9. Roteamento
   --------------------------------------------------------- */
/* Rotas simples no formato #nome ou #nome-argumento (ex.: #dia-3, #rezar-d3).
   Também aceita o formato antigo #/nome/argumento. */
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const i = h.search(/[\/-]/);
  const name = i < 0 ? h : h.slice(0, i);
  const arg = i < 0 ? '' : h.slice(i + 1);
  return [name === 'inicio' ? '' : name, arg];
}

let currentRoute = '';
function render() {
  const [name, arg] = parseHash();
  const hash = name + '/' + arg;
  const routeChanged = hash !== currentRoute;
  currentRoute = hash;
  let html;
  document.body.classList.toggle('in-flow', name === 'rezar');
  switch (name || '') {
    case '': html = viewHome(); break;
    case 'dias': html = viewDays(); break;
    case 'dia': html = viewDay(parseInt(arg, 10)); break;
    case 'rezar': html = viewFlow(arg); break;
    case 'concluido': html = viewDone(arg); break;
    case 'terco': html = viewTerco(); break;
    case 'intencoes': html = viewIntentions(); break;
    case 'oracoes': html = viewPrayers(); break;
    case 'ajustes': html = viewSettings(); break;
    case 'silencio': html = viewSilence(); break;
    case 'ajuda': html = viewHelp(); break;
    case 'sobre': html = viewAbout(); break;
    default: html = viewNotFound();
  }
  if (!html) return;
  app().innerHTML = html;

  if (name === 'rezar') requestWakeLock(); else releaseWakeLock();

  if (routeChanged) {
    window.scrollTo(0, 0);
    const h = $('h1', app());
    if (h) h.focus({ preventScroll: true });
  }
}

/* Re-renderiza a tela do modo guiado após mudar de etapa */
function rerenderFlow() {
  render();
  window.scrollTo(0, 0);
  const h = $('.flow-body h1');
  if (h) h.focus({ preventScroll: true });
}

/* ---------------------------------------------------------
   10. Ações
   --------------------------------------------------------- */
function startSession(key, mode, day) {
  const set = pendingSet[key] || todaysMysterySet();
  state.sessions[key] = {
    mode, day: day || null, set, step: 0, counts: {},
    rosary: mode === 'novena' ? state.settings.rosary : 'ave',
    startedAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  delete pendingSet[key];
  state.lastActive = key;
  save();
  location.hash = `#rezar-${key}`;
}

function activeKey() {
  const [name, arg] = parseHash();
  return name === 'rezar' ? arg : null;
}

function moveStep(dir) {
  const key = activeKey();
  const session = state.sessions[key];
  if (!session) return;
  const steps = buildSteps(session);
  let i = session.step + dir;
  while (i >= 0 && i < steps.length && !isVisible(steps[i])) i += dir;
  if (i < 0) return;
  if (i >= steps.length) { finishSession(key); return; }
  session.step = i;
  session.updatedAt = new Date().toISOString();
  state.lastActive = key;
  save();
  rerenderFlow();
}

function finishSession(key) {
  const session = state.sessions[key];
  delete state.sessions[key];
  if (state.lastActive === key) state.lastActive = null;
  if (session && session.mode === 'novena') {
    state.days[session.day].done = true;
    state.days[session.day].doneAt = new Date().toISOString();
    save();
    location.hash = `#concluido-${session.day}`;
  } else {
    save();
    location.hash = '#concluido-terco';
  }
}

function countAction(kind, n) {
  const key = activeKey();
  const session = state.sessions[key];
  if (!session) return;
  const step = buildSteps(session)[session.step];
  if (step.kind !== 'count') return;
  let c = session.counts[step.id] || 0;
  if (kind === 'count') c = Math.min(step.total, c + 1);
  else if (kind === 'undo') c = Math.max(0, c - 1);
  else if (kind === 'set') c = (n === c) ? n - 1 : n; // tocar na última conta desfaz
  session.counts[step.id] = c;
  session.updatedAt = new Date().toISOString();
  save();
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
  // mantém o foco no botão principal para toques seguidos
  const main = $('.flow-nav .btn-primary');
  if (main) main.focus({ preventScroll: true });
}

function goResume() {
  const key = state.lastActive;
  if (key && state.sessions[key]) { location.hash = `#rezar-${key}`; return; }
  const cur = currentDay();
  location.hash = cur ? `#dia-${cur}` : '#dias';
}

async function toggleFullscreen() {
  const el = document.documentElement;
  const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
  try {
    if (fsEl) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      return;
    }
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) { await req.call(el); closeModal(); return; }
  } catch (e) { /* segue para o modo alternativo */ }
  state.settings.clean = true;
  save(); applySettings(); closeModal(); render();
  toast('Este navegador não permite tela cheia. Ativamos a tela de oração limpa. No iPhone, instale o app na Tela de Início para ler em tela cheia.');
}

const savePersonal = debounce((day, value, hintEl) => {
  state.days[day].personal = value;
  save();
  if (hintEl && document.contains(hintEl)) hintEl.textContent = 'Salvo automaticamente.';
}, 500);

async function handleAction(btn) {
  const a = btn.dataset.action;
  const s = state.settings;
  switch (a) {
    case 'resume': goResume(); break;
    case 'start-day': startSession('d' + btn.dataset.day, 'novena', parseInt(btn.dataset.day, 10)); break;
    case 'start-terco': startSession('terco', 'terco'); break;
    case 'open-session':
      state.lastActive = btn.dataset.key; save();
      location.hash = `#rezar-${btn.dataset.key}`; break;
    case 'restart-session': {
      const ok = await confirmDialog({
        title: 'Recomeçar do início?',
        text: 'A oração em andamento voltará para a primeira etapa.',
        confirmLabel: 'Recomeçar'
      });
      if (ok) {
        const ses = state.sessions[btn.dataset.key];
        startSession(btn.dataset.key, ses ? ses.mode : 'terco', ses ? ses.day : null);
      }
      break;
    }
    case 'rosary': state.settings.rosary = btn.dataset.value; save(); render(); break;
    case 'next': moveStep(1); break;
    case 'prev': moveStep(-1); break;
    case 'count': countAction('count'); break;
    case 'undo-count': countAction('undo'); break;
    case 'set-count': countAction('set', parseInt(btn.dataset.n, 10)); break;
    case 'pause':
      save();
      location.hash = '#inicio';
      toast('Sua oração foi guardada. Continue quando quiser.');
      break;
    case 'open-display': openDisplaySheet(); break;
    case 'close-modal': closeModal(); break;
    case 'fullscreen': toggleFullscreen(); break;
    case 'font-up': s.font = Math.min(FONT_LEVELS.length - 1, s.font + 1); save(); applySettings(); refreshSheet(); if (!$('#modal')) render(); break;
    case 'font-down': s.font = Math.max(0, s.font - 1); save(); applySettings(); refreshSheet(); if (!$('#modal')) render(); break;
    case 'theme': s.theme = btn.dataset.value; save(); applySettings(); refreshSheet(); if (!$('#modal')) render(); break;
    case 'toggle': {
      const k = btn.dataset.key;
      s[k] = !s[k]; save(); applySettings();
      if (k === 'wakeLock' && !s[k]) releaseWakeLock();
      if ($('#modal')) { refreshSheet(); if (activeKey()) render(); } else render();
      break;
    }
    case 'reset-novena': {
      const ok = await confirmDialog({
        title: 'Reiniciar a novena?',
        text: 'O progresso dos nove dias será apagado e você recomeçará pelo Dia 1. Suas intenções salvas serão mantidas.',
        confirmLabel: 'Sim, reiniciar',
        danger: true
      });
      if (ok) {
        const fresh = defaultState();
        state.days = fresh.days;
        Object.keys(state.sessions).forEach(k => { if (k.startsWith('d')) delete state.sessions[k]; });
        if (state.lastActive && state.lastActive.startsWith('d')) state.lastActive = null;
        save();
        location.hash = '#inicio';
        render();
        toast('A novena foi reiniciada. Comece quando quiser.');
      }
      break;
    }
    case 'print': window.print(); break;
    case 'install':
      if (installPrompt) { installPrompt.prompt(); installPrompt = null; render(); }
      break;
    case 'timer-set': case 'timer-start': case 'timer-pause': case 'timer-reset':
      timerAction(a, parseInt(btn.dataset.min, 10)); break;

    /* Intenções */
    case 'new-type': {
      intNewType = btn.dataset.value;
      const ta = $('#new-int');
      const keep = ta ? ta.value : '';
      render();
      const nt = $('#new-int');
      if (nt) { nt.value = keep; nt.placeholder = TYPE_PLACEHOLDER[intNewType]; }
      break;
    }
    case 'add-int': {
      const ta = $('#new-int');
      const text = ta ? ta.value.trim() : '';
      if (!text) { toast('Escreva a intenção antes de salvar.'); if (ta) ta.focus(); return; }
      const now = new Date().toISOString();
      state.intentions.push({ id: uid(), type: intNewType, text, createdAt: now, updatedAt: now });
      save(); render(); toast('Intenção salva.');
      break;
    }
    case 'filter-int': intFilter = btn.dataset.value; render(); break;
    case 'edit-int': intEditing = btn.dataset.id; render(); { const t = $(`#edit-${btn.dataset.id}`); if (t) t.focus(); } break;
    case 'cancel-edit': intEditing = null; render(); break;
    case 'edit-type': {
      const it = state.intentions.find(i => i.id === btn.dataset.id);
      const t = $(`#edit-${btn.dataset.id}`);
      const keep = t ? t.value : null;
      if (it) { it.type = btn.dataset.value; save(); }
      render();
      const t2 = $(`#edit-${btn.dataset.id}`);
      if (t2 && keep != null) t2.value = keep;
      break;
    }
    case 'save-edit': {
      const it = state.intentions.find(i => i.id === btn.dataset.id);
      const t = $(`#edit-${btn.dataset.id}`);
      const text = t ? t.value.trim() : '';
      if (!text) { toast('O texto não pode ficar vazio.'); return; }
      if (it) { it.text = text; it.updatedAt = new Date().toISOString(); }
      intEditing = null; save(); render(); toast('Intenção atualizada.');
      break;
    }
    case 'del-int': {
      const ok = await confirmDialog({ title: 'Excluir esta intenção?', text: 'Ela será removida deste aparelho.', confirmLabel: 'Excluir', danger: true });
      if (ok) {
        state.intentions = state.intentions.filter(i => i.id !== btn.dataset.id);
        save(); render(); toast('Intenção excluída.');
      }
      break;
    }
    case 'export-int': exportIntentions(); break;
    case 'copy-export': {
      const ta = $('#export-text');
      try {
        await navigator.clipboard.writeText(ta.value);
        toast('Texto copiado.');
      } catch (e) {
        ta.focus(); ta.select();
        toast('Texto selecionado. Use o comando de copiar do seu aparelho.');
      }
      break;
    }
  }
}

/* ---------------------------------------------------------
   11. Inicialização
   --------------------------------------------------------- */
function init() {
  applySettings();

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.disabled) return;
    e.preventDefault();
    handleAction(btn);
  });

  document.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.input === 'personal') {
      const hint = t.parentElement.querySelector('.saved-hint');
      savePersonal(parseInt(t.dataset.day, 10), t.value, hint);
    }
  });

  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.change === 'set-mystery') {
      const [name, arg] = parseHash();
      const key = name === 'terco' ? 'terco' : 'd' + arg;
      pendingSet[key] = t.value;
      render();
      const sel = $('#mset');
      if (sel) sel.focus();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#modal')) { closeModal(); return; }
    if (!activeKey() || $('#modal')) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'textarea' || tag === 'input' || tag === 'select') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); const b = $('.flow-nav .btn-primary'); if (b) handleAction(b); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); moveStep(-1); }
  });

  window.addEventListener('hashchange', () => { closeModal(); render(); });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && activeKey()) requestWakeLock();
    if (document.visibilityState === 'hidden') save();
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applySettings);

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installPrompt = e;
    if (location.hash.startsWith('#ajustes')) render();
  });

  render();

  if (!EMBED && 'serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
}

document.addEventListener('DOMContentLoaded', init);

