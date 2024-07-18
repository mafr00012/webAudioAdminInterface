import {baseURL, loginHtmlPath, poisViewHTMLPath} from "../index/app";
const useCaseUpdateContainerClassList = document.getElementById("useCaseUpdateContainer").classList
document.addEventListener("DOMContentLoaded", loadItems)

function loadItems() {
  fetch(baseURL + "usecasesAdmin",{
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


function addItem(itemdata) {
  const list = document.getElementById('dynamicList');
  const listItem = document.createElement('li');
  const div = document.createElement('div');
  div.className = 'list-item';
  div.innerHTML = `<h2>${itemdata.titel}</h2><p>${itemdata.beschreibung}</p><button onclick="openUseCase(${itemdata.id})">Öffnen</button><button class="listItemDeleteButton">Löschen</button>
    <button class="useCaseUpdateButton">Bearbeiten</button> <button onclick="generateQRCode(${itemdata.id})">QR-Code herunterladen</button>`;
  listItem.appendChild(div);
  list.appendChild(listItem);

  const deleteButton = div.querySelector('.listItemDeleteButton');
  deleteButton.addEventListener('click', () => {
    list.removeChild(listItem);
    fetch(baseURL + `usecases/${itemdata.id}`,{
      method:"DELETE",
      credentials:"include"
    })
      .then(result => result.text())
      .then(data => {
        console.log(data)
      })
      .catch(error => {
        console.error('Error:', error)
        window.location.href = loginHtmlPath
      })
  });
  const updateButton = div.querySelector('.useCaseUpdateButton');
  updateButton.addEventListener('click', () => {
    if(useCaseUpdateContainerClassList.contains("useCaseUpdateContainer")){
      useCaseUpdateContainerClassList.remove("useCaseUpdateContainer")
      useCaseUpdateContainerClassList.add("useCaseUpdateContainerVisible")
    }

    const useCaseUpdateAddButton = document.getElementById("useCaseUpdateAddButton")
    useCaseUpdateAddButton.addEventListener("click", function() {
      const useCaseUpdateInputTitel = document.getElementById("useCaseUpdateInputTitel")
      const useCaseUpdateInputDescription = document.getElementById("useCaseUpdateInputDescription")
      let titel
      let description
      if(!useCaseUpdateInputTitel.value){
        titel = itemdata.titel
      }else{
        titel = useCaseUpdateInputTitel.value
      }

      if(!useCaseUpdateInputDescription.value){
        description = itemdata.beschreibung
      }else{
        description = useCaseUpdateInputDescription.value
      }

      fetch(baseURL + `usecases/${itemdata.id}`,{
        method:"PUT",
        credentials:"include",
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({titel: titel, beschreibung: description, fixed_order: itemdata.fixed_order, account_username: itemdata.account_username })
      })
        .then(result => result.text())
        .then(data => {
          console.log(data)
          clearList()
          loadItems()
        })
        .catch(error => {
          console.error('Error:', error)
          window.location.href = loginHtmlPath
        })
    })
  })
}


function openUseCase(data){
  fetch(baseURL + "chosenUseCase", {
    method: "POST",
    credentials: "include",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id: data}),
  }).then(result => result.text())
    .then(data => {
      if(data === 'true'){
        window.location.href = poisViewHTMLPath
      }else{
        console.error("that didn't work")
      }
    })
    .catch(error => {
      console.error('Error:', error)
      window.location.href = loginHtmlPath
    })
}

const useCaseUpdateCloseButton = document.getElementById("useCaseUpdateCloseButton")
useCaseUpdateCloseButton.addEventListener("click", function(){
  if(useCaseUpdateContainerClassList.contains("useCaseUpdateContainerVisible")){
    useCaseUpdateContainerClassList.remove("useCaseUpdateContainerVisible")
    useCaseUpdateContainerClassList.add("useCaseUpdateContainer")
  }
})

const inputTitel = document.getElementById('useCaseInputTitel');
const inputDescription = document.getElementById('useCaseInputDescription')
const addButton = document.getElementById('useCaseAddButton')
addButton.addEventListener("click", function(){
  const titel = inputTitel.value
  const description = inputDescription.value
  fetch(baseURL + 'usecasesAdmin', {
    method: "POST",
    credentials: "include",
    headers: {'Content-Type':'application/json'},
    body:JSON.stringify({titel, beschreibung: description})
  }).then(result => result.text())
    .then(data => {
      console.log(data)
      clearList()
      loadItems()
    })
    .catch(error => {
      console.error("Error", error)
      window.location.href = loginHtmlPath
    })
})

function clearList(){
  const list = document.getElementById('dynamicList');
  list.innerHTML = '';
}

const logoutButton = document.getElementById('logoutButton');

logoutButton.addEventListener("click", function() {
  fetch(baseURL + 'logout', {
    method:"GET",
  }).then(response => response.text())
    .then(data => {
      if(data === 'true'){
        window.location.href = loginHtmlPath
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
})
