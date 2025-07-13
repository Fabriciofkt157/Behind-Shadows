const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

http.createServer((req, res) => {
  const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Arquivo não encontrado');
    }

    res.writeHead(200);
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
