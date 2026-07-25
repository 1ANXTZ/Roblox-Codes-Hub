/**
 * utils.js
 * Pure utility functions, with no DOM or global state dependency.
 */

export const Utils = {


  /**
   * Delays execution for real-time search inputs.
   */
  debounce(fn, delay = 150) {

    let timer = null;

    return (...args) => {

      clearTimeout(timer);

      timer = setTimeout(
        () => fn(...args),
        delay
      );

    };

  },


  /**
   * Converts a string into a slug for friendly URLs.
   */
  slugify(str) {

    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  },


  /**
   * Calculates a code's status based on its expiration date.
   */
  getCodeStatus(expiresISO) {

    if (!expiresISO) return 'active';


    const today = new Date();
    today.setHours(0, 0, 0, 0);


    const expires = new Date(
      expiresISO + 'T00:00:00'
    );


    const diffDays = Math.ceil(
      (expires - today) / 86400000
    );


    if (diffDays < 0) return 'expired';

    if (diffDays <= 3) return 'expiring';


    return 'active';

  },


  /**
   * Formats an ISO date (YYYY-MM-DD).
   */
  formatDate(iso) {

    if (!iso) return 'No expiry';


    const d = new Date(
      iso + 'T00:00:00'
    );


    return d.toLocaleDateString(
      'en-US',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

  },


  /**
   * Returns relative text like "2 days ago".
   */
  relativeFromToday(iso) {

    if (!iso) return '';


    const today = new Date();
    today.setHours(0, 0, 0, 0);


    const d = new Date(
      iso + 'T00:00:00'
    );


    const diff = Math.round(
      (today - d) / 86400000
    );


    if (diff <= 0) return 'today';

    if (diff === 1) return '1 day ago';


    return `${diff} days ago`;

  },


  /**
   * Generates initials from the game name.
   */
  initials(name) {

    return name
      .split(' ')
      .filter(
        w => w.length > 2 || w === w.toUpperCase()
      )
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();

  },


  /**
   * Generates deterministic gradient.
   */
  gradientFor(seedStr) {

    let hash = 0;


    for (let i = 0; i < seedStr.length; i++) {

      hash =
        seedStr.charCodeAt(i) +
        ((hash << 5) - hash);

    }


    const h1 = Math.abs(hash) % 360;
    const h2 = (h1 + 45) % 360;


    return `linear-gradient(135deg, hsl(${h1} 70% 32%), hsl(${h2} 75% 22%))`;

  },


  qs(sel, ctx = document) {
    return ctx.querySelector(sel);
  },


  qsa(sel, ctx = document) {
    return Array.from(ctx.querySelectorAll(sel));
  },


  getURLParam(name) {

    return new URLSearchParams(
      window.location.search
    ).get(name);

  },

};
