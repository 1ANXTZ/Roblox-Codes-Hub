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


const DATA_URL_GAMES =
  'data/games.json';


const DATA_URL_CODES =
  'data/codes.json';



const ADMIN_KEYS = {

  GAMES_OVERRIDE:
    'rch:admin:games',

  CODES_OVERRIDE:
    'rch:admin:codes',

};



let _cache = {

  games: null,

  codes: null,

};





function readAdminOverride(key) {


  try {


    if (!window.localStorage) {

      return null;

    }



    const raw =
      localStorage.getItem(
        key
      );



    return raw
      ? JSON.parse(raw)
      : null;



  } catch {


    return null;


  }


}





function clone(data) {


  if (data === undefined) {

    return undefined;

  }



  return JSON.parse(
    JSON.stringify(data)
  );


}






export const Api = {



  async fetchGames() {


    if (_cache.games) {

      return clone(
        _cache.games
      );

    }



    const res =
      await fetch(
        DATA_URL_GAMES
      );



    if (!res.ok) {

      throw new Error(
        'Could not load games.json'
      );

    }



    const json =
      await res.json();



    let games =
      Array.isArray(json.games)
        ? json.games
        : [];



    const override =
      readAdminOverride(
        ADMIN_KEYS.GAMES_OVERRIDE
      );



    /*
      If admin override exists,
      it represents the complete
      current list.
    */

    if (Array.isArray(override)) {

      games =
        override;

    }



    _cache.games =
      games;



    return clone(
      games
    );


  },  async fetchCodes() {



    if (_cache.codes) {

      return clone(
        _cache.codes
      );

    }





    const res =
      await fetch(
        DATA_URL_CODES
      );



    if (!res.ok) {

      throw new Error(
        'Could not load codes.json'
      );

    }



    const json =
      await res.json();



    let codes =
      (
        json.codes &&
        typeof json.codes === 'object'
      )

      ? json.codes

      : {};





    const override =
      readAdminOverride(
        ADMIN_KEYS.CODES_OVERRIDE
      );





    /*
      Admin codes override replaces
      the current code database.
    */

    if (

      override &&

      typeof override === 'object' &&

      !Array.isArray(override)

    ) {


      codes =
        override;


    }





    _cache.codes =
      codes;



    return clone(
      codes
    );


  },







  async fetchCodesForGame(gameId) {


    const all =
      await this.fetchCodes();



    return all[gameId] || [];


  },







  invalidateCache() {


    _cache = {

      games: null,

      codes: null,

    };


  },  saveGamesOverride(games) {


    try {


      localStorage.setItem(

        ADMIN_KEYS.GAMES_OVERRIDE,

        JSON.stringify(
          games
        )

      );



      this.invalidateCache();



    } catch {


      console.warn(
        'Could not save games override'
      );


    }


  },







  saveCodesOverride(codes) {


    try {


      localStorage.setItem(

        ADMIN_KEYS.CODES_OVERRIDE,

        JSON.stringify(
          codes
        )

      );



      this.invalidateCache();



    } catch {


      console.warn(
        'Could not save codes override'
      );


    }


  },







  clearAdminOverrides() {


    try {


      localStorage.removeItem(
        ADMIN_KEYS.GAMES_OVERRIDE
      );



      localStorage.removeItem(
        ADMIN_KEYS.CODES_OVERRIDE
      );



      this.invalidateCache();



    } catch {


      console.warn(
        'Could not clear admin overrides'
      );


    }


  },



};
