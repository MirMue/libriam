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
  try {
    res.send(books);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "server error" });
  }
});

// Saves book in books.json
app.post("/books", (req, res) => {
  try {
    // Checks wether new book is already saved in library
    for (let i = 0; i < books.length; i++) {
      if (books[i].id === req.body.id) {
        console.log("doublette");
        console.log(req.body.id);
        return res.status(400).send({ msg: "doublet" });
      }
    }

    // Adds book from search results to "books"-array
    books.push(req.body);

    // Stringifies book data for writeFile-method
    const booksString = JSON.stringify(books, null, 2);

    // Saves book data in book.json file
    fs.writeFile("../backend/db/books.json", booksString, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "error while saving to file" });
      }
      console.log("book saved");
      return res.send();
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "server error" });
  }
});

// Deletes book from books.json
app.delete("/books/:id", (req, res) => {
  try {
    // Removes book object from books array
    const newBooksArray = books.filter((book) => book.id !== req.params.id);

    // Stringifies and formats the new books array
    const newBooksString = JSON.stringify(newBooksArray, null, 2);

    // Overwrites books.json with stringified new books array
    fs.writeFile("../backend/db/books.json", newBooksString, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "error while saving to file" });
      }
      console.log("book deleted");
      return res.send();
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "server error" });
  }
});
