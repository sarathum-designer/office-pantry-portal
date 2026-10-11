// ============================================================================
//  OFFICE PANTRY PORTAL — local server
//  Runs on one machine in the office. Everyone on the same WiFi can use it.
//  No internet required.
// ============================================================================
const http = require("http");
const fs   = require("fs");
const path = require("path");
const os   = require("os");

const PORT      = 3000;
const DATA_FILE = path.join(__dirname, "pantry-data.json");
const HTML_FILE = path.join(__dirname, "index.html");
const STATIC_FILES = {
  "/css/styles.css": "text/css; charset=utf-8",
  "/js/app.jsx":     "text/javascript; charset=utf-8",
};

// ---------- data persistence ----------
const DEFAULT_MENU = [
  { id: "coffee",      name: "Coffee",       category: "hot",   inStock: true, custom: false },
  { id: "cappuccino",  name: "Cappuccino",   category: "hot",   inStock: true, custom: false },
  { id: "chai",        name: "Chai",         category: "hot",   inStock: true, custom: false },
  { id: "espresso",    name: "Espresso",     category: "hot",   inStock: true, custom: false },
  { id: "lemon-tea",   name: "Lemon Tea",    category: "hot",   inStock: true, custom: false },
  { id: "cold-coffee", name: "Cold Coffee",  category: "cold",  inStock: true, custom: false },
  { id: "ice-tea",     name: "Ice Tea",      category: "cold",  inStock: true, custom: false },
  { id: "bourbon",     name: "Bourbon",      category: "snack", inStock: true, custom: false },
  { id: "hide-seek",   name: "Hide & Seek",  category: "snack", inStock: true, custom: false },
  { id: "marie-gold",  name: "Marie Gold",   category: "snack", inStock: true, custom: false },
  { id: "crack-jack",  name: "Crack Jack",   category: "snack", inStock: true, custom: false },
  { id: "moong-dal",   name: "Moong Dal",    category: "snack", inStock: true, custom: false },
  { id: "namkeen",     name: "Namkeen",      category: "snack", inStock: true, custom: false },
  { id: "makhana",     name: "Makhana",      category: "snack", inStock: true, custom: false },
];

let state = { menu: DEFAULT_MENU, orders: [] };

function loadState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      state = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      if (!state.menu || !state.menu.length) state.menu = DEFAULT_MENU;
      if (!Array.isArray(state.orders))      state.orders = [];
    }
  } catch (e) { console.error("Could not load data file:", e.message); }
}
function saveState() {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2)); }
  catch (e) { console.error("Could not save data:", e.message); }
}
loadState();

// ---------- helpers ----------
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => { body += chunk; if (body.length > 1e6) req.destroy(); });
    req.on("end",  () => { try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}
function sendJSON(res, code, data) {
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data));
}

// ---------- routes ----------
const server = http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];

  // serve the html
  if (req.method === "GET" && (url === "/" || url === "/index.html")) {
    try {
      const html = fs.readFileSync(HTML_FILE, "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch {
      res.writeHead(500); return res.end("index.html not found next to server.js");
    }
  }

  // serve the stylesheet and app script
  if (req.method === "GET" && STATIC_FILES[url]) {
    try {
      const body = fs.readFileSync(path.join(__dirname, url));
      res.writeHead(200, { "Content-Type": STATIC_FILES[url] });
      return res.end(body);
    } catch {
      res.writeHead(404); return res.end("Not found");
    }
  }

  // get full state
  if (req.method === "GET" && url === "/api/state") {
    return sendJSON(res, 200, state);
  }

  // place order
  if (req.method === "POST" && url === "/api/orders") {
    try {
      const order = await readBody(req);
      if (!order.employeeName || !Array.isArray(order.items) || !order.items.length) {
        return sendJSON(res, 400, { error: "Invalid order" });
      }
      const fullOrder = {
        id: `ORD-${Date.now().toString(36).toUpperCase()}`,
        employeeName: String(order.employeeName).slice(0, 80),
        items: order.items.slice(0, 50),
        status: "pending",
        placedAt: Date.now(),
        updatedAt: Date.now(),
      };
      state.orders.unshift(fullOrder);
      saveState();
      console.log(`[order] ${fullOrder.employeeName} → ${fullOrder.items.length} items`);
      return sendJSON(res, 200, fullOrder);
    } catch { return sendJSON(res, 400, { error: "Bad request" }); }
  }

  // update order status
  if (req.method === "PATCH" && url.startsWith("/api/orders/")) {
    try {
      const id = url.split("/").pop();
      const body = await readBody(req);
      const idx = state.orders.findIndex(o => o.id === id);
      if (idx === -1) return sendJSON(res, 404, { error: "Order not found" });
      if (body.status) state.orders[idx].status = body.status;
      state.orders[idx].updatedAt = Date.now();
      saveState();
      return sendJSON(res, 200, state.orders[idx]);
    } catch { return sendJSON(res, 400, { error: "Bad request" }); }
  }

  // delete order
  if (req.method === "DELETE" && url.startsWith("/api/orders/")) {
    const id = url.split("/").pop();
    state.orders = state.orders.filter(o => o.id !== id);
    saveState();
    return sendJSON(res, 200, { ok: true });
  }

  // replace menu
  if (req.method === "PUT" && url === "/api/menu") {
    try {
      const body = await readBody(req);
      if (!Array.isArray(body.menu)) return sendJSON(res, 400, { error: "Invalid menu" });
      state.menu = body.menu;
      saveState();
      return sendJSON(res, 200, state.menu);
    } catch { return sendJSON(res, 400, { error: "Bad request" }); }
  }

  res.writeHead(404); res.end("Not found");
});

// ---------- start ----------
function getLocalIPs() {
  const out = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) out.push(net.address);
    }
  }
  return out;
}

server.listen(PORT, "0.0.0.0", () => {
  const ips = getLocalIPs();
  console.log("\n========================================");
  console.log("  Office Pantry Portal is running");
  console.log("========================================\n");
  console.log("  On this machine:    http://localhost:" + PORT);
  ips.forEach(ip => {
    console.log("  On the office WiFi: http://" + ip + ":" + PORT);
  });
  console.log("\n  Share the WiFi link with your team.");
  console.log("  Press Ctrl+C to stop.\n");
});
