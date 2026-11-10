# AmBright Global — International B2B Trade & Export Portal
**Merchant Export Division of AmBright Tech India Consulting Private Limited**  
*Corporate Identity Number (CIN): U62020AP2025PTC121505 • DGFT IEC: 0512849182 • FIEO Premier Member • ISO 9001:2015*  
*Direct Trade Desk & WhatsApp Hotline: +91 99664 78845*

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
├── index.html            # Main enterprise single-page portal (SEO-optimised, Schema.org)
├── code.html             # Synced standalone preview template
├── admin.html            # Trade Desk Operations Console & RFQ Queue
├── proforma.html         # Printable Export Proforma Invoice Generator (@media print)
├── server.js             # High-performance Node.js HTTP server & API backend
├── robots.txt            # Crawler exclusion directives & sitemap reference
├── sitemap.xml           # XML Sitemap with hreflang alternates
├── package.json          # Node.js project manifest & scripts
├── assets/
│   ├── styles.css        # Maritime & global commerce design system
│   ├── app.js           # Client-side reactivity, interactive tools, & API client
│   └── og-image.png      # 1200x630 high-resolution social sharing preview card
├── data/                 # Server-side persistent storage
│   ├── rfq-submissions.json          # Stored commercial RFQ inquiries
│   └── supplier-registrations.json   # Stored supplier onboarding audits
└── README.md             # Documentation & deployment guide
```

---

## 🔌 Built-in Routes & API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` or `/index.html` | `GET` | Serves the enterprise web portal |
| `/admin` | `GET` | Trade Desk Operations Console (RFQ queue & SLA monitor) |
| `/proforma` | `GET` | Commercial Proforma Invoice Desk with print stylesheet |
| `/robots.txt` | `GET` | Crawler indexing directives |
| `/sitemap.xml` | `GET` | XML Sitemap for search engines |
| `/api/health` | `GET` | Health check & statutory entity metadata |
| `/api/inventory` | `GET` | Real-time bonded warehouse stock & sailing cutoffs |
| `/api/calculate` | `POST` | Instant ocean freight, origin charges, and marine insurance calculation |
| `/api/track/:id` | `GET` | Real-time Bill of Lading (BL) & Container consignment tracking |
| `/api/rfq` | `POST` | Validates & registers commercial RFQs, storing to `data/rfq-submissions.json` |
| `/api/rfq/list` | `GET` | Lists recent RFQ submissions for the Trade Desk Console |
| `/api/supplier` | `POST` | Processes supplier onboarding audit applications |
| `/api/supplier/list`| `GET` | Lists registered suppliers for procurement desk |

---

## 🛠️ Key Portal Features

1. **Spot Freight & Vessel Calculator**: Instant quotes for 5 sectors across Rotterdam, Jebel Ali, Hamburg, Houston, New York, and Singapore under FOB, CIF, or CFR Incoterms.
2. **Multi-Currency & Price Basis Engine**: Toggle between `$ USD`, `€ EUR`, `د.إ AED`, `£ GBP`, `₹ INR` and FOB/CIF price bases.
3. **Enterprise RFQ Desk**: 3-step structured quotation wizard with 4-hour SLA guarantee, auto-saved drafts, and file dropzone.
4. **Live Consignment & BL Tracker**: Milestones from Indian Seaport Customs to POD Discharge with AIS telemetry and interactive SVG routing.
5. **Trade Desk Console (`/admin`)**: Operations dashboard tracking incoming buyer RFQs, buyer KYC status, and factory supplier onboarding.
6. **Commercial Proforma Desk (`/proforma`)**: Auto-populated Proforma Invoice with bank SWIFT remittance instructions, ISO digital seal, and print formatting.
7. **Complete SEO & Accessibility**: Schema.org JSON-LD `Corporation` + `OfferCatalog`, 0 broken links, valid OpenGraph, Twitter Cards, and `sitemap.xml`.
8. **Incoterms® 2020 Compliance**: Standardized trade terms referencing the International Chamber of Commerce (ICC) trademark guidelines.

---

## 📞 Corporate Entity & Compliance

- **Parent Company**: AmBright Tech India Consulting Private Limited
- **Division**: AmBright Global (Merchant Export Division)
- **Corporate Identity Number (CIN)**: `U62020AP2025PTC121505` (Ministry of Corporate Affairs, RoC Andhra Pradesh)
- **DGFT IEC**: `0512849182`
- **FIEO Premier Member**: `FIEO/RCMC/2024/7731`
- **Quality Standard**: ISO 9001:2015 QMS
- **Registered Office**: Tirupati, Andhra Pradesh 517501, India
- **Direct Phone / WhatsApp Hotline**: `+91-9966478845`
- **Email**: `trade@ambrightglobal.com` | `escrow@ambrightglobal.com`
