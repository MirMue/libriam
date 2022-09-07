// Initialize variables for DOM elements:
const loader = document.querySelector('.loader');
const bookshelf = document.querySelector('.container');
const booksOnShelf = bookshelf.querySelectorAll('.book');
const overlay = document.querySelector('.overlay');

fillBookshelf();

// Get book data from json file
async function getBooks () {
  const response = await fetch('http://localhost:3000/books');
  const bookData = await response.json();
  return bookData
}

// Fill bookshelf container with book elements
async function fillBookshelf() {
  const bookData = await getBooks();
  
  if (bookData.length == 0) {
    let newVolume = document.createElement('div');
    newVolume.innerHTML = '<h2 style="color:gray">Deine Bibliothek ist leer</h2>';
    bookshelf.appendChild(newVolume)
  }
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

  loaderBookshelfOff();
  initButtons();
}

// Create HTML book elements
function createBookHtml (title, subtitle, authors, publishedDate, imageLinks, volumeId) {
  let html = '';
  let bookCover = '';
  let publishedYear = '';
  let subttl = '';

  if (imageLinks) {
    bookCover = `<img class="bookcover" src="${imageLinks.thumbnail}">`
  } else {
    bookCover = `<div class="bookcover empty"><p>${authors}</p><p>${title}</p><p style="font-size: small">(Kein Buchcover vorhanden)</p></div>`
  }

  if (publishedDate == undefined) {
    publishedYear = '[Jahr unbekannt]'
  } else {publishedYear = publishedDate.split('-')[0]}

  if (subtitle == undefined) {
    subttl = '-'
  } else {subttl = subtitle}

  html += `<button class="btn-results" data-modal-target="#delete-modal-${volumeId}">löschen</button>
  <div class="modal" id="delete-modal-${volumeId}">
  <div class="modal-header"><div class="modal-title">Endgültig aus Bibliothek entfernen?</div>
  <button data-close-button class="modal-button">&times;</button></div>
  <div class="modal-body">${authors}<br>${title}<br>${subttl}<br>${publishedYear}<br>
  <form action="/deletebook" method="post" id="form-${volumeId}" class="form-results" name="${volumeId}">
  <input data-delete-button type="submit" value="LÖSCHEN :(" class="btn-results" name="${volumeId}"></form>
  </div></div>
  <div class="book">
  <button class="book-button" data-modal-target="#modal-${volumeId}">${bookCover}</button>
  <div class="modal" id="modal-${volumeId}">
  <div class="modal-header"><div class="modal-title">Buchinfos</div>
  <button data-close-button class="modal-button">&times;</button></div>
  <div class="modal-body">${authors}<br>${title}<br>${subttl}<br>${publishedYear}</div></div></div>`

  return html
}

// Initialize buttons for bookcover modals and libriam logo
function initButtons () {
  const openModalButtons = document.querySelectorAll('[data-modal-target]');
  const closeModalButtons = document.querySelectorAll('[data-close-button]');
  const logoButton = document.querySelector('#libriam-logo');

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

  logoButton.addEventListener('click', () => {
    console.log('Libriam logo clicked')
  })
}

// Handle modal events
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

// Loading animation for bookshelf:
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