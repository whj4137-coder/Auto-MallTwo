const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = "/Users/a111/Documents/Auto-MallTwo/design/prototype";
const PORT = 8000;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".json": "application/json",
};

http
  .createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split("?")[0]);
    if (rel === "/") rel = "/index.html";
    const fp = path.join(ROOT, path.normalize(rel));
    if (!fp.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end("forbidden");
    }
    fs.readFile(fp, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end("not found");
      }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(fp)] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log("preview server on http://localhost:" + PORT));
