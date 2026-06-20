/* ADLER Real Estate — catalog page */
(function () {
  "use strict";

  var T = {
    de: { home:"← Startseite", eyebrow:"Immobilien in Paraguay", title:"Immobilien-Katalog",
      intro:"Alle aktuellen Angebote auf einen Blick — Villen, Häuser, Grundstücke, Gewerbe und Mietobjekte.",
      f_type:"Typ", f_loc:"Ort", f_price:"Preis bis", f_sort:"Sortierung",
      s_default:"Empfohlen", s_priceAsc:"Preis aufsteigend", s_priceDesc:"Preis absteigend",
      reset:"Zurücksetzen", empty:"Keine Objekte für diese Auswahl.", all:"Alle",
      req:"Auf Anfrage", details:"Details ansehen", count:function(n){return n+" Objekte";}, upto:"bis" },
    es: { home:"← Inicio", eyebrow:"Inmuebles en Paraguay", title:"Catálogo de inmuebles",
      intro:"Todas las ofertas actuales de un vistazo — casas, villas, terrenos, locales y alquileres.",
      f_type:"Tipo", f_loc:"Lugar", f_price:"Precio hasta", f_sort:"Orden",
      s_default:"Recomendado", s_priceAsc:"Precio ascendente", s_priceDesc:"Precio descendente",
      reset:"Restablecer", empty:"No hay inmuebles para esta selección.", all:"Todos",
      req:"A consultar", details:"Ver detalles", count:function(n){return n+" inmuebles";}, upto:"hasta" },
    en: { home:"← Home", eyebrow:"Real estate in Paraguay", title:"Property catalogue",
      intro:"All current listings at a glance — houses, villas, land, commercial and rentals.",
      f_type:"Type", f_loc:"Location", f_price:"Price up to", f_sort:"Sort",
      s_default:"Recommended", s_priceAsc:"Price ascending", s_priceDesc:"Price descending",
      reset:"Reset", empty:"No properties for this selection.", all:"All",
      req:"On request", details:"View details", count:function(n){return n+" properties";}, upto:"up to" }
  };
  var TYPE = {
    de:{}, // identity
    es:{"Villa & Haus":"Casa y villa","Grundstück":"Terreno","Gewerbe":"Comercial","Miete":"Alquiler","Nachbarschaft":"Barrio","Immobilie":"Inmueble"},
    en:{"Villa & Haus":"House & villa","Grundstück":"Land","Gewerbe":"Commercial","Miete":"Rental","Nachbarschaft":"Community","Immobilie":"Property"}
  };

  var lang = "de";
  try { lang = localStorage.getItem("adler_lang") || "de"; } catch (e) {}
  if (!T[lang]) lang = "de";
  var t = T[lang];
  var typeLabel = function (x) { return (TYPE[lang] && TYPE[lang][x]) || x; };

  document.documentElement.lang = lang;
  document.querySelectorAll("[data-t]").forEach(function (el) {
    var v = t[el.getAttribute("data-t")]; if (typeof v === "string") el.textContent = v;
  });
  document.querySelectorAll(".lang-btn").forEach(function (b) {
    b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false");
    b.addEventListener("click", function () {
      try { localStorage.setItem("adler_lang", b.dataset.lang); } catch (e) {}
      location.reload();
    });
  });
  var yr = document.getElementById("year"); if (yr) yr.textContent = new Date().getFullYear();

  var PER_PAGE = 12, page = 1, all = [];
  var grid = document.getElementById("catGrid"),
      countEl = document.getElementById("catCount"),
      emptyEl = document.getElementById("catEmpty"),
      pager = document.getElementById("pagination"),
      fType = document.getElementById("fType"), fLoc = document.getElementById("fLoc"),
      fPrice = document.getElementById("fPrice"), fSort = document.getElementById("fSort"),
      fReset = document.getElementById("fReset");

  var PRICE_TIERS = [50000,100000,150000,200000,300000,500000,1000000,2500000];

  function fmt(n) { return n.toLocaleString("de-DE"); }
  function priceHTML(it) {
    if (it.priceEUR) return '<span class="price">€ ' + fmt(it.priceEUR) + "</span>";
    if (it.priceUSD) return '<span class="price">$ ' + fmt(it.priceUSD) + "</span>";
    return '<span class="card-price-req">' + t.req + "</span>";
  }

  function opt(sel, val, label) {
    var o = document.createElement("option"); o.value = val; o.textContent = label; sel.appendChild(o);
  }

  function buildFilters() {
    var types = [], locs = [];
    all.forEach(function (i) {
      if (i.type && types.indexOf(i.type) < 0) types.push(i.type);
      if (i.location && locs.indexOf(i.location) < 0) locs.push(i.location);
    });
    types.sort(); locs.sort();
    fType.innerHTML = ""; opt(fType, "", t.all);
    types.forEach(function (x) { opt(fType, x, typeLabel(x)); });
    fLoc.innerHTML = ""; opt(fLoc, "", t.all);
    locs.forEach(function (x) { opt(fLoc, x, x); });
    opt(fPrice, "", t.all);
    PRICE_TIERS.forEach(function (p) { opt(fPrice, String(p), t.upto + " € " + fmt(p)); });
  }

  function filtered() {
    var ty = fType.value, lo = fLoc.value, pr = fPrice.value ? parseInt(fPrice.value, 10) : null, so = fSort.value;
    var list = all.filter(function (i) {
      if (ty && i.type !== ty) return false;
      if (lo && i.location !== lo) return false;
      if (pr && !((i.priceEUR || i.priceUSD || Infinity) <= pr)) return false;
      return true;
    });
    if (so === "priceAsc") list.sort(function (a, b) { return (a.priceEUR || a.priceUSD || 9e15) - (b.priceEUR || b.priceUSD || 9e15); });
    else if (so === "priceDesc") list.sort(function (a, b) { return (b.priceEUR || b.priceUSD || 0) - (a.priceEUR || a.priceUSD || 0); });
    return list;
  }

  function card(it) {
    var a = document.createElement("a");
    a.className = "card";
    a.href = "objekt.html?id=" + encodeURIComponent(it.id);
    var facts = [];
    if (it.size) facts.push("<span>" + it.size + "</span>");
    if (it.beds) facts.push("<span>" + it.beds + "</span>");
    a.innerHTML =
      '<div class="card-img"><img src="' + (it.thumb || "") + '" alt="' + (it.title || "") + '" loading="lazy" />' +
      '<span class="card-tag">' + typeLabel(it.type) + "</span></div>" +
      '<div class="card-body">' +
        '<p class="card-loc">' + (it.location || "Paraguay") + "</p>" +
        "<h3>" + (it.title || "") + "</h3>" +
        (facts.length ? '<div class="card-meta">' + facts.join("") + "</div>" : "") +
        '<div class="card-foot">' + priceHTML(it) + '<span class="card-link">' + t.details + " →</span></div>" +
      "</div>";
    return a;
  }

  function render() {
    var list = filtered();
    var pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (page > pages) page = pages;
    countEl.textContent = t.count(list.length);
    grid.innerHTML = "";
    emptyEl.hidden = list.length !== 0;
    list.slice((page - 1) * PER_PAGE, page * PER_PAGE).forEach(function (it) { grid.appendChild(card(it)); });
    renderPager(pages);
  }

  function pageBtn(label, p, opts) {
    opts = opts || {};
    var b = document.createElement("button");
    b.textContent = label;
    if (opts.current) b.setAttribute("aria-current", "true");
    if (opts.disabled) b.disabled = true;
    else b.addEventListener("click", function () { page = p; render(); window.scrollTo({ top: 0, behavior: "smooth" }); });
    pager.appendChild(b);
  }

  function renderPager(pages) {
    pager.innerHTML = "";
    if (pages <= 1) return;
    pageBtn("‹", page - 1, { disabled: page === 1 });
    for (var p = 1; p <= pages; p++) {
      if (p === 1 || p === pages || Math.abs(p - page) <= 1) pageBtn(String(p), p, { current: p === page });
      else if (p === 2 && page > 3) { var s = document.createElement("button"); s.textContent = "…"; s.disabled = true; pager.appendChild(s); }
      else if (p === pages - 1 && page < pages - 2) { var s2 = document.createElement("button"); s2.textContent = "…"; s2.disabled = true; pager.appendChild(s2); }
    }
    pageBtn("›", page + 1, { disabled: page === pages });
  }

  [fType, fLoc, fPrice, fSort].forEach(function (el) {
    el.addEventListener("change", function () { page = 1; render(); });
  });
  fReset.addEventListener("click", function () {
    fType.value = ""; fLoc.value = ""; fPrice.value = ""; fSort.value = "default"; page = 1; render();
  });

  fetch("assets/data/listings.json")
    .then(function (r) { return r.json(); })
    .then(function (data) { all = data || []; buildFilters(); render(); })
    .catch(function () { grid.innerHTML = ""; emptyEl.hidden = false; });
})();
