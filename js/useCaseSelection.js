import {BaseURL, LoginHTMLPATH, PoisViewHTMLPATH, isLoggedIn, unauthorizedHandlerWithTextoutput } from "./app.js";

const useCaseUpdateContainerClassList = document.getElementById("useCaseUpdateContainer").classList;
const useCaseUpdateCloseButton = document.getElementById("useCaseUpdateCloseButton");
const inputTitel = document.getElementById('useCaseInputTitel');
const inputDescription = document.getElementById('useCaseInputDescription');
const addButton = document.getElementById('useCaseAddButton');
const logoutButton = document.getElementById('logoutButton');

let currentItemInUpdateMenu = null;


/**
 * Event listener for DOMContentLoaded.
 *
 * checks if the user is already logged in when the document is fully loaded.
 * If the user is logged in, it loads the use case items.
 * If not, it redirects to the login page.
 * Handles unexpected responses and errors.
 */
document.addEventListener("DOMContentLoaded", async () => {
  try{
    const data = await isLoggedIn()
    if(data === 'true'){
      console.log("True: " + data)
      loadItems();
    } else if (data === 'false') {
      console.log("False: " + data)
      window.location.href = LoginHTMLPATH;
    } else {
      console.error('Unexpected response:', data);
      alert('Unerwartete Antwort vom Server');
    }
  } catch(error){
    console.error('Error in DOMContentLoaded listener:', error);
    alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
  }
})

/**
 * Event listener for closing the use case update container.
 *
 * Toggles the visibility of the use case update container by changing its CSS classes.
 */
useCaseUpdateCloseButton.addEventListener("click", function(){
  if(useCaseUpdateContainerClassList.contains("useCaseUpdateContainerVisible")){
    useCaseUpdateContainerClassList.remove("useCaseUpdateContainerVisible")
    useCaseUpdateContainerClassList.add("useCaseUpdateContainer")
  }
  currentItemInUpdateMenu = null;
})

/**
 * Event listener for the add button click.
 *
 * Captures the title and description input values and sends them to the server
 * to add a new use case. Reloads the list of use cases upon success.
 */
addButton.addEventListener("click", function(){
  const titel = inputTitel.value;
  const description = inputDescription.value;
  fetch(BaseURL + 'usecasesAdmin', {
    method: "POST",
    credentials: "include",
    headers: {'Content-Type':'application/json'},
    body:JSON.stringify({titel, beschreibung: description})
  }).then(result => unauthorizedHandlerWithTextoutput(result))
    .then(data => {
      console.log(data)
      clearList()
      loadItems()
    })
    .catch(error => {
      console.error("Error", error)
    })
})

/**
 * Event listener for the logout button click.
 *
 * Sends a logout request to the server and redirects to the login page upon success.
 */
logoutButton.addEventListener("click", function() {
  fetch(BaseURL + 'logout', {
    method:"GET",
  }).then(response => response.text())
    .then(data => {
      if(data === 'true'){
        window.location.href = LoginHTMLPATH
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
})

/**
 * Loads the list of use case items from the server.
 *
 * Sends a GET request to retrieve use case data and adds each item to the DOM.
 * Logs a message if no use cases are available.
 */
function loadItems() {
  fetch(BaseURL + "usecasesAdmin",{
    method:"GET",
    credentials:"include"
  })
    .then(result => result.json())
    .then(data => {
      if (data === null || Array.isArray(data) && data.length === 0 || (typeof data === 'object' && Object.keys(data).length === 0)) {
        console.log("noch keine Anwendungszwecke vorhanden")
      } else {
        data.forEach(value => {
        addItem(value)
        })
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

/**
 * Adds a new item to the dynamic list in the DOM.
 *
 * This function creates a list item with buttons to edit, delete, update, and generate a QR code for a use case.
 * It also sets up event listeners for each button to perform the corresponding actions.
 *
 * @param {Object} itemdata - The data object representing the use case item.
 * @param {string} itemdata.titel - The title of the use case.
 * @param {string} itemdata.beschreibung - The description of the use case.
 * @param {number} itemdata.id - The unique identifier for the use case.
 * @param {string} itemdata.fixed_order - The fixed order for the use case (if applicable).
 * @param {string} itemdata.account_username - The username associated with the use case.
 */
function addItem(itemdata) {
  const list = document.getElementById('dynamicList');
  const listItem = document.createElement('li');
  const div = document.createElement('div');
  div.className = 'list-item';
  div.innerHTML = `<h2>${itemdata.titel}</h2><p>${itemdata.beschreibung}</p>
    <button class="openUseCaseButton">Bearbeiten</button>
    <button class="listItemDeleteButton">Löschen</button>
    <button class="useCaseUpdateButton">Ändern</button>
    <button class="generateQRCodeButton">QR-Code erstellen</button>`;
  listItem.appendChild(div);
  list.appendChild(listItem);

  // Set up event listener for the 'Open Use Case' button
  const openUseCaseButton = div.querySelector('.openUseCaseButton');
  openUseCaseButton.addEventListener('click', () => openUseCase(itemdata.id));

  // Set up event listener for the 'Delete' button
  const deleteButton = div.querySelector('.listItemDeleteButton');
  deleteButton.addEventListener('click', () => {
    list.removeChild(listItem);
    fetch(BaseURL + `usecases/${itemdata.id}`, {
      method: "DELETE",
      credentials: "include"
    })
      .then(result => unauthorizedHandlerWithTextoutput(result))
      .then(data => {
        console.log(data)
        alert("Anwendungszweck wurde gelöscht");
      })
      .catch(error => {
        console.error('Error:', error)
      });
  });

  // Set up event listener for the 'Update' button
  const updateButton = div.querySelector('.useCaseUpdateButton');
  updateButton.addEventListener('click', () => {
    if (useCaseUpdateContainerClassList.contains("useCaseUpdateContainer")) {
      useCaseUpdateContainerClassList.remove("useCaseUpdateContainer");
      useCaseUpdateContainerClassList.add("useCaseUpdateContainerVisible");
    }
    currentItemInUpdateMenu = div;
    // Set up event listener for the 'Add' button in the update container
    const useCaseUpdateAddButton = document.getElementById("useCaseUpdateAddButton");
    useCaseUpdateAddButton.addEventListener("click", function () {
      const useCaseUpdateInputTitel = document.getElementById("useCaseUpdateInputTitel");
      const useCaseUpdateInputDescription = document.getElementById("useCaseUpdateInputDescription");
      let titel;
      let description;
      if(currentItemInUpdateMenu === div) {
        if (!useCaseUpdateInputTitel.value) {
          titel = itemdata.titel;
        } else {
          titel = useCaseUpdateInputTitel.value;
        }

        if (!useCaseUpdateInputDescription.value) {
          description = itemdata.beschreibung;
        } else {
          description = useCaseUpdateInputDescription.value;
        }

        fetch(BaseURL + `usecases/${itemdata.id}`, {
          method: "PUT",
          credentials: "include",
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            titel: titel, beschreibung: description, fixed_order: itemdata.fixed_order,
            account_username: itemdata.account_username
          })
        })
          .then(result => unauthorizedHandlerWithTextoutput(result))
          .then(data => {
            console.log(data);
            alert("Änderungen wurden gespeichert")
            clearList();
            loadItems();
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }
    });
  });

  // Set up event listener for the 'Generate QR Code' button
  const generateQRCodeButton = div.querySelector('.generateQRCodeButton');
  generateQRCodeButton.addEventListener('click', () => generateQRCode(itemdata.id));
}

/**
 * Opens a use case by sending its ID to the server.
 *
 * This function sends a POST request to the server to mark the use case as chosen and then redirects to the POIs view page.
 *
 * @param {number} data - The ID of the use case to open.
 */
function openUseCase(data){
  fetch(BaseURL + "chosenUseCase", {
    method: "POST",
    credentials: "include",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id: data}),
  }).then(result => unauthorizedHandlerWithTextoutput(result))
    .then(data => {
      if(data === 'true'){
        window.location.href = PoisViewHTMLPATH
      }else{
        console.error("that didn't work")
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

/**
 * Clears all items from the dynamic list in the DOM.
 *
 * This function removes all child elements from the dynamic list element, effectively clearing the list.
 */
function clearList(){
  const list = document.getElementById('dynamicList');
  list.innerHTML = '';
}
