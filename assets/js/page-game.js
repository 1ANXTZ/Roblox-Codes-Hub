/**
 * page-game.js
 * Entry point for a game's detail page (game.html).
 */

import { Api } from './api.js';
import { Games } from './games.js';
import { Codes } from './codes.js';
import { UI } from './ui.js';
import { Storage } from './storage.js';
import { Utils } from './utils.js';



const els = {

  breadcrumbName:
    document.getElementById('breadcrumb-name'),

  thumb:
    document.getElementById('game-thumb'),

  category:
    document.getElementById('game-category'),

  name:
    document.getElementById('game-name'),

  desc:
    document.getElementById('game-desc'),

  activeCount:
    document.getElementById('game-active-count'),

  lastVerified:
    document.getElementById('game-last-verified'),

  favBtn:
    document.getElementById('fav-btn'),

  shareBtn:
    document.getElementById('share-btn'),

  ticketGrid:
    document.getElementById('ticket-grid'),

  codesEmpty:
    document.getElementById('codes-empty'),

  revealExpired:
    document.getElementById('reveal-expired'),

  backToTop:
    document.getElementById('back-to-top'),

  themeToggle:
    document.getElementById('theme-toggle'),

  searchInput:
    document.getElementById('search-input'),

};





async function init() {


  const gameId =
    Utils.getURLParam('id');



  if (!gameId) {

    showGameNotFound();

    return;

  }



  const [

    games,

    codesMap

  ] = await Promise.all([

    Api.fetchGames(),

    Api.fetchCodes()

  ]);



  const enrichedGames =

    Games.withComputedFields(

      games,

      codesMap

    );



  const game =

    Games.findById(

      enrichedGames,

      gameId

    );



  if (!game) {

    showGameNotFound();

    return;

  }



  updateSEO(game);



  renderGameInfo(game);



  renderCodes(

    codesMap[game.id] || []

  );



  UI.initThemeToggle(

    els.themeToggle

  );



  UI.initBackToTop(

    els.backToTop

  );



  initSearch();


}






function updateSEO(game) {


  const pageTitle =

    `${game.name} — Active codes | Roblox Codes Hub`;



  const pageDesc =

    `Active codes for ${game.name}. Redeem rewards before they expire. Updated ${
      game.lastVerified
        ? Utils.relativeFromToday(game.lastVerified)
        : 'recently'
    }.`;



  const pageUrl =

    `${window.location.origin}${window.location.pathname}?id=${encodeURIComponent(game.id)}`;



  document.title =
    pageTitle;



  Utils.qs('#meta-description')
    ?.setAttribute(
      'content',
      pageDesc
    );



  Utils.qs('#canonical-link')
    ?.setAttribute(
      'href',
      pageUrl
    );



  Utils.qs('#og-title')
    ?.setAttribute(
      'content',
      pageTitle
    );



  Utils.qs('#og-description')
    ?.setAttribute(
      'content',
      pageDesc
    );



  Utils.qs('#og-url')
    ?.setAttribute(
      'content',
      pageUrl
    );



  Utils.qs('#twitter-title')
    ?.setAttribute(
      'content',
      pageTitle
    );



  Utils.qs('#twitter-description')
    ?.setAttribute(
      'content',
      pageDesc
    );


}





function initSearch() {


  els.searchInput?.addEventListener(

    'keydown',

    event => {


      if (

        event.key === 'Enter' &&

        event.target.value.trim()

      ) {


        window.location.href =

          `index.html?q=${encodeURIComponent(

            event.target.value.trim()

          )}`;


      }


    }

  );


}function showGameNotFound() {


  const hero =

    document.querySelector(

      '.game-hero'

    );



  if (!hero) return;



  hero.innerHTML = `

    <div class="empty-state"
         style="grid-column:1 / -1;">


      <div class="empty-state__icon">
        🔍
      </div>


      <h3>
        Game not found
      </h3>


      <p>

        The game you're looking for doesn't exist or was removed.

        <a href="index.html"
           style="color:var(--accent-amber)">

          Back to home

        </a>.

      </p>


    </div>

  `;


}







/* ---------------- Game info ---------------- */


function renderGameInfo(game) {



  if (els.breadcrumbName) {


    els.breadcrumbName.textContent =

      game.name;


  }




  if (els.thumb) {



    els.thumb.style.background =

      Utils.gradientFor(

        game.name || 'Game'

      );



    els.thumb.innerHTML = `

      <span class="game-thumb__loading">

        ${Utils.initials(

          game.name || 'Game'

        )}

      </span>

    `;




    /*
      Roblox image
      Uses CDN directly.
      No CORS problem.
    */


    if (game.robloxId) {



      const img =

        document.createElement(

          'img'

        );



      img.className =

        'game-thumb__image';



      img.src =

        `https://tr.rbxcdn.com/${game.robloxId}/150/150/Image/Png`;



      img.alt =

        `${game.name} icon`;



      img.loading =

        'lazy';



      img.onerror = () => {


        img.remove();


      };



      img.onload = () => {


        els.thumb

          .querySelector(

            '.game-thumb__loading'

          )

          ?.remove();


      };



      els.thumb.prepend(

        img

      );


    }



  }







  if (els.category) {


    els.category.textContent =

      game.category || 'Other';


  }







  if (els.name) {


    els.name.textContent =

      game.name;


  }







  if (els.desc) {


    els.desc.textContent =

      game.description || '';



  }







  if (els.activeCount) {



    els.activeCount.textContent =


      `${game.activeCount ?? 0} active code${
        
        game.activeCount === 1

          ? ''

          : 's'

      }`;



  }







  if (els.lastVerified) {



    els.lastVerified.textContent =


      `Verified ${
        
        game.lastVerified

          ? Utils.relativeFromToday(

              game.lastVerified

            )

          : 'recently'

      }`;



  }







  initFavorite(game);



  initShare(game);



}








function initFavorite(game) {



  if (!els.favBtn) return;





  const updateButton =

    isFav => {



      els.favBtn.classList.toggle(

        'is-fav',

        isFav

      );



      els.favBtn.textContent =


        isFav

          ? '★ Favorited'

          : '☆ Favorite';




      els.favBtn.setAttribute(

        'aria-pressed',

        String(isFav)

      );


    };







  updateButton(

    Storage.isFavorite(

      game.id

    )

  );







  els.favBtn.addEventListener(

    'click',

    () => {



      const state =

        Storage.toggleFavorite(

          game.id

        );



      updateButton(

        state

      );



      UI.showToast(

        state

          ? 'Added to favorites'

          : 'Removed from favorites'

      );


    }

  );


}/* ---------------- Share ---------------- */


function initShare(game) {


  if (!els.shareBtn) return;




  els.shareBtn.addEventListener(


    'click',


    async () => {



      const shareData = {



        title:

          `${game.name} — Active codes`,




        text:

          `Check out the active codes for ${game.name} on Roblox Codes Hub`,




        url:

          window.location.href



      };





      if (navigator.share) {



        try {



          await navigator.share(

            shareData

          );



        } catch {



          // cancelled

        }




      } else {



        try {



          await navigator.clipboard.writeText(

            window.location.href

          );



          UI.showToast(

            'Link copied!'

          );




        } catch {



          UI.showToast(

            'Could not copy link',

            'error'

          );



        }



      }



    }


  );


}









/* ---------------- Codes ---------------- */


function renderCodes(rawCodes) {



  if (els.revealExpired) {


    els.revealExpired.hidden = true;


  }






  const withStatus =


    Codes.withStatus(

      rawCodes

    );






  const {


    visible,


    expired



  } = Codes.splitVisible(

    withStatus

  );







  const draw = list => {




    if (!els.ticketGrid) return;






    if (!list.length) {



      els.ticketGrid.innerHTML = '';



      els.codesEmpty

        ?.classList

        .add(

          'is-visible'

        );



      return;



    }






    els.codesEmpty

      ?.classList

      .remove(

        'is-visible'

      );







    UI.renderCodes(



      els.ticketGrid,



      list,



      {


        onCopy(code) {



          UI.showToast(


            `Code "${code}" copied!`


          );



        }



      }



    );



  };








  draw(

    visible

  );








  if (



    expired.length &&

    els.revealExpired



  ) {





    els.revealExpired.hidden = false;





    let showingExpired = false;







    const expiredText =



      `Show ${expired.length} expired code${
        
        expired.length === 1

          ? ''

          : 's'

      }`;








    els.revealExpired.textContent =

      expiredText;







    els.revealExpired.addEventListener(



      'click',



      () => {




        showingExpired =

          !showingExpired;






        draw(



          showingExpired

            ? withStatus

            : visible



        );







        els.revealExpired.textContent =



          showingExpired

            ? 'Hide expired codes'

            : expiredText;





      }



    );



  }



}








/* ---------------- Start ---------------- */


init()

  .catch(



    error => {



      console.error(

        'Error loading game page:',

        error

      );




      UI.showToast(



        'Error loading game data.',



        'error'



      );



    }



  );      if (!list.length) {

        els.ticketGrid.innerHTML = '';

        els.codesEmpty?.classList.add(
          'is-visible'
        );

        return;

      }


      els.codesEmpty?.classList.remove(
        'is-visible'
      );


      UI.renderCodes(

        els.ticketGrid,

        list,

        {

          onCopy(code) {

            UI.showToast(
              `Code "${code}" copied!`
            );

          }

        }

      );


    };



  draw(
    visible
  );



  if (

    expired.length &&

    els.revealExpired

  ) {


    els.revealExpired.hidden =
      false;



    let showingExpired =
      false;



    els.revealExpired.textContent =

      `Show ${expired.length} expired code${
        expired.length === 1
          ? ''
          : 's'
      }`;



    els.revealExpired.addEventListener(

      'click',

      () => {


        showingExpired =
          !showingExpired;



        draw(

          showingExpired

            ? withStatus

            : visible

        );



        els.revealExpired.textContent =


          showingExpired

            ? 'Hide expired codes'

            : `Show ${expired.length} expired code${
                expired.length === 1
                  ? ''
                  : 's'
              }`;



      }

    );


  }


}





/*
|--------------------------------------------------------------------------
| Start
|--------------------------------------------------------------------------
*/


init()

.catch(

  error => {


    console.error(

      'Error loading game page:',

      error

    );


    UI.showToast(

      'Error loading game data.',

      'error'

    );


  }

);
