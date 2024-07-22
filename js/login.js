  import {baseURL, useCaseSelectionHTMLPath} from "./app.js";

  const loginButton = document.getElementById('loginButton');
  const username = document.getElementById('usernameLogin');
  const password = document.getElementById('passwordLogin');

  document.addEventListener("DOMContentLoaded", isLoggedIn)

  loginButton.addEventListener('click', function() {
    const usernameValue = username.value;
    const passwordValue = password.value;
    fetch(baseURL + 'loginAdmin', {
      method:"POST",
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ username: usernameValue , password: passwordValue}),
      credentials:"include"
    })
      .then(response => response.text())
      .then(data => {
        if(data === 'true'){
          window.location.href = useCaseSelectionHTMLPath
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

  async function isLoggedIn() {
    fetch(baseURL + 'isAlreadyLoggedin', {
      method:"GET",
      headers:{'Content-Type':'application/json'},
      credentials:"include",
    })
      .then(response => response.text())
      .then(data => {
        if(data === 'true'){
          window.location.href = useCaseSelectionHTMLPath;
        } else if(data === 'false'){
          // User is not logged in, no action needed
        } else {
          console.error('Unexpected response:', data);
          alert('Unerwartete Antwort vom Server');
        }
      })
      .catch(error => {
        console.error('Error:', error)
        alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      })
  }
