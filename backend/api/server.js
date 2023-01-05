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

async function getAllBooks() {
  return new Promise((resolve, reject) => {
    let bookDataArray = [];
    db.each(
      "SELECT rowid AS id, googleBookId, authors, title, subtitle, publishedYear, imgLink FROM books",
      (err, row) => {
        if (err) {
          console.log("Error in getAllBooks, db.each callback 1: ", err);
          reject(err);
        }
        const bookObj = {
          id: row.id,
          googleBookId: row.googleBookId,
          authors: row.authors,
          title: row.title,
          subtitle: row.subtitle,
          publishedYear: row.publishedYear,
          imgLink: row.imgLink,
        };
        bookDataArray.push(bookObj);
      },
      (err, rowNrs) => {
        if (err) {
          console.log("Error in getAllBooks, db.each callback 2: ", err);
          reject(err);
        }
        resolve(bookDataArray);
      }
    );
  });
}

async function getBook(googleBookId) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT rowid AS id, googleBookId, authors, title, subtitle, publishedYear, imgLink FROM books WHERE googleBookId = ?",
      googleBookId,
      (err, row) => {
        if (err) {
          console.log("Error in getBook, db.get callback: ", err);
          reject(err);
        }

        if (row) {
          const bookObj = {
            id: row.id,
            googleBookId: row.googleBookId,
            authors: row.authors,
            title: row.title,
            subtitle: row.subtitle,
            publishedYear: row.publishedYear,
            imgLink: row.imgLink,
          };
          resolve(bookObj);
        } else {
          resolve(false);
        }
      }
    );
  });
}

app.get("/books", async (req, res) => {
  try {
    const bookData = await getAllBooks();
    res.send(bookData);
  } catch (err) {
    console.log("Error in app.get, catch: ", err);
    return res.status(500).send({ msg: "server error" });
  }
});

app.post("/books", async (req, res) => {
  try {
    const isDoublet = await getBook(req.body.googleBookId);
    if (isDoublet) {
      console.log("Doublet found. Book already exists in DB: ", isDoublet);
      return res.status(400).send({ msg: "doublet" });
    }

    db.serialize(async () => {
      const stmt = db.prepare(
        "INSERT INTO books (googleBookId, authors, title, subtitle, publishedYear, imgLink) VALUES (?, ?, ?, ?, ?, ?)",
        (err) => {
          if (err) {
            console.log("Error in app.post, prepare: ", err);
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

      const savingWorked = await getBook(req.body.googleBookId);

      savingWorked
        ? res.status(200).send({ msg: "book successfully saved in DB" })
        : res.status(500).send({ msg: "server failed to save book in DB" });
    });
  } catch (err) {
    console.log("Error in app.post catch: ", err);
    res.status(500).send({ msg: "server error" });
  }
});

app.delete("/books/:id", (req, res) => {
  try {
    db.serialize(() => {
      const stmt = db.prepare(
        "DELETE FROM books WHERE googleBookId = ?",
        (err) => {
          if (err) {
            return console.log("Error in app.delete, prepare: ", err);
          }
        }
      );

      stmt.run(req.params.id);

      stmt.finalize();
    });
    res.status(200).send({
      msg: "delete request received, fucked if i know wether it worked though",
    });
  } catch (err) {
    console.log("Error in app.delete catch: ", err);
    res.status(500).send({ msg: "server error" });
  }
});
