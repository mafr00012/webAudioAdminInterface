  const loginButton = document.getElementById('loginButton');
  const username = document.getElementById('usernameLogin');
  const password = document.getElementById('passwordLogin');
  const baseURL = 'http://localhost:3000/'

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
          window.location.href = '../useCaseSelection.html'
        } else {
          console.error('Login failed:', data)
          alert('Login faild: '+ data)
        }
      })
      .catch(error => {
        console.error('Error:', error)
      })
  })

