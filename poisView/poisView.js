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
const baseURL = 'http://localhost:3000/'
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
let currentPoi = null
let orderIsImportent = false;
let countOfPois = 0;
let bearbeitungsModusAktiv = false;
const list = document.getElementById('editUseCaseSidebarListOfPOI');
const openStreatMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})
const markers = L.layerGroup().addTo(map);

function poiItem(value, marker, listDiv){
  const poi = {
    databaseData: value,
    marker: marker,
    div: listDiv
  }
  return poi
}

openStreatMap.addTo(map);

function loadMap(){
  map.removeLayer(openStreatMap)
  openStreatMap.addTo(map);
}

document.addEventListener("DOMContentLoaded", isOrderOfPoisImportent)

function loadPoiItems(jumpBackToLastCurrentPoi){
  countOfPois = 0;
  fetch( baseURL + "pois",{
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
        data.sort((a, b) => a.order - b.order);
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
        setCurrentPoi(lastCurrentPoi)
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

function isOrderOfPoisImportent(){
  fetch( baseURL + "chosenUseCase", {
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

function onMapClick(e) {
  var latitude = e.latlng.lat
  var longitude = e.latlng.lng
  if(longitude > 180 || longitude < -180){
    longitude = longitude % 180
  }
  fetch(baseURL + "pois",{
    method:"POST",
    credentials:"include",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({order: countOfPois, x_coordinate: latitude, y_coordinate: longitude, name: "titel"}),
  })
    .then(result => result.text())
    .then(data => {
      console.log(data)
      clearListAndMap()
      loadPoiItems(false)
    })
    .catch(error => {
      console.error('Error:', error)
      window.location.href = '../login.html'
    })
}

map.on('click', onMapClick);

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

let chosenDiv = null

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

function clearListAndMap(){
  list.innerHTML = '';
  markers.clearLayers();
}

editUseCaseApplyChangesButton.addEventListener('click', function(){
  const name = editUseCaseNameInput.value
  fetch(baseURL + `pois/${currentPoi.databaseData.id}`,{
    method:"PUT",
    credentials:"include",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({order: currentPoi.databaseData.order, x_coordinate: currentPoi.databaseData.x_coordinate, y_coordinate: currentPoi.databaseData.y_coordinate, soundfile_id: currentPoi.databaseData.soundfile_id, usecase_id: currentPoi.databaseData.usecase_id, name: name}),
  })
    .then(result => result.text())
    .then(data => {
      console.log(data)
      clearListAndMap()
      loadPoiItems(true)
    })
    .catch(error => {
      console.error('Error:', error)
      window.location.href = '../login.html'
    })
})

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
    console.error('Something went wrong in the MarkerMenu')
  }
})

markerDeleteButton.addEventListener('click', function() {
  markers.removeLayer(currentPoi.marker)
  nameDisplay.textContent = "Name: "
  breitengradAnzeige.textContent = "Breitengrad: "
  laengengradAnzeige.textContent = "Längengrad: "
  fetch(baseURL + `pois/${currentPoi.databaseData.id}`,{
    method:"DELETE",
    credentials:"include",
  })
    .then(result => result.text())
    .then(data => {
      console.log(data)
      clearListAndMap()
      loadPoiItems(false)
    })
    .catch(error => {
      console.error('Error:', error)
      window.location.href = '../login.html'
    })
})

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
      console.error('in der Sidebar gab es einen Fehler')
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
      console.error('in der Sidebar gab es einen Fehler')
    }
    editUseCaseSidebarClassList.remove('editUseCaseSidebarInvisible')
    editUseCaseSidebarClassList.add('editUseCaseSidebar')
  }
})

fromEditusecaseToUsecaseselectionButton.addEventListener("click",() => {
  window.location.href = "../useCaseSelection.html";
})

const toggleSwitch = document.getElementById('toggleSwitch');
toggleSwitch.addEventListener('change', function() {
  orderIsImportent = this.checked;
  if (this.checked) {
    sendOrderToServer()
    fetch(baseURL + "updateFixedOrderOfChosenUseCase", {
      method: "PUT",
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({fixed_order: "1"}),
    }).then(response => response.text())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
  } else {
    fetch(baseURL + "updateFixedOrderOfChosenUseCase", {
      method: "PUT",
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({fixed_order: "0"}),
    }).then(response => response.text())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
  }
});

function setSwitchOn() {
  toggleSwitch.checked = true;
}

function setSwitchOff() {
  toggleSwitch.checked = false;
}

function sendOrderToServer() {
  const items = list.getElementsByTagName('li');
  const order = Array.from(items).map((item, index) => {
    const poiId = item.querySelector('div').innerHTML.split('seperator')[1].trim();
    return { id: poiId, order: index + 1 };
  });

  fetch(baseURL + 'updatePoiOrder', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({newOrder: order}),
  })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

function updatechosenSoundfileCurrentPoi(soundfile){
  fetch(baseURL + `updatePoiSoundfile/${currentPoi.databaseData.id}`,{
    method: "PUT",
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({soundfile_id: soundfile.id})
  })
    .then(response => response.text())
    .then(data => {
      console.log(data)
      chosenSoundfileId = soundfile.id
      loadSoundfiles()
    })
    .catch(error => console.error('Error:', error));
}

const dropZone = document.getElementById('drop-zone');
let chosenSoundfileId = null
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const formData = new FormData();
    formData.append('file', files[0]);
    fetch(baseURL + "soundfiles", {
      method:"POST",
      credentials:"include",
      body: formData
    })
      .then(response => response.text())
      .then(data => {
        console.log(data)
        alert(`Datei "${files[0].name}" wurde erfolgreich hochgeladen.`);
        loadSoundfiles()
      })
      .catch(error => {
        console.error('Error:', error)
        window.location.href = '../login.html'
      })
  }
});

let abgespielteAudio = null;

const soundfileList = document.getElementById('soundfileList');
const toggleSoundfileList = document.getElementById('toggleSoundfileList');

function addSoundFileToList(soundfile){
  const pathToSoundFile = baseURL + `soundfilesFile/${soundfile.filename}`
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
    audio.play();
    setTimeout(() => {
      abgespielteAudio = null
      audio.pause();
    }, 5000);
  };

  item.appendChild(checkbox);
  item.appendChild(label);
  soundfileList.appendChild(item);
}

function clearSoundfileList(){
  soundfileList.innerHTML= "";
}

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

function loadSoundfiles(){
  fetch(baseURL + 'soundfiles', {
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
      window.location.href = '../login.html'
    })
}
