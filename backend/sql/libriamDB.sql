-- CREATE TABLE books(
-- id INTEGER PRIMARY KEY,
-- googleBookId TEXT,
-- authors TEXT,
-- title TEXT,
-- subtitle TEXT,
-- publishedYear TEXT,
-- imgLink TEXT
-- );

-- Testweise manuell eingefügt:
-- INSERT INTO books (
-- googleBookId,
-- authors,
-- title,
-- publishedYear,
-- imgLink
-- ) 
-- VALUES (
-- 'Jmv6DwAAQBAJ',
-- 'Stephen King',
-- 'Rita Hayworth and Shawshank Redemption',
-- '2020',
-- 'http://books.google.com/books/publisher/content?id=Jmv6DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70yVSOGWHqYi5agh2SwzMYtlbTLkBQOZ2D9E-6_rYqQ1tRlvBpdzuqBWjRYwA7uXDUuFgW58KHatSgpwyrjPTQc0PPG__qBedMbQ-Nba7gIzyhLDp93TsswC4HJvvdjFGTz3AAm&source=gbs_api'
-- );

-- SELECT * FROM books;

-- Spaltenname und Eintrag geändert:
-- ALTER TABLE books
-- RENAME COLUMN googleLink TO googleBookId;
-- UPDATE books
-- SET googleBookId = 'Jmv6DwAAQBAJ'
-- WHERE id = 1;

-- Link zu Google Books JSON Objekten: https://www.googleapis.com/books/v1/volumes/[googleBookId]

-- Löscht den table "books"
-- DROP TABLE books;