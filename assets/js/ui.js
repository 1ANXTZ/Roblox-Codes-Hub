/**
 * ui.js
 * All DOM rendering lives here. The other modules (Games,
 * Codes, Search) don't know the DOM exists — they just receive and return data.
 */

import { Utils } from './utils.js';
import { Storage } from './storage.js';

const STATUS_LABEL = {
  active: 'Active',
  expiring: 'Expiring',
  expired: 'Expired',
};

export const UI = {
  /** Renders the category chips in the horizontal bar. */
  renderCategoryChips(container, categories, activeCategory, onSelect) {
    container.innerHTML = '';
    const all = [{ name: 'All', count: null }, ...categories];

    all.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = 'chip' + (cat.name === activeCategory ? ' is-active' : '');
      chip.textContent = cat.count != null ? `${cat.name} (${cat.count})` : cat.name;
      chip.setAttribute('role', 'tab');
      chip.setAttribute('aria-selected', String(cat.name === activeCategory));
      chip.addEventListener('click', () => onSelect(cat.name));
      container.appendChild(chip);
    });
  },

  /** Renders the grid of game cards. */
  renderGameGrid(container, emptyStateEl, games, { onToggleFavorite } = {}) {
    container.innerHTML = '';

    if (!games.length) {
      emptyStateEl.hidden = false;
      return;
    }
    emptyStateEl.hidden = true;

    const frag = document.createDocumentFragment();
    games.forEach(game => frag.appendChild(this.buildGameCard(game, { onToggleFavorite })));
    container.appendChild(frag);
  },

  buildGameCard(game, { onToggleFavorite } = {}) {
    const card = document.createElement('article');
    card.className = 'game-card';
    card.dataset.gameId = game.id;

    const isFav = Storage.isFavorite(game.id);

    card.innerHTML = `
      <a href="game.html?id=${encodeURIComponent(game.id)}" class="game-card__thumb-link" style="text-decoration:none;">
        <div class="game-card__thumb" style="background:${Utils.gradientFor(game.name)}">
          <span aria-hidden="true">${Utils.initials(game.name)}</span>
          <span class="game-card__badge-count">${game.activeCount} code${game.activeCount === 1 ? '' : 's'}</span>
        </div>
      </a>
      <button class="game-card__fav${isFav ? ' is-fav' : ''}" aria-pressed="${isFav}" aria-label="Favorite ${game.name}">
        ${isFav ? '★' : '☆'}
      </button>
      <div class="game-card__body">
        <span class="game-card__category">${game.category}</span>
        <a href="game.html?id=${encodeURIComponent(game.id)}" style="text-decoration:none;">
          <h3 class="game-card__name">${game.name}</h3>
        </a>
        <span class="game-card__meta">Updated ${game.lastVerified ? Utils.relativeFromToday(game.lastVerified) : '—'}</span>
        <a class="game-card__cta" href="game.html?id=${encodeURIComponent(game.id)}">View codes</a>
      </div>
    `;

    const favBtn = card.querySelector('.game-card__fav');
    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const nowFav = Storage.toggleFavorite(game.id);
      favBtn.classList.toggle('is-fav', nowFav);
      favBtn.textContent = nowFav ? '★' : '☆';
      favBtn.setAttribute('aria-pressed', String(nowFav));
      onToggleFavorite?.(game.id, nowFav);
    });

    return card;
  },

  /** Renders the grid of code "tickets" on the game page. */
  renderTicketGrid(container, codes, gameId, { onCopy } = {}) {
    container.innerHTML = '';
    const frag = document.createDocumentFragment();
    codes.forEach(code => frag.appendChild(this.buildTicket(code, gameId, { onCopy })));
    container.appendChild(frag);
  },

  buildTicket(code, gameId, { onCopy } = {}) {
    const el = document.createElement('div');
    const isUsed = Storage.isCodeUsed(gameId, code.code);
    el.className = `ticket${code.status === 'expired' ? ' is-expired' : ''}${isUsed ? ' is-used' : ''}`;
    el.innerHTML = `
      <div class="ticket__stamp" aria-hidden="true">Used</div>
      <div class="ticket__top">
        <div class="ticket__status-row">
          <span class="status-pill status-pill--${code.status}">${STATUS_LABEL[code.status]}</span>
          <button class="used-toggle" aria-pressed="${isUsed}" title="Mark this code as already used">
            <span class="used-toggle__box" aria-hidden="true">${isUsed ? '✓' : ''}</span>
            ${isUsed ? 'Already used' : 'Mark as used'}
          </button>
        </div>
        <span class="ticket__code">${code.code}</span>
        <span class="ticket__reward">${code.reward}</span>
      </div>
      <div class="ticket__perforation"></div>
      <div class="ticket__bottom">
        <span class="ticket__verified">Verified ${Utils.formatDate(code.verified)}</span>
        <button class="copy-btn" ${code.status === 'expired' ? 'disabled' : ''}>Copy</button>
      </div>
    `;

    const usedBtn = el.querySelector('.used-toggle');
    usedBtn.addEventListener('click', () => {
      const nowUsed = Storage.toggleCodeUsed(gameId, code.code);
      el.classList.toggle('is-used', nowUsed);
      usedBtn.setAttribute('aria-pressed', String(nowUsed));
      usedBtn.innerHTML = `<span class="used-toggle__box" aria-hidden="true">${nowUsed ? '✓' : ''}</span>${nowUsed ? 'Already used' : 'Mark as used'}`;
    });

    const btn = el.querySelector('.copy-btn');
    btn.addEventListener('click', async () => {
      if (code.status === 'expired') return;
      try {
        await navigator.clipboard.writeText(code.code);
      } catch {
        // Silent fallback in case the Clipboard API is unavailable.
      }
      btn.textContent = 'Copied!';
      btn.classList.add('is-copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('is-copied');
      }, 1800);

      // Copying to paste in the game already counts as "used this code" —
      // marks it automatically, but the player can still unmark it
      // manually via the "Already used" button if they copied by mistake.
      if (!Storage.isCodeUsed(gameId, code.code)) {
        Storage.setCodeUsed(gameId, code.code, true);
        el.classList.add('is-used');
        usedBtn.setAttribute('aria-pressed', 'true');
        usedBtn.innerHTML = `<span class="used-toggle__box" aria-hidden="true">✓</span>Already used`;
      }

      onCopy?.(code);
    });

    return el;
  },

  showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  },

  /** Toggles and persists the light/dark theme. */
  initThemeToggle(btn) {
    const apply = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      btn.classList.toggle('is-active', theme === 'light');
      btn.setAttribute('aria-pressed', String(theme === 'light'));
    };
    apply(Storage.getTheme());
    btn.addEventListener('click', () => {
      const next = Storage.getTheme() === 'dark' ? 'light' : 'dark';
      Storage.setTheme(next);
      apply(next);
    });
  },

  /** Floating "back to top" button. */
  initBackToTop(btn) {
    window.addEventListener('scroll', Utils.debounce(() => {
      btn.classList.toggle('is-visible', window.scrollY > 480);
    }, 100));
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  },

  /** Share (Web Share API with copy-link fallback). */
  async share({ title, text, url }) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* user cancelled the share */
        return;
      }
    }
    await navigator.clipboard.writeText(url);
    this.showToast('Link copied to clipboard');
  },
};
