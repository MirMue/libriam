initIndex();

async function initIndex() {
  const bookData = await getBooks();
  await fillBookshelf(bookData);
  initButtons();
}
