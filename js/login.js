  import {baseURL, UseCaseSelectionHTMLPATH, isLoggedIn} from "./app.js";

  const loginButton = document.getElementById('loginButton');
  const username = document.getElementById('usernameLogin');
  const password = document.getElementById('passwordLogin');


  document.addEventListener("DOMContentLoaded", async () => {
    try{
      const data = await isLoggedIn()
      if(data === 'true'){
        window.location.href = UseCaseSelectionHTMLPATH;
      } else if (data === 'false') {
        //muss nichts machen
      } else {
        console.error('Unexpected response:', data);
        alert('Unerwartete Antwort vom Server');
      }
    } catch(error){
      console.error('Error in DOMContentLoaded listener:', error);
      alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    }
  })

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
