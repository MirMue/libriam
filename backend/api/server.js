const fs = require("fs");
const cors = require("cors");
const express = require("express");
const app = express();
const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("../backend/db/libriamdb.sqlite");

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

// Schließt DB, wenn Strg+C geklickt wird
// (Quelle: https://stackoverflow.com/questions/42928055/when-to-close-database-with-node-sqlite3-and-express)
process.on("SIGINT", () => {
  db.close();
  console.log("DATABASE CLOSED!");
});

app.get("/books", (req, res) => {
  try {
    // Einkommentieren, falls table books noch nicht existiert:
    // db.run(
    //   "CREATE TABLE books (id INTEGER PRIMARY KEY, googleBookId TEXT, authors TEXT, title TEXT, subtitle TEXT, publishedYear TEXT, imgLink TEXT)"
    // );
    // Einkommentieren, um ein Beispielbuch in books einzufügen:
    // db.run(
    //   "INSERT INTO books (googleBookId, authors, title, subtitle, publishedYear, imgLink) VALUES ('53FrZyCuITEC', 'Michail Bulgakow', 'Teufeliaden', 'Erzählungen', '2012', 'http://books.google.com/books/content?id=53FrZyCuITEC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api')",
    //   (err) => {
    //     if (err) {
    //       return console.log("app.get, db.run(INSERT...): ", err);
    //     }
    //   }
    // );
    // Einkommentieren, um alle rows in books zu löschen:
    // db.run("DELETE FROM books");

    let bookData = [];
    db.each(
      "SELECT rowid AS id, googleBookId, authors, title, subtitle, publishedYear, imgLink FROM books",
      (err, row) => {
        const bookObj = {
          id: row.id,
          googleBookId: row.googleBookId,
          authors: row.authors,
          title: row.title,
          subtitle: row.subtitle,
          publishedYear: row.publishedYear,
          imgLink: row.imgLink,
        };
        bookData.push(bookObj);
      },
      (err, rowNrs) => {
        console.log("Nr. of rows found: ", rowNrs, "; bookData: ", bookData);
        res.send(bookData);
      }
    );
  } catch (err) {
    console.log("Error in app.get, catch: ", err);
    return res.status(500).send({ msg: "server error" });
  }
});

app.post("/books", async (req, res) => {
  try {
    db.serialize(() => {
      const stmt = db.prepare(
        "INSERT INTO books (googleBookId, authors, title, subtitle, publishedYear, imgLink) VALUES (?, ?, ?, ?, ?, ?)",
        (err) => {
          if (err) {
            return console.log("Error in app.post, prepare: ", err);
          }
        }
      );

      stmt.run(
        req.body.googleBookId,
        req.body.authors,
        req.body.title,
        req.body.subtitle,
        req.body.publishedYear,
        req.body.imgLink
      );

      stmt.finalize();
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "server error" });
  }
});
