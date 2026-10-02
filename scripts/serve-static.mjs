// Minimal static server for e2e tests: serves out/ like GitHub Pages (clean URLs, 404.html) under an optional base path.
import http from "node:http"; import { readFile, stat } from "node:fs/promises"; import path from "node:path";
const [,, dir, port, prefix = ""] = process.argv;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".txt": "text/plain", ".xml": "application/xml", ".woff2": "font/woff2", ".ico": "image/x-icon", ".yml": "text/yaml" };
http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (prefix && p.startsWith(prefix)) p = p.slice(prefix.length) || "/";
  const tries = [p, `${p}.html`, path.join(p, "index.html")];
  for (const t of tries) {
    const f = path.join(dir, t);
    try { if ((await stat(f)).isFile()) { res.writeHead(200, { "content-type": types[path.extname(f)] ?? "application/octet-stream" }); return res.end(await readFile(f)); } } catch {}
  }
  res.writeHead(404, { "content-type": "text/html" }); res.end(await readFile(path.join(dir, "404.html")).catch(() => "404"));
}).listen(Number(port));
