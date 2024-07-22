export const baseURL = 'https://webaudio.uber.space/api/' //http://localhost:3000/
export const loginHtmlPath = "../../admin/login.html"
export const useCaseSelectionHTMLPath = '../../admin/useCaseSelection.html'
export const poisViewHTMLPath = '../../admin/poisView.html'


document.addEventListener("DOMContentLoaded", async () => {
  try{
    const data = await isLoggedIn()
    if(data === 'true'){
      window.location.href = useCaseSelectionHTMLPath;
    } else if (data === 'false') {
      window.location.href = loginHtmlPath;
    } else {
      console.error('Unexpected response:', data);
      alert('Unerwartete Antwort vom Server');
    }
  } catch(error){
    console.error('Error in DOMContentLoaded listener:', error);
  }
})

export async function isLoggedIn() {
  try {
    const response = await fetch(baseURL + 'isAlreadyLoggedin', {
      method: "GET",
      headers: {'Content-Type': 'application/json'},
      credentials: "include",
    })
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.text();
    console.log('Login status:', data);
    return data;
  } catch (error) {
    console.error('Error:', error)
    alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
  }
}
