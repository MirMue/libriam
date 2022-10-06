// Gets book data from local file book.json
async function getBooks () {
  const response = await fetch('http://localhost:3000/books');
  const bookData = await response.json();
  return bookData
}

// Fills bookshelf container with book elements
async function fillBookshelf(bookData) {
  
  // Puts placeholder on page if library is empty
  if (bookData.length === 0) {
    let newVolume = document.createElement('div');
    newVolume.innerHTML = '<h2>Keine Bücher vorhanden...</h2>';
    document.querySelector('#bookshelf').appendChild(newVolume)
  }
  // Puts book elements on page
  else {
    for (const book of bookData) {
      let newVolume = document.createElement('div');
      newVolume.innerHTML = createBookHtml(book);
      document.querySelector('#bookshelf').appendChild(newVolume)
    }
  }

  loaderBookshelfOff();
}

// Creates html element for a book
function createBookHtml (book) {

  // Checks for thumbnail, uses placeholder if there is none
  let bookCover = '';
  book.imageLinks ? bookCover = `<img class="bookcover" src="${book.imageLinks.thumbnail}">` :
  bookCover = `<div class="bookcover empty">
    <p>${book.authors ? book.authors : '[Autor unbekannt]'}</p>
    <p>${book.title ? book.title : '[Titel unbekannt]'}</p>
    <p style="font-size: small">(Kein Buchcover vorhanden)</p>
    </div>`;

  // Creates html element of a book
  let html = '';
  html += `<div class="book">
  <button class="btn-book" id="${book.id}">${bookCover}</button>
  </div>`;

  return html
}

// Initializes buttons for bookcovers and libriam logo
async function initButtons (searchResults) {
  // Gets all modal opening buttons (bookcovers) and the modal closing button, and the libriam logo
  const modal = document.querySelector('.modal');
  const bookData = !searchResults ? await getBooks() : searchResults;
  const openModalButtons = document.querySelectorAll('.btn-book');
  const closeModalButton = document.querySelector('.modal-close-button');
  const logoButton = document.querySelector('#libriam-logo');

  // Adds event listener to each opening button (bookcover)
  openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      openModal(button, bookData);
    })
  })

  // Adds event listener to modal closing button
  closeModalButton.addEventListener('click', () => {
      closeModal();
    }
  )

  // Adds event listener to the overlay-element in the html
  document.querySelector('.overlay').addEventListener('click', closeModal)

  // Adds an event listener to the libriam logo
  logoButton.addEventListener('click', () => {
    console.log('Libriam logo clicked')
  })

}

// Handles modal events
function openModal(button, bookData) {
  const modal = document.querySelector('.modal');
  // Identifies clicked book among search results or books.json
  let clickedBook = '';
  for (let i=0; i < bookData.length; i++) {
    if (bookData[i].id === button.id) {
      clickedBook = bookData[i]
    }
  }

  fillModal(clickedBook);

  // Brauche ich diese Zeile überhaupt noch?:
  if (modal === null) return

  // Sets style of modal and overlay elements to active
  modal.classList.add('active');
  document.querySelector('.overlay').classList.add('active');
}

// Fills modal with book information, puts in placeholders for missing information
// (Used object destructuring with clickedBook because it's a neat way to handle none existing keys/values
// without using so many if statements)
function fillModal (clickedBook) {
  const {
    authors = '[Autor unbekannt]',
    title = '[Titel unbekannt]',
    subtitle = '-',
    publishedYear = '[Jahr unbekannt]' 
  } = clickedBook;
  document.querySelector('#authors').innerHTML = `${authors}`;
  document.querySelector('#title').innerHTML = `${title}`;
  document.querySelector('#subtitle').innerHTML = `${subtitle}`;
  document.querySelector('#published-date').innerHTML = `${publishedYear}`;
}

function closeModal() {
  const modal = document.querySelector('.modal');
  // Hier wieder: brauche ich die folgende Zeile überhaupt noch?
  if (modal === null) return

  // Sets style of modal and overlay to invisible
  modal.classList.remove('active');
  document.querySelector('.overlay').classList.remove('active');
}

// Handles loading animation:
function loaderBookshelfOff () {
  document.querySelector('.loader').style.opacity = 0;
  document.querySelector('.loader').style.display = 'none';
  document.querySelector('#bookshelf').style.display = 'flex';
  setTimeout(() => (document.querySelector('#bookshelf').style.opacity = 1), 50);
}

function loaderBookshelfOn () {
  document.querySelector('.loader').style.opacity = 1;
  document.querySelector('.loader').style.display = 'flex';
  document.querySelector('#bookshelf').style.display = 'none';
  document.querySelector('#bookshelf').style.opacity = 0;
}