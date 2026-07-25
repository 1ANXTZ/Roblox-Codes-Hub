/**
 * page-game.js
 * Entry point for a game's detail page (game.html).
 */

import { Api } from './api.js';
import { Games } from './games.js';
import { Codes } from './codes.js';
import { UI } from './ui.js';
import { Storage } from './storage.js';
import { Utils } from './utils.js';

const els = {
  breadcrumbName: document.getElementById('breadcrumb-name'),
  thumb: document.getElementById('game-thumb'),
  category: document.getElementById('game-category'),
  name: document.getElementById('game-name'),
  desc: document.getElementById('game-desc'),
  activeCount: document.getElementById('game-active-count'),
  lastVerified: document.getElementById('game-last-verified'),
  favBtn: document.getElementById('fav-btn'),
  shareBtn: document.getElementById('share-btn'),
  ticketGrid: document.getElementById('ticket-grid'),
  codesEmpty: document.getElementById('codes-empty'),
  revealExpired: document.getElementById('reveal-expired'),
  backToTop: document.getElementById('back-to-top'),
  themeToggle: document.getElementById('theme-toggle'),
  searchInput: document.getElementById('search-input'),
};

async function init() {
  const gameId = Utils.getURLParam('id');
  const [games, codesMap] = await Promise.all([Api.fetchGames(), Api.fetchCodes()]);
  const enrichedGames = Games.withComputedFields(games, codesMap);
  const game = Games.findById(enrichedGames, gameId);

  if (!game) {
    document.querySelector('.game-hero').innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">🔍</div>
        <h3>Game not found</h3>
        <p>The game you're looking for doesn't exist or was removed. <a href="index.html" style="color:var(--accent-amber)">Back to home</a>.</p>
      </div>`;
    return;
  }

  const pageTitle = `${game.name} — Active codes | Roblox Codes Hub`;
  const pageDesc = `Active codes for ${game.name}: redeem rewards before they expire. Updated ${Utils.relativeFromToday(game.lastVerified)}.`;
  const pageUrl = `${window.location.origin}${window.location.pathname}?id=${encodeURIComponent(game.id)}`;

  document.title = pageTitle;
  Utils.qs('#meta-description')?.setAttribute('content', pageDesc);
  Utils.qs('#canonical-link')?.setAttribute('href', pageUrl);
  Utils.qs('#og-title')?.setAttribute('content', pageTitle);
  Utils.qs('#og-description')?.setAttribute('content', pageDesc);
  Utils.qs('#og-url')?.setAttribute('content', pageUrl);
  Utils.qs('#twitter-title')?.setAttribute('content', pageTitle);
  Utils.qs('#twitter-description')?.setAttribute('content', pageDesc);

  renderGameInfo(game);
  renderCodes(game.id, codesMap[game.id] || []);

  UI.initThemeToggle(els.themeToggle);
  UI.initBackToTop(els.backToTop);

  // Search in the game page header redirects to the home page with the term.
  els.searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      window.location.href = `index.html?q=${encodeURIComponent(e.target.value.trim())}`;
    }
  });
}

function renderGameInfo(game) {
  els.breadcrumbName.textContent = game.name;
  els.thumb.style.background = Utils.gradientFor(game.name);
  els.thumb.innerHTML = `<span aria-hidden="true">${Utils.initials(game.name)}</span>`;
  els.category.textContent = game.category;
  els.name.textContent = game.name;
  els.desc.textContent = game.description;
  els.activeCount.textContent = `${game.activeCount} active code${game.activeCount === 1 ? '' : 's'}`;
  els.lastVerified.textContent = `Verified ${game.lastVerified ? Utils.relativeFromToday(game.lastVerified) : 'recently'}`;

  const isFav = Storage.isFavorite(game.id);
  els.favBtn.classList.toggle('is-fav', isFav);
  els.favBtn.textContent = isFav ? '★ Favorited' : '☆ Favorite';
  els.favBtn.addEventListener('click', () => {
    const nowFav = Storage.toggleFavorite(game.id);
    els.favBtn.classList.toggle('is-fav', nowFav);
    els.favBtn.textContent = nowFav ? '★ Favorited' : '☆ Favorite';
    UI.showToast(nowFav ? 'Added to favorites' : 'Removed from favorites');
  });

  els.shareBtn.addEventListener('click', () => {
    UI.share({
      title: `${game.name} — Active codes`,
      text: `Check out the active codes for ${game.name} on Roblox Codes Hub`,
      url: window.location.href,
    });
  });
}

function renderCodes(gameId, rawCodes) {
  const withStatus = Codes.withStatus(rawCodes);
  const { visible, expired } = Codes.splitVisible(withStatus);

  const draw = (list) => {
    if (!list.length) {
      els.ticketGrid.innerHTML = '';
      els.codesEmpty.classList.add('is-visible');
      return;
    }
    els.codesEmpty.classList.remove('is-visible');
    UI.renderTicketGrid(els.ticketGrid, list, gameId, {
      onCopy: (code) => UI.showToast(`Code "${code.code}" copied!`),
    });
  };

  draw(visible);

  if (expired.length) {
    els.revealExpired.hidden = false;
    els.revealExpired.textContent = `Show ${expired.length} expired code${expired.length === 1 ? '' : 's'}`;
    let showing = false;
    els.revealExpired.addEventListener('click', () => {
      showing = !showing;
      draw(showing ? withStatus : visible);
      els.revealExpired.textContent = showing
        ? 'Hide expired codes'
        : `Show ${expired.length} expired code${expired.length === 1 ? '' : 's'}`;
    });
  } else {
    els.revealExpired.hidden = true;
  }
}

init().catch(err => {
  console.error(err);
  UI.showToast('Error loading game data.');
});
