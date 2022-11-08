const fs = require("fs");
const cors = require("cors");
const express = require("express");
const app = express();
const books = require("../db/books.json");

// PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// Middleware

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
app.use(
  cors({
    origin: "*",
  })
);

// Gets all books
app.get("/books", (req, res) => {
  res.send(books);
});

// Saves book in books.json
app.post("/books", (req, res) => {
  // Checks wether new book is already saved in library
  for (let i = 0; i < books.length; i++) {
    if (books[i].id === req.body.id) {
      return res.status(400).send({ msg: "doublet" });
    }
  }

  // Adds book from search results to "books"-array
  books.push(req.body);

  // Stringifies book data for writeFile-method
  const booksString = JSON.stringify(books, null, 2);

  // Saves book data in book.json file
  fs.writeFile("../backend/db/books.json", booksString, (error) => {
    if (error) {
      console.log("Error: ", error);
      res.status(500).send({ error: "Server error occured" });
    } else {
      console.log("Added new book to books.json");
      res.send();
    }
  });
});

// Deletes book from books.json
app.delete("/books/:id", (req, res) => {
  // Removes book object from books array
  const newBooksArray = books.filter((book) => book.id !== req.params.id);

  // Stringifies and formats the new books array
  const newBooksString = JSON.stringify(newBooksArray, null, 2);

  // Overwrites books.json with stringified new books array
  fs.writeFile("../backend/db/books.json", newBooksString, (error) => {
    if (error) {
      console.log("Error: ", error);
      res.status(500).send({ error: "Server error occured" });
    } else {
      console.log("Deleted book from books.json");
      res.send();
    }
  });
});
