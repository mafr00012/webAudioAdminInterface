document.addEventListener("DOMContentLoaded", loadItems)

function loadItems() {
  console.log("hallo")
  fetch("http://localhost:3000/usecases",{
    method:"GET",
    credentials:"include"
  })
    .then(result => result.json())
    .then(data => {
      data.forEach(value => {
        addItem(value)
      })
    })
    .catch(error => {
      console.error('Error:', error)
      window.location.href = '../login/login.html'
    })
}

function addItem(itemdata) {
  const list = document.getElementById('dynamicList');
  const listItem = document.createElement('li');
  const div = document.createElement('div');
  div.className = 'list-item';
  div.innerHTML = `<h2>${itemdata.titel}</h2><p>${itemdata.beschreibung}</p><button onclick="openUseCase(${itemdata.id})">Öffnen</button><button>Löschen</button>`;
  listItem.appendChild(div);
  list.appendChild(listItem);
}

function openUseCase(data){
  fetch("http://localhost:3000/choosenUseCase", {
    method: "POST",
    credentials: "include",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id: data}),
  }).then(result => result.text())
    .then(data => {
      if(data === 'true'){
        window.location.href = '../editUseCase/mapView.html'
      }else{
        console.error("that didn't work")
      }
    })
    .catch(error => {
      console.error('Error:', error)
      window.location.href = '../login/login.html'
    })
}

const logoutButton = document.getElementById('logoutButton');

logoutButton.addEventListener("click", function() {
  fetch('http://localhost:3000/logout', {
    method:"GET",
  }).then(response => response.text())
    .then(data => {
      if(data === 'true'){
        window.location.href = '../login/login.html'
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
})
