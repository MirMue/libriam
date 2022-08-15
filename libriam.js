// Initialize variables for often used DOM elements:
const loader = document.querySelector('.loader');
const bookshelf = document.querySelector('.container');
// const books = [
//   {
//       title: "Harry Potter und der Gefangene von Askaban",
//       ISBN_10: "3551354030",
//       ISBN_13: "9783551354037",
//   },
//   {
//       title: "Im Grunde gut",
//       ISBN_10: "349900416X",
//       ISBN_13: "9783499004162",
//   },
//   {
//       title: "Der dunkle Turm - Schwarz",
//       ISBN_10: "3453875567",
//       ISBN_13: "9783453875562",
//   },
//   {
//       title: "Die schwarzen Wasser der Seine",
//       ISBN_10: "3841201121",
//       ISBN_13: "9783841201126",
//   },
//   {
//       title: "The Magic of Lines II",
//       ISBN_10: "1908175737",
//       ISBN_13: "9781908175731",
//   },
//   {
//       title: "Die 13 1/2 Leben des Käpt'n Blaubär",
//       ISBN_10: "3641255228",
//       ISBN_13: "9783641255220",
//   },
//   {
//       title: "JavaScript and jQuery",
//       ISBN_10: "1118531647",
//       ISBN_13: "9781118531648",
//   },
//   {
//       title: "Meister und Margarita",
//       ISBN_10: "3423143010",
//       ISBN_13: "9783423143011",
//   },
//   {
//       title: "American Gods",
//       ISBN_10: "3847905872",
//       ISBN_13: "9783847905875",
//   },
//   {
//       title: "Will Save The Galaxy For Food",
//       ISBN_10: "1506701655",
//       ISBN_13: "9781506701653",
//   },
//   {
//       title: "Monsieur Ibrahim und die Blumen des Koran",
//       ISBN_10: "3104013632",
//       ISBN_13: "9783104013633",
//   },
//   {
//       title: "Tyll",
//       ISBN_10: "3498035673",
//       ISBN_13: "9783498035679",
//   },
//   {
//       title: "Der Mythos des Sisyphos",
//       ISBN_10: "3644026610",
//       ISBN_13: "9783644026612",
//   },
//   {
//       title: "Der sammelnde Professor",
//       ISBN_10: "3515127291",
//       ISBN_13: "9783515127295",
//   },
//   {
//       title: "Der Graf von Monte Christo",
//       ISBN_10: "3423139552",
//       ISBN_13: "9783423139557",
//   },
// ]; 

// Initialize / load bookshelf:

getBooks()
  .then((response) => {
    fillBookshelf(response);
    loaderBookshelfOff();
    initButtons();
  })


// Loading animation for bookshelf:

function loaderBookshelfOff () {
  loader.style.opacity = 0;
  loader.style.display = 'none';
  // bookshelf.style.display = 'flex';
  setTimeout(() => (bookshelf.style.opacity = 1), 50);
}

function loaderBookshelfOn () {
  loader.style.opacity = 1;
  loader.style.display = 'flex';
  // bookshelf.style.display = 'none';
  bookshelf.style.opacity = 0;
}


// Add new book to bookshelf:

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#btn-addbook').addEventListener('click', addNewBook);
})

function addNewBook (e) {
  e.preventDefault();
  loaderBookshelfOn();
  let ISBN_13 = {ISBN_13 : document.querySelector('#addbookisbn').value};
  bookshelf.innerHTML = '';
  books.push(ISBN_13);
  // Das muss noch besser gehen:
  getBooks()
  .then((response) => {
    fillBookshelf(response);
    loaderBookshelfOff();
    initButtons();
  })

    document.querySelector('#addbookisbn').value = '';
}


// Get data from Google Books and fill bookshelf with book elements:

async function getBooks () {
  const bookData = [];
  for (let i=0; i<books.length; i++) {
    const request = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${books[i].ISBN_13}`)
    const data = await request.json()
    bookData.push(data)
  }
  return bookData
}

function fillBookshelf(bookData) {
  for (const book of bookData) {
    const newVolume = document.createElement('div');

    newVolume.innerHTML = createBookHtml(
      book.items[0].volumeInfo.title,
      book.items[0].volumeInfo.subtitle,
      book.items[0].volumeInfo.authors,
      book.items[0].volumeInfo.publishedDate,
      book.items[0].volumeInfo.imageLinks,
      book.items[0].id
    );

    bookshelf.appendChild(newVolume)
    
    // Adds span element as a seperator between rows of books.
    // Problem: Depends on each row having exactly 6 books in them.
    if (bookshelf.querySelectorAll('.book').length%6 === 0) {
      const board = document.createElement('span');
      bookshelf.appendChild(board);
    }
  }
}

function createBookHtml (title, subtitle, authors, publishedDate, imageLinks, volumeId) {
  let html = '';
  let bookCover = '';
  const publishedYear = publishedDate.split('-')[0]

  if (imageLinks) {
    bookCover += `<img class="bookcover" src="${imageLinks.thumbnail}">`
  } else {
    bookCover += `<div class="bookcover empty"><p>${authors}</p><p>${title}</p><p style="font-size: small">(Kein Buchcover vorhanden)</p></div>`
  }

  if (subtitle == undefined) {
    html += `<div class="book"><button class="book-button" data-modal-target="#modal-${volumeId}">${bookCover}</button><div class="modal" id="modal-${volumeId}">
    <div class="modal-header"><div class="modal-title">Buchinfos</div><button data-close-button class="modal-button">&times;</button></div>
    <div class="modal-body">${authors}<br>${title}<br>${publishedYear}</div></div></div>`
  } else {
    html += `<div class="book"><button class="book-button" data-modal-target="#modal-${volumeId}">${bookCover}</button><div class="modal" id="modal-${volumeId}">
    <div class="modal-header"><div class="modal-title">Buchinfos</div><button data-close-button class="modal-button">&times;</button></div>
    <div class="modal-body">${authors}<br>${title}<br>${subtitle}<br>${publishedYear}</div></div></div>`
  }

  return html
}


// Open modals by clicking on bookcovers:

function initButtons () {
  const openModalButtons = document.querySelectorAll('[data-modal-target]');
  const closeModalButtons = document.querySelectorAll('[data-close-button]');
  const overlay = document.getElementById('overlay');

  openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = document.querySelector(button.dataset.modalTarget);
      openModal(modal);
    })
  })

  closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      closeModal(modal);
    })
  })

  overlay.addEventListener('click', () => {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
      closeModal(modal)
    })
  })
}

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active');
  overlay.classList.add('active');
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active');
  overlay.classList.remove('active');
}