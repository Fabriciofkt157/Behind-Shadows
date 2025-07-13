import http from 'http';
import { createReadStream, existsSync, statSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { lookup } from 'mime-types';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = 3000;

const server = http.createServer((req, res) => {
  let filePath = join(__dirname, req.url === '/' ? 'index.html' : req.url);
  try {
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const mimeType = lookup(extname(filePath)) || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mimeType });
    createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
