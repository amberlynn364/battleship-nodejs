import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

// eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
const __dirname = path.resolve(path.dirname(''));

export const httpServer = http.createServer((req, res) => {
  const filePath = path.join(__dirname, req.url === '/' ? '/front/index.html' : `/front${req.url}`);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});
