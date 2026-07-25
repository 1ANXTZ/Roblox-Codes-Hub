/**
 * main.js
 * Entry point for the home page (index.html).
 *
 * Orchestrates:
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


  let list =
    Search.filter(
      state.allGames,
      {
        query: state.query,

        category: state.category,

      }
    );



  list =
    Games.sort(
      list,

      state.sort

    );



  UI.renderGameGrid(

    els.grid,

    els.emptyState,

    list,

    {

      onToggleFavorite() {

        applyFiltersAndRender();

      }

    }

  );



  if (els.resultCount) {

    els.resultCount.textContent =
      `${list.length} game${list.length === 1 ? '' : 's'} found`;

  }


}




async function init() {


  UI.setLoading(
    els.grid,
    true
  );



  try {


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


    }    UI.renderCategoryChips(

      els.categoryRail,

      categories,

      state.category,

      onCategorySelect

    );




    const totalCodes =

      state.allGames.reduce(

        (sum, game) =>

          sum + game.activeCount,

        0

      );




    if (els.statGames) {

      els.statGames.textContent =
        state.allGames.length;

    }



    if (els.statCodes) {

      els.statCodes.textContent =
        totalCodes;

    }



    if (els.statCategories) {

      els.statCategories.textContent =
        categories.length;

    }




    const initialQuery =
      Utils.getURLParam('q');



    if (initialQuery && els.searchInput) {


      state.query =
        initialQuery;



      els.searchInput.value =
        initialQuery;



      els.searchClear
        ?.classList
        .add('is-visible');


    }




    applyFiltersAndRender();




    UI.setLoading(
      els.grid,
      false
    );




    /* ---------------- Search ---------------- */


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

              Boolean(state.query)

            );



          applyFiltersAndRender();


        },

        180

      )

    );





    /* ---------------- Search clear ---------------- */


    els.searchClear?.addEventListener(

      'click',

      () => {


        if (els.searchInput) {

          els.searchInput.value = '';

        }



        state.query = '';



        els.searchClear
          .classList
          .remove('is-visible');



        applyFiltersAndRender();



        els.searchInput?.focus();


      }

    );





    /* ---------------- Sort ---------------- */


    els.sortSelect?.addEventListener(

      'change',

      event => {


        state.sort =
          event.target.value;



        applyFiltersAndRender();


      }

    );





    /* ---------------- Theme ---------------- */


    UI.initThemeToggle(
      els.themeToggle
    );





    /* ---------------- Back to top ---------------- */


    UI.initBackToTop(
      els.backToTop
    );



  } finally {


    UI.setLoading(
      els.grid,
      false
    );


  }



}






/* ---------------- Error handler ---------------- */


function showLoadError(error) {


  console.error(

    'Error loading games:',

    error

  );



  UI.setLoading(

    els.grid,

    false

  );



  if (els.grid) {

    els.grid.innerHTML = '';

  }



  if (els.emptyState) {


    els.emptyState.hidden =
      false;



    const title =
      els.emptyState.querySelector('h3');



    const text =
      els.emptyState.querySelector('p');



    if (title) {

      title.textContent =
        'Error loading games';

    }



    if (text) {

      text.textContent =
        'Check your connection and try again.';

    }


  }


}





/* ---------------- Start ---------------- */


init()

  .catch(showLoadError);
