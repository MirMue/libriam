// To do:
//    - Nur ein modal, separat von buchelement, intern in elemente für autor, titel etc. unterteilen,
//      mit innerHTML füllen (möglichst wenig html in js)

// Initializes variables:
const loader = document.querySelector('.loader');
// variable ändern, id verwenden:
const bookshelf = document.querySelector('.container');
const booksOnShelf = bookshelf.querySelectorAll('.book');
const overlay = document.querySelector('.overlay');

// Gets book data from local file book.json
async function getBooks () {
  const response = await fetch('http://localhost:3000/books');
  const bookData = await response.json();
  return bookData
}

// Fill bookshelf container with book elements
async function fillBookshelf() {
  // Gets object array of book data (title, authors, thumbnail link etc.)
  let bookData = [];
  if (document.querySelector('#form-search')) {
    bookData = searchResults;
  }
  else {bookData = await getBooks()}
  
  // Puts placeholder on page if library is empty
  if (bookData.length === 0 && document.querySelector('#bookshelf')) {
    let newVolume = document.createElement('div');
    newVolume.innerHTML = '<h2 style="color:gray">Keine Bücher vorhanden...</h2>';
    bookshelf.appendChild(newVolume)
  }
  // Puts book-html-elements on page
  else {
    for (const book of bookData) {
      let newVolume = document.createElement('div');
      newVolume.innerHTML = createBookHtml(
        book.title,
        book.subtitle,
        book.authors,
        book.publishedDate,
        book.imageLinks,
        book.id
      );
      bookshelf.appendChild(newVolume)
    }
  }
    
  // Adds span element as a seperator between rows of books.
  // Problem: Depends on each row having exactly 6 books in them.
  // if (booksOnShelf.length%6 === 0 && booksOnShelf.length > 0) {
  //   const board = document.createElement('span');
  //   bookshelf.appendChild(board);
  // }

  loaderBookshelfOff();
}

// Creates html book element
// Html in JS ist nicht so gut :D
function createBookHtml (title, subtitle, authors, publishedDate, imageLinks, volumeId) {
  // Checks for subtitle, uses placeholder if there is none
  let subttl = '';
  if (subtitle) {
    subttl = subtitle
  } else {subttl = '-'}
  
  // Checks for publishedDate, uses placeholder if there is none
  let publishedYear = '';
  if (publishedDate) {
    publishedYear = publishedDate.split('-')[0]
  } else {publishedYear = '[Jahr unbekannt]'}

  // Checks for thumbnail, uses placeholder if there is none
  let bookCover = '';
  if (imageLinks) {
    bookCover = `<img class="bookcover" src="${imageLinks.thumbnail}">`
  } else {
    bookCover = `<div class="bookcover empty"><p>${authors}</p><p>${title}</p><p style="font-size: small">(Kein Buchcover vorhanden)</p></div>`
  }

  // Creates html element of a book
  let html = '';
  // for index page: book cover that functions as a button for opening modal with book information
  if (document.querySelector('#bookshelf')) {
    html += `<div class="book">
    <button class="book-button" data-modal-target="#modal-${volumeId}">${bookCover}</button>
    <div class="modal" id="modal-${volumeId}">
    <div class="modal-header"><div class="modal-title">Buchinfos</div>
    <button data-close-button class="modal-button">&times;</button></div>
    <div class="modal-body">${authors}<br>${title}<br>${subttl}<br>${publishedYear}</div></div>
    </div>`
  }
  // for edit library page: same as index page, but adds "delete" button
  if (document.querySelector('#editor-bookshelf')) {
    html += `<form id="form-delete-${volumeId}">
    <input value="${volumeId}" name="bookId" class="input-inv"/>
    <input class="btn-delete" type="button" id="${volumeId}" value="Löschen"/>
    </form>
    <div class="book">
    <button class="book-button" data-modal-target="#modal-${volumeId}">${bookCover}</button>
    <div class="modal" id="modal-${volumeId}">
    <div class="modal-header"><div class="modal-title">Buchinfos</div>
    <button data-close-button class="modal-button">&times;</button></div>
    <div class="modal-body">${authors}<br>${title}<br>${subttl}<br>${publishedYear}</div></div>
    </div>`
  }
  // for search page: same as index page, but adds "save" button
  if (document.querySelector('#form-search')) {
    html += `<form>
    <input type="submit" class="input-inv" value="${volumeId}" name="bookId"/>
    <input type="button" class="btn-results" id="${volumeId}" value="Speichern"/>
    </form>
    <div class="book">
    <button class="book-button" data-modal-target="#modal-${volumeId}">${bookCover}</button>
    <div class="modal" id="modal-${volumeId}">
    <div class="modal-header"><div class="modal-title">Buchinfos</div>
    <button data-close-button class="modal-button">&times;</button></div>
    <div class="modal-body">${authors}<br>${title}<br>${subttl}<br>${publishedYear}</div></div></div>`
  }

  return html
}

// Initializes buttons for bookcover modals and libriam logo
function initButtons () {
  // Gets all opening and closing buttons, and the libriam logo
  const openModalButtons = document.querySelectorAll('[data-modal-target]');
  const closeModalButtons = document.querySelectorAll('[data-close-button]');
  const logoButton = document.querySelector('#libriam-logo');

  // Adds event listener to each opening button
  openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = document.querySelector(button.dataset.modalTarget);
      openModal(modal);
    })
  })

  // Adds event listener to each closing button
  closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      closeModal(modal);
    })
  })

  // Adds event listener to the overlay-element in the html
  overlay.addEventListener('click', () => {
    const modals = document.querySelectorAll('.modal.active');
    const deleteModals = document.querySelectorAll('.modal-delete.active')
    modals.forEach(modal => {
      closeModal(modal)
    })
    deleteModals.forEach(modal => {
      closeModal(modal)
    })
  })

  // Adds an event listener to the libriam logo
  logoButton.addEventListener('click', () => {
    console.log('Libriam logo clicked')
  })

}

// Handles modal events
function openModal(modal) {
  if (modal === null) return
  modal.classList.add('active');
  overlay.classList.add('active');
}

function closeModal(modal) {
  if (modal === null) return
  modal.classList.remove('active');
  overlay.classList.remove('active');
}

// Handles loading animation:
function loaderBookshelfOff () {
  loader.style.opacity = 0;
  loader.style.display = 'none';
  bookshelf.style.display = 'flex';
  setTimeout(() => (bookshelf.style.opacity = 1), 50);
}

function loaderBookshelfOn () {
  loader.style.opacity = 1;
  loader.style.display = 'flex';
  bookshelf.style.display = 'none';
  bookshelf.style.opacity = 0;
}
