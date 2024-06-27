document.addEventListener("DOMContentLoaded", loadItems)

function loadItems() {
  console.log("hallo")
  fetch("http://localhost:3000/usecasesAdmin",{
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
  div.innerHTML = `<h2>${itemdata.titel}</h2><p>${itemdata.beschreibung}</p><button onclick="openUseCase(${itemdata.id})">Öffnen</button><button class="listItemDeleteButton">Löschen</button>
    <button class="useCaseUpdateButton">Bearbeiten</button> <button onclick="generateQRCode(${itemdata.id})">QR-Code ansehen</button>`;
  listItem.appendChild(div);
  list.appendChild(listItem);

  const deleteButton = div.querySelector('.listItemDeleteButton');
  deleteButton.addEventListener('click', () => {
    list.removeChild(listItem);
    fetch(`http://localhost:3000/usecases/${itemdata.id}`,{
      method:"DELETE",
      credentials:"include"
    })
      .then(result => result.text())
      .then(data => {
        console.log(data)
      })
      .catch(error => {
        console.error('Error:', error)
        window.location.href = '../login/login.html'
      })
  });
  const updateButton = div.querySelector('.useCaseUpdateButton');
  updateButton.addEventListener('click', () => {
    const useCaseUpdateContainerClassList = document.getElementById("useCaseUpdateContainer").classList
    if(useCaseUpdateContainerClassList.contains("useCaseUpdateContainer")){
      useCaseUpdateContainerClassList.remove("useCaseUpdateContainer")
      useCaseUpdateContainerClassList.add("useCaseUpdateContainerVisible")
    }
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

    const useCaseUpdateAddButton = document.getElementById("useCaseUpdateAddButton")
    useCaseUpdateAddButton.addEventListener("click", function() {
      fetch(`http://localhost:3000/usecases/${itemdata.id}`,{
        method:"PUT",
        credentials:"include",
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({titel: titel, beschreibung: description, fixed_order: itemdata.fixed_order, qr_code: itemdata.qr_code, account_username: itemdata.account_username })
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
  })
}


function openUseCase(data){
  fetch("http://localhost:3000/chosenUseCase", {
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

const inputTitel = document.getElementById('useCaseInputTitel');
const inputDescription = document.getElementById('useCaseInputDescription')
const addButton = document.getElementById('useCaseAddButton')
addButton.addEventListener("click", function(){
  const titel = inputTitel.value
  console.log(titel)
  const description = inputDescription.value
  console.log(description)
  fetch('http://localhost:3000/usecasesAdmin', {
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
      window.location.href = '../login/login.html'
    })
})

function clearList(){
  const list = document.getElementById('dynamicList');
  list.innerHTML = '';
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

function generateQRCode(number){
  const url = 'http://mankam.ddns.net:4000';
  const code = `Code: ${number}`;

  QRCode.toDataURL(url, { width: 100, height: 100 }, function (err, qrCodeDataURL) {
    if (err) {
      console.error(err);
      return;
    }

    const canvas = document.getElementById('qrcodeCanvas');
    const ctx = canvas.getContext('2d');

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the QR code
    const img = new Image();
    img.src = qrCodeDataURL;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);

      // Draw the number under the QR code
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(code, 40, 120);
    };

    // Send QR code to the server
    /*fetch('/save-qrcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrCodeDataURL })
    })
      .then(response => response.json())
      .then(data => {
        document.getElementById('message').innerText = data.message;
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('message').innerText = 'Error saving QR code';
      });*/
  });
}
