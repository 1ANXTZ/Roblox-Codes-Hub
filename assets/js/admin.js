/**
 * admin.js
 * Admin panel — local management for games and codes.
 *
 * Uses Api as the persistence layer.
 * Keeps data logic separated from UI actions.
 */

import { Api } from './api.js';
import { Utils } from './utils.js';


let games = [];
let codesMap = {};

let editingGameId = null;



const els = {

  navBtns:
    Utils.qsa('.admin-nav-btn'),

  panels:
    Utils.qsa('.admin-panel'),


  gameForm:
    document.getElementById('game-form'),

  gamesTableBody:
    document.querySelector('#games-table tbody'),

  gamesEmpty:
    document.getElementById('games-empty'),

  formTitle:
    document.getElementById('game-form-title'),

  cancelEditBtn:
    document.getElementById('cancel-edit-btn'),



  codeForm:
    document.getElementById('code-form'),

  codeGameSelect:
    document.getElementById('c-game'),

  codesTableBody:
    document.querySelector('#codes-table tbody'),

  codesEmpty:
    document.getElementById('codes-empty-admin'),



  categoriesTableBody:
    document.querySelector('#categories-table tbody'),

};





/* ---------------- Helpers ---------------- */


function saveGames() {

  Api.saveGamesOverride(
    games
  );

}



function saveCodes() {

  Api.saveCodesOverride(
    codesMap
  );

}



function escapeHTML(value = '') {

  return String(value)

    .replace(/&/g, '&amp;')

    .replace(/</g, '&lt;')

    .replace(/>/g, '&gt;')

    .replace(/"/g, '&quot;')

    .replace(/'/g, '&#039;');

}





/* ---------------- Panel navigation ---------------- */


els.navBtns.forEach(btn => {


  btn.addEventListener(
    'click',
    () => {


      const panelId =
        btn.dataset.panel;


      if (!panelId) return;



      els.navBtns.forEach(item => {

        item.classList.remove(
          'is-active'
        );

      });



      els.panels.forEach(panel => {

        panel.classList.remove(
          'is-active'
        );

      });



      btn.classList.add(
        'is-active'
      );



      document
        .getElementById(panelId)
        ?.classList.add(
          'is-active'
        );


    }
  );


});






/* ---------------- Initial load ---------------- */


async function init() {


  if (window.AdminAuth) {

    await window.AdminAuth.checkAuth();

  }



  games =
    await Api.fetchGames();



  codesMap =
    await Api.fetchCodes();




  renderGamesTable();

  renderCategorySelectOptions();

  renderCodeGameOptions();

  renderCodesTable();

  renderCategoriesTable();




  document
    .getElementById('lock-admin-btn')
    ?.addEventListener(
      'click',
      () => {

        window.AdminAuth?.lockAdmin();

      }
    );


}



/* ---------------- Games ---------------- */


els.gameForm?.addEventListener(
  'submit',
  event => {


    event.preventDefault();



    const formData =
      new FormData(
        els.gameForm
      );



    const name =
      String(
        formData.get('name') || ''
      )
      .trim();



    if (!name) return;



    const id =
      editingGameId ||
      Utils.slugify(name);





    const gameData = {


      id,


      name,



      category:

        String(
          formData.get('category') || ''
        )
        .trim()

        || 'Other',



      description:

        String(
          formData.get('description') || ''
        )
        .trim(),



      tags:

        String(
          formData.get('tags') || ''
        )

        .split(',')

        .map(tag => tag.trim())

        .filter(Boolean),



      popularity:

        Number(
          formData.get('popularity')
        )

        || 50,


    };




    const index =
      games.findIndex(
        game =>
          game.id === id
      );




    if (index >= 0) {


      games[index] = {

        ...games[index],

        ...gameData,

      };


    } else {


      games.push(
        gameData
      );


      codesMap[id] =
        codesMap[id] || [];


    }




    saveGames();

    saveCodes();




    resetGameForm();



    renderGamesTable();

    renderCategorySelectOptions();

    renderCodeGameOptions();

    renderCategoriesTable();



  }

);







/* ---------------- Edit game ---------------- */


els.cancelEditBtn?.addEventListener(
  'click',
  resetGameForm
);




function resetGameForm() {


  editingGameId = null;



  els.gameForm?.reset();




  if (els.formTitle) {

    els.formTitle.textContent =
      'Add new game';

  }




  if (els.cancelEditBtn) {

    els.cancelEditBtn.hidden =
      true;

  }


}






function editGame(id) {


  const game =
    games.find(
      item =>
        item.id === id
    );



  if (!game || !els.gameForm) return;




  editingGameId =
    id;




  const fields =
    els.gameForm.elements;



  fields.name.value =
    game.name;



  fields.category.value =
    game.category || 'Other';



  fields.description.value =
    game.description || '';



  fields.tags.value =
    (game.tags || [])
      .join(', ');



  fields.popularity.value =
    game.popularity ?? 50;




  if (els.formTitle) {

    els.formTitle.textContent =
      `Editing: ${game.name}`;

  }




  if (els.cancelEditBtn) {

    els.cancelEditBtn.hidden =
      false;

  }




  window.scrollTo({

    top: 0,

    behavior: 'smooth'

  });


}







/* ---------------- Remove game ---------------- */


function removeGame(id) {


  const confirmed =
    confirm(
      'Remove this game and all its codes?'
    );



  if (!confirmed) return;




  games =
    games.filter(
      game =>
        game.id !== id
    );



  delete codesMap[id];




  saveGames();

  saveCodes();




  renderGamesTable();

  renderCategorySelectOptions();

  renderCodeGameOptions();

  renderCodesTable();

  renderCategoriesTable();


}







/* ---------------- Games table ---------------- */


function renderGamesTable() {


  if (!els.gamesTableBody) return;




  els.gamesTableBody.innerHTML =
    '';




  const sortedGames =
    [...games].sort(
      (a,b) =>
        a.name.localeCompare(
          b.name,
          'en-US'
        )
    );




  if (els.gamesEmpty) {

    els.gamesEmpty.style.display =
      sortedGames.length
        ? 'none'
        : 'block';

  }




  sortedGames.forEach(game => {


    const row =
      document.createElement('tr');



    const codeCount =
      (
        codesMap[game.id] || []
      ).length;



    row.innerHTML = `

      <td>
        ${escapeHTML(game.name)}
      </td>


      <td>
        ${escapeHTML(game.category || 'Other')}
      </td>


      <td>
        ${codeCount}
      </td>


      <td>
        ${game.popularity ?? '—'}
      </td>


      <td class="table-actions">

        <button data-action="edit">
          Edit
        </button>


        <button
          data-action="remove"
          class="danger">

          Remove

        </button>

      </td>

    `;




    row
      .querySelector('[data-action="edit"]')
      ?.addEventListener(
        'click',
        () =>
          editGame(
            game.id
          )
      );



    row
      .querySelector('[data-action="remove"]')
      ?.addEventListener(
        'click',
        () =>
          removeGame(
            game.id
          )
      );



    els.gamesTableBody.appendChild(
      row
    );


  });


}

/* ---------------- Code select ---------------- */


function renderCodeGameOptions() {


  if (!els.codeGameSelect) return;



  els.codeGameSelect.innerHTML = '';


  games

    .sort(
      (a, b) =>
        a.name.localeCompare(
          b.name,
          'en-US'
        )
    )

    .forEach(game => {


      const option =
        document.createElement('option');


      option.value =
        game.id;


      option.textContent =
        game.name;


      els.codeGameSelect.appendChild(
        option
      );


    });


}







/* ---------------- Add code ---------------- */


els.codeForm?.addEventListener(
  'submit',
  event => {


    event.preventDefault();



    const formData =
      new FormData(
        els.codeForm
      );



    const gameId =
      String(
        formData.get('gameId') || ''
      );



    const code =
      String(
        formData.get('code') || ''
      )

      .trim()

      .toUpperCase();




    if (!gameId || !code) return;




    codesMap[gameId] =
      codesMap[gameId] || [];




    const exists =
      codesMap[gameId]
        .some(
          item =>
            item.code === code
        );




    if (exists) {


      alert(
        'This code already exists.'
      );


      return;


    }






    codesMap[gameId].push({


      code,



      reward:

        String(
          formData.get('reward') || ''
        )
        .trim(),




      verified:

        new Date()
          .toISOString()
          .slice(0,10),




      expires:

        formData.get('expires')
        || null,



    });






    saveCodes();




    els.codeForm.reset();




    renderGamesTable();

    renderCodesTable();



  }

);








/* ---------------- Remove code ---------------- */


function removeCode(
  gameId,
  index
) {


  if (!codesMap[gameId]) return;




  codesMap[gameId]
    .splice(
      index,
      1
    );




  saveCodes();




  renderGamesTable();

  renderCodesTable();


}








/* ---------------- Codes table ---------------- */


function renderCodesTable() {


  if (!els.codesTableBody) return;




  els.codesTableBody.innerHTML =
    '';




  const rows = [];




  Object.entries(codesMap)

    .forEach(
      ([gameId, codes]) => {



        const game =
          games.find(
            item =>
              item.id === gameId
          );




        codes.forEach(
          (code,index) => {


            rows.push({

              gameId,

              gameName:
                game?.name || gameId,

              code,

              index,

            });


          }

        );


      }

    );







  if (els.codesEmpty) {

    els.codesEmpty.style.display =
      rows.length
        ? 'none'
        : 'block';

  }






  rows.forEach(item => {


    const status =
      Utils.getCodeStatus(
        item.code.expires
      );




    const row =
      document.createElement('tr');




    row.innerHTML = `


      <td>
        ${escapeHTML(item.gameName)}
      </td>



      <td>

        <code>
          ${escapeHTML(item.code.code)}
        </code>

      </td>




      <td>
        ${escapeHTML(item.code.reward || '—')}
      </td>




      <td>

        ${
          item.code.expires

          ? Utils.formatDate(
              item.code.expires
            )

          : 'No expiry'

        }

      </td>




      <td>

        <span class="status-${status}">
          ${status}
        </span>

      </td>




      <td class="table-actions">


        <button

          data-action="remove"

          class="danger"

        >

          Remove

        </button>


      </td>



    `;




    row

      .querySelector(
        '[data-action="remove"]'
      )

      ?.addEventListener(

        'click',

        () =>

          removeCode(

            item.gameId,

            item.index

          )

      );





    els.codesTableBody.appendChild(
      row
    );



  });


}
/* ---------------- Categories ---------------- */


function renderCategorySelectOptions() {


  const categories =

    Array.from(

      new Set(

        games.map(

          game =>
            game.category || 'Other'

        )

      )

    )

    .sort(
      (a, b) =>
        a.localeCompare(
          b,
          'en-US'
        )
    );



  const datalist =
    document.getElementById(
      'category-options'
    );



  if (!datalist) return;



  datalist.innerHTML =

    categories

      .map(

        category =>

          `<option value="${escapeHTML(category)}">`

      )

      .join('');


}








function renderCategoriesTable() {


  if (!els.categoriesTableBody) return;



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




  els.categoriesTableBody.innerHTML =
    '';





  Array.from(
    counts.entries()
  )

  .sort(

    (a, b) =>

      b[1] - a[1]

  )

  .forEach(

    ([name, count]) => {


      const row =
        document.createElement('tr');




      row.innerHTML = `


        <td>
          ${escapeHTML(name)}
        </td>



        <td>
          ${count}
        </td>



        <td class="table-actions">


          <button data-action="rename">

            Rename

          </button>


        </td>


      `;





      row

        .querySelector(
          '[data-action="rename"]'
        )

        ?.addEventListener(

          'click',

          () =>
            renameCategory(
              name
            )

        );




      els.categoriesTableBody.appendChild(
        row
      );



    }

  );


}









function renameCategory(oldName) {


  const newName =

    prompt(

      `Rename category "${oldName}" to:`,

      oldName

    );




  if (

    !newName ||

    !newName.trim() ||

    newName.trim() === oldName

  ) {

    return;

  }




  const cleanName =
    newName.trim();




  games.forEach(game => {


    if (game.category === oldName) {


      game.category =
        cleanName;


    }


  });





  saveGames();




  renderGamesTable();

  renderCategorySelectOptions();

  renderCategoriesTable();


}









/* ---------------- Start ---------------- */


init()

  .catch(error => {


    console.error(

      'Error starting admin panel:',

      error

    );



    alert(
      'Could not load admin panel.'
    );


  });
