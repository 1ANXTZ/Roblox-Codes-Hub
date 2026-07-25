/**
 * admin-auth.js
 * VERY BASIC, TEMPORARY protection for the admin panel.
 *
 * ⚠️ This is NOT real security. It's a client-side-only gate meant to
 * keep the admin panel from being casually stumbled upon — anyone who
 * opens devtools and reads this file (or brute-forces the hash) can
 * get in. Since this project has no backend, this is the best that's
 * possible without one.
 *
 * For real protection, put the /admin.html page behind:
 *   - Netlify: password-protected deploy contexts, or Netlify Identity
 *   - Vercel: Vercel Authentication / a middleware check
 *   - GitHub Pages: GitHub Pages has no built-in auth — front it with
 *     Cloudflare Access or a similar proxy, or move admin off Pages.
 *
 * To change the password:
 *   1. Open a browser console anywhere and run:
 *        await crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-new-password'))
 *          .then(buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join(''))
 *   2. Copy the resulting hex string into PASSWORD_HASH below.
 *
 * Default password: codeshub2026
 */

const PASSWORD_HASH = '235a970bee264931b7b611b8680181f998eb1344ece11b77e5ec50dcb4f51c5e';
const SESSION_KEY = 'rch:admin-auth';

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function buildGate() {
  const gate = document.createElement('div');
  gate.id = 'admin-gate';
  gate.innerHTML = `
    <form id="admin-gate-form" class="admin-gate__card">
      <div class="admin-gate__logo">Roblox Codes<span>Hub</span> · Admin</div>
      <p class="admin-gate__hint">Enter the admin password to continue.</p>
      <input id="admin-gate-input" type="password" placeholder="Password" autocomplete="current-password" autofocus>
      <button type="submit" class="btn btn--primary">Unlock</button>
      <p id="admin-gate-error" class="admin-gate__error" hidden>Wrong password. Try again.</p>
    </form>
  `;
  document.body.appendChild(gate);
  return gate;
}

async function checkAuth() {
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    return true;
  }

  const shell = document.querySelector('.admin-shell');
  if (shell) shell.style.display = 'none';

  const gate = buildGate();
  const form = document.getElementById('admin-gate-form');
  const input = document.getElementById('admin-gate-input');
  const error = document.getElementById('admin-gate-error');

  return new Promise((resolve) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const hash = await sha256Hex(input.value);
      if (hash === PASSWORD_HASH) {
        sessionStorage.setItem(SESSION_KEY, '1');
        gate.remove();
        if (shell) shell.style.display = '';
        resolve(true);
      } else {
        error.hidden = false;
        input.value = '';
        input.focus();
      }
    });
  });
}

/** Lets the admin panel add a "Lock" button that clears the session flag. */
function lockAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.reload();
}

window.AdminAuth = { checkAuth, lockAdmin };
