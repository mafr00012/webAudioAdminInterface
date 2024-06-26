// Initialisierung der Karte und Festlegung des Ausgangszustands
const map = L.map('map').setView([0, 0], 2);
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
  console.log("openStreatMap kurz removed")
  openStreatMap.addTo(map);
}

document.addEventListener("DOMContentLoaded", loadPoiItems)

function loadPoiItems(){
  fetch("http://localhost:3000/pois",{
    method:"GET",
    credentials:"include"
  })
    .then(result => result.json())
    .then(data => {
      let lastCurrentPoi = null
      if(currentPoi != null){
        lastCurrentPoi = currentPoi
      }
      data.forEach(value => {
        const poi = poiItem(value)
        addPoiToMap(poi)
      })
      if(lastCurrentPoi != null){
        setCurrentPoi(lastCurrentPoi)
      }
    })
    .catch(error => {
      console.error('Error:', error)
      window.location.href = '../login/login.html'
    })
}

function isOrderOfPoisImportent(){
  fetch("http://localhost:3000/")
}

function onMapClick(e) {
  var latitude = e.latlng.lat
  var longitude = e.latlng.lng
  if(longitude > 180 || longitude < -180){
    longitude = longitude % 180
  }
  fetch("http://localhost:3000/pois",{
    method:"POST",
    credentials:"include",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({order: "1", x_coordinate: latitude, y_coordinate: longitude, name: "titel"}),
  })
    .then(result => result.text())
    .then(data => {
      console.log(data)
      clearListAndMap()
      loadPoiItems()
    })
    .catch(error => {
      console.error('Error:', error)
      window.location.href = '../login/login.html'
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
  div.innerHTML = `<h1>${itemValue.name}</h1><p>${itemValue.id} </p>`;
  poi.div = div;
  div.onclick = function() {setCurrentPoi(poi);};
  listItem.appendChild(div);
  list.appendChild(listItem);
}

function setCurrentPoi(poi) {
  const latitude = poi.databaseData.x_coordinate
  let longitude = poi.databaseData.y_coordinate

  console.log(latitude)
  console.log(longitude)

  currentPoi = poi

  editUseCaseNameInput.value = poi.databaseData.name
  nameDisplay.textContent = `Name: ${poi.databaseData.name}`
  breitengradAnzeige.textContent = `Breitengrad: ${latitude}`
  laengengradAnzeige.textContent = `Längengrad: ${longitude}`

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
  if(markerMenuClassList.contains('visiblemarkerMenu')||markerMenuClassList.contains('editUseCaseMarkerMenuWithSidebar')){
    console.log("menue is already visible")
  }else {
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
  console.log(name)
  fetch(`http://localhost:3000/pois/${currentPoi.databaseData.id}`,{
    method:"PUT",
    credentials:"include",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({order: currentPoi.databaseData.order, x_coordinate: currentPoi.databaseData.x_coordinate, y_coordinate: currentPoi.databaseData.y_coordinate, soundfile_id: currentPoi.databaseData.soundfile_id, usecase_id: currentPoi.databaseData.usecase_id, name: name}),
  })
    .then(result => result.text())
    .then(data => {
      console.log(data)
      clearListAndMap()
      loadPoiItems()
    })
    .catch(error => {
      console.error('Error:', error)
      window.location.href = '../login/login.html'
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
  fetch(`http://localhost:3000/pois/${currentPoi.databaseData.id}`,{
    method:"DELETE",
    credentials:"include",
  })
    .then(result => result.text())
    .then(data => {
      console.log(data)
      clearListAndMap()
      loadPoiItems()
    })
    .catch(error => {
      console.error('Error:', error)
      window.location.href = '../login/login.html'
    })
  nameDisplay.textContent = "Name: "
  breitengradAnzeige.textContent = "Breitengrad: "
  laengengradAnzeige.textContent = "Längengrad: "
})

bearbeitungsModusButton.addEventListener('click', function(){
  if(markerDatenAnzeigeClassList.contains('markerDatenAnzeige')) {
    markerDatenAnzeigeClassList.remove('markerDatenAnzeige');
    markerDatenBearbeitungsmodusClassList.remove('markerDatenBearbeitungsmodus');
    markerDatenAnzeigeClassList.add('markerDatenAnzeigeInvisible');
    markerDatenBearbeitungsmodusClassList.add('markerDatenBearbeitungsmodusVisible');
  }else{
    markerDatenBearbeitungsmodusClassList.remove('markerDatenBearbeitungsmodusVisible');
    markerDatenAnzeigeClassList.remove('markerDatenAnzeigeInvisible');
    markerDatenBearbeitungsmodusClassList.add('markerDatenBearbeitungsmodus');
    markerDatenAnzeigeClassList.add('markerDatenAnzeige');
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
      console.log('in der Sidebar gab es einen Fehler')
    }
    editUseCaseSidebarClassList.remove('editUseCaseSidebarInvisible')
    editUseCaseSidebarClassList.add('editUseCaseSidebar')
  }
})

fromEditusecaseToUsecaseselectionButton.addEventListener("click",() => {
  window.location.href = "../useCaseSelection/mainScreen.html";
})

const toggleSwitch = document.getElementById('toggleSwitch');
document.getElementById('toggleSwitch').addEventListener('change', function() {
  orderIsImportent = this.checked;
  if (this.checked) {
    console.log('Switch is ON');
  } else {
    console.log('Switch is OFF');
  }
});

function switchToggleSwitch(){

}

Sortable.create(list, {
  animation: 150,
  onEnd: function(event) {
    if (isToggleSwitchOn) {
      sendOrderToServer();
    }
  }
});

function sendOrderToServer() {
  const items = listElement.getElementsByTagName('li');
  const order = Array.from(items).map((item, index) => {
    const poiId = item.querySelector('div').innerHTML.split(' ')[1].trim(); // Assuming POI ID is in the div's innerHTML
    return { id: poiId, order: index + 1 };
  });

  fetch('http://localhost:3000/updatePoiOrder', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

//is only managed, when the order of the pois is important
const poiList = []
