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

export function unauthorizedHandlerWithTextoutput(result) {
  if (!result.ok) {
    // Überprüfe auf spezifische Statuscodes
    if (result.status === 401) {
      // Leite den Benutzer bei 401 Unauthorized zur Login-Seite weiter
      window.location.href = LoginHTMLPATH;
      // Wirf einen Fehler, um die weitere Verarbeitung zu stoppen
      throw new Error('Nicht autorisiert - Weiterleitung zur Login-Seite.');
    }

    // Andere Fehler behandeln
    return result.text().then(errorMessage => {
      throw new Error(`Fehler: ${result.status} ${result.statusText} - ${errorMessage}`);
    });
  }
  return result.text();
}
