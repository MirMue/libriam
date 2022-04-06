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
          newVolume.innerHTML = `<p>${vol.items[0].volumeInfo.title}</p>
          <img src="${vol.items[0].volumeInfo.imageLinks.thumbnail}"></img>
          <button class="btn1" id="btn1-${books[i].ISBN_13}">Mehr Infos...</button>
          <button class="btn2" id="btn2-${books[i].ISBN_13}">Weniger Infos...</button>
          <p class="popup-hide" id="pop-${books[i].ISBN_13}">${vol.items[0].volumeInfo.authors}<br>-<br>
          ${vol.items[0].volumeInfo.title}. ${vol.items[0].volumeInfo.subtitle}<br>-<br>${vol.items[0].volumeInfo.publishedDate}</p>`;
        }
        else if (vol.items[0].volumeInfo.title) {
          newVolume.innerHTML = `<p>${vol.items[0].volumeInfo.title}</p><img src="thumbnail_placeholder.jpg"></img>
          <button class="btn1" id="btn1-${books[i].ISBN_13}">Mehr Infos...</button>
          <button class="btn2" id="btn2-${books[i].ISBN_13}">Weniger Infos...</button>
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
  const buttons = document.querySelectorAll('.btn1').length;

  for (let i=0; i<buttons; i++) {
    document.querySelectorAll('.btn1')[i].addEventListener('click', function () {
      if (document.getElementById(`pop-${books[i].ISBN_13}`).className = 'popup-hide' &&
      document.getElementById(`pop-${books[i].ISBN_13}`).className != 'popup-show') {
        document.getElementById(`pop-${books[i].ISBN_13}`).className = 'popup-show';
        document.getElementById(`btn1-${books[i].ISBN_13}`).className = 'btn2';
        document.getElementById(`btn2-${books[i].ISBN_13}`).className = 'btn1';
        console.log('checkButtons1 ausgeführt. span-classname: ', document.getElementById(`pop-${books[i].ISBN_13}`).className);
      }
      else {console.log('Popup Error 1')}
    })
  }
}

function checkButtons2 () {
  const buttons = document.querySelectorAll('.btn2').length;

  for (let i=0; i<buttons; i++) {
    document.querySelectorAll('.btn2')[i].addEventListener('click', function () {
      if (document.getElementById(`pop-${books[i].ISBN_13}`).className = 'popup-show' &&
      document.getElementById(`pop-${books[i].ISBN_13}`).className != 'popup-hide') {
        document.getElementById(`pop-${books[i].ISBN_13}`).className = 'popup-hide';
        document.getElementById(`btn2-${books[i].ISBN_13}`).className = 'btn2';
        document.getElementById(`btn1-${books[i].ISBN_13}`).className = 'btn1';
        console.log('checkButtons2 ausgeführt. span-classname: ', document.getElementById(`pop-${books[i].ISBN_13}`).className);
      }
      else {console.log('Popup Error 2')}
    })
  }
}