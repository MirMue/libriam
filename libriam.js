getBooks()
  .then((response) => fillBookshelf(response))
  .then((response) => loaderBookshelf(response))
  .then((response) => initButtons(response));


// Loading animation for bookshelf:

let loader = document.querySelector('.loader');
let shelf = document.querySelector('.container');

function loaderBookshelf () {
  loader.style.opacity = 0;
  loader.style.display = 'none';
  shelf.style.display = 'flex';
  setTimeout(() => (shelf.style.opacity = 1), 50)
}

// Add new book to books.js:

// document.addEventListener('DOMContentLoaded', () => {
//   document.querySelector('#btn-addbook').addEventListener('click', addBook);
// })

// function addBook (e) {
//   e.preventDefault();
//   console.log('addBookToFile funzt');
//   let ISBN_13 = {ISBN_13 : document.querySelector('#addbookisbn').value};
//   console.log(ISBN_13)
// }

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

    document.getElementById('bookshelf').appendChild(newVolume)
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