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

// async/await funktioniert nicht in Express bzw. soll erst ab Express 5.0 unterstützt werden.
// Deshalb hab ich nach folgendem Vorbild einen asyncHandler gebaut:
// https://ioannisioannou.me/using-async-await-in-express-js/

// Ermöglicht den Gebrauch von async/await, weil Express wohl nicht automatisch mit rejected promises umgehen kann:
const asyncHandler = (funct) => (req, res, err) => {
  Promise.resolve(funct(req, res)).catch((err) => {
    console.log("Error in asyncHandler: ", err);
  });
};

function checkForDoublet(newBookId, idArray) {
  return new Promise((resolve, reject) => {
    let isDoublet = "no";
    if (idArray.length === 0) {
      isDoublet = "no";
      resolve(isDoublet);
    }
    for (let i = 0; i < idArray.length; i++) {
      if (idArray[i] === newBookId) {
        isDoublet = "yes";
        resolve(isDoublet);
      } else if (idArray[i] !== newBookId && i + 1 === idArray.length) {
        isDoublet = "no";
        resolve(isDoublet);
      }
    }
  }).catch((err) => {
    console.log("Error in checkForDoublet: ", err);
  });
}

function getIdArray() {
  return new Promise((resolve, reject) => {
    let idArray = [];
    db.each(
      "SELECT googleBookId FROM books",
      (err, row) => {
        if (err) {
          console.log("Error in getIdArray, db.each callback 1: ", err);
          reject(err);
        }
        idArray.push(row.googleBookId);
      },
      (err, rowNrs) => {
        if (err) {
          console.log("Error in getIdArray:, db.each callback 2 ", err);
          reject(err);
        }
        resolve(idArray);
      }
    );
  }).catch((err) => {
    console.log("Error in getIdArray, catch: ", err);
  });
}

app.get("/books", (req, res) => {
  // Wird try-catch hier überhaupt noch gebraucht, wenn ich hier jetzt Promise nutze?
  try {
    new Promise((resolve, reject) => {
      let bookDataArray = [];
      db.each(
        "SELECT rowid AS id, googleBookId, authors, title, subtitle, publishedYear, imgLink FROM books",
        (err, row) => {
          if (err) {
            console.log("Error in app.get, db.each callback 1: ", err);
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
            console.log("Error in app.get, db.each callback 2: ", err);
            reject(err);
          }
          resolve(bookDataArray);
        }
      );
    })
      .then((bookData) => {
        res.send(bookData);
      })
      .catch((err) => {
        console.log("Error in app.get, Promise catch: ", err);
        res.status(500).send({ msg: "server error" });
      });
  } catch (err) {
    console.log("Error in app.get, try-catch: ", err);
    return res.status(500).send({ msg: "server error" });
  }
});

app.post(
  "/books",
  asyncHandler(async (req, res) => {
    try {
      const idArray = await getIdArray();
      const isDoublet = await checkForDoublet(req.body.googleBookId, idArray);
      if (isDoublet === "yes") {
        console.log(
          "Book is a doublet and won't be saved in DB: ",
          req.body.title
        );
        return res.status(400).send({ msg: "doublet" });
      }

      // Hier auch mit Promise arbeiten, damit res nicht gesendet wird bevor db.serialize durch ist?
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
      res.status(200).send({ msg: "book saved to library" });
    } catch (err) {
      console.log("Error in app.post catch: ", err);
      res.status(500).send({ msg: "server error" });
    }
  })
);

app.delete("/books/:id", (req, res) => {
  try {
    // Hier auch mit Promise arbeiten, damit res nicht gesendet wird bevor db.serialize durch ist?
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
    res.status(200).send({ msg: "book deleted from library" });
  } catch (err) {
    console.log("Error in app.delete catch: ", err);
    res.status(500).send({ msg: "server error" });
  }
});
