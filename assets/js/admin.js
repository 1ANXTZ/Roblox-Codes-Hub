/**
 * admin.js
 * Admin panel — local management for games and codes.
 *
 * Uses Api as the persistence layer.
 * Keeps data logic separated from UI actions.
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

  categoriesTableBody:
    document.querySelector('#categories-table tbody'),

};


let editingGameId = null;


/* ---------------- Helpers ---------------- */

function saveGames() {
  Api.saveGamesOverride(games);
}


function saveCodes() {
  Api.saveCodesOverride(codesMap);
}


function escapeHTML(value = '') {

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

}


/* ---------------- Panel navigation ---------------- */

els.navBtns.forEach(btn => {

  btn.addEventListener('click', () => {

    if (!btn.dataset.panel) return;


    els.navBtns.forEach(b =>
      b.classList.remove('is-active')
    );


    els.panels.forEach(panel =>
      panel.classList.remove('is-active')
    );


    btn.classList.add('is-active');


    document
      .getElementById(btn.dataset.panel)
      ?.classList.add('is-active');

  });

});


/* ---------------- Initial load ---------------- */

async function init() {

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


  document
    .getElementById('lock-admin-btn')
    ?.addEventListener('click', () => {
      window.AdminAuth?.lockAdmin();
    });

}


/* ---------------- GAMES ---------------- */

els.gameForm.addEventListener('submit', e => {

  e.preventDefault();


  const fd = new FormData(
    els.gameForm
  );


  const name =
    fd.get('name')
      .trim();


  if (!name) return;


  const id =
    editingGameId ||
    Utils.slugify(name);


  const gameData = {

    id,

    name,

    category:
      fd.get('category').trim()
      || 'Other',

    description:
      fd.get('description').trim(),

    tags:
      fd.get('tags')
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),

    popularity:
      Number(fd.get('popularity'))
      || 50,

  };


  const index =
    games.findIndex(
      game => game.id === id
    );


  if (index >= 0) {

    games[index] = {
      ...games[index],
      ...gameData,
    };

  } else {

    games.push(gameData);

    codesMap[id] =
      codesMap[id] || [];

  }


  saveGames();


  resetGameForm();

  renderGamesTable();
  renderCategorySelectOptions();
  renderCodeGameOptions();
  renderCategoriesTable();

});


els.cancelEditBtn.addEventListener(
  'click',
  resetGameForm
);


function resetGameForm() {

  editingGameId = null;

  els.gameForm.reset();

  els.formTitle.textContent =
    'Add new game';

  els.cancelEditBtn.hidden =
    true;

}


function editGame(id) {

  const game =
    games.find(
      item => item.id === id
    );


  if (!game) return;


  editingGameId = id;


  els.gameForm.name.value =
    game.name;


  els.gameForm.category.value =
    game.category;


  els.gameForm.description.value =
    game.description || '';


  els.gameForm.tags.value =
    (game.tags || []).join(', ');


  els.gameForm.popularity.value =
    game.popularity ?? 50;


  els.formTitle.textContent =
    `Editing: ${game.name}`;


  els.cancelEditBtn.hidden =
    false;


  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

}/* ---------------- Remove game ---------------- */

function removeGame(id) {

  if (!confirm('Remove this game and all its codes?')) {
    return;
  }


  games =
    games.filter(
      game => game.id !== id
    );


  delete codesMap[id];


  saveGames();
  saveCodes();


  renderGamesTable();
  renderCategorySelectOptions();
  renderCodeGameOptions();
  renderCodesTable();
  renderCategoriesTable();

}



/* ---------------- Render games table ---------------- */

function renderGamesTable() {

  els.gamesTableBody.innerHTML = '';


  els.gamesEmpty.style.display =
    games.length ? 'none' : 'block';


  games.forEach(game => {

    const tr =
      document.createElement('tr');


    const codeCount =
      (codesMap[game.id] || []).length;


    tr.innerHTML = `

      <td>${escapeHTML(game.name)}</td>

      <td>${escapeHTML(game.category)}</td>

      <td>${codeCount}</td>

      <td>${game.popularity ?? '—'}</td>

      <td class="table-actions">

        <button data-action="edit">
          Edit
        </button>

        <button data-action="remove" class="danger">
          Remove
        </button>

      </td>

    `;


    tr
      .querySelector('[data-action="edit"]')
      .addEventListener(
        'click',
        () => editGame(game.id)
      );


    tr
      .querySelector('[data-action="remove"]')
      .addEventListener(
        'click',
        () => removeGame(game.id)
      );


    els.gamesTableBody.appendChild(tr);

  });

}



/* ---------------- Codes ---------------- */

function renderCodeGameOptions() {

  els.codeGameSelect.innerHTML =
    games
      .map(game =>
        `<option value="${game.id}">
          ${escapeHTML(game.name)}
        </option>`
      )
      .join('');

}



els.codeForm.addEventListener(
  'submit',
  e => {

    e.preventDefault();


    const fd =
      new FormData(
        els.codeForm
      );


    const gameId =
      fd.get('gameId');


    const code =
      fd.get('code')
        .trim()
        .toUpperCase();


    if (!gameId || !code) {
      return;
    }


    codesMap[gameId] =
      codesMap[gameId] || [];


    codesMap[gameId].push({

      code,

      reward:
        fd.get('reward')
          .trim(),

      verified:
        new Date()
          .toISOString()
          .slice(0, 10),

      expires:
        fd.get('expires')
        || null,

    });


    saveCodes();


    els.codeForm.reset();


    renderGamesTable();
    renderCodesTable();

  }
);



function removeCode(gameId, index) {

  if (!codesMap[gameId]) {
    return;
  }


  codesMap[gameId]
    .splice(index, 1);


  saveCodes();


  renderGamesTable();
  renderCodesTable();

}



function renderCodesTable() {

  els.codesTableBody.innerHTML =
    '';


  const rows = [];


  Object.entries(codesMap)
    .forEach(([gameId, codes]) => {


      const game =
        games.find(
          g => g.id === gameId
        );


      codes.forEach((code, index) => {

        rows.push({

          gameId,

          gameName:
            game?.name || gameId,

          code,

          index,

        });

      });


    });



  els.codesEmpty.style.display =
    rows.length ? 'none' : 'block';



  rows.forEach(item => {


    const status =
      Utils.getCodeStatus(
        item.code.expires
      );


    const tr =
      document.createElement('tr');


    tr.innerHTML = `

      <td>${escapeHTML(item.gameName)}</td>

      <td>
        <code>
          ${escapeHTML(item.code.code)}
        </code>
      </td>

      <td>
        ${escapeHTML(item.code.reward)}
      </td>

      <td>
        ${
          item.code.expires
          ? Utils.formatDate(item.code.expires)
          : 'No expiry'
        }
      </td>

      <td>
        ${status}
      </td>

      <td class="table-actions">

        <button 
          data-action="remove"
          class="danger">
          Remove
        </button>

      </td>

    `;


    tr
      .querySelector('[data-action="remove"]')
      .addEventListener(
        'click',
        () =>
          removeCode(
            item.gameId,
            item.index
          )
      );


    els.codesTableBody.appendChild(tr);

  });

}



/* ---------------- Categories ---------------- */

function renderCategorySelectOptions() {

  const categories =
    Array.from(
      new Set(
        games.map(
          game => game.category
        )
      )
    )
    .sort();


  const dl =
    document.getElementById(
      'category-options'
    );


  if (dl) {

    dl.innerHTML =
      categories
        .map(category =>
          `<option value="${escapeHTML(category)}">`
        )
        .join('');

  }

}



function renderCategoriesTable() {

  const counts =
    new Map();


  games.forEach(game => {

    counts.set(
      game.category,
      (counts.get(game.category) || 0) + 1
    );

  });



  els.categoriesTableBody.innerHTML =
    '';



  Array.from(counts.entries())

    .sort(
      (a, b) =>
        b[1] - a[1]
    )

    .forEach(([name, count]) => {


      const tr =
        document.createElement('tr');


      tr.innerHTML = `

        <td>
          ${escapeHTML(name)}
        </td>

        <td>
          ${count}
        </td>

        <td class="table-actions">

          <button data-action="rename">
            Rename
          </button>

        </td>

      `;


      tr
        .querySelector('[data-action="rename"]')
        .addEventListener(
          'click',
          () => renameCategory(name)
        );


      els.categoriesTableBody.appendChild(tr);


    });

}



function renameCategory(oldName) {

  const newName =
    prompt(
      `Rename category "${oldName}" to:`,
      oldName
    );


  if (
    !newName ||
    newName.trim() === '' ||
    newName === oldName
  ) {
    return;
  }


  games.forEach(game => {

    if (game.category === oldName) {

      game.category =
        newName.trim();

    }

  });


  saveGames();


  renderGamesTable();
  renderCategorySelectOptions();
  renderCategoriesTable();

}



/* ---------------- Start ---------------- */

init()
  .catch(err =>
    console.error(
      'Error starting admin panel:',
      err
    )
  );
