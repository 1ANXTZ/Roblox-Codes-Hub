/**
 * storage.js
 * Local persistence layer (localStorage). Isolated so that if
 * favorites/preferences move to a real user account via API in the
 * future, only this file needs to change.
 */

const KEYS = {
  FAVORITES: 'rch:favorites',
  THEME: 'rch:theme',
  USED_CODES: 'rch:used-codes',
};

export const Storage = {
  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.FAVORITES)) || [];
    } catch {
      return [];
    }
  },

  isFavorite(gameId) {
    return this.getFavorites().includes(gameId);
  },

  toggleFavorite(gameId) {
    const favs = this.getFavorites();
    const idx = favs.indexOf(gameId);
    if (idx >= 0) {
      favs.splice(idx, 1);
    } else {
      favs.push(gameId);
    }
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favs));
    return favs.includes(gameId);
  },

  getTheme() {
    return localStorage.getItem(KEYS.THEME) || 'dark';
  },

  setTheme(theme) {
    localStorage.setItem(KEYS.THEME, theme);
  },

  /**
   * Codes marked as "already used" by the user, per game.
   * Saved format: { "blox-fruits": ["CODE1", "CODE2"], ... }
   */
  getUsedMap() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.USED_CODES)) || {};
    } catch {
      return {};
    }
  },

  isCodeUsed(gameId, code) {
    const map = this.getUsedMap();
    return (map[gameId] || []).includes(code);
  },

  /** Directly sets the used/unused state of a code. */
  setCodeUsed(gameId, code, used) {
    const map = this.getUsedMap();
    map[gameId] = map[gameId] || [];
    const idx = map[gameId].indexOf(code);
    if (used && idx < 0) {
      map[gameId].push(code);
    } else if (!used && idx >= 0) {
      map[gameId].splice(idx, 1);
    }
    localStorage.setItem(KEYS.USED_CODES, JSON.stringify(map));
    return used;
  },

  /** Toggles the used/unused state of a code and returns the new state. */
  toggleCodeUsed(gameId, code) {
    const map = this.getUsedMap();
    map[gameId] = map[gameId] || [];
    const idx = map[gameId].indexOf(code);
    if (idx >= 0) {
      map[gameId].splice(idx, 1);
    } else {
      map[gameId].push(code);
    }
    localStorage.setItem(KEYS.USED_CODES, JSON.stringify(map));
    return map[gameId].includes(code);
  },
};
