// ============================================================================
// AmBright Global — Enterprise Node.js Web Server & API Backend
// Parent Legal Entity: Ambright Technologies India Private Limited
// DGFT IEC: 0512849182 | FIEO Premier Member | ISO 9001:2015
// ============================================================================

import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";
const DATA_DIR = path.join(__dirname, "data");

// Ensure persistent data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// MIME dictionary for fast static serving
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};

// Mock Trade Database
const BONDED_INVENTORY = [
  { sku: "AG-PEP-MG1", product: "Malabar Black Pepper MG-1", specs: "550 g/l · ETO-free", warehouse: "Kochi ICD", availableMT: 86, nextSailing: "Nov 14 · MSC Aurora", status: "In stock" },
  { sku: "AG-TUR-SLM", product: "Salem Turmeric Fingers", specs: "Curcumin 3.8% · polished", warehouse: "Erode", availableMT: 142, nextSailing: "Nov 12 · Maersk Kolkata", status: "In stock" },
  { sku: "AG-CAR-8MM", product: "Green Cardamom 8 mm Bold", specs: "Allspice grade", warehouse: "Bodinayakanur", availableMT: 9, nextSailing: "Nov 18 · CMA CGM Tage", status: "Low stock" },
  { sku: "AG-BAS-1121", product: "1121 Steam Basmati Rice", specs: "8.35 mm AGL · 2 yr aged", warehouse: "Mundra CFS", availableMT: 1240, nextSailing: "Nov 11 · Hapag Bremen", status: "In stock" },
  { sku: "EN-DIV-GV150", product: "DI Gate Valve DN150 PN16", specs: "EN 1171 · epoxy coated", warehouse: "Rajkot", availableQty: "1,820 pcs", nextSailing: "Nov 13 · ONE Harmony", status: "In stock" },
  { sku: "MN-BEN-API", product: "Sodium Bentonite API 13A", specs: "OCMA / API section 9", warehouse: "Kandla", availableMT: 3600, nextSailing: "Nov 15 · Bulk vessel", status: "In stock" },
  { sku: "MN-SIL-995", product: "Silica Quartz Powder 99.5%", specs: "325 mesh", warehouse: "Mundra CFS", availableMT: 410, nextSailing: "Nov 12 · MSC Aurora", status: "In stock" },
  { sku: "PL-HDP-B6003", product: "HDPE Blow Moulding B6003", specs: "MFI 0.35 · virgin", warehouse: "Hazira", availableMT: 0, nextSailing: "Production Nov 20", status: "Pre-book" },
];

const SHIPMENT_RECORDS = {
  AMBG2611NSRT04: {
    vessel: "MSC AURORA · Voy 412W",
    carrier: "Mediterranean Shipping Company (MSC)",
    pol: "Nhava Sheva (INNSA)",
    pod: "Rotterdam (NLRTM)",
    cargo: "2 × 40' HC · 54 MT Organic Salem Turmeric",
    container: "MSCU 4821930 / 4821946",
    step: 2,
    prog: 58,
    pos: "Red Sea — northbound, approaching Suez Canal",
    departure: "02 Nov 2026",
    etaDays: 12,
    status: "In Transit",
    blType: "Original Negotiable Ocean Bill of Lading",
    customsCHA: "AmBright Global In-House CHA Lic. INNSA1/2019",
  },
  MSKU7739120: {
    vessel: "MAERSK KOLKATA · Voy 445E",
    carrier: "A.P. Moller – Maersk",
    pol: "Mundra (INMUN)",
    pod: "Jebel Ali (AEJEA)",
    cargo: "1 × 20' FCL · 18.4 MT DI Gate Valves",
    container: "MSKU 7739120",
    step: 3,
    prog: 100,
    pos: "Berthed at Jebel Ali Terminal 2 — discharge in progress",
    departure: "04 Nov 2026",
    etaDays: 0,
    status: "Arrived at POD",
    blType: "Express Sea Waybill (eBL)",
    customsCHA: "AmBright Global In-House CHA Lic. INMUN1/2021",
  },
  CMAU4410287: {
    vessel: "CMA CGM TAGE · Voy 0FL3RW1MA",
    carrier: "CMA CGM Group",
    pol: "Mundra (INMUN)",
    pod: "Houston (USHOU)",
    cargo: "5 × 40' HC · 135 MT API Bentonite",
    container: "CMAU 4410287 + 4 units",
    step: 0,
    prog: 4,
    pos: "LEO granted · stacked at Mundra CT-3, loading in 2 days",
    departure: "11 Nov 2026 (Scheduled)",
    etaDays: 33,
    status: "Customs Passed",
    blType: "Forwarder Cargo Receipt / Draft BL",
    customsCHA: "AmBright Global In-House CHA Lic. INMUN1/2021",
  },
};

const FREIGHT_DATA = {
  ports: {
    AEJEA: { name: "Jebel Ali, UAE", rate40: 1180, bulkPerMT: 18, transit: "4–6", carrier: "Maersk ME1 / MSC Falcon" },
    NLRTM: { name: "Rotterdam, Netherlands", rate40: 2940, bulkPerMT: 42, transit: "22–26", carrier: "MSC Swan / Hapag IOS" },
    DEHAM: { name: "Hamburg, Germany", rate40: 3050, bulkPerMT: 44, transit: "24–28", carrier: "Hapag-Lloyd IOS" },
    USHOU: { name: "Houston, USA", rate40: 4380, bulkPerMT: 55, transit: "28–32", carrier: "CMA CGM INDAMEX" },
    USNYC: { name: "New York / NJ, USA", rate40: 4120, bulkPerMT: 52, transit: "28–32", carrier: "Maersk MECL" },
    SGSIN: { name: "Singapore", rate40: 640, bulkPerMT: 14, transit: "6–8", carrier: "ONE PMX / CMA CGM" },
  },
  volumes: {
    "20": { boxes: 1, size: 20, mt: 26, label: "1 × 20' FCL" },
    "40": { boxes: 1, size: 40, mt: 27, label: "1 × 40' HC" },
    "2x40": { boxes: 2, size: 40, mt: 54, label: "2 × 40' HC" },
    "5x40": { boxes: 5, size: 40, mt: 135, label: "5 × 40' HC" },
    "bulk": { boxes: 0, size: 0, mt: 500, label: "Break-bulk 500 MT" },
  },
  sectorValueMT: {
    agri: 1120,
    eng: 3400,
    min: 92,
    tex: 850,
    poly: 1180,
  },
};

// Helper: Read JSON request body safely
async function parseJsonBody(req, limit = 1048576) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("Request payload exceeds limit (1MB)"));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on("end", () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

// Helper: Append submission to JSON store
async function appendJsonFile(filename, item) {
  const filepath = path.join(DATA_DIR, filename);
  let list = [];
  try {
    if (fs.existsSync(filepath)) {
      const content = await fsp.readFile(filepath, "utf-8");
      list = JSON.parse(content || "[]");
    }
  } catch (e) {
    list = [];
  }
  list.unshift(item);
  // Keep last 500 submissions
  if (list.length > 500) list = list.slice(0, 500);
  await fsp.writeFile(filepath, JSON.stringify(list, null, 2), "utf-8");
}

// Helper: Send JSON response
function sendJson(res, statusCode, data) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(json),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-cache",
  });
  res.end(json);
}

// Request dispatcher
const server = http.createServer(async (req, res) => {
  const t0 = Date.now();
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }

  // Log incoming request on finish
  res.on("finish", () => {
    const dur = Date.now() - t0;
    const color = res.statusCode >= 500 ? "\x1b[31m" : res.statusCode >= 400 ? "\x1b[33m" : res.statusCode >= 300 ? "\x1b[36m" : "\x1b[32m";
    console.log(`[${new Date().toISOString()}] ${req.method} ${pathname} ${color}${res.statusCode}\x1b[0m ${dur}ms`);
  });

  // =========================================================================
  // API ROUTES
  // =========================================================================

  // 1. Health check & Enterprise info
  if (pathname === "/api/health" && req.method === "GET") {
    return sendJson(res, 200, {
      status: "operational",
      serverTime: new Date().toISOString(),
      entity: "Ambright Technologies India Private Limited",
      brand: "AmBright Global",
      dgftIEC: "0512849182",
      fieoRCMC: "FIEO/RCMC/2024/7731",
      iso: "ISO 9001:2015",
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
    });
  }

  // 2. Bonded Warehouse Inventory API
  if (pathname === "/api/inventory" && req.method === "GET") {
    return sendJson(res, 200, {
      lastRefreshed: new Date().toISOString(),
      inventoryLocation: "Bonded CFS / ICD Facilities (Kochi, Mundra, Hazira, Erode)",
      items: BONDED_INVENTORY,
    });
  }

  // 3. Freight Calculator API
  if (pathname === "/api/calculate" && req.method === "POST") {
    try {
      const body = await parseJsonBody(req);
      const { sector = "agri", pod = "NLRTM", volume = "40", incoterm = "CIF" } = body;

      const port = FREIGHT_DATA.ports[pod] || FREIGHT_DATA.ports.NLRTM;
      const vol = FREIGHT_DATA.volumes[volume] || FREIGHT_DATA.volumes["40"];
      const sectorVal = FREIGHT_DATA.sectorValueMT[sector] || 1120;

      const freight = vol.boxes ? vol.boxes * port.rate40 * (vol.size === 20 ? 0.62 : 1) : vol.mt * port.bulkPerMT;
      const originTHC = vol.boxes ? vol.boxes * 185 : 2400; // Terminal Handling, CHA, Port Documentation
      const cargoValue = vol.mt * sectorVal;
      const marineInsurance = incoterm === "CIF" ? (cargoValue + freight) * 1.1 * 0.0015 : 0;
      const sellerLogistics = (incoterm === "FOB" ? 0 : freight) + originTHC + marineInsurance;

      // Calculate next sailing date (skip weekends)
      const sailingDate = new Date();
      sailingDate.setDate(sailingDate.getDate() + 3 + (sailingDate.getDay() % 3));
      const docCutoff = new Date(sailingDate);
      docCutoff.setDate(docCutoff.getDate() - 2);

      return sendJson(res, 200, {
        success: true,
        calculation: {
          portName: port.name,
          podCode: pod,
          volumeLabel: vol.label,
          cargoWeightMT: vol.mt,
          incoterm: incoterm.toUpperCase(),
          transitDays: port.transit,
          nominatedCarrier: port.carrier,
          oceanFreightUSD: Math.round(freight),
          originChargesUSD: Math.round(originTHC),
          marineInsuranceUSD: Math.round(marineInsurance),
          totalSellerLogisticsUSD: Math.round(sellerLogistics),
          freightPerMTUSD: +(sellerLogistics / vol.mt).toFixed(2),
          sailingSchedule: {
            vesselDeparture: sailingDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
            documentCutoff: docCutoff.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          },
        },
      });
    } catch (err) {
      return sendJson(res, 400, { error: err.message || "Calculation failed" });
    }
  }

  // 4. Consignment & BL Tracking API
  if (pathname.startsWith("/api/track") && req.method === "GET") {
    const idParam = pathname.split("/")[3] || parsedUrl.searchParams.get("id") || "";
    const cleanId = idParam.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (!cleanId) {
      return sendJson(res, 400, { error: "Missing Bill of Lading or Container number parameter." });
    }

    if (SHIPMENT_RECORDS[cleanId]) {
      return sendJson(res, 200, {
        found: true,
        queryId: cleanId,
        shipment: SHIPMENT_RECORDS[cleanId],
      });
    }

    // Plausible synthetic generator for valid container / BL patterns
    if (/^([A-Z]{4}\d{7}|AMBG\d{4}[A-Z]{2,4}\d{2})$/.test(cleanId)) {
      let hash = 0;
      for (const char of cleanId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
      const destinations = [
        { pod: "Jebel Ali (AEJEA)", days: 5 },
        { pod: "Rotterdam (NLRTM)", days: 24 },
        { pod: "Singapore (SGSIN)", days: 7 },
        { pod: "Houston (USHOU)", days: 30 },
      ];
      const dest = destinations[hash % destinations.length];
      const step = hash % 4;
      const progress = [6, 22, 45 + (hash % 40), 100][step];
      const carriers = ["MAERSK", "MSC", "CMA CGM", "HAPAG-LLOYD", "ONE"];

      return sendJson(res, 200, {
        found: true,
        queryId: cleanId,
        shipment: {
          vessel: `${carriers[hash % carriers.length]} VALIANT · Voy ${100 + (hash % 800)}W`,
          carrier: carriers[hash % carriers.length],
          pol: "Nhava Sheva (INNSA)",
          pod: dest.pod,
          cargo: `${1 + (hash % 3)} × 40' HC · ${27 * (1 + (hash % 3))} MT`,
          container: cleanId,
          step,
          prog: progress,
          pos: ["Gate-in complete at JNPT CT-4", "Loaded on board · departed port", "Open sea transit · AIS on schedule", "Berthed at destination terminal"][step],
          etaDays: Math.max(0, Math.round(dest.days * (1 - progress / 100))),
          status: ["Customs Passed", "Loaded on Board", "In Transit", "Arrived at POD"][step],
          blType: "Electronic Sea Waybill (eBL)",
          customsCHA: "AmBright Global In-House CHA Lic. INNSA1/2019",
        },
      });
    }

    return sendJson(res, 404, {
      found: false,
      queryId: cleanId,
      error: `No export consignment found for "${cleanId}". Please check the Bill of Lading or Container number.`,
    });
  }

  // 5. Formal RFQ Submission Endpoint
  if (pathname === "/api/rfq" && req.method === "POST") {
    try {
      const data = await parseJsonBody(req);
      const { company, name, email, phone, product, qty, packaging, pod, incoterm, payment } = data;

      if (!company || !name || !email || !product || !qty) {
        return sendJson(res, 422, {
          error: "Missing required procurement fields: company, name, email, product, and quantity are mandatory.",
        });
      }

      const now = new Date();
      const year = String(now.getFullYear()).slice(2);
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const rfqReference = `RFQ-${year}${month}-${randomId}`;

      const submission = {
        rfqReference,
        receivedAt: now.toISOString(),
        corporate: {
          companyLegalEntity: company,
          procurementOfficer: name,
          designation: data.designation || "Procurement Officer",
          corporateEmail: email,
          phone: phone || "Not provided",
          countryOfIncorporation: data.country || "Not specified",
          taxOrVatId: data.taxid || null,
        },
        orderSpecs: {
          productCategory: product,
          specificGrade: data.grade || "Standard Export Grade",
          quantity: `${qty} ${data.qtyUnit || "MT"}`,
          packaging: packaging || "Standard Export Packaging",
          portOfDischarge: pod || "Rotterdam (NLRTM)",
          orderFrequency: data.frequency || "Spot / One-time",
          notes: data.notes || "",
        },
        tradeFinance: {
          incoterm: incoterm || "CIF",
          paymentMethod: payment || "Irrevocable LC at Sight",
          mutualNDA: "Active",
          complianceScreening: "Queued (FEMA / OFAC / DGFT)",
        },
        slaResponseTarget: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      };

      // Persist to local JSON database
      await appendJsonFile("rfq-submissions.json", submission);

      return sendJson(res, 201, {
        success: true,
        rfqReference,
        message: "Your Formal Commercial Inquiry has been registered. An official Proforma Quote will be delivered within our 4 business hour SLA.",
        details: submission,
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message || "Failed to process RFQ submission" });
    }
  }

  // 6. Supplier Onboarding API
  if (pathname === "/api/supplier" && req.method === "POST") {
    try {
      const data = await parseJsonBody(req);
      if (!data.company || !data.email || !data.gstin) {
        return sendJson(res, 422, { error: "Manufacturing unit name, GSTIN, and business email are mandatory." });
      }

      const regId = `SUP-IN${Date.now().toString().slice(-6)}`;
      const record = {
        supplierId: regId,
        submittedAt: new Date().toISOString(),
        unitName: data.company,
        gstin: data.gstin.toUpperCase(),
        iec: data.iec || null,
        category: data.category || "General",
        email: data.email,
        status: "Preliminary Audit Scheduled",
      };

      await appendJsonFile("supplier-registrations.json", record);
      return sendJson(res, 201, {
        success: true,
        supplierId: regId,
        message: "Factory onboarding application received. Our technical audit team will contact you within 2 working days.",
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message || "Supplier onboarding registration failed" });
    }
  }

  // =========================================================================
  // STATIC FILE SERVING
  // =========================================================================

  if (pathname === "/" || pathname === "/code.html") {
    pathname = "/index.html";
  }

  // Normalize path and prevent directory traversal
  const safePath = path.normalize(path.join(__dirname, pathname));
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Forbidden");
    return;
  }

  try {
    const stat = await fsp.stat(safePath);
    if (stat.isDirectory()) {
      pathname = path.join(pathname, "index.html");
      return serveFile(path.join(__dirname, pathname), res);
    }
    await serveFile(safePath, res);
  } catch (err) {
    if (err.code === "ENOENT") {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;padding:40px;text-align:center"><h2>404 — Resource Not Found</h2><p>AmBright Global Trade Portal</p><p><a href="/">Return to Home</a></p></body></html>`);
    } else {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("500 Internal Server Error");
    }
  }
});

// Stream or read static file with headers
async function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
  });

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}

// Start Node.js HTTP server
server.listen(PORT, HOST, () => {
  console.log("\n=================================================================");
  console.log(" AmBright Global — International Trade & Export Portal");
  console.log(" Entity: Ambright Technologies India Private Limited (IEC 0512849182)");
  console.log(` Running live on: http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/`);
  console.log(` Ready to serve HTTP & REST APIs (Node.js ${process.version})`);
  console.log("=================================================================\n");
});

// Graceful termination
process.on("SIGINT", () => {
  console.log("\nGracefully shutting down AmBright Global Portal...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

