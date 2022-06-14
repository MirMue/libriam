getBooks().then((response) => fillBookshelf(response));
initButtons();

async function getBooks () {
  const bookData = [];
  for (let i=0; i<books.length; i++) {
    const request = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${books[i].ISBN_13}`)
    const data = await request.json()
    bookData.push(data)
  }
  return bookData
}

function fillBookshelf(bookData) {
  for (const book of bookData) {
    const newVolume = document.createElement('div');

    newVolume.innerHTML = createBookHtml(
      book.items[0].volumeInfo.title,
      book.items[0].volumeInfo.subtitle,
      book.items[0].volumeInfo.authors,
      book.items[0].volumeInfo.publishedDate,
      book.items[0].volumeInfo.imageLinks
    );

    document.getElementById('bookshelf').appendChild(newVolume);
  }
}

function createBookHtml (title, subtitle, authors, publishedDate, imageLinks) {
  let html = '';
  if (imageLinks) {
    html = `<img src="${imageLinks.thumbnail}">`
  } else {
    html = `<p>${title}</p><img src="thumbnail_placeholder.jpg">`
  }

  html += `<button class="btn-info">Mehr Infos...</button>
    <button class="btn-close">Weniger Infos...</button>
    <p class="hidden">${authors}<br>-<br>
    ${title}. ${subtitle}<br>-<br>${publishedDate}</p>`

  return html
}

function initButtons () {
  const infoButtons = document.querySelectorAll('.btn-info');
  const closeButtons = document.querySelectorAll('.btn-close');

  for (const button of infoButtons) {
    button.addEventListener('click', () => {
      const hiddenElement = button.parentElement.getElementsByClassName('hidden');
      hiddenElement[0].className = 'visible';
      button.style.backgroundColor = 'grey';
      button.parentElement.querySelector('.btn-close').style.backgroundColor = 'goldenrod';
    })
  }

  for (const button of closeButtons) {
    button.addEventListener('click', () => {
      const visibleElement = button.parentElement.getElementsByClassName('visible');
      visibleElement[0].className = 'hidden';
      button.style.backgroundColor = 'grey';
      button.parentElement.querySelector('.btn-info').style.backgroundColor = 'goldenrod';
    })
  }
}