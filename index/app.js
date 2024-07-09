document.addEventListener("DOMContentLoaded", isLoggedIn)
const BaseURL = 'https://webaudio.uber.space/api/' //http://localhost:3000/
function isLoggedIn() {
  fetch(BaseURL + 'loginAdmin', {
    method:"POST",
    credentials:"include",
  })
    .then(response => response.text())
    .then(data => {
      if(data === 'true'){
        window.location.href = '../../webAudioAdminInterface/useCaseSelection/mainScreen.html'
      } else {
        window.location.href = "../../webAudioAdminInterface/login.html";
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
}
