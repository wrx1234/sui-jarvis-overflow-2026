import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("site");
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const requestPath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  const candidate = resolve(root, requestPath === "/" ? "index.html" : requestPath.slice(1));

  if (!candidate.startsWith(root) || !existsSync(candidate) || !statSync(candidate).isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "content-type": mimeTypes[extname(candidate)] || "application/octet-stream",
    "cache-control": "no-store"
  });
  createReadStream(candidate).pipe(res);
});

server.listen(port, () => {
  console.log(`Sui Jarvis demo site: http://localhost:${port}`);
});

