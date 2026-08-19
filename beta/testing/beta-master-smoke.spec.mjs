import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const betaRoot = path.resolve(here, "..");
const publicRoot = path.join(betaRoot, "public");
const outputDir = path.join(here, "visual-audit");

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".mp4", "video/mp4"]
]);

const routes = [
  ["play", "#/play", "#playRoot .play-grid"],
  ["loadout", "#/loadout", "#loadoutRoot .loadout-card"],
  ["review-insights", "#/review/insights", "#reviewRoot .section-subnav"],
  ["library-lineups", "#/library/lineups", "#libraryRoot .library-layout"],
  ["settings-visual", "#/settings/visual", "#settingsRoot .settings-layout"]
];

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  ].filter(Boolean);
  const found = candidates.find(candidate => fs.existsSync(candidate));
  if (!found) throw new Error("Chrome or Edge was not found. Set CHROME_PATH to run this smoke check.");
  return found;
}

function contentType(filePath) {
  return mime.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}

function staticServer() {
  return http.createServer((request, response) => {
    let routePath = decodeURIComponent((request.url || "/").split("?")[0].split("#")[0]);
    if (!routePath || routePath === "/") routePath = "/index.html";
    const filePath = path.resolve(publicRoot, routePath.slice(1));
    if (!filePath.startsWith(publicRoot)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("not found");
        return;
      }
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": contentType(filePath)
      });
      response.end(data);
    });
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForJson(url, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // Chrome is still opening the debugging port.
    }
    await wait(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function openWebSocket(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const pending = new Map();
    const events = [];
    let nextId = 1;
    ws.addEventListener("open", () => {
      resolve({
        events,
        ws,
        send(method, params = {}) {
          const id = nextId++;
          ws.send(JSON.stringify({ id, method, params }));
          return new Promise((res, rej) => {
            const timeout = setTimeout(() => {
              if (!pending.has(id)) return;
              pending.delete(id);
              rej(new Error(`CDP command timed out: ${method}`));
            }, 10000);
            pending.set(id, {
              method,
              reject: rej,
              resolve(value) {
                clearTimeout(timeout);
                res(value);
              }
            });
          });
        }
      });
    });
    ws.addEventListener("message", message => {
      const data = JSON.parse(message.data);
      if (data.id && pending.has(data.id)) {
        const item = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) item.reject(new Error(`${item.method}: ${data.error.message}`));
        else item.resolve(data.result || {});
      } else if (data.method) {
        events.push(data);
      }
    });
    ws.addEventListener("error", reject);
  });
}

async function createTarget(port) {
  const endpoint = `http://127.0.0.1:${port}/json/new?about%3Ablank`;
  let response = await fetch(endpoint, { method: "PUT" });
  if (!response.ok) response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Could not create Chrome target: ${response.status}`);
  return response.json();
}

async function closeTarget(port, id) {
  try {
    await fetch(`http://127.0.0.1:${port}/json/close/${id}`);
  } catch {
    // Target may already be closed.
  }
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    awaitPromise: true,
    expression,
    returnByValue: true
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Browser evaluation failed.");
  return result.result?.value;
}

async function waitFor(client, expression, label, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(client, expression)) return;
    await wait(120);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

function collectErrors(events) {
  return events.flatMap(event => {
    if (event.method === "Runtime.exceptionThrown") {
      return [event.params?.exceptionDetails?.text || "Runtime exception"];
    }
    if (event.method === "Runtime.consoleAPICalled" && event.params?.type === "error") {
      return [(event.params.args || []).map(arg => arg.value || arg.description || "").join(" ")];
    }
    if (event.method === "Log.entryAdded" && event.params?.entry?.level === "error") {
      return [event.params.entry.text];
    }
    return [];
  });
}

async function captureRoute(client, baseUrl, name, hash, selector) {
  client.events.length = 0;
  await client.send("Page.navigate", { url: `${baseUrl}${hash}` });
  await waitFor(
    client,
    `(function(){const el=document.querySelector(${JSON.stringify(selector)});return !!(el && (el.children.length || el.textContent.trim().length));})()`,
    selector
  );
  await wait(500);
  const errors = collectErrors(client.events);
  if (errors.length) throw new Error(`${name} emitted errors:\n${errors.join("\n")}`);
  const screenshot = await client.send("Page.captureScreenshot", {
    captureBeyondViewport: true,
    format: "png"
  });
  fs.writeFileSync(path.join(outputDir, `beta-master-${name}.png`), Buffer.from(screenshot.data, "base64"));
  console.log(`OK ${name}`);
}

async function runInteractionSmoke(client, baseUrl) {
  client.events.length = 0;
  await client.send("Page.navigate", { url: `${baseUrl}#/loadout` });
  await waitFor(client, `!!document.querySelector('#loadoutRoot [data-action="spin-loadout"]')`, "loadout spin button");
  await evaluate(client, `document.querySelector('#loadoutRoot [data-action="spin-loadout"]').click(), true`);
  await waitFor(client, `!!document.querySelector('#loadoutRoot .loadout-generated-panel')`, "generated loadout", 5000);
  await wait(2500);
  await waitFor(client, `!!document.querySelector('#loadoutRoot [data-action="start-match"]:not(:disabled)')`, "enabled start match");
  await evaluate(client, `document.querySelector('#loadoutRoot [data-action="start-match"]').click(), true`);
  await waitFor(client, `location.hash.includes('/in-game') && !!document.querySelector('#inGameRoot .in-game-layout')`, "in-game route");
  await evaluate(client, `document.querySelector('.topbar-actions [data-action="open-search"]').click(), true`);
  await waitFor(client, `document.querySelector('#modalRoot')?.textContent.toLowerCase().includes('search')`, "search modal");
  await evaluate(client, `document.querySelector('[data-modal-close]').click(), true`);
  await client.send("Page.navigate", { url: `${baseUrl}#/library/lineups` });
  await waitFor(client, `!!document.querySelector('#libraryRoot [data-action="open-lineup-detail"]')`, "lineup detail button");
  await evaluate(client, `document.querySelector('#libraryRoot [data-action="open-lineup-detail"]').click(), true`);
  await waitFor(client, `document.querySelector('#modalRoot')?.textContent.includes('Steps')`, "lineup modal");
  const errors = collectErrors(client.events);
  if (errors.length) throw new Error(`Interaction smoke emitted errors:\n${errors.join("\n")}`);
  console.log("OK interactions");
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const server = staticServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const debugPort = 10400 + Math.floor(Math.random() * 300);
  const profileDir = path.join(process.env.TEMP || ".", `rc-beta-smoke-${Date.now()}`);
  fs.mkdirSync(profileDir, { recursive: true });
  const browser = spawn(findChrome(), [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-background-networking",
    "--remote-allow-origins=*",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    "about:blank"
  ], { stdio: ["ignore", "pipe", "pipe"] });
  try {
    await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);
    const target = await createTarget(debugPort);
    const client = await openWebSocket(target.webSocketDebuggerUrl);
    await client.send("Runtime.enable");
    await client.send("Log.enable");
    await client.send("Page.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      deviceScaleFactor: 1,
      height: 1000,
      mobile: false,
      width: 1440
    });
    const baseUrl = `http://127.0.0.1:${server.address().port}/index.html`;
    for (const [name, hash, selector] of routes) {
      await captureRoute(client, baseUrl, name, hash, selector);
    }
    await runInteractionSmoke(client, baseUrl);
    client.ws.close();
    await closeTarget(debugPort, target.id);
  } finally {
    browser.kill("SIGKILL");
    server.close();
  }
}

main().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
