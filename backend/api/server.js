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

function getAllBooks() {
  try {
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
  } catch (err) {
    console.log("Error in getAllBooks, catch: ", err);
    return res.status(500).send({ msg: "server error" });
  }
}

function checkForDoublet(newBookId, bookData) {
  try {
    return new Promise((resolve, reject) => {
      if (bookData.length === 0) {
        resolve(false);
      }

      for (let i = 0; i < bookData.length; i++) {
        if (bookData[i].googleBookId === newBookId) {
          resolve(true);
        } else if (
          bookData[i].googleBookId !== newBookId &&
          i + 1 === bookData.length
        ) {
          resolve(false);
        }
      }
    });
  } catch (err) {
    console.log("Error in checkForDoublet: ", err);
    return res.status(500).send({ msg: "server error" });
  }
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
    const bookData = await getAllBooks();
    const isDoublet = await checkForDoublet(req.body.googleBookId, bookData);
    if (isDoublet) {
      console.log(
        "Book is a doublet and won't be saved in DB: ",
        req.body.title
      );
      return res.status(400).send({ msg: "doublet" });
    }

    db.serialize(() => {
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
    });

    res.status(200).send({
      msg: "post request received, fucked if i know wether it worked though",
    });
    // So wie ich es verstehe, wird res.status(200).send(...) immer abgeschickt, weil die callback Funktion in db.serialize nebenläufig ist und nichts was in ihr passiert das Absenden verhindern kann (auch die Verwendung von return oder reject in einem Promise bewirkt nichts). Die callback Funktion in db.prepare ist "noch nebenläufiger", hat also keinen Einfluss auf den Rest von db.serialize und kann nur für das loggen von errors verwendet werden.
    // Ich bin sehr unglücklich damit, bisher keine Lösung dafür gefunden zu haben.
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
