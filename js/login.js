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
        } else {
          console.error('Login failed:', data)
          alert('Login faild: '+ data)
        }
      })
      .catch(error => {
        console.error('Error:', error)
      })
  })

  function isLoggedIn() {
    fetch(baseURL + 'isAlreadyLoggedin', {
      method:"GET",
      headers:{'Content-Type':'application/json'},
      credentials:"include",
    })
      .then(response => response.text())
      .then(data => {
        if(data === 'true'){
          window.location.href = useCaseSelectionHTMLPath;
        }
      })
      .catch(error => {
        console.error('Error:', error)
      })
  }
