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

  expired: 'Expired'

};





function escapeHTML(value = '') {

  return String(value)

    .replace(/&/g, '&amp;')

    .replace(/</g, '&lt;')

    .replace(/>/g, '&gt;')

    .replace(/"/g, '&quot;')

    .replace(/'/g, '&#039;');

}







/*
  Roblox Image System

  games.json stores Place IDs.
  Roblox thumbnails need Universe IDs.

  Flow:

  Place ID
      ↓
  Universe API
      ↓
  Thumbnail API
      ↓
  Image URL
*/


const robloxCache = {};





async function getRobloxIcon(game) {


  if (!game?.robloxId) {

    return '';

  }



  const placeId = game.robloxId;




  if (robloxCache[placeId]) {

    return robloxCache[placeId];

  }






  try {



    const universeResponse = await fetch(

      `https://apis.roblox.com/universes/v1/places/${placeId}/universe`

    );



    if (!universeResponse.ok) {

      throw new Error(
        'Universe request failed'
      );

    }





    const universeData = await universeResponse.json();




    const universeId = universeData.universeId;




    if (!universeId) {

      throw new Error(
        'Universe ID missing'
      );

    }







    const imageResponse = await fetch(

      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png&isCircular=false`

    );




    if (!imageResponse.ok) {

      throw new Error(
        'Thumbnail request failed'
      );

    }





    const imageData = await imageResponse.json();




    const imageUrl =

      imageData?.data?.[0]?.imageUrl || '';






    robloxCache[placeId] = imageUrl;



    return imageUrl;



  } catch(error) {



    console.warn(

      'Roblox image failed:',

      game.name,

      error.message

    );



    return '';

  }


}







async function copyText(text) {


  const value = String(text ?? '').trim();



  if (!value) {

    throw new Error(
      'Empty text'
    );

  }




  if (

    navigator.clipboard &&

    window.isSecureContext

  ) {


    await navigator.clipboard.writeText(value);

    return;


  }






  const textarea = document.createElement('textarea');



  textarea.value = value;



  textarea.style.position = 'fixed';

  textarea.style.opacity = '0';




  document.body.appendChild(textarea);



  textarea.select();



  document.execCommand('copy');



  textarea.remove();



}export const UI = {


  toastTimer: null,




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



      const button = document.createElement('button');



      button.type = 'button';



      button.className =

        'chip' +

        (

          category.name === activeCategory

            ? ' is-active'

            : ''

        );





      button.textContent =

        category.count !== null

          ? `${category.name} (${category.count})`

          : category.name;





      button.addEventListener(

        'click',

        () => {


          onSelect?.(category.name);


        }

      );





      container.appendChild(button);



    });



  },









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






    const fragment = document.createDocumentFragment();





    games.forEach(game => {



      const card = this.buildGameCard(

        game,

        {

          onToggleFavorite

        }

      );





      if (card) {

        fragment.appendChild(card);

      }



    });






    container.appendChild(fragment);



  },









  buildGameCard(

    game,

    {

      onToggleFavorite

    } = {}

  ) {




    if (!game?.id) {

      return null;

    }





    const card = document.createElement('article');



    card.className = 'game-card';





    const isFav = Storage.isFavorite(

      game.id

    );






    card.dataset.gameId = game.id;





    const fallback = Utils.initials(

      game.name || 'Game'

    );






    card.innerHTML = `

      <a

        href="game.html?id=${encodeURIComponent(game.id)}"

        class="game-card__thumb-link"

      >

        <div

          class="game-card__thumb"

          style="background:${Utils.gradientFor(game.name || 'Game')}"

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

            ${escapeHTML(game.name || 'Unknown')}

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





    const thumb = card.querySelector(

      '.game-card__thumb'

    );






    /*
      Load Roblox image asynchronously.
      Card renders first, image enters later.
    */



    getRobloxIcon(game)

      .then(imageUrl => {



        if (!imageUrl || !thumb) {

          return;

        }






        const img = document.createElement('img');



        img.className = 'game-card__image';



        img.src = imageUrl;



        img.alt = `${game.name} icon`;



        img.loading = 'lazy';





        img.onload = () => {



          const loading = thumb.querySelector(

            '.game-card__loading'

          );



          loading?.remove();



        };






        img.onerror = () => {



          console.warn(

            'Roblox image failed:',

            game.name

          );



          img.remove();



        };






        thumb.prepend(img);



      });







    const favBtn = card.querySelector(

      '.game-card__fav'

    );





    favBtn?.addEventListener(

      'click',

      () => {



        const state = Storage.toggleFavorite(

          game.id

        );





        favBtn.classList.toggle(

          'is-fav',

          state

        );





        favBtn.textContent = state

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



  },  /* =========================
     Code Cards
  ========================= */



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






    const fragment = document.createDocumentFragment();





    codes.forEach(code => {



      const card = this.buildCodeCard(

        code,

        {

          onCopy

        }

      );





      if (card) {

        fragment.appendChild(card);

      }



    });






    container.appendChild(fragment);



  },









  buildCodeCard(

    code,

    {

      onCopy

    } = {}

  ) {



    if (!code) {

      return null;

    }






    const card = document.createElement('article');



    card.className = 'code-card';






    const status = code.status || 'active';





    card.dataset.status = status;







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

      >

        Copy

      </button>

    `;







    const button = card.querySelector(

      '.code-card__copy'

    );







    button?.addEventListener(

      'click',

      async () => {



        try {



          await copyText(code.code);





          button.textContent = 'Copied!';





          this.showToast(

            'Code copied!'

          );





          onCopy?.(

            code.code

          );





          setTimeout(() => {



            button.textContent = 'Copy';



          }, 1500);






        } catch {



          button.textContent = 'Error';





          this.showToast(

            'Could not copy code',

            'error'

          );



        }



      }



    );







    return card;



  },









  /* =========================
     Stats
  ========================= */



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



  },  /* =========================
     Toast
  ========================= */



  showToast(

    message,

    type = 'success'

  ) {



    let toast = document.querySelector('.toast');







    if (!toast) {



      toast = document.createElement('div');



      toast.className = 'toast';





      toast.setAttribute(

        'role',

        'status'

      );





      toast.setAttribute(

        'aria-live',

        'polite'

      );





      document.body.appendChild(toast);



    }







    toast.textContent = message;



    toast.dataset.type = type;








    requestAnimationFrame(() => {



      toast.classList.add('show');



    });







    clearTimeout(

      this.toastTimer

    );







    this.toastTimer = setTimeout(() => {



      toast.classList.remove('show');



    }, 2500);




  },









  /* =========================
     Theme Toggle
  ========================= */



  initThemeToggle(button) {



    if (!button) return;







    const savedTheme = Storage.getTheme();







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



  },  /* =========================
     Back To Top
  ========================= */



  initBackToTop(button) {



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
