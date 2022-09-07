const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const express = require('express');
const app = express();
const books = require('./books.json');
const searchJson = require('./search.json');


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));


// Middleware for static directories
app.use(express.static(path.join(__dirname, 'public')));

// Middleware body parser
app.use(express.json());
app.use(express.urlencoded({extended: false}));


// Get index page
app.get('/', (request, response) => {
  let filePath = path.join(__dirname,
    request.url == '/' ? 'index.html' : request.url);

  let contentType = 'text/html';
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.ico': 'image/x-icon'
  }
  let extname = path.extname(filePath);
  contentType = contentTypes[`${extname}`];

  fs.readFile(filePath, (error, data) => {
    if (error) {
        if(error.code == 'ENOENT') {
            console.log('Page not found: ', error.code)
            console.log(error.message)
            return
        }
        console.log('Server Error: ', error.code)
        return
    }
  
  response.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*',});
  response.send(data, 'utf8');
  })
})

// Get all books
app.get('/books', (request, response) => {
  response.send(books)
})


// Get searchpage
app.get('/searchpage', (request, response) => {
  let filePath = path.join(__dirname, 'public',
    request.url == '/searchpage' ? 'searchpage.html' : request.url);
  
  let contentType = 'text/html';
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.ico': 'image/x-icon'
  }
  let extname = path.extname(filePath);
  contentType = contentTypes[`${extname}`];

  fs.readFile(filePath, (error, data) => {
    if (error) {
        if(error.code == 'ENOENT') {
            console.log('Page not found: ', error.code)
            console.log(error.message)
            return
        }
        console.log('Server Error: ', error.code)
        return
    }
  
  response.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*',});
  response.send(data, 'utf8');
  })
})

// Add books to search.json for displaying search results
app.post('/search', async (request, response) => {
  let keyword = request.body.keywd;
  let resultsArray = await fetchSearchedBooks(keyword);
  resultsArray = JSON.stringify(resultsArray, null, 2);

  fs.writeFile('./search.json', resultsArray, (error) => {
    if (error) {
      console.log('Error: ', error)
      response.redirect('/')
    }
    console.log('Search results added to search.json')
  })
    
  response.redirect('/searchpage.html');
})  

// Fetch book data from Google Books API
async function fetchSearchedBooks (keyword) {
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q={${keyword}}`)
  const data = await response.json()

  let dataArray = []
  for (let i = 0; i < 6; i++) {
    dataArray.push(data.items[i])
  }

  let resultsArray = []
  for (let i = 0; i < dataArray.length; i++) {
    let searchedBook = createSearchedBook(dataArray[i])
    resultsArray.push(searchedBook)
  }

  return resultsArray
}

// Creates book object
function createSearchedBook (item) {
  searchedBook = {
    "id": item.id,
    "title": item.volumeInfo.title,
    "subtitle": item.volumeInfo.subtitle,
    "authors": item.volumeInfo.authors,
    "publishedDate": item.volumeInfo.publishedDate,
    "imageLinks": item.volumeInfo.imageLinks,
  }
  return searchedBook
}

// Get all search results
app.get('/searchresults', (request, response) => {
  response.send(searchJson)
})

// Add book from search results to books.json
app.post('/addtolibrary', (request, response) => {
  let searchJ = searchJson;
  let bookData = books;
  let searchId = Object.keys(JSON.parse(JSON.stringify(request.body)))[0];
  let newBook = {};

  searchJ.forEach(book => {
    if (book.id == searchId) {
      newBook = {...book}
    }
  })
  bookData.push(newBook)
  bookData = JSON.stringify(bookData, null, 2)

  fs.writeFile('./books.json', bookData, (error) => {
    if (error) {
      console.log('Error: ', error)
      response.redirect('/searchpage');
    }
    console.log('Added new book to books.json');
  })

  clearSearch();

  response.redirect('/')
})

// Clear search.json
function clearSearch () {
  const empty = '[]'

  fs.writeFile('./search.json', empty, (error) => {
    if (error) {
      console.log('Error: ', error)
      response.redirect('/')
    }
    console.log('Search results added to search.json')
  })

  return
}

// Remove book from books.json
app.post('/deletebook', (request, response) => {
  let bookId = Object.keys(JSON.parse(JSON.stringify(request.body)))[0];
  let bookData = books;

  let result = bookData.filter(item => item.id != bookId)
  result = JSON.stringify(result, null, 2)

  fs.writeFile('./books.json', result, (error) => {
    if (error) {
      console.log('Error: ', error)
      response.redirect('/searchpage');
    }
    console.log('Deleted book from books.json');
  })
    
  response.redirect('/editlibrary.html');
}) 