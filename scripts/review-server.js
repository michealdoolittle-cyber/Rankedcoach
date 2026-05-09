const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Cache-Control": "no-store",
    ...headers
  });
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload, null, 2), {
    "Content-Type": "application/json; charset=utf-8"
  });
}

function safePathFromUrl(urlPath = "/") {
  const clean = decodeURIComponent(String(urlPath || "/").split("?")[0]);
  const relative = clean === "/" ? "/index.html" : clean;
  const resolved = path.normalize(path.join(PUBLIC_DIR, relative));
  if (!resolved.startsWith(PUBLIC_DIR)) return null;
  return resolved;
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      const fallback404 = path.join(PUBLIC_DIR, "404.html");
      if (filePath !== fallback404 && fs.existsSync(fallback404)) {
        return fs.readFile(fallback404, (_fallbackError, fallbackData) => {
          send(res, 404, fallbackData || "Not found", {
            "Content-Type": "text/html; charset=utf-8"
          });
        });
      }
      return send(res, 404, "Not found", {
        "Content-Type": "text/plain; charset=utf-8"
      });
    }

    send(res, 200, data, {
      "Content-Type": CONTENT_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
  });
}

const server = http.createServer((req, res) => {
  if ((req.method || "GET").toUpperCase() === "OPTIONS") {
    return send(res, 204, "", {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    });
  }

  if ((req.url || "").startsWith("/api/")) {
    return sendJson(res, 501, {
      ok: false,
      message: "Local review server only serves the static app shell. Deploy or use Cloudflare preview for live API-backed flows."
    });
  }

  const resolved = safePathFromUrl(req.url || "/");
  if (!resolved) {
    return send(res, 400, "Bad request", {
      "Content-Type": "text/plain; charset=utf-8"
    });
  }

  let filePath = resolved;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (!fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    if (!ext) {
      filePath = path.join(PUBLIC_DIR, "index.html");
    }
  }

  return serveFile(res, filePath);
});

server.listen(PORT, HOST, () => {
  console.log(`RankedCoach review server running at http://${HOST}:${PORT}`);
  console.log(`Serving static files from ${PUBLIC_DIR}`);
});
