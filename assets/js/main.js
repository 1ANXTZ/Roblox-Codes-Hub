/**
 * main.js
 * Entry point for the home page (index.html).
 * Orchestrates Api, Games, Search and UI — contains no business logic of its own.
 */

import { Api } from './api.js';
import { Games } from './games.js';
import { Search } from './search.js';
import { UI } from './ui.js';
import { Utils } from './utils.js';

const state = {
  allGames: [],
  category: 'All',
  query: '',
  sort: 'popular',
};

const els = {
  grid: document.getElementById('game-grid'),
  emptyState: document.getElementById('empty-state'),
  categoryRail: document.getElementById('category-rail'),
  searchInput: document.getElementById('search-input'),
  searchClear: document.getElementById('search-clear'),
  sortSelect: document.getElementById('sort-select'),
  resultCount: document.getElementById('result-count'),
  themeToggle: document.getElementById('theme-toggle'),
  backToTop: document.getElementById('back-to-top'),
  statGames: document.getElementById('stat-games'),
  statCodes: document.getElementById('stat-codes'),
  statCategories: document.getElementById('stat-categories'),
};

function applyFiltersAndRender() {
  let list = Search.filter(state.allGames, { query: state.query, category: state.category });
  list = Games.sort(list, state.sort);

  UI.renderGameGrid(els.grid, els.emptyState, list, {
    onToggleFavorite: () => {},
  });

  els.resultCount.innerHTML = `<strong>${list.length}</strong> game${list.length === 1 ? '' : 's'} found`;
}

async function init() {
  const [games, codesMap] = await Promise.all([Api.fetchGames(), Api.fetchCodes()]);
  state.allGames = Games.withComputedFields(games, codesMap);

  const categories = Games.extractCategories(state.allGames);

  function onCategorySelect(cat) {
    state.category = cat;
    UI.renderCategoryChips(els.categoryRail, categories, state.category, onCategorySelect);
    applyFiltersAndRender();
  }
  UI.renderCategoryChips(els.categoryRail, categories, state.category, onCategorySelect);

  // Hero stats
  const totalCodes = state.allGames.reduce((sum, g) => sum + g.activeCount, 0);
  els.statGames.textContent = state.allGames.length;
  els.statCodes.textContent = totalCodes;
  els.statCategories.textContent = categories.length;

  // Supports arriving at the home page with a search term already set
  // (e.g. coming from the game page).
  const initialQuery = Utils.getURLParam('q');
  if (initialQuery) {
    state.query = initialQuery;
    els.searchInput.value = initialQuery;
    els.searchClear.classList.add('is-visible');
  }

  applyFiltersAndRender();

  els.searchInput.addEventListener('input', Utils.debounce((e) => {
    state.query = e.target.value;
    els.searchClear.classList.toggle('is-visible', !!state.query);
    applyFiltersAndRender();
  }, 180));

  els.searchClear.addEventListener('click', () => {
    els.searchInput.value = '';
    state.query = '';
    els.searchClear.classList.remove('is-visible');
    applyFiltersAndRender();
    els.searchInput.focus();
  });

  els.sortSelect.addEventListener('change', (e) => {
    state.sort = e.target.value;
    applyFiltersAndRender();
  });

  UI.initThemeToggle(els.themeToggle);
  UI.initBackToTop(els.backToTop);
}

init().catch(err => {
  console.error(err);
  els.grid.innerHTML = '';
  els.emptyState.hidden = false;
  els.emptyState.querySelector('h3').textContent = 'Error loading games';
  els.emptyState.querySelector('p').textContent = 'Check your connection and try again.';
});
