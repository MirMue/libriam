// Initialize variables for often used DOM elements:
const loader = document.querySelector('.loader');
const bookshelf = document.querySelector('.container');

fillBookshelf();

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

async function fillBookshelf() {
  const bookData = await getBooks();
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
  loaderBookshelfOff();
  initButtons();
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

// Initialize buttons for bookcover modals and libriam logo:

function initButtons () {
  const openModalButtons = document.querySelectorAll('[data-modal-target]');
  const closeModalButtons = document.querySelectorAll('[data-close-button]');
  const logoButton = document.querySelector('#libriam-logo');
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

  logoButton.addEventListener('click', () => {
    // Send info about changed URL to server: localhost:3000/about
    console.log('Libriam logo clicked')
  })
}

// Handle modal events:

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