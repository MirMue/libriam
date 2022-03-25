const container = document.querySelector('.container');

var books = [
  {
      title: "Harry Potter und der Gefangene von Askaban",
      ISBN_10: "3551354030",
      ISBN_13: "9783551354037",
  },
  {
      title: "Im Grunde gut",
      ISBN_10: "349900416X",
      ISBN_13: "9783499004162",
  },
  {
    title: "Der dunkle Turm - Schwarz",
    ISBN_10: "3453875567",
    ISBN_13: "9783453875562",
  },
  {
    title: "Die schwarzen Wasser der Seine",
    ISBN_10: "3841201121",
    ISBN_13: "9783841201126",
  },
  {
    title: "The Magic of Lines II",
    ISBN_10: "1908175737",
    ISBN_13: "9781908175731",
  },
  {
    title: "Die 13 1/2 Leben des Käpt'n Blaubär",
    ISBN_10: "3641255228",
    ISBN_13: "9783641255220",
  },
]

$(document).ready(function(){
    for (let i=0; i<books.length; i++){
      $.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${books[i].ISBN_13}`, function(data) {
        const x = document.createElement('div');
        if (data.items[0].volumeInfo.imageLinks) {
          x.innerHTML = `<p>${data.items[0].volumeInfo.title}</p><img src="${data.items[0].volumeInfo.imageLinks.thumbnail}"></img>`;
        }
        else if (data.items[0].volumeInfo.title) {
          x.innerHTML = `<p>${data.items[0].volumeInfo.title}</p><img src="thumbnail_placeholder.jpg"></img>`;
        }
        else {console.log("Problem im if-statement")}
        container.appendChild(x);
      });
    }
    });