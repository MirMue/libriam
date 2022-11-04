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
      return res
        .status(400)
        .send({ success: false, msg: "Book already in database" });
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
    } else {
      console.log("Added new book to books.json");
    }
  });

  res.status(200).send({ success: true, msg: "Book saved to database" });
});

// Deletes book from books.json
app.delete("/books/:id", (req, res) => {
  // Removes book object with fitting id from "books"-array
  let deletedBook = "";
  for (let i = 0; i < books.length; i++) {
    if (books[i].id === req.params.id) {
      deletedBook = books.splice(i, 1);
    }
  }

  // Stringifies and formats the new "books"-array
  const booksString = JSON.stringify(books, null, 2);

  // Overwrites books.json with new "books"-array
  fs.writeFile("../backend/db/books.json", booksString, (error) => {
    if (error) {
      console.log("Error: ", error);
    }
    console.log("Deleted book from books.json");
  });

  // Ich weiß, dass die response auch so gesendet wird, wenn das Löschen nicht erfolgreich war:
  res.status(200).send({ success: true, msg: "Book deleted from database" });
});
