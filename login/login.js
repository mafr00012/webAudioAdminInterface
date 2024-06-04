document.addEventListener("DOMContentLoaded", function() {
  const loginButton = document.getElementById('loginButton');
  const emailLogin = document.getElementById('emailLogin');
  const passwordLogin = document.getElementById('passwordLogin');

  loginButton.addEventListener('click', function() {
    window.location.href = "../useCaseSelection/mainScreen.html";
  })
})
