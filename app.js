const TASKS = {
  setup: [
    'Unload equipment from vehicle',
    'Weather check through both BOM and Willy Weather',
    'Setup exclusion zone',
    'Measure out peg/weights location',
    'Roll out screen',
    'Connect straps',
    'Run power and audio cables',
    'Start generator if applicable',
    'Inflate screen',
    'Setup projector',
    'Test audio'
  ],
  movie: [
    'Top up screen prior to movie start',
    'Start the movie',
    'Confirm audio levels are correct',
    'Safety check pegs 20 min interval',
    'Safety check pegs 40 min',
    'Top up screen with air if required',
    'Safety check pegs 60 min',
    'Safety check pegs 80 min',
    'Top up screen with air if required',
    'Safety check pegs 100 min',
    'Safety check pegs 120 min',
    'Top up screen with air if required',
    'Safety check pegs 140 min',
    'Safety check pegs 160 min',
    'Safety check pegs 180 min',
    'Safety check pegs 200 min',
    'Safety check pegs 220 min',
    'Safety check pegs 240 min'
  ],
  packup: [
    'Deflate the screen',
    'Pack away straps and pegs',
    'Collect and secure all cables',
    'Pack projector and audio gear',
    'Load equipment into vehicle',
    'Do a last check to ensure nothing is left behind'
  ]
};

const STORAGE_KEY = 'aoc-checklist-state-v2';
const HISTORY_KEY = 'aoc-checklist-history-v1';
const THEME_KEY = 'aoc-checklist-theme';
const totalTasks = Object.values(TASKS).reduce((sum, arr) => sum + arr.length, 0);

const defaultState = () => ({
  details: { staffName: '', eventLocation: '', eventDate: '', managerEmail: '' },
  setup: Array(TASKS.setup.length).fill(false),
  movie: Array(TASKS.movie.length).fill(false),
  packup: Array(TASKS.packup.length).fill(false),
  notes: { setup: '', movie: '', packup: '' },
  timestamps: {
    setup: Array(TASKS.setup.length).fill(''),
    movie: Array(TASKS.movie.length).fill(''),
    packup: Array(TASKS.packup.length).fill('')
  },
  signatureDataUrl: '',
  started: false
});

let state = defaultState();
let signaturePad;

function $(id) { return document.getElementById(id); }

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    const fresh = defaultState();
    state = {
      ...fresh,
      ...saved,
      details: { ...fresh.details, ...(saved.details || {}) },
      notes: { ...fresh.notes, ...(saved.notes || {}) },
      timestamps: {
        setup: Array.isArray(saved?.timestamps?.setup) ? saved.timestamps.setup : fresh.timestamps.setup,
        movie: Array.isArray(saved?.timestamps?.movie) ? saved.timestamps.movie : fresh.timestamps.movie,
        packup: Array.isArray(saved?.timestamps?.packup) ? saved.timestamps.packup : fresh.timestamps.packup
      }
    };
    ['setup', 'movie', 'packup'].forEach(group => {
      if (!Array.isArray(state[group]) || state[group].length !== TASKS[group].length) state[group] = fresh[group];
      if (!Array.isArray(state.timestamps[group]) || state.timestamps[group].length !== TASKS[group].length) state.timestamps[group] = fresh.timestamps[group];
    });
  } catch (error) {
    console.warn('Could not load saved state.', error);
    state = defaultState();
  }
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(items) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

function formatDate(dateValue) {
  if (!dateValue) return '-';
  const date = new Date(dateValue + 'T00:00:00');
  return Number.isNaN(date.getTime()) ? dateValue : date.toLocaleDateString();
}

function formatDateTime(dateValue) {
  if (!dateValue) return '—';
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? dateValue : date.toLocaleString();
}

function updateSummary() {
  $('summaryStaff').textContent = state.details.staffName || '-';
  $('summaryLocation').textContent = state.details.eventLocation || '-';
  $('summaryDate').textContent = formatDate(state.details.eventDate);
  $('summaryEmail').textContent = state.details.managerEmail || '-';
}

function getCompletedCount() {
  return [...state.setup, ...state.movie, ...state.packup].filter(Boolean).length;
}

function updateProgress() {
  const completed = getCompletedCount();
  const percent = Math.round((completed / totalTasks) * 100);
  $('progressCount').textContent = completed;
  $('progressTotal').textContent = totalTasks;
  $('progressPercent').textContent = `${percent}%`;
  $('progressFill').style.width = `${percent}%`;

  const pill = $('statusPill');
  const isComplete = completed === totalTasks;
  pill.textContent = isComplete ? 'Complete' : 'In Progress';
  pill.classList.toggle('complete', isComplete);
}

function setStartedScreen(isStarted) {
  $('start-screen').classList.toggle('hidden', isStarted);
  $('checklist-screen').classList.toggle('hidden', !isStarted);
}

function renderTasks(containerId, groupName, tasks) {
  const container = $(containerId);
  container.innerHTML = '';

  tasks.forEach((task, index) => {
    const item = document.createElement('div');
    item.className = `task-item ${state[groupName][index] ? 'done' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = state[groupName][index];
    checkbox.id = `${groupName}-${index}`;

    const main = document.createElement('div');
    main.className = 'task-main';

    const label = document.createElement('label');
    label.className = 'task-label';
    label.htmlFor = checkbox.id;
    label.textContent = task;

    const meta = document.createElement('div');
    meta.className = 'task-meta';

    const stamp = document.createElement('span');
    stamp.className = 'task-stamp';
    stamp.id = `${groupName}-${index}-stamp`;
    stamp.textContent = state.timestamps[groupName][index]
      ? `Completed ${formatDateTime(state.timestamps[groupName][index])}`
      : 'Not completed yet';

    meta.appendChild(stamp);
    main.appendChild(label);
    main.appendChild(meta);

    checkbox.addEventListener('change', () => {
      state[groupName][index] = checkbox.checked;
      state.timestamps[groupName][index] = checkbox.checked ? new Date().toISOString() : '';
      item.classList.toggle('done', checkbox.checked);
      stamp.textContent = checkbox.checked
        ? `Completed ${formatDateTime(state.timestamps[groupName][index])}`
        : 'Not completed yet';
      updateProgress();
      saveState();
    });

    item.appendChild(checkbox);
    item.appendChild(main);
    container.appendChild(item);
  });
}

function bindNotes() {
  const map = { setupNotes: 'setup', movieNotes: 'movie', packupNotes: 'packup' };
  Object.entries(map).forEach(([id, group]) => {
    const field = $(id);
    field.value = state.notes[group] || '';
    field.addEventListener('input', () => {
      state.notes[group] = field.value;
      saveState();
    });
  });
}

function bindPhaseToggles() {
  document.querySelectorAll('.phase-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = $(btn.dataset.target);
      const indicator = btn.querySelector('.toggle-indicator');
      const isOpen = target.classList.toggle('open');
      indicator.textContent = isOpen ? '−' : '+';
    });
  });
}

function expandAll() {
  document.querySelectorAll('.phase-content').forEach(el => el.classList.add('open'));
  document.querySelectorAll('.toggle-indicator').forEach(el => el.textContent = '−');
}

function collectReportText(record = state) {
  const lines = [];
  lines.push('Adelaide Outdoor Cinema');
  lines.push('Movies Under The Stars - Staff Checklist');
  lines.push('');
  lines.push(`Staff: ${record.details.staffName || '-'}`);
  lines.push(`Location: ${record.details.eventLocation || '-'}`);
  lines.push(`Date: ${formatDate(record.details.eventDate)}`);
  lines.push(`Manager Email: ${record.details.managerEmail || '-'}`);
  lines.push(`Progress: ${Math.round((([...record.setup, ...record.movie, ...record.packup].filter(Boolean).length) / totalTasks) * 100)}%`);
  lines.push('');

  [['Setup', 'setup'], ['Movie Begins', 'movie'], ['Pack Up', 'packup']].forEach(([title, key]) => {
    lines.push(title);
    TASKS[key].forEach((task, index) => {
      const done = record[key][index] ? 'YES' : 'NO';
      const stamp = record.timestamps?.[key]?.[index] ? formatDateTime(record.timestamps[key][index]) : '—';
      lines.push(`- ${task}: ${done} | ${stamp}`);
    });
    lines.push('');
    lines.push(`${title} Notes:`);
    lines.push(record.notes?.[key] || 'None');
    lines.push('');
  });

  lines.push(`Signature captured: ${record.signatureDataUrl ? 'Yes' : 'No'}`);
  return lines.join('\n');
}

function emailReport() {
  const body = collectReportText();
  const to = state.details.managerEmail || '';
  const subject = `AOC Checklist - ${state.details.eventLocation || 'Event'} - ${formatDate(state.details.eventDate)}`;
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

function buildCompletedRecord() {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    savedAt: new Date().toISOString(),
    details: { ...state.details },
    setup: [...state.setup],
    movie: [...state.movie],
    packup: [...state.packup],
    notes: { ...state.notes },
    timestamps: {
      setup: [...state.timestamps.setup],
      movie: [...state.timestamps.movie],
      packup: [...state.timestamps.packup]
    },
    signatureDataUrl: state.signatureDataUrl || ''
  };
}

function saveCompletedRecord() {
  const history = getHistory();
  history.unshift(buildCompletedRecord());
  saveHistory(history.slice(0, 50));
  renderHistory();
  alert('Completed record saved on this device.');
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function renderHistory() {
  const history = getHistory();
  const empty = $('historyEmpty');
  const list = $('historyList');
  list.innerHTML = '';
  empty.classList.toggle('hidden', history.length > 0);

  history.forEach(record => {
    const card = document.createElement('div');
    card.className = 'history-card';
    const completeCount = [...record.setup, ...record.movie, ...record.packup].filter(Boolean).length;

    card.innerHTML = `
      <h3>${record.details.eventLocation || 'Untitled Event'} — ${formatDate(record.details.eventDate)}</h3>
      <div class="history-meta">
        <div><strong>Staff:</strong> ${record.details.staffName || '-'}</div>
        <div><strong>Saved:</strong> ${formatDateTime(record.savedAt)}</div>
        <div><strong>Tasks Completed:</strong> ${completeCount} / ${totalTasks}</div>
      </div>
      <div class="history-actions">
        <button class="secondary-btn history-download" type="button">Download Report</button>
        <button class="danger-btn history-delete" type="button">Delete</button>
      </div>
    `;

    card.querySelector('.history-download').addEventListener('click', () => {
      const safeLocation = (record.details.eventLocation || 'event').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      downloadTextFile(`aoc-checklist-${safeLocation}.txt`, collectReportText(record));
    });

    card.querySelector('.history-delete').addEventListener('click', () => {
      const filtered = getHistory().filter(item => item.id !== record.id);
      saveHistory(filtered);
      renderHistory();
    });

    list.appendChild(card);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  $('themeToggle').textContent = theme === 'light' ? '☀️' : '🌙';
  localStorage.setItem(THEME_KEY, theme);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved === 'light' ? 'light' : 'dark');
  $('themeToggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  });
}

function resizeCanvasForDisplay(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const desiredWidth = Math.max(1, Math.round(rect.width * ratio));
  const desiredHeight = Math.max(1, Math.round(rect.height * ratio));
  if (canvas.width !== desiredWidth || canvas.height !== desiredHeight) {
    const existing = canvas.toDataURL();
    canvas.width = desiredWidth;
    canvas.height = desiredHeight;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2.5;
    if (state.signatureDataUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = state.signatureDataUrl;
    } else if (existing && existing.length > 1000) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = existing;
    }
  }
}

function setupSignaturePad() {
  const canvas = $('signaturePad');
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  function saveSignature() {
    state.signatureDataUrl = canvas.toDataURL('image/png');
    saveState();
  }

  function getPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const point = event.touches ? event.touches[0] : event;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  function start(event) {
    drawing = true;
    const point = getPoint(event);
    lastX = point.x;
    lastY = point.y;
  }

  function move(event) {
    if (!drawing) return;
    event.preventDefault();
    const point = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#fff';
    ctx.stroke();
    lastX = point.x;
    lastY = point.y;
  }

  function end() {
    if (!drawing) return;
    drawing = false;
    saveSignature();
  }

  signaturePad = {
    clear() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      state.signatureDataUrl = '';
      saveState();
    },
    redraw() {
      resizeCanvasForDisplay(canvas);
      if (state.signatureDataUrl) {
        const img = new Image();
        img.onload = () => {
          const rect = canvas.getBoundingClientRect();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
        };
        img.src = state.signatureDataUrl;
      }
    }
  };

  resizeCanvasForDisplay(canvas);
  if (state.signatureDataUrl) signaturePad.redraw();

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start, { passive: true });
  canvas.addEventListener('touchmove', move, { passive: false });
  window.addEventListener('touchend', end);
  window.addEventListener('resize', () => signaturePad.redraw());

  $('clearSignatureBtn').addEventListener('click', () => signaturePad.clear());
}

function init() {
  loadState();
  initTheme();

  renderTasks('setupTasks', 'setup', TASKS.setup);
  renderTasks('movieTasks', 'movie', TASKS.movie);
  renderTasks('packupTasks', 'packup', TASKS.packup);
  bindNotes();
  bindPhaseToggles();
  updateSummary();
  updateProgress();
  renderHistory();

  $('staffName').value = state.details.staffName;
  $('eventLocation').value = state.details.eventLocation;
  $('eventDate').value = state.details.eventDate;
  $('managerEmail').value = state.details.managerEmail;

  setStartedScreen(state.started);
  setupSignaturePad();

  $('details-form').addEventListener('submit', event => {
    event.preventDefault();
    state.details.staffName = $('staffName').value.trim();
    state.details.eventLocation = $('eventLocation').value.trim();
    state.details.eventDate = $('eventDate').value;
    state.details.managerEmail = $('managerEmail').value.trim();
    state.started = true;
    updateSummary();
    setStartedScreen(true);
    saveState();
  });

  $('expandAllBtn').addEventListener('click', expandAll);
  $('printBtn').addEventListener('click', () => window.print());
  $('printBtnTop').addEventListener('click', () => window.print());
  $('emailBtn').addEventListener('click', emailReport);
  $('saveCompleteBtn').addEventListener('click', saveCompletedRecord);

  $('clearHistoryBtn').addEventListener('click', () => {
    if (!confirm('Clear all saved completed records from this device?')) return;
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  });

  $('resetBtn').addEventListener('click', () => {
    if (!confirm('Start a new checklist? This clears the current active checklist on this device.')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = defaultState();
    window.location.reload();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(error => {
      console.warn('Service worker registration failed.', error);
    });
  }
}

init();
