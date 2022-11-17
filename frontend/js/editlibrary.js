initEditlibrary();

async function initEditlibrary() {
  const bookData = await getBooks();
  await fillBookshelf(bookData);
  initButtons();
  initDeleteButton();
}

// Sets id of delete button inside modal to same value as clicked bookcover
// (id will be used in requestDeletion() later)
function initDeleteButton() {
  const openModalButtons = document.querySelectorAll(".btn-book");
  const deleteButton = document.querySelector(".btn-modal-form");

  openModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      deleteButton.setAttribute(
        "data-bookId",
        `${button.getAttribute("data-bookId")}`
      );
    });
  });

  deleteButton.addEventListener("click", requestDeletion);
}

// Sends delete request to server
async function requestDeletion(e) {
  // Gets id from clicked delete button above the book
  const id = e.target.getAttribute("data-bookId");

  // Sends post request to server with book id as request body
  const response = await fetch("http://localhost:3000/books/" + id, {
    method: "DELETE",
  });

  closeModal();

  // Checks wether deletion was successful
  if (response.ok) {
    document.querySelector("#bookshelf").innerHTML = "<h2>Buch gelöscht!</h2>";
  }
  // Werde mich noch informieren, wie man gute Errormeldungen schreibt:
  else {
    console.log(`Error: response.status: ${response.status}`);
  }
}
