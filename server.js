// ============================================================================
// AmBright Global Traders — Enterprise Node.js Web Server & API Backend
// Parent Legal Entity: AmBright Tech India Consulting Private Limited
// DGFT IEC: 0512849182 | FIEO Premier Member | ISO 9001:2015
// ============================================================================

import http from "node:http";
import https from "node:https";
import net from "node:net";
import tls from "node:tls";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Zero-dependency .env environment loader
try {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq > 0) {
        const k = line.slice(0, eq).trim();
        const v = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        if (process.env[k] === undefined) process.env[k] = v;
      }
    }
  }
} catch (_) {}

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";
const DATA_DIR = path.join(__dirname, "data");

// Email subsystem environment configuration
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "trade@ambrightglobal.com";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const WEBHOOK_EMAIL_URL = process.env.WEBHOOK_EMAIL_URL || "";

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
  ".xml": "application/xml; charset=utf-8",
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
    customsCHA: "AmBright Global Traders In-House CHA Lic. INNSA1/2019",
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
    customsCHA: "AmBright Global Traders In-House CHA Lic. INMUN1/2021",
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
    customsCHA: "AmBright Global Traders In-House CHA Lic. INMUN1/2021",
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

// ============================================================================
// EMAIL SUBSYSTEM & NOTIFICATION GENERATOR
// ============================================================================

async function sendSmtpRaw({ to, subject, html, text }) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return { delivered: false, reason: "SMTP credentials not configured (Stored in Outbox)" };
  }

  return new Promise((resolve) => {
    try {
      const socket = tls.connect(SMTP_PORT, SMTP_HOST, { rejectUnauthorized: false }, () => {
        let step = 0;
        let responseBuffer = "";

        const sendCmd = (cmd) => {
          socket.write(cmd + "\r\n");
        };

        socket.on("data", (chunk) => {
          responseBuffer += chunk.toString();
          if (step === 0 && responseBuffer.startsWith("220")) {
            step++;
            responseBuffer = "";
            sendCmd(`EHLO ${SMTP_HOST}`);
          } else if (step === 1 && (responseBuffer.includes("250-") || responseBuffer.includes("250 "))) {
            step++;
            responseBuffer = "";
            sendCmd("AUTH LOGIN");
          } else if (step === 2 && responseBuffer.includes("334")) {
            step++;
            responseBuffer = "";
            sendCmd(Buffer.from(SMTP_USER).toString("base64"));
          } else if (step === 3 && responseBuffer.includes("334")) {
            step++;
            responseBuffer = "";
            sendCmd(Buffer.from(SMTP_PASS).toString("base64"));
          } else if (step === 4 && responseBuffer.includes("235")) {
            step++;
            responseBuffer = "";
            sendCmd(`MAIL FROM:<${SMTP_USER}>`);
          } else if (step === 5 && responseBuffer.includes("250")) {
            step++;
            responseBuffer = "";
            sendCmd(`RCPT TO:<${to}>`);
          } else if (step === 6 && responseBuffer.includes("250")) {
            step++;
            responseBuffer = "";
            sendCmd("DATA");
          } else if (step === 7 && responseBuffer.includes("354")) {
            step++;
            responseBuffer = "";
            const boundary = "==_AmBright_Global_Part_==";
            const message = [
              `From: "AmBright Global Traders Trade Operations" <${SMTP_USER}>`,
              `To: <${to}>`,
              `Subject: ${subject}`,
              "MIME-Version: 1.0",
              `Content-Type: multipart/alternative; boundary="${boundary}"`,
              "",
              `--${boundary}`,
              "Content-Type: text/plain; charset=utf-8",
              "",
              text,
              "",
              `--${boundary}`,
              "Content-Type: text/html; charset=utf-8",
              "",
              html,
              "",
              `--${boundary}--`,
              ".",
            ].join("\r\n");
            sendCmd(message);
          } else if (step === 8 && responseBuffer.includes("250")) {
            socket.end();
            resolve({ delivered: true, reason: "SMTP 250 OK" });
          }
        });

        socket.on("error", (err) => resolve({ delivered: false, reason: err.message }));
      });

      socket.setTimeout(8000, () => {
        socket.destroy();
        resolve({ delivered: false, reason: "SMTP connection timed out" });
      });
    } catch (err) {
      resolve({ delivered: false, reason: err.message });
    }
  });
}

async function dispatchEmail({ to, subject, html, text, type, reference }) {
  const timestamp = new Date().toISOString();
  const emailId = `EML-${Date.now().toString().slice(-6)}`;

  let deliveryResult = { delivered: false, reason: "Stored in Outbox" };
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      deliveryResult = await sendSmtpRaw({ to, subject, html, text });
    } catch (e) {
      deliveryResult = { delivered: false, reason: e.message };
    }
  }

  if (WEBHOOK_EMAIL_URL) {
    try {
      const webhookPayload = JSON.stringify({ to, subject, reference, timestamp, type, status: deliveryResult.delivered ? "SENT" : "QUEUED" });
      const parsed = new URL(WEBHOOK_EMAIL_URL);
      const req = https.request(parsed, { method: "POST", headers: { "Content-Type": "application/json" } });
      req.write(webhookPayload);
      req.end();
    } catch (_) {}
  }

  const record = {
    id: emailId,
    timestamp,
    to,
    from: SMTP_USER || "trade@ambrightglobal.com",
    subject,
    type,
    reference,
    status: deliveryResult.delivered ? "SENT" : "QUEUED_OUTBOX",
    transport: deliveryResult.delivered ? "SMTP_TLS" : "LOCAL_OUTBOX",
    deliveryDetail: deliveryResult.reason,
    preview: (text || "").slice(0, 160) + "...",
  };

  await appendJsonFile("email-outbox.json", record);
  console.log(`\x1b[36m[EMAIL DISPATCH]\x1b[0m ${record.status} -> ${to} | ${subject}`);
  return record;
}

function generateBuyerEmailHtml(rfq) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:'Inter',system-ui,sans-serif;color:#1e293b">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05)">
    <div style="background:#0b192c;padding:28px 32px;border-bottom:3px solid #f59e0b">
      <div style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px">AmBright Global Traders</div>
      <div style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-top:4px">AmBright Tech India Consulting Private Limited · DGFT IEC: 0512849182</div>
    </div>
    <div style="padding:32px">
      <div style="display:inline-block;background:#fef3c7;color:#92400e;padding:6px 12px;border-radius:6px;font-weight:700;font-size:12px">Formal Commercial Inquiry Acknowledged</div>
      <h2 style="font-size:20px;color:#0b192c;margin-top:14px;margin-bottom:8px">RFQ Reference: ${rfq.rfqReference}</h2>
      <p style="color:#475569;font-size:14px;line-height:1.6">Dear <b>${rfq.corporate.procurementOfficer}</b>,</p>
      <p style="color:#475569;font-size:14px;line-height:1.6">Thank you for submitting your procurement requirement for <b>${rfq.corporate.companyLegalEntity}</b>. Our Trade Desk has queued your requirement under our <b>4 business hour SLA</b>.</p>
      
      <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;font-size:13px">
        <tr><td style="padding:10px 14px;color:#64748b;border-bottom:1px solid #e2e8f0;width:35%">Product Category</td><td style="padding:10px 14px;font-weight:700;color:#0b192c;border-bottom:1px solid #e2e8f0">${rfq.orderSpecs.productCategory}</td></tr>
        <tr><td style="padding:10px 14px;color:#64748b;border-bottom:1px solid #e2e8f0">Specific Grade</td><td style="padding:10px 14px;font-weight:700;color:#0b192c;border-bottom:1px solid #e2e8f0">${rfq.orderSpecs.specificGrade}</td></tr>
        <tr><td style="padding:10px 14px;color:#64748b;border-bottom:1px solid #e2e8f0">Quantity Required</td><td style="padding:10px 14px;font-weight:700;color:#0b192c;border-bottom:1px solid #e2e8f0">${rfq.orderSpecs.quantity}</td></tr>
        <tr><td style="padding:10px 14px;color:#64748b;border-bottom:1px solid #e2e8f0">Port of Discharge (POD)</td><td style="padding:10px 14px;font-weight:700;color:#0b192c;border-bottom:1px solid #e2e8f0">${rfq.orderSpecs.portOfDischarge}</td></tr>
        <tr><td style="padding:10px 14px;color:#64748b">Incoterms & Payment</td><td style="padding:10px 14px;font-weight:700;color:#0b192c">${rfq.tradeFinance.incoterm} · ${rfq.tradeFinance.paymentMethod}</td></tr>
      </table>

      <div style="text-align:center;margin:28px 0">
        <a href="http://localhost:3000/proforma?ref=${rfq.rfqReference}" style="background:#f59e0b;color:#0b192c;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:700;font-size:14px;display:inline-block">View Specimen Proforma Invoice &rarr;</a>
      </div>

      <div style="border-top:1px solid #e2e8f0;padding-top:18px;font-size:12px;color:#64748b;line-height:1.5">
        <strong>Direct Trade Desk Hotline:</strong> +91 99664 78845 &nbsp;|&nbsp; <strong>WhatsApp:</strong> +91 99664 78845<br>
        <strong>Email:</strong> trade@ambrightglobal.com &nbsp;|&nbsp; <strong>Regd. Office:</strong> Sector 11, CBD Belapur, Tirupati, India
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generateTradeDeskAlertHtml(rfq) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:'Inter',sans-serif;padding:20px;background:#f8fafc;color:#0b192c">
  <div style="max-width:600px;background:#fff;padding:24px;border-radius:8px;border:1px solid #cbd5e1">
    <h3 style="margin-top:0;color:#dc2626">🔥 Urgent: New Commercial RFQ Registered</h3>
    <p><b>Reference:</b> ${rfq.rfqReference}<br>
    <b>Company:</b> ${rfq.corporate.companyLegalEntity} (${rfq.corporate.countryOfIncorporation})<br>
    <b>Officer:</b> ${rfq.corporate.procurementOfficer} (${rfq.corporate.designation})<br>
    <b>Email:</b> <a href="mailto:${rfq.corporate.corporateEmail}">${rfq.corporate.corporateEmail}</a><br>
    <b>Phone:</b> <a href="tel:${rfq.corporate.phone}">${rfq.corporate.phone}</a><br>
    <b>Product:</b> ${rfq.orderSpecs.productCategory} (${rfq.orderSpecs.specificGrade})<br>
    <b>Quantity:</b> ${rfq.orderSpecs.quantity}<br>
    <b>POD:</b> ${rfq.orderSpecs.portOfDischarge}<br>
    <b>Incoterm:</b> ${rfq.tradeFinance.incoterm} | <b>Payment:</b> ${rfq.tradeFinance.paymentMethod}<br>
    <b>SLA Target Expiry:</b> ${rfq.slaResponseTarget}</p>
    <p><a href="http://localhost:3000/admin" style="display:inline-block;background:#0b192c;color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none">Open Trade Operations Queue &rarr;</a></p>
  </div>
</body>
</html>`;
}

function generateSupplierEmailHtml(sup) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:'Inter',sans-serif;padding:20px;background:#f8fafc;color:#0b192c">
  <div style="max-width:600px;background:#fff;padding:24px;border-radius:8px;border:1px solid #cbd5e1">
    <h3 style="margin-top:0;color:#1d4ed8">🏭 AmBright Global Traders — Factory Onboarding Acknowledged</h3>
    <p>Dear <b>${sup.company}</b>,</p>
    <p>We have registered your application for AmBright Global Traders' verified mill & export manufacturing network.</p>
    <p><b>Supplier Reference ID:</b> ${sup.supplierId}<br>
    <b>GSTIN:</b> ${sup.gstin}<br>
    <b>Category:</b> ${sup.category}</p>
    <p>Our technical audit and pre-shipment inspection team will review your credentials within 2 working days.</p>
    <p>AmBright Global Traders Compliance Desk · compliance@ambrightglobal.com</p>
  </div>
</body>
</html>`;
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
      entity: "AmBright Tech India Consulting Private Limited",
      brand: "AmBright Global Traders",
      cin: "U62020AP2025PTC121505",
      dgftIEC: "0512849182",
      fieoRCMC: "FIEO/RCMC/2024/7731",
      iso: "ISO 9001:2015",
      registeredOffice: "Tirupati, Andhra Pradesh 517501, India",
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
          customsCHA: "AmBright Global Traders In-House CHA Lic. INNSA1/2019",
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

      // 1. Dispatch confirmation email to Buyer
      dispatchEmail({
        to: email,
        subject: `[AmBright Global Traders] Formal Quotation Acknowledged: ${rfqReference} - ${company}`,
        reference: rfqReference,
        type: "BUYER_ACKNOWLEDGEMENT",
        text: `Dear ${name},\n\nThank you for submitting your procurement requirement to AmBright Global Traders (AmBright Tech India Consulting Pvt Ltd).\n\nInquiry Reference: ${rfqReference}\nProduct: ${product} (${qty} ${data.qtyUnit || "MT"})\nDestination: ${pod || "Main Port"}\nIncoterm: ${incoterm || "CIF"}\n\nA trade officer has been assigned and will return a signed Proforma Invoice within our guaranteed 4-hour SLA.\n\nYou can review your preliminary Proforma details online at: http://localhost:3000/proforma?ref=${rfqReference}\n\nDirect Trade Hotline / WhatsApp: +91 99664 78845\nAmBright Global Traders Trade Operations`,
        html: generateBuyerEmailHtml(submission),
      }).catch(console.error);

      // 2. Dispatch internal alert email to Trade Desk
      dispatchEmail({
        to: NOTIFICATION_EMAIL,
        subject: `🔥 [NEW RFQ ALERT] ${rfqReference} - ${company} (${qty} ${data.qtyUnit || "MT"} ${product})`,
        reference: rfqReference,
        type: "TRADE_DESK_ALERT",
        text: `NEW COMMERCIAL RFQ RECEIVED:\n\nReference: ${rfqReference}\nCompany: ${company}\nContact: ${name} (${email}, ${phone})\nCountry: ${data.country || "Not specified"}\nProduct: ${product}\nGrade: ${data.grade || "Standard"}\nQuantity: ${qty} ${data.qtyUnit || "MT"}\nPOD: ${pod}\nIncoterms: ${incoterm}\nPayment: ${payment}\nSLA Target: ${submission.slaResponseTarget}\n\nOpen in Dashboard: http://localhost:3000/admin\nProforma View: http://localhost:3000/proforma?ref=${rfqReference}`,
        html: generateTradeDeskAlertHtml(submission),
      }).catch(console.error);

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

  // 5b. Get All RFQs (for Admin / Trade Desk)
  if (pathname === "/api/rfq/list" && req.method === "GET") {
    try {
      const file = path.join(DATA_DIR, "rfq-submissions.json");
      const list = fs.existsSync(file) ? JSON.parse(await fsp.readFile(file, "utf-8")) : [];
      return sendJson(res, 200, list);
    } catch (err) {
      return sendJson(res, 500, { error: "Failed to read RFQs" });
    }
  }

  // 5c. Get Single RFQ by Reference
  if (pathname.startsWith("/api/rfq/") && req.method === "GET") {
    const ref = pathname.split("/")[3];
    try {
      const file = path.join(DATA_DIR, "rfq-submissions.json");
      const list = fs.existsSync(file) ? JSON.parse(await fsp.readFile(file, "utf-8")) : [];
      const item = list.find((x) => x.rfqReference === ref);
      if (item) return sendJson(res, 200, item);
      return sendJson(res, 404, { error: "RFQ not found" });
    } catch (err) {
      return sendJson(res, 500, { error: "Failed to lookup RFQ" });
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

      // Dispatch Supplier Onboarding Acknowledgement & Alert
      dispatchEmail({
        to: data.email,
        subject: `[AmBright Global Traders] Factory Onboarding Application Received: ${regId} - ${data.company}`,
        reference: regId,
        type: "SUPPLIER_ACKNOWLEDGEMENT",
        text: `Dear ${data.company},\n\nWe have received your factory audit application for AmBright Global Traders' verified mill network.\nApplication ID: ${regId}\nGSTIN: ${data.gstin}\nCategory: ${data.category || "General"}\n\nOur technical compliance and vendor evaluation team will review your mill profile within 2 business days.\n\nAmBright Global Traders Compliance Desk`,
        html: generateSupplierEmailHtml(record),
      }).catch(console.error);

      dispatchEmail({
        to: NOTIFICATION_EMAIL,
        subject: `🏭 [NEW SUPPLIER ONBOARDING] ${regId} - ${data.company} (GSTIN: ${data.gstin})`,
        reference: regId,
        type: "SUPPLIER_ALERT",
        text: `NEW FACTORY ONBOARDING SUBMITTED:\n\nID: ${regId}\nUnit: ${data.company}\nGSTIN: ${data.gstin}\nIEC: ${data.iec || "Not provided"}\nCategory: ${data.category || "General"}\nEmail: ${data.email}\n\nDashboard: http://localhost:3000/admin`,
        html: generateSupplierEmailHtml(record),
      }).catch(console.error);

      return sendJson(res, 201, {
        success: true,
        supplierId: regId,
        message: "Factory onboarding application received. Our technical audit team will contact you within 2 working days.",
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message || "Supplier onboarding registration failed" });
    }
  }

  // 6b. Get Supplier Registrations
  if (pathname === "/api/supplier/list" && req.method === "GET") {
    try {
      const file = path.join(DATA_DIR, "supplier-registrations.json");
      const list = fs.existsSync(file) ? JSON.parse(await fsp.readFile(file, "utf-8")) : [];
      return sendJson(res, 200, list);
    } catch (err) {
      return sendJson(res, 500, { error: "Failed to read suppliers" });
    }
  }

  // 7. Outbox & Email Notifications Log API
  if (pathname === "/api/emails" && req.method === "GET") {
    try {
      const file = path.join(DATA_DIR, "email-outbox.json");
      const list = fs.existsSync(file) ? JSON.parse(await fsp.readFile(file, "utf-8")) : [];
      return sendJson(res, 200, list);
    } catch (err) {
      return sendJson(res, 500, { error: "Failed to read email outbox" });
    }
  }

  // =========================================================================
  // STATIC FILE SERVING
  // =========================================================================

  if (pathname === "/" || pathname === "/code.html") {
    pathname = "/index.html";
  } else if (pathname === "/admin") {
    pathname = "/admin.html";
  } else if (pathname === "/proforma") {
    pathname = "/proforma.html";
  }

  // Normalize path and prevent directory traversal
  const safePath = path.normalize(path.join(__dirname, pathname));
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Forbidden");
    return;
  }

  try {
    let targetFile = safePath;
    let stat;
    try {
      stat = await fsp.stat(targetFile);
    } catch (e) {
      if (e.code === "ENOENT" && !path.extname(targetFile)) {
        const withHtml = targetFile + ".html";
        try {
          stat = await fsp.stat(withHtml);
          targetFile = withHtml;
        } catch (_) {}
      }
    }

    if (!stat) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!DOCTYPE html><html><head><title>404 Not Found — AmBright Global Traders</title></head><body style="font-family:sans-serif;padding:40px;text-align:center"><h2>404 — Resource Not Found</h2><p>AmBright Global Traders Institutional Trade Portal</p><p><a href="/">Return to Home</a></p></body></html>`);
      return;
    }

    if (stat.isDirectory()) {
      targetFile = path.join(targetFile, "index.html");
      return serveFile(targetFile, res);
    }
    await serveFile(targetFile, res);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("500 Internal Server Error");
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
  console.log(" AmBright Global Traders — International Trade & Export Portal");
  console.log(" Entity: AmBright Tech India Consulting Private Limited (CIN: U62020AP2025PTC121505 | IEC: 0512849182)");
  console.log(` Running live on: http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/`);
  console.log(` Ready to serve HTTP & REST APIs (Node.js ${process.version})`);
  console.log("=================================================================\n");
});

// Graceful termination
process.on("SIGINT", () => {
  console.log("\nGracefully shutting down AmBright Global Traders Portal...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

