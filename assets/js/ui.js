/**
 * ui.js
 * All DOM rendering lives here.
 *
 * Responsible only for DOM rendering.
 */

import { Utils } from './utils.js';
import { Storage } from './storage.js';


const STATUS_LABEL = {

  active: 'Active',

  expiring: 'Expiring',

  expired: 'Expired',

};




function escapeHTML(value = '') {

  return String(value)

    .replace(/&/g, '&amp;')

    .replace(/</g, '&lt;')

    .replace(/>/g, '&gt;')

    .replace(/"/g, '&quot;')

    .replace(/'/g, '&#039;');

}





/**
 * Get Roblox game thumbnail automatically.
 * Uses robloxId from games.json.
 */

async function getRobloxIcon(game) {

  if (!game?.robloxId) {

    return '';

  }


  try {


    const response = await fetch(

      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${game.robloxId}&size=512x512&format=Png&isCircular=false`

    );


    const data = await response.json();



    return (

      data?.data?.[0]?.imageUrl ||

      ''

    );



  } catch {


    return '';

  }

}






async function copyText(text) {

  const value =
    String(text ?? '').trim();


  if (!value) {

    throw new Error(
      'Empty text'
    );

  }



  if (

    navigator.clipboard &&

    window.isSecureContext

  ) {


    await navigator.clipboard.writeText(

      value

    );


    return;


  }




  const textarea =
    document.createElement('textarea');



  textarea.value =
    value;



  textarea.style.position =
    'fixed';



  textarea.style.opacity =
    '0';



  document.body.appendChild(

    textarea

  );



  textarea.select();



  document.execCommand(

    'copy'

  );



  textarea.remove();


}






export const UI = {


  toastTimer: null,



  /* ---------------- Categories ---------------- */


  renderCategoryChips(

    container,

    categories = [],

    activeCategory,

    onSelect

  ) {


    if (!container) return;



    container.innerHTML = '';



    const list = [

      {
        name: 'All',
        count: null
      },

      ...categories

    ];



    list.forEach(category => {


      const button =
        document.createElement(
          'button'
        );



      button.className =

        'chip' +

        (

          category.name === activeCategory

            ? ' is-active'

            : ''

        );



      button.type =

        'button';




      button.textContent =

        category.count !== null

          ? `${category.name} (${category.count})`

          : category.name;




      button.addEventListener(

        'click',

        () => {

          onSelect?.(

            category.name

          );

        }

      );



      container.appendChild(

        button

      );


    });


  },  /* ---------------- Game cards ---------------- */



  renderGameGrid(

    container,

    emptyStateEl,

    games = [],

    {

      onToggleFavorite

    } = {}

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




    const fragment =

      document.createDocumentFragment();




    games.forEach(game => {


      fragment.appendChild(

        this.buildGameCard(

          game,

          {

            onToggleFavorite

          }

        )

      );


    });




    container.appendChild(

      fragment

    );


  },







  async buildGameCard(

    game,

    {

      onToggleFavorite

    } = {}

  ) {


    const card =

      document.createElement(

        'article'

      );



    card.className =

      'game-card';



    const isFav =

      Storage.isFavorite(

        game.id

      );



    card.dataset.gameId =

      game.id;



    const fallback =

      Utils.initials(

        game.name

      );



    card.innerHTML = `


      <a

        href="game.html?id=${encodeURIComponent(game.id)}"

        class="game-card__thumb-link"

      >


        <div

          class="game-card__thumb"

          style="background:${Utils.gradientFor(game.name)}"

        >


          <span class="game-card__loading">

            ${escapeHTML(fallback)}

          </span>



          <span class="game-card__badge-count">

            ${game.activeCount ?? 0}

            code${game.activeCount === 1 ? '' : 's'}

          </span>



        </div>


      </a>





      <button

        class="game-card__fav${isFav ? ' is-fav' : ''}"

        aria-pressed="${isFav}"

        type="button"

      >

        ${isFav ? '★' : '☆'}

      </button>





      <div class="game-card__body">


        <span class="game-card__category">

          ${escapeHTML(game.category || 'Other')}

        </span>





        <a

          href="game.html?id=${encodeURIComponent(game.id)}"

        >

          <h3 class="game-card__name">

            ${escapeHTML(game.name)}

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





    /*
      Load Roblox image after card creation.
    */


    const thumb =

      card.querySelector(

        '.game-card__thumb'

      );



    const imageUrl =

      await getRobloxIcon(

        game

      );



    if (imageUrl && thumb) {


      const img =

        document.createElement(

          'img'

        );



      img.className =

        'game-card__image';



      img.src =

        imageUrl;



      img.alt =

        `${game.name} icon`;



      img.loading =

        'lazy';



      img.onerror = () => {

        img.remove();

      };



      thumb.prepend(

        img

      );


      const loading =

        thumb.querySelector(

          '.game-card__loading'

        );


      loading?.remove();


    }






    const favBtn =

      card.querySelector(

        '.game-card__fav'

      );




    favBtn?.addEventListener(

      'click',

      () => {


        const state =

          Storage.toggleFavorite(

            game.id

          );



        favBtn.classList.toggle(

          'is-fav',

          state

        );



        favBtn.textContent =

          state

            ? '★'

            : '☆';



        favBtn.setAttribute(

          'aria-pressed',

          String(state)

        );



        onToggleFavorite?.(

          game.id,

          state

        );


      }

    );



    return card;


  },
  /* ---------------- Code cards ---------------- */


  renderCodes(

    container,

    codes = [],

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




    const fragment =

      document.createDocumentFragment();




    codes.forEach(code => {


      fragment.appendChild(

        this.buildCodeCard(

          code,

          {

            onCopy

          }

        )

      );


    });




    container.appendChild(

      fragment

    );


  },







  buildCodeCard(

    code,

    {

      onCopy

    } = {}

  ) {


    const card =

      document.createElement(

        'article'

      );



    card.className =

      'code-card';



    const status =

      code.status || 'active';



    card.dataset.status =

      status;




    card.innerHTML = `


      <div class="code-card__top">


        <span class="code-card__status status-${escapeHTML(status)}">


          ${STATUS_LABEL[status] || status}


        </span>


      </div>





      <code class="code-card__value">


        ${escapeHTML(code.code || '')}


      </code>





      <p class="code-card__reward">


        ${escapeHTML(

          code.reward ||

          'Reward unavailable'

        )}


      </p>







      <button


        class="code-card__copy"


        type="button"


        aria-label="Copy code ${escapeHTML(code.code || '')}"


      >


        Copy


      </button>



    `;




    const button =

      card.querySelector(

        '.code-card__copy'

      );






    button?.addEventListener(


      'click',


      async () => {


        try {


          await copyText(

            code.code

          );



          button.textContent =

            'Copied!';



          this.showToast(

            'Code copied!'

          );



          onCopy?.(

            code.code

          );



          setTimeout(() => {


            button.textContent =

              'Copy';


          }, 1500);




        } catch {


          button.textContent =

            'Error';



          this.showToast(

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

    stats = {}

  ) {



    if (!elements) return;




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


  },







  /* ---------------- Toast ---------------- */


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



      toast.setAttribute(

        'role',

        'status'

      );



      toast.setAttribute(

        'aria-live',

        'polite'

      );



      document.body.appendChild(

        toast

      );


    }







    toast.textContent =

      message;



    toast.dataset.type =

      type;







    requestAnimationFrame(() => {



      toast.classList.add(

        'show'

      );



    });







    clearTimeout(

      this.toastTimer

    );







    this.toastTimer =

      setTimeout(() => {



        toast.classList.remove(

          'show'

        );



      }, 2500);



  },
  /* ---------------- Theme ---------------- */



  initThemeToggle(

    button

  ) {



    if (!button) return;







    const savedTheme =

      Storage.getTheme();







    if (

      savedTheme === 'light'

    ) {



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







    const updateVisibility = () => {



      button.classList.toggle(



        'is-visible',



        window.scrollY > 500



      );



    };







    updateVisibility();







    window.addEventListener(



      'scroll',



      updateVisibility,



      {

        passive: true

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
