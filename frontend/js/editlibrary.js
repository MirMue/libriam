"use strict";

function initDeleteButtons() {
  const deleteButtons = document.querySelectorAll(".btn-delete");
  const confirmDeletionButton = document.querySelector(".btn-modal-delete");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openModal(button);
      confirmDeletionButton.setAttribute(
        "data-delete-id",
        `${button.getAttribute("data-delete-id")}`
      );
    });
  });

  confirmDeletionButton.addEventListener("click", requestDeletion);
}

async function requestDeletion(e) {
  // (e.target ist der button, der angeklickt wurde)
  const bookId = e.target.getAttribute("data-delete-id");

  const response = await fetch("http://localhost:3000/books/" + bookId, {
    method: "DELETE",
  });

  if (response.ok) {
    document.querySelector("#modal-delete .modal-body").innerHTML =
      "<h2>Buch gelöscht!</h2>";
    document
      .querySelector("#container-bookshelf")
      .removeChild(document.getElementById(`container-book-${bookId}`));
  } else {
    document.querySelector("#modal-delete .modal-body").innerHTML =
      "<h2>Etwas ist schief gelaufen :/</h2>";
  }
}
