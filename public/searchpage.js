const searchForm = document.querySelector('#form-search');
let searchResults = [];

initSearch();

// Initializes form for searching books for searchpage.html
function initSearch () {
    searchForm.addEventListener('submit', searchBooks);
  }
  
  // Takes user input from searchpage.html and searches for books via google API
  async function searchBooks (e) {
    e.preventDefault(e)
  
    // Activates loading animation and empties former search results
    loaderBookshelfOn();
    document.querySelector('#search-results').innerHTML = '';
  
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
    fillBookshelf(searchResults);
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
  if (data.status === 'new book saved') {
      document.querySelector('#search-results').innerHTML = 
      '<h2 style="color:grey">Buch gespeichert!</h2>';
  }
  if (data.status === 'refused to save doublet') {
      document.querySelector('#search-results').innerHTML = 
      '<h2 style="color:grey">Buch ist bereits in Bibliothek vorhanden!</h2>';
  }
  
  searchResults = [];
  searchForm.reset()
}