let searchResults = [];
const searchForm = document.querySelector("#form-search");

initSearch();

// Initializes form for searching books for searchpage.html
function initSearch() {
  searchForm.addEventListener("submit", searchBooks);
}

// Takes user input from form and searches for books via google API
async function searchBooks(e) {
  e.preventDefault(e);

  // Activates loading animation and empties former search results
  loaderToggle(true);
  document.querySelector("#bookshelf").innerHTML = "";

  // Gets user input from form on searchpage.html
  const userInput = document.querySelector("#searchkeyword").value;

  // Fetch request with google API
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q={${userInput}}`
  );
  const data = await response.json();

  // Collects google search results in an array (limited to 6 books for better manageability)
  let dataArray = [];
  for (let i = 0; i < 6; i++) {
    dataArray.push(data.items[i]);
  }
  // Creates book objects in book.json-format from google search results
  // and puts them in an array
  let resultsArray = [];
  for (let i = 0; i < dataArray.length; i++) {
    let searchedBook = createSearchedBook(dataArray[i]);
    resultsArray.push(searchedBook);
  }

  // Adds a copy of book object array to variable
  searchResults = [...resultsArray];

  // Puts search results on page
  fillBookshelf(searchResults);

  // Initializes modal buttons for search results on page and save button inside modal
  initButtons(searchResults);
  initSaveButton();
}

// Creates new object from google search result, taking only necessary information
function createSearchedBook(item) {
  let searchedBook = {
    id: item.id,
    title: item.volumeInfo.title,
    subtitle: item.volumeInfo.subtitle,
    authors: item.volumeInfo.authors,
    publishedYear: item.volumeInfo.publishedDate,
    imageLinks: item.volumeInfo.imageLinks,
  };

  // Removes keys with a value of undefined
  // (Necessary for fillModal() in libriam.js to work, because it works better with the object destructuring I used there)
  // (Notiz für mich: der Code auf der rechten Seite von && wird nur ausgeführt, wenn der Code auf der linken Seite true ergiebt.)
  Object.keys(searchedBook).forEach(
    (key) => searchedBook[key] === undefined && delete searchedBook[key]
  );

  // If there is a key/value-pair for publishedYear, reduces value to year (removes month and day)
  if (searchedBook.publishedYear) {
    searchedBook.publishedYear = searchedBook.publishedYear.split("-")[0];
  }

  return searchedBook;
}

// Sets id of save button inside the modal to same id as the clicked bookcover,
// because that id will be used for identification of the right book object in requestSave()
function initSaveButton() {
  const openModalButtons = document.querySelectorAll(".btn-book");
  const saveButton = document.querySelector(".btn-modal-form");

  openModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      saveButton.setAttribute(
        "data-bookId",
        `${button.getAttribute("data-bookId")}`
      );
    });
  });

  saveButton.addEventListener("click", requestSave);
}

// Sends save request to server
async function requestSave(event) {
  // Initializes variable for new book
  let newBook = "";

  // Searches for save button id in searchResults and puts object with that id on variable "newBook"
  for (let i = 0; i < searchResults.length; i++) {
    if (searchResults[i].id === event.target.getAttribute("data-bookId")) {
      newBook = searchResults[i];
    }
  }

  // Sends post request to server with newBook-object as request body
  const response = await fetch("http://localhost:3000/books", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(newBook),
  });

  closeModal();

  // Checks wether response confirms saving process
  // or refused due to new book already being in the library
  if (response.status === 200) {
    document.querySelector("#bookshelf").innerHTML =
      "<h2>Buch gespeichert!</h2>";
  }
  if (response.status === 400) {
    document.querySelector("#bookshelf").innerHTML =
      "<h2>Buch ist bereits in Bibliothek vorhanden!</h2>";
  }

  searchResults = [];
  searchForm.reset();
}
