/**
 * storage.js
 * Local persistence layer.
 */

const KEYS = {

  FAVORITES: 'rch:favorites',

  THEME: 'rch:theme',

  USED_CODES: 'rch:used-codes',

};



function read(key, fallback) {

  try {

    const value =
      localStorage.getItem(key);


    return value
      ? JSON.parse(value)
      : fallback;


  } catch {

    return fallback;

  }

}



function write(key, value) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );


  } catch {

    // Ignore storage errors.

  }

}





export const Storage = {


  getFavorites() {

    const favorites =
      read(
        KEYS.FAVORITES,
        []
      );


    return Array.isArray(favorites)

      ? [...new Set(favorites)]

      : [];

  },




  isFavorite(gameId) {

    return this
      .getFavorites()
      .includes(gameId);

  },




  toggleFavorite(gameId) {

    if (!gameId) return false;


    const favorites =
      this.getFavorites();



    const index =
      favorites.indexOf(gameId);



    if (index >= 0) {

      favorites.splice(index, 1);

    } else {

      favorites.push(gameId);

    }



    write(
      KEYS.FAVORITES,
      favorites
    );


    return favorites.includes(gameId);

  },




  getTheme() {

    try {

      return localStorage.getItem(
        KEYS.THEME
      ) || 'dark';


    } catch {

      return 'dark';

    }

  },




  setTheme(theme) {

    try {

      localStorage.setItem(
        KEYS.THEME,
        theme
      );


    } catch {

      // Ignore storage errors.

    }

  },




  getUsedMap() {

    const map =
      read(
        KEYS.USED_CODES,
        {}
      );


    return map &&
      typeof map === 'object' &&
      !Array.isArray(map)

      ? map

      : {};

  },




  isCodeUsed(gameId, code) {

    const map =
      this.getUsedMap();


    return Array.isArray(map[gameId])

      ? map[gameId].includes(code)

      : false;

  },




  setCodeUsed(gameId, code, used) {

    if (!gameId || !code) {
      return false;
    }


    const map =
      this.getUsedMap();


    map[gameId] =
      Array.isArray(map[gameId])
        ? map[gameId]
        : [];



    const index =
      map[gameId].indexOf(code);



    if (used && index === -1) {

      map[gameId].push(code);

    }



    if (!used && index >= 0) {

      map[gameId].splice(index, 1);

    }



    write(
      KEYS.USED_CODES,
      map
    );


    return used;

  },




  toggleCodeUsed(gameId, code) {

    if (!gameId || !code) {
      return false;
    }


    const map =
      this.getUsedMap();



    map[gameId] =
      Array.isArray(map[gameId])
        ? map[gameId]
        : [];



    const index =
      map[gameId].indexOf(code);



    if (index >= 0) {

      map[gameId].splice(index, 1);

    } else {

      map[gameId].push(code);

    }



    write(
      KEYS.USED_CODES,
      map
    );



    return map[gameId].includes(code);

  },


};
