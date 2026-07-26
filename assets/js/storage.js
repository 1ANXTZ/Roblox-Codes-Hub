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


    if (!window.localStorage) {

      return fallback;

    }



    const value =
      localStorage.getItem(key);



    if (!value) {

      return fallback;

    }



    return JSON.parse(value);



  } catch {


    return fallback;


  }


}







function write(key, value) {


  try {


    if (!window.localStorage) {

      return false;

    }



    localStorage.setItem(

      key,

      JSON.stringify(value)

    );



    return true;



  } catch {


    return false;


  }


}







function normalize(value) {

  return String(value ?? '')
    .trim();

}








export const Storage = {



  getFavorites() {


    const favorites =
      read(
        KEYS.FAVORITES,
        []
      );



    return Array.isArray(favorites)

      ? [...new Set(
          favorites.map(normalize)
            .filter(Boolean)
        )]

      : [];


  },







  isFavorite(gameId) {


    const id =
      normalize(gameId);



    if (!id) return false;



    return this
      .getFavorites()
      .includes(id);


  },







  toggleFavorite(gameId) {


    const id =
      normalize(gameId);



    if (!id) return false;



    const favorites =
      this.getFavorites();



    const index =
      favorites.indexOf(id);



    if (index >= 0) {


      favorites.splice(
        index,
        1
      );


    } else {


      favorites.push(id);


    }




    write(
      KEYS.FAVORITES,
      favorites
    );



    return favorites.includes(id);


  },









  getTheme() {


    try {


      const theme =
        localStorage.getItem(
          KEYS.THEME
        );



      return (

        theme === 'light' ||

        theme === 'dark'

      )

        ? theme

        : 'dark';



    } catch {


      return 'dark';


    }


  },









  setTheme(theme) {


    if (
      theme !== 'light' &&
      theme !== 'dark'
    ) {

      return false;

    }



    return write(

      KEYS.THEME,

      theme

    );


  },









  getUsedMap() {


    const map =
      read(
        KEYS.USED_CODES,
        {}
      );



    return (

      map &&

      typeof map === 'object' &&

      !Array.isArray(map)

    )

      ? map

      : {};


  },









  isCodeUsed(gameId, code) {


    const id =
      normalize(gameId);


    const value =
      normalize(code);



    if (!id || !value) {

      return false;

    }



    const map =
      this.getUsedMap();



    return Array.isArray(map[id])

      ? map[id].includes(value)

      : false;


  },









  setCodeUsed(gameId, code, used) {


    const id =
      normalize(gameId);


    const value =
      normalize(code);



    if (!id || !value) {

      return false;

    }



    const map =
      this.getUsedMap();



    map[id] =
      Array.isArray(map[id])

        ? map[id]

        : [];



    const index =
      map[id].indexOf(value);





    if (used && index === -1) {


      map[id].push(value);


    }





    if (!used && index >= 0) {


      map[id].splice(
        index,
        1
      );


    }





    write(
      KEYS.USED_CODES,
      map
    );



    return Boolean(used);


  },









  toggleCodeUsed(gameId, code) {


    const id =
      normalize(gameId);


    const value =
      normalize(code);



    if (!id || !value) {

      return false;

    }



    const currentlyUsed =
      this.isCodeUsed(
        id,
        value
      );



    return this.setCodeUsed(

      id,

      value,

      !currentlyUsed

    );


  },


};
