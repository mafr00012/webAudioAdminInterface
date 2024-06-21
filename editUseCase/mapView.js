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
var currentMarker = null
const openStreatMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

openStreatMap.addTo(map);

function loadMap(){
  openStreatMap.addTo(map);
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

function onMapClick(e) {
  var latitude = e.latlng.lat
  var longitude = e.latlng.lng
  const marker = L.marker([latitude, longitude]).addTo(map);

  if(longitude > 180 || longitude < -180){
    longitude = longitude % 180
  }

  marker.on('click', function(){
    currentMarker = marker
    breitengradAnzeige.textContent = `Breitengrad: ${latitude}`
    laengengradAnzeige.textContent = `Längengrad: ${longitude}`
    openMenue()
  })
  currentMarker = marker
  breitengradAnzeige.textContent = `Breitengrad: ${latitude}`
  laengengradAnzeige.textContent = `Längengrad: ${longitude}`
  openMenue()

  console.log("Koordinaten: ", latitude, longitude);
}

map.on('click', onMapClick);

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
  map.removeLayer(currentMarker)
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
