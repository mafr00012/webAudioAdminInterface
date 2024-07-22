export const baseURL = 'https://webaudio.uber.space/api/' //http://localhost:3000/
export const loginHtmlPath = "../../admin/login.html"
export const useCaseSelectionHTMLPath = '../../admin/useCaseSelection.html'
export const poisViewHTMLPath = '../../admin/poisView.html'


document.addEventListener("DOMContentLoaded", isLoggedIn)

export function isLoggedIn() {
  fetch(baseURL + 'isAlreadyLoggedin', {
    method:"GET",
    headers:{'Content-Type':'application/json'},
    credentials:"include",
  })
    .then(response => response.text())
    .then(data => {
      if(data === 'true'){
        window.location.href = useCaseSelectionHTMLPath;
      } else {
        window.location.href = loginHtmlPath;
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
}
