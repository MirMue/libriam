"use strict";

initIndexpage();

async function initIndexpage() {
  const bookData = await getAllBooks();
  await putBooksOnPage(bookData);
  initButtons(bookData);
}
