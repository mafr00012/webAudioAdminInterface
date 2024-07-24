export const baseURL = 'https://webaudio.uber.space/api/' //http://localhost:3000/
const applicationName = "admin"
export const loginHtmlPath = `../../${applicationName}/login.html`
export const useCaseSelectionHTMLPath = `../../${applicationName}/useCaseSelection.html`
export const poisViewHTMLPath = `../../${applicationName}/poisView.html`


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
    return await response.text();
  } catch (error) {
    console.error('Error:', error)
    return null;
  }
}
