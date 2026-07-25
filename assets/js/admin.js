/**
 * admin.js
 * Admin panel — works 100% locally for now (persistence via
 * localStorage, through the Api). The structure already separates
 * "actions" from "data", so plugging in a real API later just means
 * swapping the Api.save*Override calls for HTTP requests
 * (e.g. PUT /api/games/:id).
 */

import { Api } from './api.js';
import { Utils } from './utils.js';

let games = [];
let codesMap = {};

const els = {
  navBtns: Utils.qsa('.admin-nav-btn'),
  panels: Utils.qsa('.admin-panel'),

  gameForm: document.getElementById('game-form'),
  gamesTableBody: document.querySelector('#games-table tbody'),
  gamesEmpty: document.getElementById('games-empty'),
  formTitle: document.getElementById('game-form-title'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),

  codeForm: document.getElementById('code-form'),
  codeGameSelect: document.getElementById('c-game'),
  codesTableBody: document.querySelector('#codes-table tbody'),
  codesEmpty: document.getElementById('codes-empty-admin'),

  categoriesTableBody: document.querySelector('#categories-table tbody'),
};

let editingGameId = null;

/* ---------------- Panel navigation ---------------- */
els.navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Skip nav-styled buttons that aren't actual panel switches (e.g. the
    // "Lock panel" button, which shares the .admin-nav-btn class purely
    // for visual consistency but has no data-panel target).
    if (!btn.dataset.panel) return;

    els.navBtns.forEach(b => b.classList.remove('is-active'));
    els.panels.forEach(p => p.classList.remove('is-active'));
    btn.classList.add('is-active');
    document.getElementById(btn.dataset.panel).classList.add('is-active');
  });
});

/* ---------------- Initial load ---------------- */
async function init() {
  // Basic, temporary password gate — see js/admin-auth.js for details/limitations.
  if (window.AdminAuth) {
    await window.AdminAuth.checkAuth();
  }

  games = await Api.fetchGames();
  codesMap = await Api.fetchCodes();
  renderGamesTable();
  renderCategorySelectOptions();
  renderCodeGameOptions();
  renderCodesTable();
  renderCategoriesTable();

  document.getElementById('lock-admin-btn')?.addEventListener('click', () => {
    window.AdminAuth?.lockAdmin();
  });
}

/* ---------------- GAMES: create/edit/remove ---------------- */
els.gameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(els.gameForm);
  const name = fd.get('name').trim();
  if (!name) return;

  const id = editingGameId || Utils.slugify(name);
  const gameData = {
    id,
    name,
    category: fd.get('category').trim() || 'Other',
    description: fd.get('description').trim(),
    tags: fd.get('tags').split(',').map(t => t.trim()).filter(Boolean),
    popularity: Number(fd.get('popularity')) || 50,
  };

  const idx = games.findIndex(g => g.id === id);
  if (idx >= 0) {
    games[idx] = { ...games[idx], ...gameData };
  } else {
    games.push(gameData);
    codesMap[id] = codesMap[id] || [];
  }

  Api.saveGamesOverride(games);
  resetGameForm();
  renderGamesTable();
  renderCategorySelectOptions();
  renderCodeGameOptions();
  renderCategoriesTable();
});

els.cancelEditBtn.addEventListener('click', resetGameForm);

function resetGameForm() {
  editingGameId = null;
  els.gameForm.reset();
  els.formTitle.textContent = 'Add new game';
  els.cancelEditBtn.hidden = true;
}

function editGame(id) {
  const game = games.find(g => g.id === id);
  if (!game) return;
  editingGameId = id;
  els.gameForm.name.value = game.name;
  els.gameForm.category.value = game.category;
  els.gameForm.description.value = game.description || '';
  els.gameForm.tags.value = (game.tags || []).join(', ');
  els.gameForm.popularity.value = game.popularity ?? 50;
  els.formTitle.textContent = `Editing: ${game.name}`;
  els.cancelEditBtn.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function removeGame(id) {
  if (!confirm('Remove this game and all its codes?')) return;
  games = games.filter(g => g.id !== id);
  delete codesMap[id];
  Api.saveGamesOverride(games);
  Api.saveCodesOverride(codesMap);
  renderGamesTable();
  renderCategorySelectOptions();
  renderCodeGameOptions();
  renderCodesTable();
  renderCategoriesTable();
}

function renderGamesTable() {
  els.gamesTableBody.innerHTML = '';
  els.gamesEmpty.style.display = games.length ? 'none' : 'block';

  games.forEach(game => {
    const tr = document.createElement('tr');
    const codeCount = (codesMap[game.id] || []).length;
    tr.innerHTML = `
      <td>${game.name}</td>
      <td>${game.category}</td>
      <td>${codeCount}</td>
      <td>${game.popularity ?? '—'}</td>
      <td class="table-actions">
        <button data-action="edit">Edit</button>
        <button data-action="remove" class="danger">Remove</button>
      </td>
    `;
    tr.querySelector('[data-action="edit"]').addEventListener('click', () => editGame(game.id));
    tr.querySelector('[data-action="remove"]').addEventListener('click', () => removeGame(game.id));
    els.gamesTableBody.appendChild(tr);
  });
}

/* ---------------- CODES: add/remove ---------------- */
function renderCodeGameOptions() {
  els.codeGameSelect.innerHTML = games
    .map(g => `<option value="${g.id}">${g.name}</option>`)
    .join('');
}

els.codeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(els.codeForm);
  const gameId = fd.get('gameId');
  const code = fd.get('code').trim().toUpperCase();
  if (!gameId || !code) return;

  codesMap[gameId] = codesMap[gameId] || [];
  codesMap[gameId].push({
    code,
    reward: fd.get('reward').trim(),
    verified: new Date().toISOString().slice(0, 10),
    expires: fd.get('expires') || null,
  });

  Api.saveCodesOverride(codesMap);
  els.codeForm.reset();
  renderGamesTable();
  renderCodesTable();
});

function removeCode(gameId, index) {
  codesMap[gameId].splice(index, 1);
  Api.saveCodesOverride(codesMap);
  renderGamesTable();
  renderCodesTable();
}

function renderCodesTable() {
  els.codesTableBody.innerHTML = '';
  const rows = [];
  Object.entries(codesMap).forEach(([gameId, codes]) => {
    const game = games.find(g => g.id === gameId);
    codes.forEach((c, index) => rows.push({ gameId, gameName: game?.name || gameId, code: c, index }));
  });

  els.codesEmpty.style.display = rows.length ? 'none' : 'block';

  rows.forEach(({ gameId, gameName, code, index }) => {
    const status = Utils.getCodeStatus(code.expires);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${gameName}</td>
      <td><code>${code.code}</code></td>
      <td>${code.reward}</td>
      <td>${code.expires ? Utils.formatDate(code.expires) : 'No expiry'}</td>
      <td>${status}</td>
      <td class="table-actions"><button data-action="remove" class="danger">Remove</button></td>
    `;
    tr.querySelector('[data-action="remove"]').addEventListener('click', () => removeCode(gameId, index));
    els.codesTableBody.appendChild(tr);
  });
}

/* ---------------- CATEGORIES ---------------- */
function renderCategorySelectOptions() {
  const categories = Array.from(new Set(games.map(g => g.category))).sort();
  const dl = document.getElementById('category-options');
  if (dl) dl.innerHTML = categories.map(c => `<option value="${c}">`).join('');
}

function renderCategoriesTable() {
  const counts = new Map();
  games.forEach(g => counts.set(g.category, (counts.get(g.category) || 0) + 1));

  els.categoriesTableBody.innerHTML = '';
  Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${name}</td>
      <td>${count}</td>
      <td class="table-actions"><button data-action="rename">Rename</button></td>
    `;
    tr.querySelector('[data-action="rename"]').addEventListener('click', () => renameCategory(name));
    els.categoriesTableBody.appendChild(tr);
  });
}

function renameCategory(oldName) {
  const newName = prompt(`Rename category "${oldName}" to:`, oldName);
  if (!newName || newName.trim() === '' || newName === oldName) return;
  games.forEach(g => { if (g.category === oldName) g.category = newName.trim(); });
  Api.saveGamesOverride(games);
  renderGamesTable();
  renderCategorySelectOptions();
  renderCategoriesTable();
}

init().catch(err => console.error('Error starting the admin panel:', err));
