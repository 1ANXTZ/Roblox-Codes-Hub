/**
 * ui.js
 * All DOM rendering lives here.
 *
 * This module is responsible only for UI.
 * Data rules stay in Games, Codes and Storage.
 */

import { Utils } from './utils.js';
import { Storage } from './storage.js';


const STATUS_LABEL = {

  active: 'Active',

  expiring: 'Expiring',

  expired: 'Expired',

};



export const UI = {


  /* ---------------- Categories ---------------- */


  renderCategoryChips(
    container,
    categories,
    activeCategory,
    onSelect
  ) {

    if (!container) return;


    container.innerHTML = '';


    const all = [
      {
        name: 'All',
        count: null
      },
      ...categories
    ];



    all.forEach(category => {


      const chip =
        document.createElement('button');



      chip.className =
        'chip' +
        (
          category.name === activeCategory
            ? ' is-active'
            : ''
        );



      chip.textContent =
        category.count != null
          ? `${category.name} (${category.count})`
          : category.name;



      chip.setAttribute(
        'role',
        'tab'
      );



      chip.setAttribute(
        'aria-selected',
        String(
          category.name === activeCategory
        )
      );



      chip.addEventListener(
        'click',
        () => onSelect?.(category.name)
      );



      container.appendChild(chip);

    });

  },



  /* ---------------- Game cards ---------------- */


  renderGameGrid(
    container,
    emptyStateEl,
    games,
    { onToggleFavorite } = {}
  ) {


    if (!container) return;



    container.innerHTML = '';



    if (!games.length) {


      if (emptyStateEl) {

        emptyStateEl.hidden = false;

      }


      return;

    }



    if (emptyStateEl) {

      emptyStateEl.hidden = true;

    }



    const frag =
      document.createDocumentFragment();



    games.forEach(game => {


      frag.appendChild(

        this.buildGameCard(
          game,
          {
            onToggleFavorite
          }
        )

      );


    });



    container.appendChild(frag);

  },



  buildGameCard(
    game,
    { onToggleFavorite } = {}
  ) {


    const card =
      document.createElement('article');



    card.className =
      'game-card';



    card.dataset.gameId =
      game.id;



    const isFav =
      Storage.isFavorite(
        game.id
      );



    card.innerHTML = `

      <a
        href="game.html?id=${encodeURIComponent(game.id)}"
        class="game-card__thumb-link"
        style="text-decoration:none;"
      >

        <div
          class="game-card__thumb"
          style="background:${Utils.gradientFor(game.name)}"
        >

          <span aria-hidden="true">
            ${Utils.initials(game.name)}
          </span>


          <span class="game-card__badge-count">
            ${game.activeCount}
            code${game.activeCount === 1 ? '' : 's'}
          </span>


        </div>

      </a>


      <button
        class="game-card__fav${isFav ? ' is-fav' : ''}"
        aria-pressed="${isFav}"
        aria-label="Favorite ${game.name}"
        type="button"
      >

        ${isFav ? '★' : '☆'}

      </button>


      <div class="game-card__body">


        <span class="game-card__category">
          ${game.category || 'Other'}
        </span>


        <a
          href="game.html?id=${encodeURIComponent(game.id)}"
          style="text-decoration:none;"
        >

          <h3 class="game-card__name">
            ${game.name}
          </h3>

        </a>


        <span class="game-card__meta">

          Updated ${
            game.lastVerified
              ? Utils.relativeFromToday(game.lastVerified)
              : '—'
          }

        </span>


        <a
          class="game-card__cta"
          href="game.html?id=${encodeURIComponent(game.id)}"
        >

          View codes

        </a>


      </div>

    `;


    const favBtn =
      card.querySelector(
        '.game-card__fav'
      );


    favBtn?.addEventListener(
      'click',
      event => {

        event.preventDefault();


        const nowFav =
          Storage.toggleFavorite(
            game.id
          );


        favBtn.classList.toggle(
          'is-fav',
          nowFav
        );


        favBtn.textContent =
          nowFav ? '★' : '☆';


        favBtn.setAttribute(
          'aria-pressed',
          String(nowFav)
        );


        onToggleFavorite?.(
          game.id,
          nowFav
        );


      }
    );


    return card;

  },  /* ---------------- Code cards ---------------- */


  renderCodes(
    container,
    codes,
    {
      onCopy
    } = {}
  ) {


    if (!container) return;



    container.innerHTML = '';



    if (!codes.length) {


      container.innerHTML = `

        <p class="empty-state">
          No codes available.
        </p>

      `;


      return;

    }



    const frag =
      document.createDocumentFragment();



    codes.forEach(code => {


      frag.appendChild(

        this.buildCodeCard(
          code,
          {
            onCopy
          }
        )

      );


    });



    container.appendChild(frag);

  },



  buildCodeCard(
    code,
    {
      onCopy
    } = {}
  ) {


    const card =
      document.createElement('article');



    card.className =
      'code-card';



    const status =
      code.status || 'active';



    card.dataset.status =
      status;



    card.innerHTML = `

      <div class="code-card__top">

        <span class="code-card__status status-${status}">
          ${STATUS_LABEL[status] || status}
        </span>

      </div>


      <code class="code-card__value">
        ${code.code}
      </code>


      <button
        class="code-card__copy"
        type="button"
      >

        Copy

      </button>

    `;



    const copyBtn =
      card.querySelector(
        '.code-card__copy'
      );



    copyBtn?.addEventListener(
      'click',
      async () => {


        try {


          await navigator.clipboard.writeText(
            code.code
          );



          copyBtn.textContent =
            'Copied!';



          UI.showToast(
            'Code copied!'
          );



          onCopy?.(
            code.code
          );



          setTimeout(
            () => {

              copyBtn.textContent =
                'Copy';

            },
            1500
          );



        } catch {


          copyBtn.textContent =
            'Error';



          UI.showToast(
            'Could not copy code',
            'error'
          );


        }


      }
    );



    return card;

  },



  /* ---------------- Stats ---------------- */


  renderStats(
    elements,
    stats
  ) {


    if (!stats) return;



    if (elements.games) {

      elements.games.textContent =
        stats.games ?? 0;

    }



    if (elements.codes) {

      elements.codes.textContent =
        stats.codes ?? 0;

    }



    if (elements.categories) {

      elements.categories.textContent =
        stats.categories ?? 0;

    }


  },  /* ---------------- Toast ---------------- */


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



  /* ---------------- Back to top ---------------- */


  initBackToTop(
    button
  ) {


    if (!button) return;



    window.addEventListener(
      'scroll',
      () => {


        button.classList.toggle(
          'is-visible',
          window.scrollY > 500
        );


      }
    );



    button.addEventListener(
      'click',
      () => {


        window.scrollTo({

          top: 0,

          behavior: 'smooth'

        });


      }
    );


  }


};
