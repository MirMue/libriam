/*
To do:
    - Dafür sorgen, dass die Elemente sich nicht bewegt, wenn der Popuptext geöffnet oder geschlossen wird
    - Funktion erstellen, mit der man ein neues Buch zu books.js hinzufügen kann
    - style.css bearbeiten, sodass es bei vielen Büchern einen Zeilenumbruch gibt
*/

loadLib();
checkButtons1();
checkButtons2();

function loadLib () {
  for (let i=0; i<books.length; i++) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `https://www.googleapis.com/books/v1/volumes?q=isbn:${books[i].ISBN_13}`, false);

    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const newVolume = document.createElement('div');
        const vol = JSON.parse(this.responseText);
        if (vol.items[0].volumeInfo.imageLinks) {
          newVolume.innerHTML = `<img src="${vol.items[0].volumeInfo.imageLinks.thumbnail}"></img>
          <button class="btn-show" id="btn1-${books[i].ISBN_13}">Mehr Infos...</button>
          <button class="btn-hide" id="btn2-${books[i].ISBN_13}">Weniger Infos...</button>
          <p class="popup-hide" id="pop-${books[i].ISBN_13}">${vol.items[0].volumeInfo.authors}<br>-<br>
          ${vol.items[0].volumeInfo.title}. ${vol.items[0].volumeInfo.subtitle}<br>-<br>${vol.items[0].volumeInfo.publishedDate}</p>`;
        }
        else if (vol.items[0].volumeInfo.title) {
          newVolume.innerHTML = `<p>${vol.items[0].volumeInfo.title}</p><img src="thumbnail_placeholder.jpg"></img>
          <button class="btn-show" id="btn1-${books[i].ISBN_13}">Mehr Infos...</button>
          <button class="btn-hide" id="btn2-${books[i].ISBN_13}">Weniger Infos...</button>
          <p class="popup-hide" id="pop-${books[i].ISBN_13}">${vol.items[0].volumeInfo.authors}<br>-<br>
          ${vol.items[0].volumeInfo.title}. ${vol.items[0].volumeInfo.subtitle}<br>-<br>${vol.items[0].volumeInfo.publishedDate}</p>`
        }
        else {console.log('Error: volume hat weder Titel noch Coverbild')}
        
        document.getElementById('bookshelf').appendChild(newVolume);
      }
    }

    xhr.onerror = function () {
      console.log('Request Error');
    }

    xhr.send();
  }
}

function checkButtons1 () {
  const buttons = document.querySelectorAll('.btn-show').length;

  for (let i=0; i<buttons; i++) {
    document.querySelectorAll('.btn-show')[i].addEventListener('click', function () {
      if (document.getElementById(`pop-${books[i].ISBN_13}`).className == 'popup-hide' &&
      document.getElementById(`pop-${books[i].ISBN_13}`).className != 'popup-show') {
        document.getElementById(`pop-${books[i].ISBN_13}`).className = 'popup-show';
        document.getElementById(`btn1-${books[i].ISBN_13}`).className = 'btn-hide';
        document.getElementById(`btn2-${books[i].ISBN_13}`).className = 'btn-show';
      }
      if (document.getElementById(`pop-${books[i].ISBN_13}`).className = 'popup-show' &&
      document.getElementById(`pop-${books[i].ISBN_13}`).className != 'popup-hide') {
        
      }
      else {console.log('Popup Error 1')}
    })
  }
}

// Das if-statement hat mit der Bedingung, dass der Popuptext-classname == 'pop-show' ist, nicht funktioniert.
// Wird der Popuptext-classname in checkButtons2 abgerufen, ist er true, nicht popup-show.
// Innerhalb von checkButtons1 wird der classname aber korrekterweise auf popup-show gesetzt.
// Habe die if-statement-Bedingung in checkButtons2 jetzt einfach auf classname == 'true' gesetzt.
function checkButtons2 () {
  const buttons = document.querySelectorAll('.btn-hide').length;

  for (let i=0; i<buttons; i++) {
    document.querySelectorAll('.btn-hide', )[i].addEventListener('click', function () {
      if (document.getElementById(`pop-${books[i].ISBN_13}`).className == 'true') {
        document.getElementById(`pop-${books[i].ISBN_13}`).className = 'popup-hide';
        document.getElementById(`btn2-${books[i].ISBN_13}`).className = 'btn-hide';
        document.getElementById(`btn1-${books[i].ISBN_13}`).className = 'btn-show';
      }
      else {console.log('Popup Error 2')}
    })
  }
}

// Funktion und Eventlistener zum Überprüfen der classnames:
// (Zum Verwenden den button in index.html einkommentieren)
// document.querySelector('#checkbtn').addEventListener('click', checkClassname);
// function checkClassname() {
//   const buttons = document.querySelectorAll('.btn-hide').length;

//   for (let i=0; i<buttons; i++) {
//     console.log('i: ', i)
//     console.log('classname popuptext: ', document.querySelector(`#pop-${books[i].ISBN_13}`).className, typeof document.querySelector(`#pop-${books[i].ISBN_13}`).className);
//     console.log('classname button "Mehr...": ', document.getElementById(`btn1-${books[i].ISBN_13}`).className);
//     console.log('classname button "Weniger...": ', document.getElementById(`btn2-${books[i].ISBN_13}`).className);
//   }
//   console.log('-------------------------------------')
// }