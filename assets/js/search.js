/**
 * search.js
 * Real-time search engine: filters by name, category and tags.
 * Pure — receives the full game list and criteria, returns
 * the filtered list. Easy to test in isolation.
 */


export const Search = {


  filter(
    games,
    {
      query = '',
      category = 'All'
    } = {}
  ) {


    const q =
      query
        .trim()
        .toLowerCase();



    return games.filter(game => {



      const gameCategory =
        game.category || 'Other';



      const matchesCategory =

        category === 'All' ||

        gameCategory === category;



      if (!matchesCategory) {

        return false;

      }



      if (!q) {

        return true;

      }



      const haystack = [

        game.name || '',

        gameCategory,

        ...(game.tags || [])

      ]

        .join(' ')

        .toLowerCase();



      return haystack.includes(q);


    });


  },


};
