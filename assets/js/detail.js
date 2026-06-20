/* ADLER Real Estate — single object page */
(function () {
  "use strict";

  var T = {
    de: { toCatalog:"← Katalog", req:"Auf Anfrage", inquire:"Jetzt anfragen", wa:"Hallo, ich interessiere mich für: ",
      type:"Typ", location:"Ort", size:"Fläche", beds:"Schlafzimmer", priceUsd:"ca. in USD",
      orig:"Alle Fotos im Original-Inserat ansehen ↗", notfound:"Objekt nicht gefunden.", back:"Zum Katalog", desc:"Beschreibung" },
    es: { toCatalog:"← Catálogo", req:"A consultar", inquire:"Consultar ahora", wa:"Hola, me interesa: ",
      type:"Tipo", location:"Lugar", size:"Superficie", beds:"Dormitorios", priceUsd:"aprox. en USD",
      orig:"Ver todas las fotos en el anuncio original ↗", notfound:"Inmueble no encontrado.", back:"Al catálogo", desc:"Descripción" },
    en: { toCatalog:"← Catalogue", req:"On request", inquire:"Inquire now", wa:"Hello, I'm interested in: ",
      type:"Type", location:"Location", size:"Area", beds:"Bedrooms", priceUsd:"approx. in USD",
      orig:"See all photos in the original listing ↗", notfound:"Property not found.", back:"To the catalogue", desc:"Description" }
  };
  var TYPE = {
    de:{}, es:{"Villa & Haus":"Casa y villa","Grundstück":"Terreno","Gewerbe":"Comercial","Miete":"Alquiler","Nachbarschaft":"Barrio","Immobilie":"Inmueble"},
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

  function fmt(n) { return n.toLocaleString("de-DE"); }
  function esc(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var root = document.getElementById("detailRoot");
  var id = new URLSearchParams(location.search).get("id");

  fetch("assets/data/listings.json").then(function (r) { return r.json(); }).then(function (data) {
    var it = (data || []).filter(function (x) { return String(x.id) === String(id); })[0];
    if (!it) { root.innerHTML = '<p class="cat-empty">' + t.notfound + ' <a href="katalog.html" style="color:var(--gold-deep)">' + t.back + "</a></p>"; return; }
    document.title = it.title + " — ADLER Real Estate";

    var price = it.priceEUR ? '<span class="price">€ ' + fmt(it.priceEUR) + "</span>" :
                (it.priceUSD ? '<span class="price">$ ' + fmt(it.priceUSD) + "</span>" :
                '<span class="price" style="font-size:1.4rem;color:var(--gold-deep)">' + t.req + "</span>");
    var priceSub = (it.priceEUR && it.priceUSD) ? '<span class="price-sub">' + t.priceUsd + " $ " + fmt(it.priceUSD) + "</span>" : "";

    var facts = [];
    facts.push("<li><span>" + t.type + "</span><span>" + typeLabel(it.type) + "</span></li>");
    if (it.location) facts.push("<li><span>" + t.location + "</span><span>" + esc(it.location) + "</span></li>");
    if (it.size) facts.push("<li><span>" + t.size + "</span><span>" + esc(it.size) + "</span></li>");
    if (it.beds) facts.push("<li><span>" + t.beds + "</span><span>" + esc(it.beds) + "</span></li>");

    var waMsg = encodeURIComponent(t.wa + it.title + " (" + location.href + ")");

    root.innerHTML =
      '<a href="katalog.html" class="detail-back">' + t.toCatalog + "</a>" +
      '<div class="detail-hero">' +
        '<div class="detail-img"><img src="' + (it.image || it.thumb || "") + '" alt="' + esc(it.title) + '" /></div>' +
        '<aside class="detail-side"><div class="detail-card">' +
          '<p class="card-loc">' + esc(it.location || "Paraguay") + "</p>" +
          "<h1 style=\"font-size:1.7rem;margin:.2rem 0 .6rem\">" + esc(it.title) + "</h1>" +
          price + priceSub +
          '<ul class="detail-facts">' + facts.join("") + "</ul>" +
          '<a class="btn btn-gold btn-block" target="_blank" rel="noopener" href="https://wa.me/595981152015?text=' + waMsg + '">' + t.inquire + "</a>" +
          (it.url ? '<p class="detail-orig"><a href="' + it.url + '" target="_blank" rel="noopener" style="color:var(--gold-deep);text-decoration:underline">' + t.orig + "</a></p>" : "") +
        "</div></aside>" +
      "</div>" +
      (it.desc ? '<div class="detail-desc"><h2>' + t.desc + "</h2><p>" + esc(it.desc) + "</p></div>" : "");
  }).catch(function () {
    root.innerHTML = '<p class="cat-empty">' + t.notfound + "</p>";
  });
})();
