// Initializes variables:
const loader = document.querySelector('.loader');
const bookshelf = document.querySelector('.container');
const booksOnShelf = bookshelf.querySelectorAll('.book');
const overlay = document.querySelector('.overlay');
let pageURL = '';
let searchResults = [];

getURL();

// Gets document URL, calls functions depending on that URL
async function getURL() {
  if (document.URL === 'file:///C:/Users/miria/Documents/Webdev/libriam/public/index.html') {
    pageURL = 'indexpage'
    await fillBookshelf();
    initButtons();
  }
  if (document.URL === 'file:///C:/Users/miria/Documents/Webdev/libriam/public/searchpage.html') {
    pageURL = 'searchpage';
    initSearch();
  }
  if (document.URL === 'file:///C:/Users/miria/Documents/Webdev/libriam/public/editlibrary.html') {
    pageURL = 'editlibrary'
    await fillBookshelf();
    initButtons();
    initDeleteButtons();
  }
}

// Gets book data from local file book.json
async function getBooks () {
  const response = await fetch('http://localhost:3000/books');
  const bookData = await response.json();
  return bookData
}

// Fill bookshelf container with book elements
async function fillBookshelf() {
  // Gets object array of book data (title, authors, thumbnail link etc.)
  // depending on the URL
  let bookData = [];
  if (pageURL === 'searchpage') {
    bookData = searchResults;
  } else {bookData = await getBooks()}
  
  // Puts placeholder on page if library is empty
  if (bookData.length === 0) {
    let newVolume = document.createElement('div');
    newVolume.innerHTML = '<h2 style="color:gray">Keine Bücher vorhanden...</h2>';
    bookshelf.appendChild(newVolume)
  }
  // Puts search results on page
  if (pageURL === 'searchpage') {
    for (const book of searchResults) {
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
  // Puts books from book.json on page
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
  if (pageURL === 'indexpage') {
    html += `<div class="book">
    <button class="book-button" data-modal-target="#modal-${volumeId}">${bookCover}</button>
    <div class="modal" id="modal-${volumeId}">
    <div class="modal-header"><div class="modal-title">Buchinfos</div>
    <button data-close-button class="modal-button">&times;</button></div>
    <div class="modal-body">${authors}<br>${title}<br>${subttl}<br>${publishedYear}</div></div>
    </div>`
  }
  // for edit library page: same as index page, but adds "delete" button
  if (pageURL === 'editlibrary') {
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
  if (pageURL === 'searchpage') {
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

// Initializes delete buttons for editlibrary.html
function initDeleteButtons () {
  const deleteButtons = document.querySelectorAll('.btn-delete');

  deleteButtons.forEach(button => {
    button.addEventListener('click', requestDeletion)
  })
}

// Sends delete request to server
async function requestDeletion (event) {
  // Gets id from clicked "delete" button above the book
  const deleteBookId = {id: event.target.id};

  // Sends post request to server with book id as request body
  const response = await fetch('http://localhost:3000/deletebook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(deleteBookId),
  });

  // Wird die response überhaupt gebraucht?
  const data = await response.json();

  // Redirects user to index.html
  document.location = 'file:///C:/Users/miria/Documents/Webdev/libriam/public/index.html'
}

// Initializes form for searching books for searchpage.html
function initSearch () {
  const searchForm = document.querySelector('#form-search');
  searchForm.addEventListener('submit', searchBooks);
}

// Takes user input from searchpage.html and searches for books via google API
async function searchBooks (e) {
  e.preventDefault(e)

  // Activates loading animation
  loaderBookshelfOn();

  // Gets user input from form on searchpage.html
  const userInput = document.querySelector('#searchkeyword').value;

  // Fetch request with google API
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q={${userInput}}`);
  const data = await response.json();
  
  // Collects google search results in an array (limited to 6 books for better manageability)
  let dataArray = []
  for (let i = 0; i < 6; i++) {
    dataArray.push(data.items[i])
  }
  // Creates book objects in book.json-format from google search results
  // and puts them in an array
  let resultsArray = []
  for (let i = 0; i < dataArray.length; i++) {
    let searchedBook = createSearchedBook(dataArray[i])
    resultsArray.push(searchedBook)
  }

  // Adds a copy of book object array to variable
  // searchResults (initialized at the beginning of libriam.js)
  searchResults = [...resultsArray];

  // Puts search results on page
  fillBookshelf();
  // Initializes save buttons and modal buttons for search results on page
  initSaveButton();
  initButtons();
}

// Creates new object from google search result, taking only necessary information
function createSearchedBook (item) {
  searchedBook = {
    "id": item.id,
    "title": item.volumeInfo.title,
    "subtitle": item.volumeInfo.subtitle,
    "authors": item.volumeInfo.authors,
    "publishedDate": item.volumeInfo.publishedDate,
    "imageLinks": item.volumeInfo.imageLinks,
  }
  return searchedBook
}

// Initializes save button for search results
function initSaveButton () {
  const saveButtons = document.querySelectorAll('.btn-results');

  saveButtons.forEach(button => {
    button.addEventListener('click', requestSave)
  })
}

// Sends save request to server
async function requestSave (event) {
  // Initializes variable for new book
  let newBook = '';

  // Gets id for new book from clicked "save" button above the book on editlibrary.html
  const newBookId = event.target.id;

  // Searches for this id in searchResults and puts object with that id on variable "newBook"
  for (let i=0; i<searchResults.length; i++) {
    if (searchResults[i].id === newBookId) {
      newBook = searchResults[i]
    }
  }

  // Sends post request to server with newBook-object as request body
  const response = await fetch('http://localhost:3000/addtolibrary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(newBook),
  });

  // Parses response from server
  const data = await response.json();

  // Checks wether response confirms save process
  // or refused due to new book already being in the library
  // If save was refused, prompts the user to choose wether to return to library
  // or continue the search
  const message = 'Dieses Buch ist bereits in deiner Bibliothek vorhanden!\nWähle "OK" um zur Bibliothek zurückzukehren\nWähle "Abbrechen" um die Suche fortzusetzen'
  if (data.status === 'refused to save doublet') {
    if (confirm(message)) {
      document.location = 'file:///C:/Users/miria/Documents/Webdev/libriam/public/index.html'
      return
    }
    else {
      searchResults = [];
      document.location = 'file:///C:/Users/miria/Documents/Webdev/libriam/public/searchpage.html'
      return
    }
  }
  if (data.status === 'new book saved') {
    document.location = 'file:///C:/Users/miria/Documents/Webdev/libriam/public/index.html'
    return
  }
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
