const https = require('https2');
const fs = require('fs');

https.createSecureServer({
  cert: fs.readFileSync('도메인 인증서 경로'),
  key: fs.readFileSync('도메인 비밀키 경로'),
  ca: [
    fs.readFileSync('상위 인증서 경로'),
    fs.readFileSync('상위 인증서 경로'),
  ],
}, (req, res) => {
  res.write('<h1>Hello World!</h1>');
  res.end('<h1>Hello World!</h1>');
}).listen(443, () => {
  console.log('listening on 443');
});