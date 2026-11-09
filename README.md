# AmBright Global — International B2B Trade & Export Portal
**Merchant Export Division of Ambright Technologies India Private Limited**  
*DGFT IEC Certified (0512849182) • FIEO Premier Member • ISO 9001:2015*

---

## 🚀 Quick Start with Node.js

This portal includes a zero-dependency, modern Node.js backend (`server.js`) that serves the responsive web application and handles REST API requests (RFQ processing, freight calculation, BL tracking, and bonded warehouse inventory).

### 1. Run the Server
```bash
# Start the production server
npm start

# Or with live reload
npm run dev

# Or directly with node
node server.js
```

The portal will be live at **`http://localhost:3000/`**.

---

## 📁 Project Structure

```
AmBrightGlobal/
├── index.html            # Main enterprise single-page portal
├── code.html             # Synced standalone preview template
├── server.js             # High-performance Node.js HTTP server & API backend
├── package.json          # Node.js project manifest & scripts
├── assets/
│   ├── styles.css        # Maritime & global commerce design system
│   └── app.js           # Client-side reactivity, interactive tools, & API client
├── data/                 # Server-side persistent storage
│   ├── rfq-submissions.json          # Stored commercial RFQ inquiries
│   └── supplier-registrations.json   # Stored supplier onboarding audits
└── README.md             # Documentation & deployment guide
```

---

## 🔌 Built-in Node.js API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` or `/index.html` | `GET` | Serves the enterprise web portal |
| `/api/health` | `GET` | Health check & statutory entity metadata |
| `/api/inventory` | `GET` | Real-time bonded warehouse stock & sailing cutoffs |
| `/api/calculate` | `POST` | Instant ocean freight, origin charges, and marine insurance calculation |
| `/api/track/:id` | `GET` | Real-time Bill of Lading (BL) & Container consignment tracking |
| `/api/rfq` | `POST` | Validates & registers commercial RFQs, storing to `data/rfq-submissions.json` |
| `/api/supplier` | `POST` | Processes supplier onboarding audit applications |

---

## 🛠️ Key Portal Features

1. **Spot Freight & Vessel Calculator**: Instant quotes for 5 sectors across Rotterdam, Jebel Ali, Hamburg, Houston, New York, and Singapore under FOB, CIF, or CFR Incoterms.
2. **Multi-Currency & Price Basis Engine**: Toggle between `$ USD`, `€ EUR`, `د.إ AED`, `£ GBP`, `₹ INR` and FOB/CIF price bases.
3. **Enterprise RFQ Desk**: 3-step structured quotation wizard with 4-hour SLA guarantee, auto-saved drafts, and file dropzone.
4. **Live Consignment & BL Tracker**: Milestones from Indian Seaport Customs to POD Discharge with AIS telemetry.
5. **Incoterms® 2020 Responsibility Matrix**: Interactive comparison of seller vs. buyer obligations.
6. **Certificate of Analysis (COA) Dossier**: SGS/Intertek accredited laboratory inspection preview.

