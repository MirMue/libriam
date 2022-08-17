// nodemon starten: npm run dev

const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    let filePath = path.join(
        __dirname,
        req.url == '/' ? 'index.html' : `${req.url}.html`);
    
    if (req.url === '/books') {
        filePath = path.join(__dirname, 'books.js')
    }
    
    let extname = path.extname(filePath);

    let contentType = 'text/html';

    switch (extname) {
        case '.html':
            contentType = 'text/html';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            if(error.code == 'ENOENT') {
                console.log('Page not found: ', error.code)
            }
            else {
                console.log('Server Error: ', error.code)
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': contentType});
            res.end(data, 'utf8');
        }
    })
})

server.listen(PORT, (error) => {
    if (error) {
        console.log('Error: ', error)
    }
    else {
        console.log(`Server is listening on PORT ${PORT}...`)
    }
})