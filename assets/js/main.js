/**
 * main.js
 * Entry point for index.html.
 *
 * Flow:
 * Api -> Games -> Search -> UI
 *
 * No business rules here.
 */


import { Api } from './api.js';
import { Games } from './games.js';
import { Search } from './search.js';
import { UI } from './ui.js';
import { Utils } from './utils.js';





const state = {

  allGames: [],

  category: 'All',

  query: '',

  sort: 'popular',

};






const els = {


  grid:
    document.getElementById('game-grid'),



  emptyState:
    document.getElementById('empty-state'),



  categoryRail:
    document.getElementById('category-rail'),



  searchInput:
    document.getElementById('search-input'),



  searchClear:
    document.getElementById('search-clear'),



  sortSelect:
    document.getElementById('sort-select'),



  resultCount:
    document.getElementById('result-count'),



  themeToggle:
    document.getElementById('theme-toggle'),



  backToTop:
    document.getElementById('back-to-top'),



  statGames:
    document.getElementById('stat-games'),



  statCodes:
    document.getElementById('stat-codes'),



  statCategories:
    document.getElementById('stat-categories'),

};








function applyFiltersAndRender() {


  let filtered =

    Search.filter(

      state.allGames,

      {

        query:
          state.query,


        category:
          state.category,

      }

    );





  filtered =

    Games.sort(

      filtered,

      state.sort

    );






  UI.renderGameGrid(

    els.grid,

    els.emptyState,

    filtered,

    {

      onToggleFavorite() {

        applyFiltersAndRender();

      }

    }

  );







  if (els.resultCount) {


    els.resultCount.textContent =

      `${filtered.length} game${

        filtered.length === 1

          ? ''

          : 's'

      } found`;


  }


}








async function init() {


  if (!els.grid) {

    return;

  }



  try {


    UI.setLoading?.(

      els.grid,

      true

    );






    const [

      games,

      codesMap

    ] = await Promise.all([



      Api.fetchGames(),



      Api.fetchCodes()



    ]);






    state.allGames =

      Games.withComputedFields(

        games,

        codesMap

      );






    const categories =

      Games.extractCategories(

        state.allGames

      );







    function onCategorySelect(category) {


      state.category =

        category;





      UI.renderCategoryChips(

        els.categoryRail,

        categories,

        state.category,

        onCategorySelect

      );





      applyFiltersAndRender();


    }







    UI.renderCategoryChips(

      els.categoryRail,

      categories,

      state.category,

      onCategorySelect

    );








    const totalActiveCodes =

      state.allGames.reduce(

        (total, game) =>


          total + (

            game.activeCount || 0

          ),


        0

      );








    UI.renderStats(

      {

        games:

          els.statGames,


        codes:

          els.statCodes,


        categories:

          els.statCategories,


      },


      {

        games:

          state.allGames.length,


        codes:

          totalActiveCodes,


        categories:

          categories.length,


      }

    );





    const initialQuery =

      Utils.getURLParam('q');






    if (

      initialQuery &&

      els.searchInput

    ) {


      state.query =

        initialQuery.trim();





      els.searchInput.value =

        state.query;





      els.searchClear

        ?.classList

        .add(

          'is-visible'

        );


    }







    applyFiltersAndRender();







    els.searchInput?.addEventListener(

      'input',

      Utils.debounce(

        event => {


          state.query =

            event.target.value.trim();





          els.searchClear

            ?.classList

            .toggle(

              'is-visible',

              Boolean(

                state.query

              )

            );





          applyFiltersAndRender();




        },

        180

      )

    );








    els.searchClear?.addEventListener(

      'click',

      () => {


        if (els.searchInput) {


          els.searchInput.value =

            '';


        }





        state.query = '';






        els.searchClear

          ?.classList

          .remove(

            'is-visible'

          );







        applyFiltersAndRender();






        els.searchInput?.focus();



      }

    );








    els.sortSelect?.addEventListener(

      'change',

      event => {


        state.sort =

          event.target.value;





        applyFiltersAndRender();




      }

    );








    UI.initThemeToggle(

      els.themeToggle

    );






    UI.initBackToTop(

      els.backToTop

    );





  } catch (error) {


    showLoadError(

      error

    );


  } finally {


    UI.setLoading?.(

      els.grid,

      false

    );


  }



}









function showLoadError(error) {


  console.error(

    'Error loading games:',

    error

  );






  if (!els.grid) {

    return;

  }








  els.grid.innerHTML = `


    <div class="empty-state">


      <div class="empty-state__icon">

        ⚠️

      </div>





      <h3>

        Error loading games

      </h3>





      <p>

        Check your connection and try again.

      </p>





    </div>


  `;



}









init();
