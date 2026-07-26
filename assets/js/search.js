/**
 * search.js
 * Real-time search engine: filters by name, category,
 * tags and description.
 *
 * Pure — receives data and criteria,
 * returns filtered results.
 */


export const Search = {


  filter(

    games = [],

    {
      query = '',
      category = 'All'

    } = {}

  ) {



    const q =

      String(query)

        .trim()

        .toLocaleLowerCase();





    return games.filter(game => {



      if (!game) {

        return false;

      }






      const gameCategory =

        String(

          game.category || 'Other'

        );





      const matchesCategory =


        category === 'All' ||


        gameCategory === category;






      if (!matchesCategory) {

        return false;

      }







      if (!q) {

        return true;

      }







      const tags =


        Array.isArray(game.tags)

          ? game.tags

              .map(tag =>

                String(tag)

                  .trim()

              )

          : [];









      const haystack = [



        game.name || '',



        game.description || '',



        gameCategory,



        ...tags



      ]

      .join(' ')

      .toLocaleLowerCase();







      return haystack.includes(q);




    });


  },


};
