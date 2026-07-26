/**
 * admin-auth.js
 * Temporary client-side protection for the admin panel.
 *
 * ⚠️ NOT real security.
 * Only prevents casual access.
 */


const PASSWORD_HASH =
  '235a970bee264931b7b611b8680181f998eb1344ece11b77e5ec50dcb4f51c5e';


const SESSION_KEY =
  'rch:admin-auth';


const MAX_ATTEMPTS =
  5;


let attempts = 0;


let lockedUntil = 0;





async function sha256Hex(text) {


  if (
    !window.crypto ||
    !window.crypto.subtle
  ) {

    throw new Error(
      'Crypto unavailable'
    );

  }



  const buffer =
    await crypto.subtle.digest(

      'SHA-256',

      new TextEncoder().encode(
        text
      )

    );



  return Array.from(

    new Uint8Array(buffer)

  )

    .map(

      byte =>
        byte
          .toString(16)
          .padStart(2, '0')

    )

    .join('');

}








function hasSession() {


  try {


    return sessionStorage.getItem(
      SESSION_KEY
    ) === '1';



  } catch {


    return false;


  }


}








function saveSession() {


  try {


    sessionStorage.setItem(

      SESSION_KEY,

      '1'

    );


  } catch {


    // ignore


  }


}








function buildGate() {


  const existing =
    document.getElementById(
      'admin-gate'
    );



  if (existing) {

    return existing;

  }




  const gate =
    document.createElement(
      'div'
    );



  gate.id =
    'admin-gate';



  gate.innerHTML = `

    <form
      id="admin-gate-form"
      class="admin-gate__card"
    >

      <div class="admin-gate__logo">
        Roblox Codes<span>Hub</span> · Admin
      </div>


      <p class="admin-gate__hint">
        Enter the admin password to continue.
      </p>


      <input
        id="admin-gate-input"
        type="password"
        placeholder="Password"
        autocomplete="current-password"
        autofocus
      >


      <button
        type="submit"
        class="btn btn--primary"
      >
        Unlock
      </button>


      <p
        id="admin-gate-error"
        class="admin-gate__error"
        hidden
      ></p>


    </form>

  `;



  document.body.appendChild(
    gate
  );



  return gate;


}









async function checkAuth() {


  if (hasSession()) {

    return true;

  }





  const shell =
    document.querySelector(
      '.admin-shell'
    );



  if (shell) {

    shell.style.display =
      'none';

  }





  const gate =
    buildGate();




  const form =
    gate.querySelector(
      '#admin-gate-form'
    );


  const input =
    gate.querySelector(
      '#admin-gate-input'
    );


  const error =
    gate.querySelector(
      '#admin-gate-error'
    );




  if (!form) {

    return false;

  }






  return new Promise(resolve => {



    form.addEventListener(

      'submit',

      async event => {


        event.preventDefault();




        if (
          Date.now() <
          lockedUntil
        ) {


          error.textContent =
            'Try again in a few seconds.';


          error.hidden =
            false;


          return;

        }







        if (
          attempts >= MAX_ATTEMPTS
        ) {


          lockedUntil =
            Date.now() + 15000;


          attempts = 0;


          error.textContent =
            'Too many attempts. Wait 15 seconds.';


          error.hidden =
            false;


          return;


        }






        try {


          const hash =
            await sha256Hex(
              input.value
            );



          if (
            hash === PASSWORD_HASH
          ) {


            saveSession();



            gate.remove();



            if (shell) {

              shell.style.display =
                '';

            }



            resolve(true);



            return;


          }





          attempts++;



          error.textContent =
            `Wrong password (${attempts}/${MAX_ATTEMPTS})`;



          error.hidden =
            false;



          input.value =
            '';



          input.focus();




        } catch (err) {


          console.error(err);



          error.textContent =
            'Authentication unavailable.';



          error.hidden =
            false;


        }


      }

    );


  });


}








function lockAdmin() {


  try {


    sessionStorage.removeItem(
      SESSION_KEY
    );


  } catch {


    // ignore


  }



  window.location.reload();


}







window.AdminAuth = {

  checkAuth,

  lockAdmin,

};
