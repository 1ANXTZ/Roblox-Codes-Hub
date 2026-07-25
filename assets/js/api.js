/**
 * api.js
 * The ONLY point of contact with the data source.
 *
 * Today: reads /data/games.json and /data/codes.json (static files).
 * Tomorrow: swap the fetch implementation for real API calls
 * without touching the rest of the frontend.
 *
 * Also layers on top the data saved by the admin panel
 * (localStorage), simulating persistence until a backend exists.
 */

const DATA_URL_GAMES = 'data/games.json';
const DATA_URL_CODES = 'data/codes.json';

const ADMIN_KEYS = {
  GAMES_OVERRIDE: 'rch:admin:games',
  CODES_OVERRIDE: 'rch:admin:codes',
};

let _cache = {
  games: null,
  codes: null,
};


function readAdminOverride(key) {

  try {

    if (!window.localStorage) return null;

    const raw = localStorage.getItem(key);

    return raw ? JSON.parse(raw) : null;

  } catch {

    return null;

  }

}


function clone(data) {
  return JSON.parse(JSON.stringify(data));
}


export const Api = {


  /**
   * Returns games merged with admin changes.
   */
  async fetchGames() {

    if (_cache.games) {
      return clone(_cache.games);
    }


    const res = await fetch(DATA_URL_GAMES);


    if (!res.ok) {
      throw new Error('Could not load games.json');
    }


    const json = await res.json();

    let games = json.games || [];


    const override = readAdminOverride(
      ADMIN_KEYS.GAMES_OVERRIDE
    );


    if (Array.isArray(override)) {

      const map = new Map(
        games.map(game => [
          game.id,
          game
        ])
      );


      override.forEach(game => {

        map.set(
          game.id,
          {
            ...map.get(game.id),
            ...game,
          }
        );

      });


      games = Array.from(
        map.values()
      );

    }


    _cache.games = games;


    return clone(games);

  },


  /**
   * Returns codes dictionary merged with admin changes.
   */
  async fetchCodes() {

    if (_cache.codes) {
      return clone(_cache.codes);
    }


    const res = await fetch(DATA_URL_CODES);


    if (!res.ok) {
      throw new Error('Could not load codes.json');
    }


    const json = await res.json();

    let codes = json.codes || {};


    const override = readAdminOverride(
      ADMIN_KEYS.CODES_OVERRIDE
    );


    if (
      override &&
      typeof override === 'object' &&
      !Array.isArray(override)
    ) {

      codes = {
        ...codes,
        ...override,
      };

    }


    _cache.codes = codes;


    return clone(codes);

  },


  /**
   * Returns codes from a specific game.
   */
  async fetchCodesForGame(gameId) {

    const all = await this.fetchCodes();

    return all[gameId] || [];

  },


  /**
   * Clears memory cache after admin changes.
   */
  invalidateCache() {

    _cache = {
      games: null,
      codes: null,
    };

  },


  /**
   * Saves admin game overrides locally.
   */
  saveGamesOverride(games) {

    localStorage.setItem(
      ADMIN_KEYS.GAMES_OVERRIDE,
      JSON.stringify(games)
    );


    this.invalidateCache();

  },


  /**
   * Saves admin code overrides locally.
   */
  saveCodesOverride(codes) {

    localStorage.setItem(
      ADMIN_KEYS.CODES_OVERRIDE,
      JSON.stringify(codes)
    );


    this.invalidateCache();

  },


};
