"use strict";

async function getAllBooks() {
  const response = await fetch("http://localhost:3000/books");
  const bookData = await response.json();
  return bookData;
}

async function putBooksOnPage(bookData, isSearchresult) {
  let container = "";
  let loader = "";
  isSearchresult
    ? ((container = document.querySelector("#container-results")),
      (loader = document.querySelector("#loader-search")))
    : ((container = document.querySelector("#container-bookshelf")),
      (loader = document.querySelector("#loader-bookshelf")));

  loaderToggle(loader, container, "on");

  if (bookData.length === 0) {
    let newVolume = document.createElement("div");
    newVolume.innerHTML = "<h2>Keine Bücher vorhanden...</h2>";
    container.appendChild(newVolume);
  } else {
    for (const book of bookData) {
      let newVolume = document.createElement("div");
      newVolume.classList.add("container-book");
      newVolume.setAttribute("id", `container-book-${book.googleBookId}`);
      newVolume.innerHTML = createBookHtml(book, isSearchresult);
      container.appendChild(newVolume);
    }
  }
  initDeleteButtons();
  loaderToggle(loader, container, "off");
}

function createBookHtml(book, isSearchresult) {
  let bookCover = "";
  book.imgLink
    ? (bookCover = `<img class="bookcover" src="${book.imgLink}">`)
    : (bookCover = `<div class="bookcover empty">
    <p>${book.authors ? book.authors : "[Autor unbekannt]"}</p>
    <p>${book.title ? book.title : "[Titel unbekannt]"}</p>
    <p style="font-size: small">(Kein Buchcover vorhanden)</p>
    </div>`);

  let bookHtml = "";
  isSearchresult
    ? (bookHtml += `<div class="book-small">
  <button class="btn-bookcover" data-book-id="${book.googleBookId}">${bookCover}</button>
  </div>`)
    : (bookHtml += `<div class="book-large">
    <div class="container-bookcover">${bookCover}</div>
    <div class="container-book-info">
    <p class="authors">${book.authors ? book.authors : "[Autor unbekannt]"}</p>
    <p class="title">${book.title ? book.title : "[Titel unbekannt]"}</p>
    <p class="subtitle">${book.subtitle ? book.subtitle : ""}</p>
    <p class="published-year">${
      book.publishedYear ? book.publishedYear : "[Jahr unbekannt]"
    }</p>
    </div>
    <div class="nav-book-large">
    <button class="btn-delete" data-delete-id="${
      book.googleBookId
    }">löschen</button>
    </div>
    </div>`);

  return bookHtml;
}

async function initButtons(bookData) {
  const openModalButtons = document.querySelectorAll(".btn-bookcover");
  const closeModalButtons = document.querySelectorAll(".btn-modal-close");
  const logoButton = document.querySelector("#libriam-logo");

  openModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openModal(button, bookData);
    });
  });

  closeModalButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.querySelector(".overlay").addEventListener("click", closeModal);

  logoButton.addEventListener("click", () => {
    console.log("Libriam logo clicked");
  });
}

function openModal(button, bookData) {
  let modal = "";
  // bookData will only be received through bookcover-buttons in the search form
  if (bookData) {
    modal = document.querySelector("#modal-search");
    let clickedBookcover = "";
    for (let i = 0; i < bookData.length; i++) {
      if (bookData[i].googleBookId === button.getAttribute("data-book-id")) {
        clickedBookcover = bookData[i];
      }
    }
    fillModal(clickedBookcover);
  } else {
    modal = document.querySelector("#modal-delete");
  }

  modal.classList.add("active");
  document.querySelector(".overlay").classList.add("active");
}

function fillModal(clickedBookcover) {
  // (Used object destructuring with clickedBookcover)
  const {
    authors = "[Autor unbekannt]",
    title = "[Titel unbekannt]",
    subtitle = "-",
    publishedYear = "[Jahr unbekannt]",
  } = clickedBookcover;
  document.querySelector("#modal-authors").innerHTML = authors;
  document.querySelector("#modal-title").innerHTML = title;
  document.querySelector("#modal-subtitle").innerHTML = subtitle;
  document.querySelector("#modal-published-date").innerHTML = publishedYear;
}

function closeModal() {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    modal.classList.remove("active");
  });
  // Setzt modal für löschen-button zurück, nach Ende des Löschvorgangs (ist mir noch zu unelegant)
  document.querySelector("#modal-delete .modal-body").innerHTML =
    '<form><input type="button" class="btn-modal-delete" value="Löschen" /></form>';
  initDeleteButtons();
  document.querySelector(".overlay").classList.remove("active");
}

function loaderToggle(loader, container, toggleTo) {
  // "on" und "off" könnten durch booleans ersetzt werden, aber ich finde es so verständlicher
  if (toggleTo === "on") {
    loader.style.opacity = 1;
    loader.style.display = "flex";
    container.style.display = "none";
    container.style.opacity = 0;
  }
  if (toggleTo === "off") {
    loader.style.opacity = 0;
    loader.style.display = "none";
    container.style.display = "flex";
    setTimeout(() => (container.style.opacity = 1), 50);
  }
}
