document.getElementById('button').addEventListener('click', loadLib);

function loadLib () {
  for (let i=0; i<books.length; i++) {
    var xhr = new XMLHttpRequest();
    // open(type, file/URL, async true/false), letzteres für richtige Reihenfolge der Bücher wichtig
    xhr.open('GET', `https://www.googleapis.com/books/v1/volumes?q=isbn:${books[i].ISBN_13}`, false);

    // alternativ könnte hier onload verwendet werden, onreadystatechange ist vielleicht overkill
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const newVolume = document.createElement('div');
        const vol = JSON.parse(this.responseText);
        if (vol.items[0].volumeInfo.imageLinks) {
          newVolume.innerHTML = `<p>${vol.items[0].volumeInfo.title}</p>
          <img src="${vol.items[0].volumeInfo.imageLinks.thumbnail}"></img>`;
        }
        else if (vol.items[0].volumeInfo.title) {
          newVolume.innerHTML = `<p>${vol.items[0].volumeInfo.title}</p><img src="thumbnail_placeholder.jpg"></img>`
        }
        else {console.log('Error: volume hat weder Titel noch Coverbild')}
        
        document.getElementById('bookshelf').appendChild(newVolume);
      }
    }

    xhr.onerror = function () {
      console.log('Request Error');
    }
    // Sendet request, ist notwendig
    xhr.send();
  }
}