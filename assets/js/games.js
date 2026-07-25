/**
 * games.js
 * Business rules related to games: active code counts,
 * list of available categories, sorting.
 * Doesn't touch the DOM — only receives/returns data.
 */

import { Codes } from './codes.js';


export const Games = {


  /**
   * Enriches each game with computed data.
   */
  withComputedFields(
    games = [],
    codesMap = {}
  ) {

    return games.map(game => {


      const codes =
        codesMap[game.id] || [];



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
   * Extracts categories with game counts.
   */
  extractCategories(
    games = []
  ) {


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


    const list =
      [...games];



    switch(mode) {


      case 'popular':

        return list.sort(
          (a, b) =>
            (b.popularity ?? 0) -
            (a.popularity ?? 0)
        );



      case 'recent':

        return list.sort(
          (a, b) => {

            const dateA =
              new Date(
                a.lastVerified || 0
              );

            const dateB =
              new Date(
                b.lastVerified || 0
              );


            return dateB - dateA;

          }
        );



      case 'az':

        return list.sort(
          (a, b) =>
            String(a.name)
              .localeCompare(
                String(b.name),
                'en-US'
              )
        );



      default:

        return list;


    }


  },



  /**
   * Finds a game by ID.
   */
  findById(
    games = [],
    id
  ) {

    if (!id) return null;


    return games.find(

      game =>
        game.id === id

    ) || null;


  },


};
