export const baseURL = 'https://webaudio.uber.space/api/' //http://localhost:3000/
export const loginHtmlPath = "../../webAudioAdminInterface/login.html"
export const useCaseSelectionHTMLPath = '../../webAudioAdminInterface/useCaseSelection.html'
export const poisViewHTMLPath = '../../webAudioAdminInterface/poisView.html'
export const completeLoginHtmlPathURL = "https://webaudio.uber.space/webAudioAdminInterface/login.html"

window.location.replace(completeLoginHtmlPathURL);

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
    return null;
  }
}
