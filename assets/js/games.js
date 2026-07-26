/**
 * games.js
 * Business rules related to games: active code counts,
 * categories and sorting.
 *
 * No DOM dependency.
 */

import { Codes } from './codes.js';



export const Games = {



  /**
   * Adds computed fields to games.
   */
  withComputedFields(
    games = [],
    codesMap = {}
  ) {


    if (!Array.isArray(games)) {

      return [];

    }



    return games.map(game => {


      const codes =
        Array.isArray(codesMap?.[game.id])
          ? codesMap[game.id]
          : [];




      const activeCount =

        Codes.countByStatus(
          codes,
          'active'
        )

        +

        Codes.countByStatus(
          codes,
          'expiring'
        );





      const lastVerified =

        Codes.mostRecentVerification(
          codes
        );





      return {

        ...game,

        activeCount,

        lastVerified,

      };


    });


  },







  /**
   * Extracts categories with counts.
   */
  extractCategories(
    games = []
  ) {


    if (!Array.isArray(games)) {

      return [];

    }



    const counts =
      new Map();




    games.forEach(game => {


      const category =
        game.category || 'Other';



      counts.set(

        category,

        (counts.get(category) || 0) + 1

      );


    });





    return Array.from(
      counts.entries()
    )

    .map(
      ([name, count]) => ({

        name,

        count,

      })
    )

    .sort(
      (a, b) =>
        b.count - a.count
    );


  },








  /**
   * Sort games.
   */
  sort(
    games = [],
    mode = 'popular'
  ) {



    if (!Array.isArray(games)) {

      return [];

    }



    const list =
      [...games];





    switch(mode) {



      case 'popular':

        return list.sort(

          (a, b) =>

            Number(b.popularity || 0) -

            Number(a.popularity || 0)

        );






      case 'recent':

        return list.sort(

          (a, b) => {


            const dateA =
              a.lastVerified
                ? new Date(a.lastVerified).getTime()
                : 0;


            const dateB =
              b.lastVerified
                ? new Date(b.lastVerified).getTime()
                : 0;



            return dateB - dateA;


          }

        );







      case 'az':

        return list.sort(

          (a, b) =>

            String(a.name || '')
              .localeCompare(
                String(b.name || ''),
                'en-US'
              )

        );







      default:

        return list;


    }


  },








  /**
   * Find game by ID.
   */
  findById(
    games = [],
    id
  ) {


    if (
      !Array.isArray(games) ||
      !id
    ) {

      return null;

    }




    return games.find(

      game =>

        String(game.id) === String(id)

    ) || null;


  },



};
