// nodemon starten: npm run dev

const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (error, data) => {
            if (error) {
                res.writeHead(404);
                res.write('Error: File Not Found');
            }
            else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
    })}
    if (req.url === '/about') {
        fs.readFile(path.join(__dirname, 'about.html'), (error, data) => {
            if (error) {
                res.writeHead(404);
                res.write('Error: File Not Found');
            }
            else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
    })
    }
    if (req.url === '/books') {
        fs.readFile(path.join(__dirname, 'books.js'), (error, data) => {
            if (error) {
                res.writeHead(404);
                res.write('Error: File Not Found');
            }
            else {
                res.writeHead(200, { 'Content-Type': 'text/javascript' });
                res.end(data.toString())
            }
        })
    }
})

server.listen(PORT, (error) => {
    if (error) {
        console.log('Error: ', error)
    }
    else {
        console.log(`Server is listening on PORT ${PORT}...`)
    }
})