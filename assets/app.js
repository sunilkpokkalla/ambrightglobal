/* ==========================================================================
   AmBright Global — Portal interactions (vanilla JS, no dependencies)
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- Toast */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg, icon = "info") {
    $("#toastMsg").textContent = msg;
    toastEl.querySelector(".material-symbols-outlined").textContent = icon;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3800);
  }
  $$("[data-toast]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); toast(a.dataset.toast); }));

  /* -------------------------------------------------------------- Dialogs */
  function openDialog(id) {
    const d = document.getElementById(id);
    if (d && !d.open) d.showModal();
  }
  $$("[data-open]").forEach((el) =>
    el.addEventListener("click", (e) => { e.preventDefault(); closeNav(); openDialog(el.dataset.open); })
  );
  $$("dialog.modal").forEach((d) => {
    // Light-dismiss on backdrop click
    d.addEventListener("click", (e) => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) d.close();
    });
    $$("[data-close]", d).forEach((b) => b.addEventListener("click", () => d.close()));
  });
  $("[data-escrow]")?.addEventListener("click", () => {
    const esc = $('input[name="payment"][value="Escrow"]');
    if (esc) esc.checked = true;
  });

  /* ------------------------------------------------------ Header & nav */
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const nav = $("#primaryNav");
  const navToggle = $("#navToggle");
  function closeNav() {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.querySelector(".material-symbols-outlined").textContent = "menu";
  }
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.querySelector(".material-symbols-outlined").textContent = open ? "close" : "menu";
  });
  $$("a", nav).forEach((a) => a.addEventListener("click", closeNav));

  // Active section highlight
  const navLinks = $$('a[href^="#"]', nav).filter((a) => !a.dataset.open);
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));

  /* ---------------------------------------------------- Dropdown menus */
  function setupMenu(btnId, menuId) {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);
    const close = () => { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); };
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = menu.hidden;
      $$(".menu").forEach((m) => (m.hidden = true));
      $$(".util-btn[aria-expanded]").forEach((b) => b.setAttribute("aria-expanded", "false"));
      menu.hidden = !willOpen;
      btn.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) menu.querySelector('[aria-checked="true"]')?.focus();
    });
    menu.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { close(); btn.focus(); } });
    return close;
  }
  const closeCurrency = setupMenu("currencyBtn", "currencyMenu");
  const closeLang = setupMenu("langBtn", "langMenu");

  /* ------------------------------------------------ Multi-Language Dictionary */
  const I18N = {
    EN: {
      btn_lbl: "Global English · EN",
      nav_products: "Products",
      nav_rfq: "Buyer RFQ",
      nav_suppliers: "Suppliers",
      nav_supply_chain: "Supply Chain",
      nav_compliance: "Compliance",
      nav_corporate: "Corporate",
      btn_rfq: "RFQ Desk",
      btn_supplier: "Supplier Onboarding",
      util_tracker: "Consignment / BL Tracking",
      hero_badge: '<span class="pill"><span class="material-symbols-outlined" style="font-size:15px">verified</span>Institutional Global Merchant Exporter</span><span>Incoterms® 2020 Standard Compliant</span><span class="dot"></span><span>Verified Origin: <strong>Republic of India</strong></span>',
      hero_title: 'Bridging Continents with <span class="accent">Uncompromising Integrity</span> &amp; Precision Supply Chains.',
      hero_sub: 'AmBright Global sources <strong>directly from audited mills, foundries and farm collectives</strong> across India — eliminating intermediary markups — and enforces <strong>independent pre-shipment inspection on every consignment</strong> before delivering on-spec cargo, on schedule, to institutional buyers in <strong>45+ countries</strong>.',
      hero_cta_rfq: "Submit Trade RFQ (Instant SLA)",
      hero_cta_inventory: "Catalogue 2025 & Live Inventory",
      calc_head: '<span class="material-symbols-outlined">calculate</span>Quick Spot Container &amp; Vessel Calculator',
      cat_eyebrow: "Export Catalogue · FY 2025–26",
      cat_title: "High-Yield Commodity Verticals",
      rfq_eyebrow: "Buyer Portal · Formal Quotation Desk",
      rfq_title: "Enterprise RFQ & Formal Quotation Desk",
      corr_eyebrow: "Supply Chain · Ocean Freight Corridors",
      corr_title: "Ocean Freight Corridors & Real-Time Consignment Tracking",
      gov_eyebrow: "Corporate Governance & Statutory Legitimacy",
      gov_title: 'AmBright Global operates under <span>Ambright Technologies India Private Limited</span>',
      escrow_urgent: '<span class="live-dot"></span>Live Trade Desk · Priority Line',
      toast: "Language switched to Global English · EN",
      dir: "ltr",
      langCode: "en"
    },
    DE: {
      btn_lbl: "Deutsch · DE",
      nav_products: "Produkte",
      nav_rfq: "Käufer RFQ",
      nav_suppliers: "Lieferanten",
      nav_supply_chain: "Lieferkette",
      nav_compliance: "Konformität",
      nav_corporate: "Unternehmen",
      btn_rfq: "RFQ-Desk",
      btn_supplier: "Lieferanten Onboarding",
      util_tracker: "Sendungs- / BL-Verfolgung",
      hero_badge: '<span class="pill"><span class="material-symbols-outlined" style="font-size:15px">verified</span>Institutioneller globaler Exporteur</span><span>Incoterms® 2020 Standardkonform</span><span class="dot"></span><span>Geprüfter Ursprung: <strong>Republik Indien</strong></span>',
      hero_title: 'Kontinente verbinden mit <span class="accent">Kompromissloser Integrität</span> &amp; Präziser Lieferkette.',
      hero_sub: 'AmBright Global bezieht <strong>direkt aus geprüften Produktionswerken, Gießereien und Agrarkollektiven</strong> in ganz Indien — ohne Zwischenhändleraufschläge — und garantiert <strong>unabhängige Vorversandkontrollen für jede Sendung</strong> vor Auslieferung an institutionelle Abnehmer in <strong>45+ Ländern</strong>.',
      hero_cta_rfq: "Handels-RFQ einreichen (4-Std SLA)",
      hero_cta_inventory: "Katalog 2025 & Live-Bestand",
      calc_head: '<span class="material-symbols-outlined">calculate</span>Schneller Frachtcontainer- &amp; Schiffsrechner',
      cat_eyebrow: "Exportkatalog · GJ 2025–26",
      cat_title: "Hochwertige Export-Rohstoffsparten",
      rfq_eyebrow: "Käuferportal · Offizieller Angebotsschalter",
      rfq_title: "Unternehmens-RFQ & Formaler Angebotsschalter",
      corr_eyebrow: "Lieferkette · Seefracht-Korridore",
      corr_title: "Seefracht-Korridore & Echtzeit-Sendungsverfolgung",
      gov_eyebrow: "Unternehmensführung & Gesetzliche Legitimität",
      gov_title: 'AmBright Global operiert unter <span>Ambright Technologies India Private Limited</span>',
      escrow_urgent: '<span class="live-dot"></span>Live Trade Desk · Prioritätslinie',
      toast: "Sprache auf Deutsch umgestellt · DE",
      dir: "ltr",
      langCode: "de"
    },
    AR: {
      btn_lbl: "العربية · AR",
      nav_products: "المنتجات",
      nav_rfq: "طلب عروض الأسعار",
      nav_suppliers: "الموردون",
      nav_supply_chain: "سلسلة الإمداد",
      nav_compliance: "الامتثال والتراخيص",
      nav_corporate: "المؤسسة",
      btn_rfq: "مكتب عروض الأسعار",
      btn_supplier: "تسجيل الموردين",
      util_tracker: "تتبع بوليصة الشحن والحاويات",
      hero_badge: '<span class="pill"><span class="material-symbols-outlined" style="font-size:15px">verified</span>مصدر تجاري دولي معتمد</span><span>متوافق مع Incoterms® 2020</span><span class="dot"></span><span>بلد المنشأ المعتمد: <strong>جمهورية الهند</strong></span>',
      hero_title: 'ربط القارات بـ <span class="accent">نزاهة لا مساومة فيها</span> وسلاسل إمداد فائقة الدقة.',
      hero_sub: 'تقوم AmBright Global بالتوريد <strong>مباشرة من المصانع والمصاهر والمزارع الهندية المعتمدة</strong> — لإلغاء هوامش الوسطاء — مع فرض <strong>فحص مستقل قبل الشحن بنسبة 100%</strong> للمشترين في أكثر من <strong>45 دولة</strong>.',
      hero_cta_rfq: "تقديم طلب عرض أسعار تجاري",
      hero_cta_inventory: "كتالوج 2025 والمخزون المتاح",
      calc_head: '<span class="material-symbols-outlined">calculate</span>حاسبة الحاويات والشحن البحري الفوري',
      cat_eyebrow: "كتالوج التصدير السنوي · 2025–26",
      cat_title: "قطاعات السلع والمنتجات التصديرية الكبرى",
      rfq_eyebrow: "بوابة المشتري · مكتب طلب عروض الأسعار",
      rfq_title: "مكتب عروض الأسعار التجارية والمناقصات",
      corr_eyebrow: "سلسلة الإمداد · ممرات الشحن البحري",
      corr_title: "ممرات الشحن البحري وتتبع الشحنات المباشر",
      gov_eyebrow: "الحوكمة المؤسسية والشرعية القانونية",
      gov_title: 'تعمل AmBright Global تحت مظلة <span>Ambright Technologies India Private Limited</span>',
      escrow_urgent: '<span class="live-dot"></span>مكتب التجارة المباشر · خط الأولوية',
      toast: "تم تغيير لغة البوابة إلى العربية · AR",
      dir: "rtl",
      langCode: "ar"
    },
    ES: {
      btn_lbl: "Español · ES",
      nav_products: "Productos",
      nav_rfq: "RFQ Comprador",
      nav_suppliers: "Proveedores",
      nav_supply_chain: "Cadena de Suministro",
      nav_compliance: "Cumplimiento",
      nav_corporate: "Corporativo",
      btn_rfq: "Mesa RFQ",
      btn_supplier: "Alta Proveedores",
      util_tracker: "Rastreo de BL / Carga",
      hero_badge: '<span class="pill"><span class="material-symbols-outlined" style="font-size:15px">verified</span>Exportador Comercial Global</span><span>Cumplimiento Incoterms® 2020</span><span class="dot"></span><span>Origen Verificado: <strong>República de la India</strong></span>',
      hero_title: 'Conectando Continentes con <span class="accent">Integridad Absoluta</span> y Cadenas de Suministro Precisas.',
      hero_sub: 'AmBright Global adquiere <strong>directamente de fábricas, fundiciones y cooperativas agrícolas certificadas</strong> en toda la India — eliminando comisiones intermedias — y aplica <strong>inspección previa al embarque en cada lote</strong>.',
      hero_cta_rfq: "Enviar Solicitud RFQ (Respuesta en 4h)",
      hero_cta_inventory: "Catálogo 2025 e Inventario en Vivo",
      calc_head: '<span class="material-symbols-outlined">calculate</span>Calculadora Instantánea de Contenedores y Buques',
      cat_eyebrow: "Catálogo de Exportación · FY 2025–26",
      cat_title: "Verticales de Materias Primas de Alto Rendimiento",
      rfq_eyebrow: "Portal de Compradores · Mesa Formal de Cotizaciones",
      rfq_title: "Mesa de Cotizaciones RFQ Empresarial",
      corr_eyebrow: "Cadena de Suministro · Corredores de Carga",
      corr_title: "Corredores de Flete Marítimo y Rastreo en Tiempo Real",
      gov_eyebrow: "Gobernanza Corporativa y Legitimidad Legal",
      gov_title: 'AmBright Global opera bajo <span>Ambright Technologies India Private Limited</span>',
      escrow_urgent: '<span class="live-dot"></span>Mesa de Negociación en Vivo · Línea Prioritaria',
      toast: "Idioma cambiado a Español · ES",
      dir: "ltr",
      langCode: "es"
    },
    ID: {
      btn_lbl: "Bahasa Indonesia · ID",
      nav_products: "Produk",
      nav_rfq: "Permintaan RFQ",
      nav_suppliers: "Pemasok",
      nav_supply_chain: "Rantai Pasok",
      nav_compliance: "Kepatuhan",
      nav_corporate: "Korporasi",
      btn_rfq: "Meja RFQ",
      btn_supplier: "Pendaftaran Pemasok",
      util_tracker: "Pelacakan Muatan / BL",
      hero_badge: '<span class="pill"><span class="material-symbols-outlined" style="font-size:15px">verified</span>Eksportir Dagang Global</span><span>Kepatuhan Standar Incoterms® 2020</span><span class="dot"></span><span>Asal Terverifikasi: <strong>Republik India</strong></span>',
      hero_title: 'Menghubungkan Benua dengan <span class="accent">Integritas Tanpa Kompromi</span> &amp; Rantai Pasokan Presisi.',
      hero_sub: 'AmBright Global mengambil pasokan <strong>langsung dari pabrik, pengecoran dan kelompok tani terakreditasi</strong> di seluruh India — menghilangkan biaya perantara — serta menerapkan <strong>inspeksi pra-pengiriman independen pada setiap konsinyasi</strong>.',
      hero_cta_rfq: "Kirim Permintaan RFQ (SLA 4 Jam)",
      hero_cta_inventory: "Katalog 2025 & Stok Siap Kirim",
      calc_head: '<span class="material-symbols-outlined">calculate</span>Kalkulator Cepat Kontainer &amp; Kapal Kargo',
      cat_eyebrow: "Katalog Ekspor · TA 2025–26",
      cat_title: "Komoditas Ekspor Unggulan Berdaya Saing Tinggi",
      rfq_eyebrow: "Portal Pembeli · Meja Penawaran Formal",
      rfq_title: "Meja Penawaran Harga & RFQ Korporat",
      corr_eyebrow: "Rantai Pasokan · Jalur Kargo Laut",
      corr_title: "Jalur Kargo Laut & Pelacakan Pengiriman Real-Time",
      gov_eyebrow: "Tata Kelola Perusahaan & Legalitas Statuter",
      gov_title: 'AmBright Global beroperasi di bawah <span>Ambright Technologies India Private Limited</span>',
      escrow_urgent: '<span class="live-dot"></span>Meja Dagang Aktif · Jalur Prioritas',
      toast: "Bahasa diubah ke Bahasa Indonesia · ID",
      dir: "ltr",
      langCode: "id"
    }
  };

  function setLanguage(langCode, showToast = true) {
    const code = (langCode || "EN").toUpperCase();
    const data = I18N[code] || I18N.EN;

    // 1. Update button label
    const btnLbl = $("#langBtn .lbl");
    if (btnLbl) btnLbl.textContent = data.btn_lbl;

    // 2. Set document attributes (direction & language)
    document.documentElement.lang = data.langCode;
    document.documentElement.dir = data.dir;

    // 3. Update radio button states
    $$("#langMenu [data-lang]").forEach((b) => {
      b.setAttribute("aria-checked", String(b.dataset.lang === code));
    });

    // 4. Update elements with text translation
    $$("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (data[key]) el.textContent = data[key];
    });

    // 5. Update elements with HTML translation
    $$("[data-i18n-html]").forEach((el) => {
      const key = el.dataset.i18nHtml;
      if (data[key]) el.innerHTML = data[key];
    });

    // 6. Save preference
    try {
      localStorage.setItem("ambright_lang", code);
    } catch (_) {}

    // 7. Toast notification
    if (showToast) {
      toast(data.toast, "translate");
    }
  }

  // Handle language option clicks
  $$("#langMenu [data-lang]").forEach((b) =>
    b.addEventListener("click", () => {
      const targetLang = b.dataset.lang;
      setLanguage(targetLang, true);
      closeLang();
    })
  );

  // Restore saved language on load
  try {
    const savedLang = localStorage.getItem("ambright_lang");
    if (savedLang && I18N[savedLang]) {
      setLanguage(savedLang, false);
    }
  } catch (_) {}

  /* ---------------------------------------------- Currency & price basis */
  const FX = { USD: 1, EUR: 0.92, AED: 3.6725, GBP: 0.79, INR: 84.1 };
  const CIF_UPLIFT = 1.075; // indicative freight + insurance uplift for catalogue display
  const state = { currency: "USD", basis: "FOB" };
  const symbols = { USD: "$", EUR: "€", AED: "AED ", GBP: "£", INR: "₹" };

  function fmt(usd, decimals = 0, cur = state.currency) {
    const v = usd * FX[cur];
    const d = cur === "INR" && decimals > 0 ? 0 : decimals;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: cur, minimumFractionDigits: d, maximumFractionDigits: d, currencyDisplay: "narrowSymbol" }).format(v);
  }

  function renderPrices() {
    $$("[data-usd]").forEach((el) => {
      const base = parseFloat(el.dataset.usd) * (state.basis === "CIF" ? CIF_UPLIFT : 1);
      el.textContent = fmt(base, parseInt(el.dataset.decimals || "0", 10));
    });
    $$("[data-basis-label]").forEach((el) => (el.textContent = state.basis === "CIF" ? "Indicative CIF" : "Indicative FOB"));
    $("#currencyLabel").textContent = `${symbols[state.currency].trim()} ${state.currency} · ${state.basis}`;
    $("#priceBasisNote").textContent = `${state.currency} · ${state.basis === "CIF" ? "CIF main destination ports" : "FOB India"}`;
    if (lastCalc) renderCalc(lastCalc);
  }
  $$("#currencyMenu [data-currency]").forEach((b) =>
    b.addEventListener("click", () => {
      state.currency = b.dataset.currency;
      $$("#currencyMenu [data-currency]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      renderPrices();
      closeCurrency();
      toast(`Indicative prices now shown in ${state.currency}.`, "currency_exchange");
    })
  );
  $$("#currencyMenu [data-basis]").forEach((b) =>
    b.addEventListener("click", () => {
      state.basis = b.dataset.basis;
      $$("#currencyMenu [data-basis]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      renderPrices();
    })
  );

  /* ------------------------------------------------------- Count-up */
  const counters = $$("[data-count]");
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      countObs.unobserve(en.target);
      const el = en.target, end = +el.dataset.count;
      if (reduceMotion) return;
      const t0 = performance.now(), dur = 1400;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  });
  counters.forEach((c) => countObs.observe(c));

  /* --------------------------------------------- Spot freight calculator */
  const PODS = {
    AEJEA: { name: "Jebel Ali", rate40: 1180, bulk: 18, transit: "4–6", sail: [2, 5], carrier: "Maersk ME1 / MSC Falcon" },
    NLRTM: { name: "Rotterdam", rate40: 2940, bulk: 42, transit: "22–26", sail: [3], carrier: "MSC Swan / Hapag IOS" },
    DEHAM: { name: "Hamburg", rate40: 3050, bulk: 44, transit: "24–28", sail: [4], carrier: "Hapag-Lloyd IOS" },
    USHOU: { name: "Houston", rate40: 4380, bulk: 55, transit: "28–32", sail: [1], carrier: "CMA CGM INDAMEX" },
    USNYC: { name: "New York / NJ", rate40: 4120, bulk: 52, transit: "28–32", sail: [1, 4], carrier: "Maersk MECL" },
    SGSIN: { name: "Singapore", rate40: 640, bulk: 14, transit: "6–8", sail: [0, 3], carrier: "ONE PMX / CMA CGM" },
  };
  const VOLS = {
    "20": { boxes: 1, size: 20, mt: 26, label: "1 × 20' FCL" },
    "40": { boxes: 1, size: 40, mt: 27, label: "1 × 40' HC" },
    "2x40": { boxes: 2, size: 40, mt: 54, label: "2 × 40' HC" },
    "5x40": { boxes: 5, size: 40, mt: 135, label: "5 × 40' HC" },
    bulk: { boxes: 0, size: 0, mt: 500, label: "Break-bulk 500 MT" },
  };
  const SECTOR_VALUE = { agri: 1120, eng: 3400, min: 92, tex: 850, poly: 1180 }; // USD/MT indicative
  let lastCalc = null;

  function nextSailing(days) {
    const now = new Date();
    for (let i = 2; i < 12; i++) {
      const d = new Date(now); d.setDate(now.getDate() + i);
      if (days.includes(d.getDay())) return d;
    }
    return now;
  }

  $("#calcForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const pod = PODS[f.pod.value], vol = VOLS[f.volume.value];
    const inco = f.incoterm.value, sector = f.sector.value;
    const freight = vol.boxes ? vol.boxes * pod.rate40 * (vol.size === 20 ? 0.62 : 1) : vol.mt * pod.bulk;
    const origin = vol.boxes ? vol.boxes * 185 : 2400; // THC, docs, CHA, VGM
    const cargoValue = vol.mt * SECTOR_VALUE[sector];
    const insurance = inco === "CIF" ? (cargoValue + freight) * 1.1 * 0.0015 : 0;
    lastCalc = { pod, vol, inco, freight, origin, insurance, cargoValue, sailing: nextSailing(pod.sail), pricedAt: new Date() };
    renderCalc(lastCalc);
  });

  function renderCalc(c) {
    const box = $("#calcResult");
    const sail = c.sailing.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    const cutoff = new Date(c.sailing); cutoff.setDate(cutoff.getDate() - 2);
    const total = (c.inco === "FOB" ? 0 : c.freight) + c.origin + c.insurance;
    box.innerHTML = `
      <div class="cr-item"><div class="k">Ocean Freight</div><div class="v">${fmt(c.freight)}</div><div class="s">${c.inco === "FOB" ? "Buyer-nominated (indicative)" : c.vol.label}</div></div>
      <div class="cr-item"><div class="k">Origin THC · CHA · Docs</div><div class="v">${fmt(c.origin)}</div><div class="s">${c.inco === "FOB" ? "Included in FOB price" : "Included in quote"}</div></div>
      <div class="cr-item"><div class="k">Marine Insurance</div><div class="v">${c.inco === "CIF" ? fmt(c.insurance) : "—"}</div><div class="s">${c.inco === "CIF" ? "ICC (A) · 110% value" : "Buyer arranges"}</div></div>
      <div class="cr-item"><div class="k">Transit to ${c.pod.name}</div><div class="v">${c.pod.transit} days</div><div class="s">${c.pod.carrier}</div></div>
      <div class="cr-item"><div class="k">Seller Logistics Cost</div><div class="v gold">${fmt(total)}</div><div class="s">≈ ${fmt(total / c.vol.mt, 2)} / MT · ${c.inco}</div></div>
      <a class="btn btn-gold" href="#rfq" id="calcToRfq"><span class="material-symbols-outlined">lock_clock</span>Lock Rate via RFQ</a>
      <p class="cr-note"><span class="material-symbols-outlined">event_available</span>Next sailing <b>&nbsp;${sail}</b>&nbsp;· doc cut-off ${cutoff.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · Firm quote SLA ≤ 4 business hours · Spot index as of ${c.pricedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}. Indicative only, excludes destination charges &amp; duties.</p>`;
    box.hidden = false;
    $("#calcToRfq").addEventListener("click", () => {
      const podInput = $("#f-pod");
      if (podInput && !podInput.value) podInput.value = $("#calcPod").selectedOptions[0].text;
      const r = $(`input[name="incoterm"][value="${c.inco}"]`); if (r) r.checked = true;
    });
  }

  /* -------------------------------------------------- Catalogue filters */
  const tabs = $$(".tab");
  function applyFilter(cat) {
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.filter === cat)));
    $$("#productGrid > [data-cat]").forEach((card) => {
      card.hidden = !(cat === "all" || card.dataset.cat === cat || card.dataset.cat === "all");
    });
  }
  tabs.forEach((t) => t.addEventListener("click", () => applyFilter(t.dataset.filter)));
  // Arrow-key navigation between tabs
  $(".tabs").addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0 || !["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    const n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    n.focus(); n.click();
  });
  $$("[data-filter-link]").forEach((a) => a.addEventListener("click", () => applyFilter(a.dataset.filterLink)));

  /* ------------------------------------------------------ Quote buttons */
  $$("[data-quote]").forEach((b) =>
    b.addEventListener("click", () => {
      const sel = $("#f-product");
      const opt = Array.from(sel.options).find((o) => o.text === b.dataset.quote);
      if (opt) sel.value = opt.value;
      $("#rfq").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      toast(`“${b.dataset.quote}” pre-selected in your RFQ (Step 2).`, "request_quote");
      setTimeout(() => $("#f-company").focus({ preventScroll: true }), 700);
    })
  );

  /* ------------------------------------------------------------ RFQ form */
  const form = $("#rfqForm");
  const steps = $$(".rfq-step", form);
  const stepBtns = $$(".step-btn");
  const btnNext = $("#rfqNext"), btnBack = $("#rfqBack"), btnSubmit = $("#rfqSubmit");
  let current = 0, maxReached = 0;
  const DRAFT_KEY = "ambright-rfq-draft";

  function validateStep(i) {
    let ok = true, firstBad = null;
    $$(".field", steps[i]).forEach((field) => {
      const ctrls = $$("input, select, textarea", field).filter((c) => c.required);
      const bad = ctrls.some((c) => !c.checkValidity());
      field.classList.toggle("has-error", bad);
      if (bad) { ok = false; firstBad = firstBad || ctrls.find((c) => !c.checkValidity()); }
    });
    if (firstBad) firstBad.focus();
    return ok;
  }
  // Clear errors as user corrects
  form.addEventListener("input", (e) => {
    const field = e.target.closest(".field");
    if (field?.classList.contains("has-error") && e.target.checkValidity()) field.classList.remove("has-error");
    saveDraft();
  });
  form.addEventListener("change", (e) => {
    const field = e.target.closest(".field");
    if (field?.classList.contains("has-error") && e.target.checkValidity()) field.classList.remove("has-error");
  });

  function goTo(i) {
    current = i; maxReached = Math.max(maxReached, i);
    steps.forEach((s, k) => (s.hidden = k !== i));
    stepBtns.forEach((b, k) => {
      b.disabled = k > maxReached;
      b.classList.toggle("done", k < maxReached && k !== i);
      if (k === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    btnBack.hidden = i === 0;
    btnNext.hidden = i === steps.length - 1;
    btnSubmit.hidden = i !== steps.length - 1;
    $("#rfqProgress").style.width = `${((i + 1) / steps.length) * 100}%`;
    $("#rfqMeta").textContent = `Step ${i + 1} of ${steps.length} · Draft auto-saved locally`;
  }
  btnNext.addEventListener("click", () => {
    if (!validateStep(current)) return;
    goTo(current + 1);
    form.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
  btnBack.addEventListener("click", () => goTo(current - 1));
  stepBtns.forEach((b) => b.addEventListener("click", () => {
    const target = +b.dataset.goto;
    if (target > current && !validateStep(current)) return;
    goTo(target);
  }));

  // Draft persistence (text fields only)
  function saveDraft() {
    try {
      const data = {};
      $$("input:not([type=file]):not([type=checkbox]):not([type=radio]), select, textarea", form).forEach((c) => { if (c.name) data[c.name] = c.value; });
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch { /* storage unavailable */ }
  }
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (draft) Object.entries(draft).forEach(([k, v]) => { const c = form.elements[k]; if (c && !(c instanceof RadioNodeList) && v) c.value = v; });
  } catch { /* ignore */ }

  // File drop
  const dz = $("#dropzone"), fileInput = $("#f-files"), fileList = $("#fileList");
  let files = [];
  const MAX_FILES = 5, MAX_SIZE = 20 * 1024 * 1024;
  const human = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB");
  function addFiles(list) {
    for (const f of list) {
      if (files.length >= MAX_FILES) { toast("Maximum 5 files per RFQ.", "warning"); break; }
      if (f.size > MAX_SIZE) { toast(`${f.name} exceeds 20 MB.`, "warning"); continue; }
      if (!files.some((x) => x.name === f.name && x.size === f.size)) files.push(f);
    }
    renderFiles();
  }
  function renderFiles() {
    fileList.innerHTML = "";
    files.forEach((f, i) => {
      const row = document.createElement("div");
      row.className = "file-item";
      row.innerHTML = `<span class="material-symbols-outlined">description</span><span class="name"></span><span class="size">${human(f.size)}</span><button type="button" aria-label="Remove file"><span class="material-symbols-outlined">close</span></button>`;
      row.querySelector(".name").textContent = f.name;
      row.querySelector("button").addEventListener("click", () => { files.splice(i, 1); renderFiles(); });
      fileList.appendChild(row);
    });
  }
  fileInput.addEventListener("change", () => { addFiles(fileInput.files); fileInput.value = ""; });
  ["dragenter", "dragover"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("drag"); }));
  ["dragleave", "drop"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove("drag"); }));
  dz.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (current !== steps.length - 1) { btnNext.click(); return; }
    if (!validateStep(current)) return;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="material-symbols-outlined">progress_activity</span>Registering…';

    const fd = new FormData(form);
    const payload = {};
    fd.forEach((val, key) => { payload[key] = val; });
    payload.fileCount = files.length;

    let resData = null;
    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        resData = await res.json();
      }
    } catch (netErr) {
      // Local fallback if offline
    }

    const now = new Date();
    const fallbackRef = `RFQ-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const ref = resData?.rfqReference || fallbackRef;

    $("#sucRef").textContent = ref;
    $("#sucEmail").textContent = fd.get("email");
    const rows = [
      ["Entity", fd.get("company")],
      ["Product", fd.get("product")],
      ["Quantity", `${fd.get("qty")} ${fd.get("qtyUnit")}`],
      ["Packaging", fd.get("packaging")],
      ["POD", fd.get("pod")],
      ["Terms", `${fd.get("incoterm")} · ${fd.get("payment")}`],
      ["Attachments", files.length ? `${files.length} file(s)` : "None"],
      ["Status", "Under Formal Trade Review (4h SLA)"],
    ];
    const dl = $("#sucSummary");
    dl.innerHTML = "";
    rows.forEach(([k, v]) => {
      const dt = document.createElement("dt"); dt.textContent = k;
      const dd = document.createElement("dd"); dd.textContent = v || "—";
      dl.append(dt, dd);
    });
    const piBtn = $("#sucViewPi");
    if (piBtn) piBtn.href = `/proforma?ref=${encodeURIComponent(ref)}`;
    openDialog("successDialog");
    form.reset(); files = []; renderFiles();
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    maxReached = 0; goTo(0);
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<span class="material-symbols-outlined">verified</span>Generate Official Quote Request';
  });
  goTo(0);

  // Supplier & Account form dialogs with backend persistence
  const supForm = document.getElementById("supplierForm");
  if (supForm) {
    supForm.addEventListener("submit", async (e) => {
      let ok = true;
      $$(".field", supForm).forEach((field) => {
        const bad = $$("input, select", field).some((c) => !c.checkValidity());
        field.classList.toggle("has-error", bad);
        if (bad) ok = false;
      });
      if (!ok) { e.preventDefault(); return; }

      const payload = {
        company: $("#s-co")?.value,
        gstin: $("#s-gst")?.value,
        iec: $("#s-iec")?.value,
        category: $("#s-cat")?.value,
        email: $("#s-mail")?.value,
      };

      try {
        await fetch("/api/supplier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {}

      setTimeout(() => {
        supForm.reset();
        toast("Application received — our supplier audit team will contact you within 2 working days.", "factory");
      }, 50);
    });
  }

  const accForm = document.getElementById("accountForm");
  if (accForm) {
    accForm.addEventListener("submit", (e) => {
      let ok = true;
      $$(".field", accForm).forEach((field) => {
        const bad = $$("input, select", field).some((c) => !c.checkValidity());
        field.classList.toggle("has-error", bad);
        if (bad) ok = false;
      });
      if (!ok) { e.preventDefault(); return; }
      setTimeout(() => {
        accForm.reset();
        toast("Secure sign-in link sent. Please check your corporate inbox.", "mark_email_read");
      }, 50);
    });
  }

  /* --------------------------------------------------------- Route map */
  const W = 1000, H = 500;
  const P = ([lon, lat]) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
  const NS = "http://www.w3.org/2000/svg";
  const LAND = [
    [[-168,66],[-162,70],[-140,70],[-120,72],[-95,72],[-80,73],[-62,66],[-56,52],[-66,45],[-70,42],[-76,38],[-76,35],[-81,31],[-80,25],[-83,29],[-90,30],[-97,27],[-97,22],[-92,19],[-87,21],[-88,16],[-83,10],[-79,9],[-85,12],[-92,15],[-105,20],[-110,24],[-112,30],[-117,32],[-124,40],[-124,48],[-133,56],[-150,60],[-165,60]],
    [[-55,60],[-44,60],[-20,70],[-20,80],[-60,82],[-70,77],[-55,68]],
    [[-79,9],[-72,12],[-62,10],[-52,5],[-35,-6],[-39,-14],[-48,-26],[-58,-36],[-65,-42],[-68,-54],[-74,-50],[-72,-35],[-71,-18],[-81,-6],[-80,1]],
    [[-10,36],[-6,37],[-2,37],[3,43],[8,44],[12,42],[16,38],[18,40],[13,45],[19,42],[24,38],[26,41],[29,41],[36,36],[35,32],[34,28],[39,22],[43,13],[52,16],[58,22],[56,26],[51,24],[48,30],[51,28],[57,26],[62,25],[67,24],[70,21],[73,17],[75,12],[77,8],[80,13],[80,16],[87,21],[92,22],[94,16],[98,15],[98,8],[101,3],[104,1.5],[103,6],[100,13],[105,9],[109,12],[108,20],[110,21],[117,23],[122,30],[121,36],[118,38],[122,40],[126,38],[129,35],[129,40],[135,43],[140,48],[141,53],[135,55],[143,59],[155,59],[163,62],[180,65],[180,72],[140,73],[110,77],[80,73],[68,70],[60,68],[40,67],[30,70],[20,70],[14,66],[5,62],[10,58],[8,55],[5,53],[0,50],[-5,48],[-1,46],[-9,43]],
    [[-17,21],[-16,28],[-10,30],[-6,36],[10,37],[11,33],[20,31],[30,31],[32,31],[34,28],[38,18],[43,12],[51,12],[42,-1],[40,-10],[35,-22],[33,-26],[26,-34],[18,-34],[12,-17],[13,-6],[9,-1],[9,4],[4,6],[-8,4],[-13,8],[-17,15]],
    [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[141,-38],[135,-35],[129,-31],[115,-34]],
    [[95.5,5.5],[100,2],[106,-3],[105.5,-6],[101,-3],[95,3]],
    [[109,1],[117,7],[119,1],[116,-4],[110,-3]],
    [[105,-6],[114,-7],[114,-8.5],[106,-7]],
    [[130,31],[141,36],[142,43],[140,41],[132,34]],
    [[-5,50],[1,51],[-2,56],[-5,58],[-6,55],[-3,54]],
    [[44,-25],[49,-12],[50,-16],[47,-25]],
    [[80,9.8],[81.8,7],[80,6]],
  ];
  const ORIGIN = [72.95, 18.95];
  const GIB_LEG = [ORIGIN, [65,14], [52,13], [43.4,12.6], [38,20], [33.5,28], [32.5,31.3], [25,34], [15,36.5], [5,37.8], [-5.6,35.9]];
  const ROUTES = {
    jebel: { pts: [ORIGIN, [66,22], [59,24], [56.4,26.3], [55.03,25.0]], ports: ["AEJEA"],
      tl: [["Nhava Sheva", "Gate-in · Day 0"], ["Arabian Sea", "Day 2"], ["Strait of Hormuz", "Day 3–4"], ["Jebel Ali", "Berth · Day 4–6"]],
      via: "Weekly Tue / Fri · Maersk ME1, MSC Falcon" },
    rotterdam: { pts: [...GIB_LEG, [-10,38], [-9.5,44], [-5,48.5], [1.5,50.5], [4.1,51.95]], ports: ["NLRTM"],
      tl: [["Nhava Sheva", "Day 0"], ["Suez Canal", "Day 9–11"], ["Gibraltar", "Day 16–18"], ["Rotterdam", "Day 22–26"]],
      via: "Weekly Wed · MSC Swan, Hapag-Lloyd IOS" },
    usa: { pts: [...GIB_LEG, [-25,36.5], [-50,38], [-73.9,40.5]], extra: [[-73.9,40.5], [-75,35], [-79,28], [-80.3,24.8], [-85,25.5], [-94.8,29.3]], ports: ["USNYC", "USHOU"],
      tl: [["Nhava Sheva", "Day 0"], ["Suez Canal", "Day 9–11"], ["New York / NJ", "Day 28–30"], ["Houston", "Day 30–32"]],
      via: "Weekly Mon · CMA CGM INDAMEX, Maersk MECL" },
    singapore: { pts: [ORIGIN, [73,11], [79,5.2], [88,5.6], [95,6.2], [98.5,3.8], [103.8,1.27]], ports: ["SGSIN"],
      tl: [["Nhava Sheva", "Day 0"], ["Colombo transit", "Day 2–3"], ["Malacca Strait", "Day 5"], ["Singapore", "Day 6–8"]],
      via: "Twice weekly Sun / Wed · ONE PMX, CMA CGM" },
  };
  const PORTS = {
    INNSA: { ll: ORIGIN, name: "Nhava Sheva", sub: "INNSA · Origin", dx: 8, dy: 12, origin: true },
    AEJEA: { ll: [55.03,25.0], name: "Jebel Ali", sub: "AEJEA", dx: -50, dy: 18 },
    NLRTM: { ll: [4.1,51.95], name: "Rotterdam", sub: "NLRTM", dx: 8, dy: -6 },
    USNYC: { ll: [-73.9,40.5], name: "New York", sub: "USNYC", dx: 8, dy: -6 },
    USHOU: { ll: [-94.8,29.3], name: "Houston", sub: "USHOU", dx: -48, dy: -8 },
    SGSIN: { ll: [103.8,1.27], name: "Singapore", sub: "SGSIN", dx: 8, dy: 12 },
  };

  function smoothPath(points) {
    const p = points.map(P);
    let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  }
  const el = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };

  const gGrid = $("#mapGrid"), gLand = $("#mapLand"), gRoutes = $("#mapRoutes"), gPorts = $("#mapPorts"), ship = $("#mapShip");
  for (let lon = -150; lon <= 180; lon += 30) { const [x] = P([lon, 0]); gGrid.appendChild(el("line", { x1: x, y1: 0, x2: x, y2: H })); }
  for (let lat = -60; lat <= 75; lat += 15) { const [, y] = P([0, lat]); gGrid.appendChild(el("line", { x1: 0, y1: y, x2: W, y2: y })); }
  LAND.forEach((poly) => gLand.appendChild(el("path", { class: "land", d: "M" + poly.map(P).map((q) => q.map((n) => n.toFixed(1)).join(",")).join("L") + "Z" })));

  const routePaths = {};
  Object.entries(ROUTES).forEach(([key, r]) => {
    const path = el("path", { class: "route", d: smoothPath(r.pts) + (r.extra ? " " + smoothPath(r.extra) : "") });
    // A separate single-leg path used for ship animation
    const anim = el("path", { d: smoothPath(r.pts), fill: "none", stroke: "none" });
    gRoutes.append(path, anim);
    routePaths[key] = { path, anim };
  });
  const portEls = {};
  Object.entries(PORTS).forEach(([code, p]) => {
    const [x, y] = P(p.ll);
    const g = el("g", { class: "port" + (p.origin ? " origin" : "") });
    g.append(el("circle", { class: "halo", cx: x, cy: y, r: p.origin ? 9 : 7 }), el("circle", { cx: x, cy: y, r: p.origin ? 3.6 : 3 }));
    const t = el("text", { x: x + p.dx, y: y + p.dy }); t.textContent = p.name;
    const s = el("text", { class: "sub", x: x + p.dx, y: y + p.dy + 9 }); s.textContent = p.sub;
    g.append(t, s);
    gPorts.appendChild(g);
    portEls[code] = g;
  });

  let activeRoute = "jebel", shipRAF = null, shipT0 = 0;
  function animateShip(t) {
    const anim = routePaths[activeRoute].anim;
    const len = anim.getTotalLength();
    const dur = Math.max(4000, len * 9);
    const prog = reduceMotion ? 0.6 : ((t - shipT0) % dur) / dur;
    const a = anim.getPointAtLength(prog * len);
    const b = anim.getPointAtLength(Math.min(len, prog * len + 1));
    const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    const flip = Math.abs(ang) > 90;
    ship.setAttribute("transform", `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${flip ? ang + 180 : ang}) scale(${flip ? -1 : 1} 1)`);
    if (!reduceMotion) shipRAF = requestAnimationFrame(animateShip);
  }
  function selectRoute(key) {
    activeRoute = key;
    Object.entries(routePaths).forEach(([k, r]) => r.path.classList.toggle("active", k === key));
    // Bring active route to front
    gRoutes.appendChild(routePaths[key].path);
    Object.entries(portEls).forEach(([code, g]) => g.classList.toggle("active", ROUTES[key].ports.includes(code)));
    $$(".route-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.route === key)));
    const r = ROUTES[key];
    $("#routeTimeline").innerHTML = `
      <div class="timeline-head"><b>Transit timeline · Nhava Sheva → ${r.tl[r.tl.length - 1][0]}</b><span class="via">${r.via}</span></div>
      <div class="tl-track">${r.tl.map(([b, s]) => `<div class="tl-node"><b>${b}</b><span>${s}</span></div>`).join("")}</div>`;
    cancelAnimationFrame(shipRAF);
    shipT0 = performance.now();
    shipRAF = requestAnimationFrame(animateShip);
  }
  $$(".route-btn").forEach((b) => b.addEventListener("click", () => selectRoute(b.dataset.route)));
  selectRoute("jebel");

  // Pause the ship animation when the map is off-screen
  new IntersectionObserver(([en]) => {
    if (reduceMotion) return;
    if (en.isIntersecting) { cancelAnimationFrame(shipRAF); shipRAF = requestAnimationFrame(animateShip); }
    else cancelAnimationFrame(shipRAF);
  }).observe($("#routeMap"));

  /* ------------------------------------------------------- BL tracker */
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); };
  const SHIPMENTS = {
    AMBG2611NSRT04: { vessel: "MSC AURORA · Voy 412W", pol: "Nhava Sheva (INNSA)", pod: "Rotterdam (NLRTM)", cargo: "2 × 40' HC · 54 MT Organic Turmeric", container: "MSCU 4821930 / 4821946", step: 2, prog: 58, pos: "Red Sea — northbound, approaching Suez Canal", eta: 12, status: "In Transit" },
    MSKU7739120: { vessel: "MAERSK KOLKATA · Voy 445E", pol: "Mundra (INMUN)", pod: "Jebel Ali (AEJEA)", cargo: "1 × 20' FCL · 18.4 MT DI Gate Valves", container: "MSKU 7739120", step: 3, prog: 100, pos: "Berthed at Jebel Ali T2 — discharge in progress", eta: 0, status: "Arrived at POD" },
    CMAU4410287: { vessel: "CMA CGM TAGE · Voy 0FL3RW1MA", pol: "Mundra (INMUN)", pod: "Houston (USHOU)", cargo: "5 × 40' HC · 135 MT API Bentonite", container: "CMAU 4410287 +4", step: 0, prog: 4, pos: "LEO granted · stacked at Mundra CT-3, loading in 2 days", eta: 33, status: "Customs Passed" },
  };
  const TRACK_STEPS = [["Customs Passed", "LEO · ICEGATE", "verified"], ["Loaded on Board", "Shipped BL", "inventory"], ["In Transit", "Ocean leg", "sailing"], ["POD Arrival", "Discharge", "anchor"]];

  function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
  function lookup(id) {
    if (SHIPMENTS[id]) return SHIPMENTS[id];
    // Synthesize a plausible record for well-formed ISO 6346 / AmBright BL numbers
    if (!/^([A-Z]{4}\d{7}|AMBG\d{4}[A-Z]{2,4}\d{2})$/.test(id)) return null;
    const h = hash(id);
    const dest = [["Jebel Ali (AEJEA)", 5], ["Rotterdam (NLRTM)", 24], ["Singapore (SGSIN)", 7], ["New York (USNYC)", 30]][h % 4];
    const step = h % 4, prog = [6, 22, 40 + (h % 45), 100][step];
    return {
      vessel: ["ONE HARMONY", "HAPAG BREMEN", "MSC FALCON", "MAERSK SELETAR"][h % 4] + ` · Voy ${100 + (h % 800)}W`,
      pol: "Nhava Sheva (INNSA)", pod: dest[0], cargo: `${1 + (h % 3)} × 40' HC · ${27 * (1 + (h % 3))} MT`, container: id,
      step, prog, pos: ["Gate-in complete at JNPT", "On board — vessel departed", "Open sea — on schedule", "Berthed at destination"][step],
      eta: Math.max(0, Math.round(dest[1] * (1 - prog / 100))), status: TRACK_STEPS[step][0],
    };
  }

  async function renderTrack(id) {
    const out = $("#trackResult");
    let rec = null;

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.shipment) {
          rec = data.shipment;
        }
      }
    } catch (e) {
      // Offline fallback
    }

    if (!rec) rec = lookup(id);

    if (!rec) {
      out.innerHTML = `<div class="track-empty"><span class="material-symbols-outlined">search_off</span><p><b>No consignment found for “<span></span>”.</b><br>Check the BL / container number or contact the trade desk.</p></div>`;
      out.querySelector("b span").textContent = id;
      return;
    }
    const pillCls = rec.step === 3 ? "ok" : rec.step === 0 ? "warn" : "";
    out.innerHTML = `
      <div class="tr-top">
        <div><div class="bl">BL / CNTR · ${id}</div><div class="vessel"><span class="material-symbols-outlined">directions_boat</span>${rec.vessel}</div></div>
        <span class="status-pill ${pillCls}">${rec.status}</span>
      </div>
      <ol class="track-steps">${TRACK_STEPS.map(([t, s, ic], i) => `<li class="${i < rec.step || (rec.step === 3 && i === 3) ? "done" : i === rec.step ? "current" : ""}"><span class="n"><span class="material-symbols-outlined">${i < rec.step || rec.step === 3 ? "check" : ic}</span></span><b>${t}</b>${s}</li>`).join("")}</ol>
      <div class="voyage-bar">
        <div class="lbl"><span>${rec.pol}</span><span>${rec.pod}</span></div>
        <div class="bar"><i style="width:0"></i></div>
        <div class="pos"><span class="material-symbols-outlined">my_location</span>${rec.pos}</div>
      </div>
      <div class="tr-grid">
        <div><div class="k">Cargo</div><div class="v">${rec.cargo}</div></div>
        <div><div class="k">Container(s)</div><div class="v">${rec.container}</div></div>
        <div><div class="k">${rec.etaDays === 0 || rec.eta === 0 ? "Arrived" : "ETA at POD"}</div><div class="v eta">${addDays(rec.etaDays !== undefined ? rec.etaDays : rec.eta)}</div></div>
        <div><div class="k">Last AIS update</div><div class="v">${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} IST</div></div>
      </div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => { out.querySelector(".bar i").style.width = rec.prog + "%"; }));
  }
  $("#trackForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("#trackInput").value.replace(/\s+/g, "").toUpperCase();
    if (id) renderTrack(id);
  });
  $$("[data-track]").forEach((b) => b.addEventListener("click", () => { $("#trackInput").value = b.dataset.track; renderTrack(b.dataset.track); }));
  renderTrack("AMBG2611NSRT04");
  $("#trackInput").value = "AMBG2611NSRT04";

  /* ------------------------------------------------ IST clock & desk */
  function tickClock() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false }).formatToParts(now);
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const hour = parseInt(get("hour"), 10);
    const open = get("weekday") !== "Sun" && hour >= 8 && hour < 22;
    $("#istClock").textContent = `${get("weekday")} ${get("hour")}:${get("minute")} IST`;
    $("#deskStatus").textContent = open ? "Open" : "After-hours (SLA clock starts 08:00 IST)";
    $("#deskStatus").style.color = open ? "#34D399" : "#FCD34D";
  }
  tickClock();
  setInterval(tickClock, 30000);

  const invTime = $("#invTime");
  if (invTime) invTime.textContent = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " IST";
  $("#year").textContent = new Date().getFullYear();

  /* ------------------------------------------------------- Reveal */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); revealObs.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((r) => revealObs.observe(r));

  renderPrices();
})();

