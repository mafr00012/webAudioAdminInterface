  import {BaseURL, UseCaseSelectionHTMLPATH, isLoggedIn} from "./app.js";

  const loginButton = document.getElementById('loginButton');
  const username = document.getElementById('usernameLogin');
  const password = document.getElementById('passwordLogin');


  /**
   * Event listener for DOMContentLoaded.
   *
   * checks if the user is already logged in when the document is fully loaded.
   * If the user is logged in, redirects to the useCaseSelection page.
   * Handles unexpected responses and errors.
   */
  document.addEventListener("DOMContentLoaded", async () => {
    try{
      const data = await isLoggedIn()
      if(data === 'true'){
        window.location.href = UseCaseSelectionHTMLPATH;
      } else if (data === 'false') {
        // Do nothing if not logged in
      } else {
        console.error('Unexpected response:', data);
        alert('Unerwartete Antwort vom Server');
      }
    } catch(error){
      console.error('Error in DOMContentLoaded listener:', error);
      alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    }
  })

  /**
   * Event listener for login button click.
   *
   * Captures username and password input values and sends them to the server
   * to attempt a login. Redirects to the use case selection page on successful
   * login. Alerts the user if the login fails or if there is an unexpected response.
   */
  loginButton.addEventListener('click', function() {
    const usernameValue = username.value;
    const passwordValue = password.value;
    fetch(BaseURL + 'loginAdmin', {
      method:"POST",
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ username: usernameValue , password: passwordValue}),
      credentials:"include"
    })
      .then(response => response.text())
      .then(data => {
        if(data === 'true'){
          window.location.href = UseCaseSelectionHTMLPATH
        } else if(data === 'false'){
          console.error('Login failed')
          alert('Benutzername und Passwort passen nicht zusammen');
        } else {
          console.error('Unexpected response:', data);
          alert('Unerwartete Antwort vom Server');
        }
      })
      .catch(error => {
        console.error('Error:', error)
        alert("Unerwartete Antwort vom Server");
      })
  })
