// Define the base URL for the API endpoint. This URL is used to make requests to the web audio API server.
export const BaseURL = 'https://webaudio.uber.space/api/' //http://localhost:3000/
// Define the name of the application.
const applicationName = "admin"
// Export the path from the js directory to the login HTML file
export const LoginHTMLPATH = `../../${applicationName}/login.html`
// Export the path from the js directory to the useCaseSelection HTML file
export const UseCaseSelectionHTMLPATH = `../../${applicationName}/useCaseSelection.html`
// Export the path from the js directory to the poisView HTML file
export const PoisViewHTMLPATH = `../../${applicationName}/poisView.html`

/**
 * asynchronous function to check if the user is already logged in
 * @returns {Promise<null|string>}
 */
export async function isLoggedIn() {
  try {
    const response = await fetch(BaseURL + 'isAlreadyLoggedin', {
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
