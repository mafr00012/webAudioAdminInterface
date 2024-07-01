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
    fetch("http://localhost:3000/soundfiles", {
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
        window.location.href = '../login/login.html'
      })
  }
});

let abgespielteAudio = null;

const soundfileList = document.getElementById('soundfileList');
const toggleSoundfileList = document.getElementById('toggleSoundfileList');

function addSoundFileToList(soundfile){
  const pathToSoundFile = `http://localhost:3000/soundfilesFile/${soundfile.filename}`
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
    toggleSoundfileList.textContent = 'MP3 hinzufügen';
  } else {
    soundfileList.style.display = 'none';
    dropZone.style.display = 'block';
    toggleSoundfileList.textContent = 'Zurück zur Liste';
  }
});

function loadSoundfiles(){
  fetch('http://localhost:3000/soundfiles', {
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
      window.location.href = '../login/login.html'
    })
}

function setChosenSoundfileId(soundfileId){
  chosenSoundfileId = soundfileId
}
