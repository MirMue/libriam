fillBookshelf();
initButtons();

// Startet den for-loop nicht. Das array bbookData ist aber vorhanden, also keine Ahnung warum.
function fillBookshelf() {
  const bookData = getBooks();
  console.log(bookData)
  for (const book of bookData) {
    console.log('for-of-loop funktioniert')
    const newVolume = document.createElement('div');
    const thumbnail =  searchForThumbnail(book);
    console.log(book.items[0].volumeInfo.title)
    newVolume.innerHTML = createBookHtml(
      book.items[0].volumeInfo.title,
      book.items[0].volumeInfo.subtitle,
      book.items[0].volumeInfo.authors,
      book.items[0].volumeInfo.publishedDate,
      thumbnail
    )
    document.getElementById('bookshelf').appendChild(newVolume);
  }
  console.log('fillBookshelf beendet')
}

function searchForThumbnail(book) {
  if (book.items[0].volumeInfo.imageLinks) {
    return book.items[0].volumeInfo.imageLinks.thumbnail
  } else {return 'empty'}
}


function getBooks () {
  const bookData = [];
  for (let i=0; i<books.length; i++) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `https://www.googleapis.com/books/v1/volumes?q=isbn:${books[i].ISBN_13}`, true);

    xhr.onload = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          bookData.push(JSON.parse(this.responseText))
        } else {console.log('Http Request Error 1 - xhr.statusText: ', xhr.statusText)}
      } else {console.log('Http Request Error 2 - xhr.statusText: ', xhr.statusText)}
    }

    // xhr.onreadystatechange = () => {
    //   if (this.readyState == 4 && this.status == 200) {
    //     console.log('xhr.onreadystatechange erreicht')
    //     bookData.push(JSON.parse(this.responseText))
    //   }
    // }

    xhr.onerror = function () {
      console.log('Http Request Error 3 - xhr.statusText: ', xhr.statusText);
    }

    xhr.send();
  }
  return bookData
}

function createBookHtml (title, subtitle, authors, publishedDate, thumbnail) {
  let html = '';
  if (thumbnail !== 'empty') {
    html = `<img src="${thumbnail}">`
  } else if (thumbnail === 'empty') {
    html = `<p>${title}</p><img src="thumbnail_placeholder.jpg">`
  } else {console.log('Fehler: thumbnail weder vorhanden noch empty')}

  html += `<button class="btn-info">Mehr Infos...</button>
    <button class="btn-close">Weniger Infos...</button>
    <p class="hidden">${authors}<br>-<br>
    ${title}. ${subtitle}<br>-<br>${publishedDate}</p>`

  return html
}

function initButtons () {
  const infoButtons = document.querySelectorAll('.btn-info');
  const closeButtons = document.querySelectorAll('.btn-close');

  for (const button of infoButtons) {
    button.addEventListener('click', () => {
      const hiddenElement = button.parentElement.getElementsByClassName('hidden');
      hiddenElement[0].className = 'visible';
      button.style.backgroundColor = 'grey';
      button.parentElement.querySelector('.btn-close').style.backgroundColor = 'goldenrod';
    })
  }

  for (const button of closeButtons) {
    button.addEventListener('click', () => {
      const visibleElement = button.parentElement.getElementsByClassName('visible');
      visibleElement[0].className = 'hidden';
      button.style.backgroundColor = 'grey';
      button.parentElement.querySelector('.btn-info').style.backgroundColor = 'goldenrod';
    })
  }
}