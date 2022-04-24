/*
To do:
    - Dafür sorgen, dass die Elemente sich nicht bewegt, wenn der Popuptext geöffnet oder geschlossen wird
    - Funktion erstellen, mit der man ein neues Buch zu books.js hinzufügen kann
    - style.css bearbeiten, sodass es bei vielen Büchern einen Zeilenumbruch gibt
*/

const bookData = getBooks();
putBooksOnShelf(bookData)

checkButtons1(); // Funktionsname ist nicht aussagekräftig
checkButtons2(); // Funktionsname ist nicht aussagekräftig

function getBooks () {
  const bookData = []
  for (let i=0; i<books.length; i++) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `https://www.googleapis.com/books/v1/volumes?q=isbn:${books[i].ISBN_13}`, false);

    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        bookData.push(JSON.parse(this.responseText))
      }
    }

    xhr.onerror = function () {
      console.log('Request Error');
    }

    xhr.send();
  }

  return bookData
}

function putBooksOnShelf(bookData) {
  for (const book of bookData) {
    const newVolume = document.createElement('div');
    newVolume.innerHTML = createBookHtml(
      book.thumbnail, 
      book.title, 
      book.subtitle, 
      book.authors,
      book.publishedDate
    )  
    document.getElementById('bookshelf').appendChild(newVolume);
  }
}

function createBookHtml(thumbnail, title, subtitle, authors, publishedDate) {
  let html = ''
  if (thumbnail) {
    html = `<img src="${thumbnail}">`
  } else {
    html = `<p>${title}</p><img src="thumbnail_placeholder.jpg">`
  }

  html += `<button class="btn-show">Mehr Infos...</button>
    <button class="btn-hide">Weniger Infos...</button>
    <p class="popup-hide">${authors}<br>-<br>
    ${title}. ${subtitle}<br>-<br>${publishedDate}</p>`

  return html
}

function checkButtons1 () {
  const buttons = document.querySelectorAll('.btn-show')

  for (const button of buttons) {
    button.addEventListener('click', function () {
      const hiddenElement = button.parentElement.getElementsByClassName('popup-hide')
      hiddenElement[0].className = 'popup-show'
    })
  }
}

// Das if-statement hat mit der Bedingung, dass der Popuptext-classname == 'pop-show' ist, nicht funktioniert.
// Wird der Popuptext-classname in checkButtons2 abgerufen, ist er true, nicht popup-show.
// Innerhalb von checkButtons1 wird der classname aber korrekterweise auf popup-show gesetzt.
// Habe die if-statement-Bedingung in checkButtons2 jetzt einfach auf classname == 'true' gesetzt.
// TODO: Funktion umbauen, ähnlich checkButtons1
function checkButtons2 () {
  const buttons = document.querySelectorAll('.btn-hide').length;

  for (let i=0; i<buttons; i++) {
    document.querySelectorAll('.btn-hide', )[i].addEventListener('click', function () {
      if (document.getElementById(`pop-${books[i].ISBN_13}`).className == 'popup-show') {
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