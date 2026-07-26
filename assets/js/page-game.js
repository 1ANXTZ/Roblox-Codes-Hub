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


    showNotFound();


    return;


  }



  updateSEO(game);



  renderGameInfo(game);



  renderCodes(

    game.id,

    codesMap[game.id] || []

  );



  UI.initThemeToggle(

    els.themeToggle

  );



  UI.initBackToTop(

    els.backToTop

  );  els.searchInput?.addEventListener(

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


}





/* ---------------- SEO ---------------- */


function updateSEO(game) {


  const pageTitle =

    `${game.name} — Active codes | Roblox Codes Hub`;



  const pageDesc =

    `Active codes for ${game.name}: redeem rewards before they expire. Updated ${
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





/* ---------------- Not Found ---------------- */


function showNotFound() {


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

        game.name

      );



    els.thumb.innerHTML = `


      <span aria-hidden="true">

        ${Utils.initials(game.name)}

      </span>


    `;


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


  }  if (els.activeCount) {


    els.activeCount.textContent =

      `${game.activeCount} active code${
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





  if (els.favBtn) {


    const updateFavoriteButton =

      isFav => {


        els.favBtn.classList.toggle(

          'is-fav',

          isFav

        );



        els.favBtn.textContent =

          isFav

            ? '★ Favorited'

            : '☆ Favorite';


      };





    updateFavoriteButton(

      Storage.isFavorite(

        game.id

      )

    );





    els.favBtn.addEventListener(

      'click',

      () => {


        const nowFav =

          Storage.toggleFavorite(

            game.id

          );



        updateFavoriteButton(

          nowFav

        );



        UI.showToast(

          nowFav

            ? 'Added to favorites'

            : 'Removed from favorites'

        );


      }

    );


  }






  els.shareBtn?.addEventListener(

    'click',

    async () => {


      const shareData = {


        title:

          `${game.name} — Active codes`,



        text:

          `Check out the active codes for ${game.name} on Roblox Codes Hub`,



        url:

          window.location.href,


      };





      if (navigator.share) {


        try {


          await navigator.share(

            shareData

          );


        } catch {


          // user cancelled share


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


function renderCodes(

  gameId,

  rawCodes

) {


  if (els.revealExpired) {


    els.revealExpired.hidden =

      true;


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





  const draw =

    list => {


      if (!els.ticketGrid) {


        return;


      }




      if (!list.length) {


        els.ticketGrid.innerHTML =

          '';



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


            Storage.toggleCodeUsed(

              gameId,

              code

            );



            UI.showToast(

              `Code "${code}" copied!`

            );


          }


        }

      );


    };




  draw(

    visible

  );  /* ---------------- Toast ---------------- */


  showToast(
    message,
    type = 'success'
  ) {


    let toast =
      document.querySelector(
        '.toast'
      );



    if (!toast) {


      toast =
        document.createElement(
          'div'
        );



      toast.className =
        'toast';



      document.body.appendChild(
        toast
      );


    }



    toast.textContent =
      message;



    toast.dataset.type =
      type;



    toast.classList.add(
      'show'
    );



    clearTimeout(
      this.toastTimer
    );



    this.toastTimer =
      setTimeout(
        () => {

          toast.classList.remove(
            'show'
          );

        },
        2500
      );


  },




  /* ---------------- Loading ---------------- */


  setLoading(
    container,
    loading
  ) {


    if (!container) return;



    container.classList.toggle(
      'is-loading',
      loading
    );


  },




  /* ---------------- Theme ---------------- */


  initThemeToggle(
    button
  ) {


    if (!button) return;



    const savedTheme =
      Storage.getTheme();



    if (savedTheme === 'light') {


      document.documentElement.classList.add(
        'light'
      );


    }



    button.addEventListener(
      'click',
      () => {


        const light =
          document.documentElement.classList.toggle(
            'light'
          );



        Storage.setTheme(
          light
            ? 'light'
            : 'dark'
        );


      }
    );


  },
