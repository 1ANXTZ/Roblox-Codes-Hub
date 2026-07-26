/**
 * api.js
 * The ONLY point of contact with the data source.
 *
 * Reads static JSON files and applies local admin overrides.
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
      localStorage.getItem(key);



    if (!raw) {

      return null;

    }



    return JSON.parse(raw);



  } catch {


    return null;


  }


}









function clone(data) {


  if (
    data === null ||
    data === undefined
  ) {

    return data;

  }



  try {


    return JSON.parse(
      JSON.stringify(data)
    );



  } catch {


    return data;


  }


}









function saveLocal(key, value) {


  try {


    localStorage.setItem(

      key,

      JSON.stringify(value)

    );


    return true;



  } catch {


    return false;


  }


}









export const Api = {



  async fetchGames() {



    if (_cache.games) {


      return clone(
        _cache.games
      );


    }





    const response =
      await fetch(
        DATA_URL_GAMES,
        {
          cache: 'no-store'
        }
      );



    if (!response.ok) {


      throw new Error(
        `Failed loading games.json (${response.status})`
      );


    }





    const json =
      await response.json();





    let games =


      Array.isArray(json.games)

        ? json.games

        : [];







    const override =

      readAdminOverride(
        ADMIN_KEYS.GAMES_OVERRIDE
      );





    if (Array.isArray(override)) {


      games =
        override;


    }






    _cache.games =
      games;





    return clone(
      games
    );


  },









  async fetchCodes() {



    if (_cache.codes) {


      return clone(
        _cache.codes
      );


    }





    const response =
      await fetch(
        DATA_URL_CODES,
        {
          cache: 'no-store'
        }
      );



    if (!response.ok) {


      throw new Error(
        `Failed loading codes.json (${response.status})`
      );


    }






    const json =
      await response.json();





    let codes =



      json.codes &&

      typeof json.codes === 'object' &&

      !Array.isArray(json.codes)


        ? json.codes


        : {};







    const override =

      readAdminOverride(
        ADMIN_KEYS.CODES_OVERRIDE
      );






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


    if (!gameId) {

      return [];

    }



    const all =
      await this.fetchCodes();




    return Array.isArray(all[gameId])

      ? clone(all[gameId])

      : [];



  },









  invalidateCache() {


    _cache = {


      games: null,


      codes: null,


    };


  },









  saveGamesOverride(games) {


    if (!Array.isArray(games)) {

      return false;

    }





    const saved =
      saveLocal(

        ADMIN_KEYS.GAMES_OVERRIDE,

        games

      );



    if (saved) {

      this.invalidateCache();

    }



    return saved;


  },









  saveCodesOverride(codes) {


    if (

      !codes ||

      typeof codes !== 'object' ||

      Array.isArray(codes)

    ) {

      return false;

    }






    const saved =
      saveLocal(

        ADMIN_KEYS.CODES_OVERRIDE,

        codes

      );




    if (saved) {

      this.invalidateCache();

    }




    return saved;


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



      return true;



    } catch {


      return false;


    }


  },


};
