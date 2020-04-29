const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  fs.readFile('./welcome.html', (err, data) => {
    if (err) {
      throw err;
    }
    res.end(data);
  });
});

server.listen(8080);

server.on('listening', () => {
  console.log('ready on 8080 port');
});
server.on('error', err => {
  console.error(err);
});