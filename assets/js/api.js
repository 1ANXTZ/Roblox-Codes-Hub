/**
 * api.js
 * The ONLY point of contact with the data source.
 *
 * Today: reads /data/games.json and /data/codes.json (static files).
 * Tomorrow: just swap the fetchGames()/fetchCodes() implementation
 * for real calls (e.g. fetch('/api/games')) without touching any
 * other part of the frontend — UI, Search and Games/Codes only know
 * about this module.
 *
 * Also layers on top the data saved by the admin panel
 * (localStorage), simulating write persistence until there's a
 * real backend.
 */

const DATA_URL_GAMES = 'data/games.json';
const DATA_URL_CODES = 'data/codes.json';

const ADMIN_KEYS = {
  GAMES_OVERRIDE: 'rch:admin:games',
  CODES_OVERRIDE: 'rch:admin:codes',
};

let _cache = { games: null, codes: null };

function readAdminOverride(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const Api = {
  /**
   * Returns the list of games, already merged with edits made in the admin panel.
   */
  async fetchGames() {
    if (_cache.games) return _cache.games;
    const res = await fetch(DATA_URL_GAMES);
    if (!res.ok) throw new Error('Could not load games.json');
    const json = await res.json();
    let games = json.games;

    const override = readAdminOverride(ADMIN_KEYS.GAMES_OVERRIDE);
    if (override && Array.isArray(override)) {
      // Merge: admin override takes priority by id, and can add new games.
      const map = new Map(games.map(g => [g.id, g]));
      override.forEach(g => map.set(g.id, { ...map.get(g.id), ...g }));
      games = Array.from(map.values());
    }

    _cache.games = games;
    return games;
  },

  /**
   * Returns the { gameId: [codes] } dictionary, merged with the admin panel.
   */
  async fetchCodes() {
    if (_cache.codes) return _cache.codes;
    const res = await fetch(DATA_URL_CODES);
    if (!res.ok) throw new Error('Could not load codes.json');
    const json = await res.json();
    let codes = json.codes;

    const override = readAdminOverride(ADMIN_KEYS.CODES_OVERRIDE);
    if (override && typeof override === 'object') {
      codes = { ...codes, ...override };
    }

    _cache.codes = codes;
    return codes;
  },

  async fetchCodesForGame(gameId) {
    const all = await this.fetchCodes();
    return all[gameId] || [];
  },

  /** Invalidates the in-memory cache (used after the admin saves changes). */
  invalidateCache() {
    _cache = { games: null, codes: null };
  },

  /** Used by the admin panel to persist changes locally. */
  saveGamesOverride(games) {
    localStorage.setItem(ADMIN_KEYS.GAMES_OVERRIDE, JSON.stringify(games));
    this.invalidateCache();
  },

  saveCodesOverride(codes) {
    localStorage.setItem(ADMIN_KEYS.CODES_OVERRIDE, JSON.stringify(codes));
    this.invalidateCache();
  },
};
