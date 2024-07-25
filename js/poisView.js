import {BaseURL, LoginHTMLPATH, UseCaseSelectionHTMLPATH, isLoggedIn} from "./app.js";

const map = L.map('map', {
  center: [0, 0],
  zoom: 3,
  maxBounds: [
    [-90, -180],
    [90, 180]
  ],
  maxBoundsViscosity: 2.0 ,
  minZoom: 3
})
const breitengradAnzeige = document.getElementById('breitengradAnzeige');
const laengengradAnzeige = document.getElementById('laengengradAnzeige');
const nameDisplay = document.getElementById('nameDisplay');
const markerMenuClassList = document.getElementById("markerMenu").classList
const mapClassList = document.getElementById('map').classList
const closeButton = document.getElementById('markerMenuCloseButton')
const markerDeleteButton = document.getElementById('markerLoeschenButton')
const markerDatenBearbeitungsmodusClassList = document.getElementById('markerDatenBearbeitungsmodus').classList;
const markerDatenAnzeigeClassList = document.getElementById('markerDatenAnzeige').classList;
const bearbeitungsModusButton = document.getElementById('bearbeitungsModusButton');
const editUseCaseNavbarSideBarManageButton = document.getElementById('editUseCaseNavbarSideBarManageButton');
const editUseCaseSidebarClassList = document.getElementById('editUseCaseSidebar').classList;
const fromEditusecaseToUsecaseselectionButton = document.getElementById('fromEditusecaseToUsecaseselectionButton');
const editUseCaseNameInput = document.getElementById('editUseCaseNameInput')
const editUseCaseApplyChangesButton = document.getElementById('editUseCaseApplyChangesButton')
const list = document.getElementById('editUseCaseSidebarListOfPOI');
const openStreatMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})
const markers = L.layerGroup().addTo(map);
const toggleSwitch = document.getElementById('toggleSwitch');
const dropZone = document.getElementById('drop-zone');
const soundfileList = document.getElementById('soundfileList');
const toggleSoundfileList = document.getElementById('toggleSoundfileList');

let currentPoi = null
let orderIsImportent = false;
let countOfPois = 0;
let bearbeitungsModusAktiv = false;
let chosenDiv = null
let chosenSoundfileId = null
let abgespielteAudio = null;

/**
 * Initializes the page by checking if the user is logged in and setting up the Contents if he is logged in
 * or redirect the user to the login if he is not.
 */
document.addEventListener("DOMContentLoaded", async () => {
  try{
    const data = await isLoggedIn()
    if(data === 'true'){
      isOrderOfPoisImportent();
    } else if (data === 'false') {
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

// Add the OpenStreetMap to the map container
openStreatMap.addTo(map);

// Register an event listener for map clicks
map.on('click', onMapClick);

/**
 * Event listener for the "Apply Changes" button in the edit use case section.
 * Updates the current point of interest (POI) with new data.
 */
editUseCaseApplyChangesButton.addEventListener('click', function(){
  const name = editUseCaseNameInput.value
  if(name === "seperator") {
    alert("Invalider Name")
  }
  else {
    fetch(BaseURL + `pois/${currentPoi.databaseData.id}`, {
      method: "PUT",
      credentials: "include",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        order: currentPoi.databaseData.order, x_coordinate: currentPoi.databaseData.x_coordinate,
        y_coordinate: currentPoi.databaseData.y_coordinate, soundfile_id: currentPoi.databaseData.soundfile_id,
        usecase_id: currentPoi.databaseData.usecase_id, name: name
      }),
    })
      .then(result => {
        if (!result.ok) {
          if (result.status === 401) {
            window.location.href = LoginHTMLPATH;
            throw new Error('Unauthorized - redirecting to login page');
          }

          return result.text().then(errorMessage => {
            throw new Error(`Error: ${result.status} ${result.statusText} - ${errorMessage}`);
          });
        }
        return result.text();
      })
      .then(() => {
        alert("Name wurde geändert")
        clearListAndMap()
        loadPoiItems(true)
      })
      .catch(error => {
        console.error('Error:', error)
      })
  }
})

/**
 * Event listener for the "Close" button in the marker menu.
 * Changes the map view and marker menu visibility.
 */
closeButton.addEventListener('click', function (){
  if(mapClassList.contains('mapWithMarkerMenu')){
    mapClassList.remove('mapWithMarkerMenu')
    mapClassList.add('fullMap')
    markerMenuClassList.remove('visiblemarkerMenu')
    markerMenuClassList.add('markerMenu')
  }else if(mapClassList.contains('mapWithMarkerMenuAndSidebar')){
    mapClassList.remove('mapWithMarkerMenuAndSidebar')
    mapClassList.add('mapWithSidebar')
    markerMenuClassList.remove('editUseCaseMarkerMenuWithSidebar')
    markerMenuClassList.add('markerMenu')
  }else{
    console.error('Something went wrong in the MarkerMenu display')
  }
})

/**
 * Event listener for the "Delete Marker" button.
 * Removes the marker from the map and the list and deletes the corresponding POI from the database.
 */
markerDeleteButton.addEventListener('click', function() {
  markers.removeLayer(currentPoi.marker)
  nameDisplay.textContent = "Name: "
  breitengradAnzeige.textContent = "Breitengrad: "
  laengengradAnzeige.textContent = "Längengrad: "
  fetch(BaseURL + `pois/${currentPoi.databaseData.id}`,{
    method:"DELETE",
    credentials:"include",
  })
    .then(result => {
      if (!result.ok) {
        if (result.status === 401) {
          window.location.href = LoginHTMLPATH;
          throw new Error('Unauthorized - redirecting to login page');
        }

        return result.text().then(errorMessage => {
          throw new Error(`Error: ${result.status} ${result.statusText} - ${errorMessage}`);
        });
      }
      return result.text();
    })
    .then(() => {
      clearListAndMap()
      loadPoiItems(false)
    })
    .catch(error => {
      console.error('Error:', error)
    })
})

/**
 * Toggles the edit mode for marker data.
 * Switches between displaying marker data and enabling edit mode.
 */
bearbeitungsModusButton.addEventListener('click', function(){
  if(markerDatenAnzeigeClassList.contains('markerDatenAnzeige')) {
    markerDatenAnzeigeClassList.remove('markerDatenAnzeige');
    markerDatenBearbeitungsmodusClassList.remove('markerDatenBearbeitungsmodus');
    markerDatenAnzeigeClassList.add('markerDatenAnzeigeInvisible');
    markerDatenBearbeitungsmodusClassList.add('markerDatenBearbeitungsmodusVisible');
    bearbeitungsModusAktiv = true;
    editUseCaseNameInput.value = currentPoi.databaseData.name
    chosenSoundfileId = currentPoi.databaseData.soundfile_id
    loadSoundfiles()
  }else{
    markerDatenBearbeitungsmodusClassList.remove('markerDatenBearbeitungsmodusVisible');
    markerDatenAnzeigeClassList.remove('markerDatenAnzeigeInvisible');
    markerDatenBearbeitungsmodusClassList.add('markerDatenBearbeitungsmodus');
    markerDatenAnzeigeClassList.add('markerDatenAnzeige');
    bearbeitungsModusAktiv = false;
  }
})

/**
 * Toggles the visibility of the sidebar and adjusts map view and marker menu accordingly.
 */
editUseCaseNavbarSideBarManageButton.addEventListener('click', function(){
  if(editUseCaseSidebarClassList.contains('editUseCaseSidebar')){
    if(mapClassList.contains('mapWithMarkerMenuAndSidebar')){
      mapClassList.remove('mapWithMarkerMenuAndSidebar')
      mapClassList.add('mapWithMarkerMenu')
      markerMenuClassList.remove('editUseCaseMarkerMenuWithSidebar')
      markerMenuClassList.add('visiblemarkerMenu')
    } else if(mapClassList.contains('mapWithSidebar')){
      mapClassList.remove('mapWithSidebar')
      mapClassList.add('fullMap')
    }else{
      console.error('Something went wrong at the Sidebar display')
    }
    editUseCaseSidebarClassList.remove('editUseCaseSidebar')
    editUseCaseSidebarClassList.add('editUseCaseSidebarInvisible')
  }else if(editUseCaseSidebarClassList.contains('editUseCaseSidebarInvisible')){
    if(mapClassList.contains('fullMap')){
      mapClassList.remove('fullMap')
      mapClassList.add('mapWithSidebar')
    }else if(mapClassList.contains('mapWithMarkerMenu')){
      mapClassList.remove('mapWithMarkerMenu')
      mapClassList.add('mapWithMarkerMenuAndSidebar')
      markerMenuClassList.remove('visiblemarkerMenu')
      markerMenuClassList.add('editUseCaseMarkerMenuWithSidebar')
    } else {
      console.error('Something went wrong at the Sidebar display')
    }
    editUseCaseSidebarClassList.remove('editUseCaseSidebarInvisible')
    editUseCaseSidebarClassList.add('editUseCaseSidebar')
  }
})

/**
 * Redirects the user from the edit use case page to the use case selection page.
 */
fromEditusecaseToUsecaseselectionButton.addEventListener("click", function() {
  window.location.href = UseCaseSelectionHTMLPATH;
})

/**
 * Toggles the importance of the order of POIs and updates the server with the new order state.
 */
toggleSwitch.addEventListener('change', function() {
  orderIsImportent = this.checked;
  if (this.checked) {
    sendOrderToServer()
    fetch(BaseURL + "updateFixedOrderOfChosenUseCase", {
      method: "PUT",
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({fixed_order: "1"}),
    }).catch(error => console.error('Error:', error));
  } else {
    fetch(BaseURL + "updateFixedOrderOfChosenUseCase", {
      method: "PUT",
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({fixed_order: "0"}),
    }).catch(error => console.error('Error:', error));
  }
});

/**
 * Event listener for drag over events on the drop zone.
 * Prevents the default behavior and adds a visual indicator for dragging.
 * @param {DragEvent} e - The drag event
 */
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

/**
 * Event listener for drag leave events on the drop zone.
 * Removes the visual indicator for dragging.
 */
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

/**
 * Handles the drop event on the drop zone.
 * Uploads the dropped file to the server if it is valid.
 * @param {DragEvent} e - The drag event
 */
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const formData = new FormData();
    formData.append('file', files[0]);
    fetch(BaseURL + "soundfiles", {
      method:"POST",
      credentials:"include",
      body: formData
    })
      .then(result => {
        if (!result.ok) {
          if (result.status === 401) {
            window.location.href = LoginHTMLPATH;
            throw new Error('Unauthorized - redirecting to login page');
          }

          return result.text().then(errorMessage => {
            throw new Error(`Error: ${result.status} ${result.statusText} - ${errorMessage}`);
          });
        }
        return result.text();
      })
      .then(() => {
        alert(`Datei "${files[0].name}" wurde erfolgreich hochgeladen.`);
        loadSoundfiles()
      })
      .catch(error => {
        console.error('Error:', error)
      })
  }
});

/**
 * Toggles the visibility between the soundfile list and the drop zone.
 * Updates the toggle button text based on the current state.
 */
toggleSoundfileList.addEventListener('click', function() {
  if (soundfileList.style.display === 'none') {
    soundfileList.style.display = 'block';
    dropZone.style.display = 'none';
    toggleSoundfileList.textContent = 'MP3 zu Liste hinzufügen';
  } else {
    soundfileList.style.display = 'none';
    dropZone.style.display = 'block';
    toggleSoundfileList.textContent = 'Zurück zur Liste';
  }
});

/**
 * Represents a POI item with database data, a map marker, and an associated DOM element.
 * @param {Object} value - The database data for the POI
 * @param {L.Marker} marker - The map marker for the POI
 * @param {HTMLElement} listDiv - The DOM element representing the POI in the list
 * @returns {Object} The POI item object
 */
function poiItem(value, marker, listDiv){
  return {
    databaseData: value,
    marker: marker,
    div: listDiv
  }
}

/**
 * Loads the map and resets its layers.
 * Removes the current layer and adds a new one to the map.
 */
function loadMap(){
  map.removeLayer(openStreatMap)
  openStreatMap.addTo(map);
}

/**
 * Loads the Points of Interest (POIs) from the server and displays them on the map.
 * Optionally, it can retain the previous POI selection after reloading.
 * @param {boolean} jumpBackToLastCurrentPoi - If true, it reselects the last selected POI after loading.
 */
function loadPoiItems(jumpBackToLastCurrentPoi){
  countOfPois = 0;
  fetch( BaseURL + "pois",{
    method:"GET",
    credentials:"include"
  })
    .then(result => result.json())
    .then(data => {
      let lastCurrentPoi = null
      if(jumpBackToLastCurrentPoi){
        lastCurrentPoi = currentPoi
      }else{
        lastCurrentPoi = null
      }
      if(orderIsImportent){
        data.sort((a, b) => a.order - b.order); // Sort POIs by their order if important
      }
      data.forEach(value => {
        countOfPois++;
        const poi = poiItem(value)
        addPoiToMap(poi)
        if(lastCurrentPoi != null) {
          if (poi.databaseData.id === lastCurrentPoi.databaseData.id) {
            lastCurrentPoi = poi
          }
        }
      })
      if(lastCurrentPoi != null){
        setCurrentPoi(lastCurrentPoi) // Set the last current POI as active
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

/**
 * Checks if the order of POIs is set to important for the current use case and loads the POIs accordingly.
 * Sets the toggle switch based on the order importance.
 */
function isOrderOfPoisImportent(){
  fetch( BaseURL + "chosenUseCase", {
    method: "GET",
    credentials: "include",
  }).then(result => result.json())
    .then(data => {
      if(data.fixed_order === 1){
        orderIsImportent = true
        setSwitchOn()
        loadPoiItems(false)
      }else{
        orderIsImportent = false
        setSwitchOff()
        loadPoiItems(false)
      }
    }).catch(error => {
    console.error('Error:', error)
  })
}

/**
 * Event handler for map clicks. Adds a new POI at the clicked location.
 * Adjusts longitude if it exceeds bounds and posts the new POI to the server.
 * @param {Object} e - The map click event, which includes the latitude and longitude.
 */
function onMapClick(e) {
  let latitude = e.latlng.lat
  let longitude = e.latlng.lng
  if(longitude > 180 || longitude < -180){
    longitude = longitude % 180
  }
  fetch(BaseURL + "pois",{
    method:"POST",
    credentials:"include",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({order: countOfPois, x_coordinate: latitude, y_coordinate: longitude, name: "titel"}),
  })
    .then(result => {
      if (!result.ok) {
        if (result.status === 401) {
          window.location.href = LoginHTMLPATH;
          throw new Error('Unauthorized - redirecting to login page');
        }

        return result.text().then(errorMessage => {
          throw new Error(`Error: ${result.status} ${result.statusText} - ${errorMessage}`);
        });
      }
      return result.text();
    })
    .then(() => {
      clearListAndMap()
      loadPoiItems(false)
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

/**
 * Adds a POI to the map and the POI list.
 * Creates a map marker for the POI and sets up click event to select the POI.
 * @param {Object} poi - The POI item object containing database data and marker.
 */
function addPoiToMap(poi) {
  const latitude = poi.databaseData.x_coordinate
  const longitude = poi.databaseData.y_coordinate
  const marker = L.marker([latitude, longitude]).addTo(markers);
  poi.marker = marker
  addPoiToList(poi)
  marker.on('click', function(){
    setCurrentPoi(poi)
  })
  setCurrentPoi(poi)
}

/**
 * Adds a Point of Interest (POI) to the list display on the webpage.
 * Creates a list item element for the POI and appends it to the list.
 * Sets up an event listener to make the POI active when clicked.
 * @param {Object} poi - The POI object containing database data and associated marker.
 */
function addPoiToList(poi) {
  const itemValue = poi.databaseData;
  const listItem = document.createElement('li');
  const div = document.createElement('div');
  div.className = 'list-item';
  div.innerHTML = `<h1>${itemValue.name}</h1><p style="display: none">seperator${itemValue.id}seperator</p>`;
  poi.div = div;
  div.onclick = function() {setCurrentPoi(poi);};
  listItem.appendChild(div);
  list.appendChild(listItem);
}

/**
 * Sets the specified POI as the currently active POI.
 * Updates the display with the POI's data and changes the background color of the selected list item.
 * If edit mode is active, populates input fields with POI data and loads sound files.
 * @param {Object} poi - The POI object to be set as current.
 */
function setCurrentPoi(poi) {
  const latitude = poi.databaseData.x_coordinate
  let longitude = poi.databaseData.y_coordinate

  currentPoi = poi

  nameDisplay.textContent = `Name: ${poi.databaseData.name}`
  breitengradAnzeige.textContent = `Breitengrad: ${latitude}`
  laengengradAnzeige.textContent = `Längengrad: ${longitude}`
  if(bearbeitungsModusAktiv){
    editUseCaseNameInput.value = poi.databaseData.name
    chosenSoundfileId = poi.databaseData.soundfile_id
    loadSoundfiles()
  }

  changeBackgroundColorOfChosenListItem(poi)
  if(!markerMenuClassList.contains('visiblemarkerMenu')&&!markerMenuClassList.contains('editUseCaseMarkerMenuWithSidebar')){
    openMenue()
  }
}

/**
 * Changes the background color of the selected list item to indicate it is the active POI.
 * Reverts the previously selected list item's background color to the default.
 * @param {Object} poi - The POI whose list item should be highlighted.
 */
function changeBackgroundColorOfChosenListItem(poi){
  const div = poi.div
  if(chosenDiv === null){
    chosenDiv = div
    div.style = 'background-color: #555555'
  }else{
    chosenDiv.style = 'background-color: white'
    div.style = 'background-color: #555555'
    chosenDiv = div
  }
}

/**
 * Opens the marker menu and adjusts the map layout based on the current sidebar state.
 * Changes the map layout to accommodate the visibility of the marker menu.
 */
function openMenue(){
  if(!(markerMenuClassList.contains('visiblemarkerMenu')||markerMenuClassList.contains('editUseCaseMarkerMenuWithSidebar'))){
    if (editUseCaseSidebarClassList.contains('editUseCaseSidebarInvisible')) {
      markerMenuClassList.remove('markerMenu')
      markerMenuClassList.add('visiblemarkerMenu')
      mapClassList.remove('fullMap')
      mapClassList.add('mapWithMarkerMenu')
    } else if (editUseCaseSidebarClassList.contains('editUseCaseSidebar')) {
      markerMenuClassList.remove('markerMenu')
      markerMenuClassList.add('editUseCaseMarkerMenuWithSidebar')
      mapClassList.remove('mapWithSidebar')
      mapClassList.add('mapWithMarkerMenuAndSidebar')
    }
    loadMap()
  }
}

/**
 * Clears all POI list items and map markers from the display.
 * Resets the list and removes all layers from the marker group.
 */
function clearListAndMap(){
  list.innerHTML = '';
  markers.clearLayers();
}

/**
 * Sets the toggle switch wich switches weather the order of the pois in the list is importent, to the "on" position.
 * Changes the switch's state to checked.
 */
function setSwitchOn() {
  toggleSwitch.checked = true;
}

/**
 * Sets the toggle switch wich switches weather the order of the pois in the list is importent, to the "off" position.
 * Changes the switch's state to unchecked.
 */
function setSwitchOff() {
  toggleSwitch.checked = false;
}

/**
 * Sends the updated order of POIs to the server.
 * The order is determined by the current sequence of list items.
 * Each item in the list is assigned an order based on its position.
 */
function sendOrderToServer() {
  const items = list.getElementsByTagName('li');
  const order = Array.from(items).map((item, index) => {
    const poiId = item.querySelector('div').innerHTML.split('seperator')[1].trim();
    return { id: poiId, order: index + 1 };
  });

  fetch(BaseURL + 'updatePoiOrder', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({newOrder: order}),
  })
    .then(result => {
      if (!result.ok) {
        if (result.status === 401) {
          window.location.href = LoginHTMLPATH;
          throw new Error('Unauthorized - redirecting to login page');
        }

        return result.text().then(errorMessage => {
          throw new Error(`Error: ${result.status} ${result.statusText} - ${errorMessage}`);
        });
      }
      return result.text();
    })
    .catch(error => console.error('Error:', error));
}

/**
 * Updates the sound file associated with the current POI.
 * Sends a request to the server to update the sound file ID for the specified POI.
 * After updating, clears the list and map and reloads the POIs.
 * @param {Object} soundfile - The sound file object containing the ID to be associated with the POI.
 */
function updatechosenSoundfileCurrentPoi(soundfile){
  fetch(BaseURL + `updatePoiSoundfile/${currentPoi.databaseData.id}`,{
    method: "PUT",
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({soundfile_id: soundfile.id})
  })
    .then(result => {
      if (!result.ok) {
        if (result.status === 401) {
          window.location.href = LoginHTMLPATH;
          throw new Error('Unauthorized - redirecting to login page');
        }

        return result.text().then(errorMessage => {
          throw new Error(`Error: ${result.status} ${result.statusText} - ${errorMessage}`);
        });
      }
      return result.text();
    })
    .then(() => {
      alert("soundfile wurde geändert")
      chosenSoundfileId = soundfile.id
      clearListAndMap()
      loadPoiItems(true);
      //loadSoundfiles()
    })
    .catch(error => console.error('Error:', error));
}

/**
 * Adds a sound file to the list in the UI.
 * Creates a new list item with a checkbox and label for the sound file.
 * The checkbox allows selection of the sound file, and the label allows playback of the audio.
 * @param {Object} soundfile - The sound file object containing id and filename.
 */
function addSoundFileToList(soundfile){
  const pathToSoundFile = BaseURL + `soundfilesFile/${soundfile.filename}`
  const item = document.createElement('div');
  item.className = 'soundfile-item';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = 'soundfile';
  checkbox.value = soundfile.id;
  if(soundfile.id === chosenSoundfileId){
    checkbox.checked = true;
  }
  checkbox.onclick = () => {
    document.querySelectorAll('input[name="soundfile"]').forEach(cb => {
      if (cb !== checkbox){
        cb.checked = false;
      } else {
        updatechosenSoundfileCurrentPoi(soundfile)
      }
    });
  };

  const label = document.createElement('p');
  label.textContent = soundfile.filename;
  label.onclick = () => {
    if(abgespielteAudio != null){
      abgespielteAudio.pause();
    }
    const audio = new Audio(pathToSoundFile);
    abgespielteAudio = audio;
    audio.play()
      .catch(error => {
        console.error("Error: " + error);
        alert("Fehler beim Abspielen der Audio");
      })
    setTimeout(() => {
      abgespielteAudio = null
      audio.pause();
    }, 5000);
  };

  item.appendChild(checkbox);
  item.appendChild(label);
  soundfileList.appendChild(item);
}

/**
 * Clears all items from the sound file list in the UI.
 * Empties the content of the soundfileList container.
 */
function clearSoundfileList(){
  soundfileList.innerHTML= "";
}

/**
 * Loads the list of sound files from the server and populates the UI.
 * Fetches the sound files data, clears the list and adds each sound file to the list using `addSoundFileToList`.
 */
function loadSoundfiles(){
  fetch(BaseURL + 'soundfiles', {
    method: "GET",
    credentials: "include"
  }).then(response => response.json())
    .then(data => {
      clearSoundfileList();
      data.forEach( value => {
        addSoundFileToList(value);
      })
    })
    .catch(error => {
      console.error('Error:', error)
    })
}
