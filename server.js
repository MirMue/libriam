// To do:
//    - Ordnerstruktur des Projekt ändern
//    - body-parser, den ich manuell installiert hatte, aus package.json entfernen?
//    - style.css aufräumen und html-Elemente auf unnötige Attribute überprüfen

const path = require('path');
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const app = express();
const books = require('./books.json');

// PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));


// Middleware for static directories
app.use(express.static(path.join(__dirname, 'public')));

// Middleware body parser
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// CORS (hier ggf. spezifische origins angeben)
app.use(cors({
  origin: '*'
}))

// Gets all books
app.get('/books', (req, res) => {
  res.send(books)
})

// Saves book in books.json
app.post('/addtolibrary', (req, res) => {
  // Checks wether new book is already saved in library
  // inventory = method used by libraries to check in their books
  let bookStatus = {status : 'new book saved'};
  for (let i=0; i<books.length; i++) {
    if (books[i].id === req.body.id) {
      bookStatus.status = 'refused to save doublet'
    }
  }

  if (bookStatus.status === 'new book saved') {
    // Adds book from search results to "books"-array
    books.push(req.body)

    // Stringifies book data for writeFile-method
    const booksString = JSON.stringify(books, null, 2)

    // Saves book data in book.json file
    fs.writeFile('./books.json', booksString, (error) => {
      if (error) {
        console.log('Error: ', error)
        res.redirect('/searchpage');
      }
      console.log('Added new book to books.json');
    })
  }

  // Sends response to libriam.js
  res.header({'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})
  res.send(bookStatus)
})

// Deletes book from books.json
app.post('/deletebook', (req, res) => {
  // Gets id of the book from request body
  const deleteBookId = req.body.id;

  // Removes book object with the same id from "books"-array
  let deletedBook = '';
  for (let i=0; i<books.length; i++) {
    if (books[i].id === deleteBookId) {
      deletedBook = books.splice(i, 1)
    }
  }

  // Stringifies and formats the new "books"-array
  const booksString = JSON.stringify(books, null, 2)

  // Overwrites books.json with new "books"-array
  fs.writeFile('./books.json', booksString, (error) => {
    if (error) {
      console.log('Error: ', error)
      res.redirect('/searchpage');
    }
    console.log('Deleted book from books.json: ', deletedBook);
  })

  res.send()
})