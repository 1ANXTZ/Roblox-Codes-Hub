/**
 * utils.js
 * Pure utility functions, with no DOM or global state dependency.
 */

export const Utils = {


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



  slugify(str = '') {

    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  },



  getCodeStatus(expiresISO) {

    if (!expiresISO) return 'active';


    const expires =
      new Date(
        `${expiresISO}T00:00:00`
      );


    if (Number.isNaN(expires.getTime())) {

      return 'active';

    }



    const today =
      new Date();


    today.setHours(
      0,
      0,
      0,
      0
    );



    const diffDays =
      Math.ceil(
        (expires - today) / 86400000
      );



    if (diffDays < 0) {

      return 'expired';

    }


    if (diffDays <= 3) {

      return 'expiring';

    }


    return 'active';

  },



  formatDate(iso) {

    if (!iso) return 'No expiry';


    const d =
      new Date(
        `${iso}T00:00:00`
      );


    if (Number.isNaN(d.getTime())) {

      return 'Invalid date';

    }


    return d.toLocaleDateString(
      'en-US',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

  },



  relativeFromToday(iso) {

    if (!iso) return '';


    const d =
      new Date(
        `${iso}T00:00:00`
      );


    if (Number.isNaN(d.getTime())) {

      return '';

    }



    const today =
      new Date();


    today.setHours(
      0,
      0,
      0,
      0
    );



    const diff =
      Math.round(
        (today - d) / 86400000
      );



    if (diff <= 0) {

      return 'today';

    }


    if (diff === 1) {

      return '1 day ago';

    }


    return `${diff} days ago`;

  },



  initials(name = '') {

    const words =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);



    return words
      .filter(
        w =>
          w.length > 2 ||
          w === w.toUpperCase()
      )
      .slice(0, 2)
      .map(
        w => w[0]
      )
      .join('')
      .toUpperCase();

  },



  gradientFor(seedStr = '') {

    let hash = 0;


    for (
      let i = 0;
      i < seedStr.length;
      i++
    ) {

      hash =
        seedStr.charCodeAt(i) +
        ((hash << 5) - hash);

    }



    const h1 =
      Math.abs(hash) % 360;


    const h2 =
      (h1 + 45) % 360;



    return `
      linear-gradient(
        135deg,
        hsl(${h1} 70% 32%),
        hsl(${h2} 75% 22%)
      )
    `;

  },



  qs(sel, ctx = null) {

    return ctx?.querySelector(sel) || null;

  },



  qsa(sel, ctx = null) {

    return ctx

      ? Array.from(
          ctx.querySelectorAll(sel)
        )

      : [];

  },



  getURLParam(name) {

    return new URLSearchParams(
      window.location.search
    ).get(name);

  },


};
