// Initialisierung der Karte und Festlegung des Ausgangszustands
const map = L.map('map').setView([0, 0], 2);
const breitengradAnzeige = document.getElementById('breitengradAnzeige');
const laengengradAnzeige = document.getElementById('laengengradAnzeige');
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
const openStreatMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

function poiItem(id, latitude, longitude, marker, listDiv){
  const poi = {
    id: id,
    latitude: latitude,
    longitude: longitude,
    marker: marker,
    div: listDiv
  }
  return poi
}

openStreatMap.addTo(map);

function loadMap(){
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
      data.forEach(value => {
        addPoiToMap(value.x_coordinate, value.y_coordinate, value)
      })
    })
    .catch(error => {
      console.error('Error:', error)
      window.location.href = '../login/login.html'
    })
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
    body:JSON.stringify({order: "1", x_coordinate: latitude, y_coordinate: longitude}),
  })
    .then(result => result.text())
    .then(data => {
      console.log(data)
      const list = document.getElementById('editUseCaseSidebarListOfPOI');
      list.innerHTML = '';
      loadPoiItems()
    })
    .catch(error => {
      console.error('Error:', error)
      window.location.href = '../login/login.html'
    })
}

map.on('click', onMapClick);

function addPoiToMap(latitude, longitude, value){
  const marker = L.marker([latitude, longitude]).addTo(map);
  const poi = poiItem(value.id, latitude, longitude, marker)
  addExistingPoiToList(value, poi)
  marker.on('click', function(){
    setCurrentPoi(poi)
  })
  setCurrentPoi(poi)
  return poi
}

function addExistingPoiToList(itemValue, poi) {
  const list = document.getElementById('editUseCaseSidebarListOfPOI');
  const listItem = document.createElement('li');
  const div = document.createElement('div');
  div.className = 'list-item';
  div.innerHTML = '<h1>titel</h1><p>${itemValue.id} </p>';
  poi.div = div;
  poi.id = itemValue.id
  div.onclick = function() {setCurrentPoi(poi);};
  listItem.appendChild(div);
  list.appendChild(listItem);
  return div
}

function setCurrentPoi(poi) {
  const latitude = poi.latitude
  let longitude = poi.longitude

  console.log(latitude)
  console.log(longitude)

  currentPoi = poi
  breitengradAnzeige.textContent = `Breitengrad: ${latitude}`
  laengengradAnzeige.textContent = `Längengrad: ${longitude}`
  changeBackgroundColorOfChosenListItem(poi)
  openMenue()
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
  if(markerMenuClassList.contains('visiblemarkerMenu')){
    console.log("menue is already visible")
  }else{
    if(editUseCaseSidebarClassList.contains('editUseCaseSidebarInvisible')){
      markerMenuClassList.remove('markerMenu')
      markerMenuClassList.add('visiblemarkerMenu')
      mapClassList.remove('fullMap')
      mapClassList.add('mapWithMarkerMenu')
    }else if(editUseCaseSidebarClassList.contains('editUseCaseSidebar')){
      markerMenuClassList.remove('markerMenu')
      markerMenuClassList.add('editUseCaseMarkerMenuWithSidebar')
      mapClassList.remove('mapWithSidebar')
      mapClassList.add('mapWithMarkerMenuAndSidebar')
    }
    loadMap()
  }
}

editUseCaseApplyChangesButton.addEventListener('click', function(){
  const name = editUseCaseNameInput.value
  const poiId = currentPoi.id
  console.log(poiId)
  fetch(`http://localhost:3000/pois/${currentPoi.id}`,{
    method:"PUT",
    credentials:"include",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({order: "1", x_coordinate: latitude, y_coordinate: longitude}),
  })
    .then(result => result.text())
    .then(data => {
      console.log(data)
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
    markerMenuClassList.remove('visiblemarkerMenu')
    markerMenuClassList.add('markerMenu')
  }else{
    console.error('Something went wrong in the MarkerMenu')
  }
})

markerDeleteButton.addEventListener('click', function() {
  map.removeLayer(currentPoi.marker)
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

document.getElementById('toggleSwitch').addEventListener('change', function() {
  if (this.checked) {
    console.log('Switch is ON');
  } else {
    console.log('Switch is OFF');
  }
});
