/**
 * admin-auth.js
 * Temporary client-side protection for the admin panel.
 *
 * ⚠️ This is NOT real security.
 * It only prevents casual access.
 * Real authentication requires a backend or external auth provider.
 */

const PASSWORD_HASH =
  '235a970bee264931b7b611b8680181f998eb1344ece11b77e5ec50dcb4f51c5e';

const SESSION_KEY =
  'rch:admin-auth';

const MAX_ATTEMPTS =
  5;

let attempts =
  0;



async function sha256Hex(text) {


  if (!crypto?.subtle) {

    throw new Error(
      'Crypto API unavailable'
    );

  }


  const buffer =
    await crypto.subtle.digest(

      'SHA-256',

      new TextEncoder().encode(text)

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





function buildGate() {


  if (
    document.getElementById(
      'admin-gate'
    )
  ) {

    return document.getElementById(
      'admin-gate'
    );

  }



  const gate =
    document.createElement('div');



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

        aria-label="Admin password"

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

      >

        Wrong password. Try again.

      </p>


    </form>

  `;



  document.body.appendChild(
    gate
  );


  return gate;

}







async function checkAuth() {


  if (

    sessionStorage.getItem(
      SESSION_KEY
    ) === '1'

  ) {

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
    document.getElementById(
      'admin-gate-form'
    );



  const input =
    document.getElementById(
      'admin-gate-input'
    );



  const error =
    document.getElementById(
      'admin-gate-error'
    );




  return new Promise(
    resolve => {


      form.addEventListener(

        'submit',

        async event => {


          event.preventDefault();



          if (
            attempts >= MAX_ATTEMPTS
          ) {


            error.textContent =
              'Too many attempts. Refresh the page and try again.';


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


              sessionStorage.setItem(

                SESSION_KEY,

                '1'

              );



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

              `Wrong password. Attempts: ${
                attempts
              }/${MAX_ATTEMPTS}`;



            error.hidden =
              false;



            input.value =
              '';



            input.focus();



          } catch (err) {


            console.error(
              err
            );



            error.textContent =
              'Authentication unavailable.';



            error.hidden =
              false;


          }



        }

      );


    }

  );


}







/**
 * Locks admin session.
 */
function lockAdmin() {


  sessionStorage.removeItem(
    SESSION_KEY
  );


  window.location.reload();


}





window.AdminAuth = {

  checkAuth,

  lockAdmin,

};
