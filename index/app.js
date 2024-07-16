document.addEventListener("DOMContentLoaded", isLoggedIn)
const BaseURL =  'http://localhost:3000/'
function isLoggedIn() {
  fetch(BaseURL + 'loginAdmin', {
    method:"POST",
    credentials:"include",
  })
    .then(response => response.text())
    .then(data => {
      if(data === 'true'){
        window.location.href = '../useCaseSelection/mainScreen.html'
      } else {
        window.location.href = "../login.html";
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
}
