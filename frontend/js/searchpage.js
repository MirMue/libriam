"use strict";

let searchResults = [];
const searchForm = document.querySelector("#form-search-google");

initSearch();

function initSearch() {
  searchForm.addEventListener("submit", searchBooks);
}

async function searchBooks(e) {
  e.preventDefault(e);

  loaderToggle(
    document.querySelector("#loader-search"),
    document.querySelector("#container-results"),
    "on"
  );

  document.querySelector("#container-results").innerHTML = "";

  const userInput = document.querySelector("#searchkeyword").value;
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q={${userInput}}`
  );
  const data = await response.json();

  // Google search results limited to 6 books for better manageability
  let dataSlice = [];
  for (let i = 0; i < 6; i++) {
    dataSlice.push(data.items[i]);
  }

  let resultsArray = [];
  for (let i = 0; i < dataSlice.length; i++) {
    let bookObj = createBookObj(dataSlice[i]);
    resultsArray.push(bookObj);
  }

  // Adds a copy of book object array to variable
  // Wieso hatte ich das gemacht?
  searchResults = [...resultsArray];

  putBooksOnPage(searchResults, true);

  initButtons(searchResults);
  initSaveButton();
}

function createBookObj(item) {
  let bookObj = {
    googleBookId: item.id,
    authors: item.volumeInfo.authors,
    title: item.volumeInfo.title,
    subtitle: item.volumeInfo.subtitle,
    publishedYear: item.volumeInfo.publishedDate,
    imgLink: item.volumeInfo.imageLinks,
  };

  // Removes keys with a value of undefined. Necessary for putBooksOnPage() in libriam.js to work, because it works better with the object destructuring I used there
  Object.keys(bookObj).forEach(
    (key) => bookObj[key] === undefined && delete bookObj[key]
  );

  // If there is a key/value-pair for publishedYear, reduces value to year (removes month and day)
  if (bookObj.publishedYear) {
    bookObj.publishedYear = bookObj.publishedYear.split("-")[0];
  }

  if (bookObj.imgLink) {
    bookObj.imgLink = bookObj.imgLink.smallThumbnail;
  }

  return bookObj;
}

function initSaveButton() {
  const openModalButtons = document.querySelectorAll(".btn-bookcover");
  const saveButton = document.querySelector(".btn-modal-form");

  openModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      saveButton.setAttribute(
        "data-book-id",
        `${button.getAttribute("data-book-id")}`
      );
    });
  });

  saveButton.addEventListener("click", requestSave);
}

async function requestSave(event) {
  let newBook = "";

  for (let i = 0; i < searchResults.length; i++) {
    if (
      searchResults[i].googleBookId ===
      event.target.getAttribute("data-book-id")
    ) {
      newBook = searchResults[i];
    }
  }

  const response = await fetch("http://localhost:3000/books", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(newBook),
  });

  closeModal();

  if (response.ok) {
    document.querySelector("#container-results").innerHTML =
      "<h2>Buch gespeichert!</h2>";
    document.querySelector("#container-bookshelf").innerHTML = "";
    initIndexpage();
  } else {
    const data = await response.json();
    if (data.msg === "doublet") {
      document.querySelector("#container-results").innerHTML =
        "<h2>Buch ist bereits in Bibliothek vorhanden!</h2>";
    } else {
      document.querySelector("#container-results").innerHTML =
        "<h2>Etwas ist schief gegangen :/</h2>";
    }
  }

  searchResults = [];
  searchForm.reset();
}
