// AnyPay demo server — zero dependencies (Node 18+).
// Serves index.html and proxies the NEAR Intents (1Click) API so the demo
// works from any origin without CORS issues.
// Usage: node server.js   →   http://localhost:8080
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const API = "https://1click.chaindefuser.com";

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/" || req.url === "/index.html") {
      const html = fs.readFileSync(path.join(__dirname, "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    }
    if (req.url === "/api/tokens" && req.method === "GET") {
      const r = await fetch(API + "/v0/tokens");
      const body = await r.text();
      res.writeHead(r.status, { "Content-Type": "application/json" });
      return res.end(body);
    }
    if (req.url === "/api/quote" && req.method === "POST") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const r = await fetch(API + "/v0/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: Buffer.concat(chunks)
      });
      const body = await r.text();
      res.writeHead(r.status, { "Content-Type": "application/json" });
      return res.end(body);
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  } catch (e) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Proxy error: " + e.message }));
  }
});

server.listen(PORT, () => console.log("AnyPay demo running at http://localhost:" + PORT));
