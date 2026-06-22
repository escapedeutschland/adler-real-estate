/* ADLER Real Estate — single object page with gallery */
(function () {
  "use strict";

  var T = {
    de: { toCatalog:"← Katalog", req:"Auf Anfrage", inquire:"Jetzt anfragen", wa:"Hallo, ich interessiere mich für: ",
      type:"Typ", location:"Ort", size:"Fläche", beds:"Schlafzimmer", baths:"Badezimmer", year:"Baujahr", priceUsd:"ca. in USD",
      orig:"Original-Inserat ansehen ↗", notfound:"Objekt nicht gefunden.", back:"Zum Katalog", desc:"Beschreibung", photos:"Fotos", video:"Video-Tour" },
    es: { toCatalog:"← Catálogo", req:"A consultar", inquire:"Consultar ahora", wa:"Hola, me interesa: ",
      type:"Tipo", location:"Lugar", size:"Superficie", beds:"Dormitorios", baths:"Baños", year:"Año de construcción", priceUsd:"aprox. en USD",
      orig:"Ver anuncio original ↗", notfound:"Inmueble no encontrado.", back:"Al catálogo", desc:"Descripción", photos:"Fotos", video:"Video" },
    en: { toCatalog:"← Catalogue", req:"On request", inquire:"Inquire now", wa:"Hello, I'm interested in: ",
      type:"Type", location:"Location", size:"Area", beds:"Bedrooms", baths:"Bathrooms", year:"Year built", priceUsd:"approx. in USD",
      orig:"View original listing ↗", notfound:"Property not found.", back:"To the catalogue", desc:"Description", photos:"Photos", video:"Video tour" }
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
  function esc(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function thumb(u) { return u.replace(/dimension=[^:/]+/, "dimension=240x180"); }
  function stripUnit(v, units) { var s = String(v == null ? "" : v); var r = s.replace(new RegExp("\\s*(?:" + units + ")\\.?\\s*$", "i"), "").trim(); return r || s; }

  function formatDesc(text) {
    var lines = text.split("\n").map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
    // drop standalone price lines (redundant with the price card)
    lines = lines.filter(function (l) {
      return !(l.length <= 60 && /[\d.,]{3,}\s*(euro|eur|€|usd|us-dollar|gs|guaran)/i.test(l) && /(preis|verkauf|kaufpreis)/i.test(l));
    });
    // merge wrapped sentence fragments (prev has no terminal punctuation & next starts lowercase)
    var merged = [];
    lines.forEach(function (l) {
      if (merged.length) {
        var p = merged[merged.length - 1];
        if (!/[.!?:)]$/.test(p) && /^[a-zäöüß(„"]/.test(l)) { merged[merged.length - 1] = p + " " + l; return; }
      }
      merged.push(l);
    });
    lines = merged;

    var out = "", listOpen = false;
    function closeList() { if (listOpen) { out += "</ul>"; listOpen = false; } }
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i], next = lines[i + 1] || "";
      var heading = (l.length <= 78 && !/[.!?]$/.test(l) && l.split(" ").length <= 9 && next.length > 110) || (/:$/.test(l) && l.length <= 80);
      if (heading) { closeList(); out += "<h4>" + esc(l.replace(/:$/, "")) + "</h4>"; continue; }
      var bullet = l.length <= 118 && !/[.!?]$/.test(l);
      if (bullet) { if (!listOpen) { out += '<ul class="desc-list">'; listOpen = true; } out += "<li>" + esc(l) + "</li>"; continue; }
      closeList(); out += "<p>" + esc(l) + "</p>";
    }
    closeList();
    return out;
  }

  var root = document.getElementById("detailRoot");
  var id = new URLSearchParams(location.search).get("id");

  fetch("assets/data/listings.json?v=15").then(function (r) { return r.json(); }).then(function (data) {
    var it = (data || []).filter(function (x) { return String(x.id) === String(id); })[0];
    if (!it) { root.innerHTML = '<p class="cat-empty">' + t.notfound + ' <a href="katalog.html" style="color:var(--gold-deep)">' + t.back + "</a></p>"; return; }
    var title = it["title_" + lang] || it.title;
    var dFull = it["descFull_" + lang] || it.descFull;
    var dShort = it["desc_" + lang] || it.desc;
    document.title = title + " — ADLER Real Estate";

    var imgs = (it.images && it.images.length) ? it.images : (it.image ? [it.image] : []);
    var multi = imgs.length > 1;

    var price = it.priceEUR ? '<span class="price">€ ' + fmt(it.priceEUR) + "</span>" :
                (it.priceUSD ? '<span class="price">$ ' + fmt(it.priceUSD) + "</span>" :
                '<span class="price" style="font-size:1.4rem;color:var(--gold-deep)">' + t.req + "</span>");
    var priceSub = (it.priceEUR && it.priceUSD) ? '<span class="price-sub">' + t.priceUsd + " $ " + fmt(it.priceUSD) + "</span>" : "";

    var facts = ["<li><span>" + t.type + "</span><span>" + typeLabel(it.type) + "</span></li>"];
    if (it.location) facts.push("<li><span>" + t.location + "</span><span>" + esc(it.location) + "</span></li>");
    if (it.size) facts.push("<li><span>" + t.size + "</span><span>" + esc(it.size) + "</span></li>");
    if (it.beds) facts.push("<li><span>" + t.beds + "</span><span>" + esc(stripUnit(it.beds, "Schlafzimmern?|Zimmer|dormitorios?|bedrooms?")) + "</span></li>");
    if (it.baths) facts.push("<li><span>" + t.baths + "</span><span>" + esc(stripUnit(it.baths, "Badezimmern?|Bäder|Bad|baños?|bathrooms?")) + "</span></li>");
    if (it.year) facts.push("<li><span>" + t.year + "</span><span>" + esc(it.year) + "</span></li>");
    if (imgs.length) facts.push("<li><span>" + t.photos + "</span><span>" + imgs.length + "</span></li>");

    var waMsg = encodeURIComponent(t.wa + title + " (" + location.href + ")");

    var galleryHTML =
      '<div class="gallery">' +
        '<div class="gal-stage">' +
          (multi ? '<button class="gal-nav gal-prev" aria-label="prev">‹</button>' : "") +
          '<img id="galMain" src="' + (imgs[0] || "") + '" alt="' + esc(title) + '" />' +
          (multi ? '<button class="gal-nav gal-next" aria-label="next">›</button>' : "") +
          (multi ? '<span class="gal-count" id="galCount">1 / ' + imgs.length + "</span>" : "") +
        "</div>" +
        (multi ? '<div class="gal-thumbs" id="galThumbs">' + imgs.map(function (u, i) {
          return '<button class="gal-thumb' + (i === 0 ? " active" : "") + '" data-i="' + i + '"><img src="' + thumb(u) + '" loading="lazy" alt="" /></button>';
        }).join("") + "</div>" : "") +
      "</div>";

    var descBlock = (dFull || dShort)
      ? '<div class="detail-desc"><h2>' + t.desc + "</h2>" + (dFull ? formatDesc(dFull) : "<p>" + esc(dShort) + "</p>") + "</div>"
      : "";

    var videoHTML = it.video
      ? '<div class="detail-video"><h2>' + t.video + "</h2>" +
          '<div class="video-facade" data-vid="' + esc(it.video) + '" role="button" tabindex="0" aria-label="' + esc(t.video) + '">' +
            '<img src="https://i.ytimg.com/vi/' + esc(it.video) + '/hqdefault.jpg" alt="" loading="lazy" />' +
            '<span class="video-play" aria-hidden="true"><svg viewBox="0 0 68 48" width="68" height="48"><path class="vp-bg" d="M66.5 7.7a8 8 0 0 0-5.6-5.7C56 .6 34 .6 34 .6s-22 0-26.9 1.4a8 8 0 0 0-5.6 5.7A83 83 0 0 0 .5 24a83 83 0 0 0 1 16.3 8 8 0 0 0 5.6 5.7C12 47.4 34 47.4 34 47.4s22 0 26.9-1.4a8 8 0 0 0 5.6-5.7A83 83 0 0 0 67.5 24a83 83 0 0 0-1-16.3z"/><path d="M27 34V14l18 10z" fill="#fff"/></svg></span>' +
          "</div>" +
        "</div>"
      : "";

    root.innerHTML =
      '<a href="katalog.html" class="detail-back">' + t.toCatalog + "</a>" +
      '<div class="detail-grid">' +
        '<div class="detail-main">' + galleryHTML + videoHTML + descBlock + "</div>" +
        '<aside class="detail-side"><div class="detail-card">' +
          '<p class="card-loc">' + esc(it.location || "Paraguay") + "</p>" +
          '<h1 class="detail-card-title">' + esc(title) + "</h1>" +
          price + priceSub +
          '<ul class="detail-facts">' + facts.join("") + "</ul>" +
          '<a class="btn btn-gold btn-block" target="_blank" rel="noopener" href="https://wa.me/595981152015?text=' + waMsg + '">' + t.inquire + "</a>" +
          (it.url ? '<p class="detail-orig"><a href="' + it.url + '" target="_blank" rel="noopener" style="color:var(--gold-deep);text-decoration:underline">' + t.orig + "</a></p>" : "") +
        "</div></aside>" +
      "</div>";

    /* ---- video facade: load YouTube only on click (fast + privacy-friendly) ---- */
    var facade = document.querySelector(".video-facade");
    if (facade) {
      var playVideo = function () {
        var vid = facade.getAttribute("data-vid");
        var fr = document.createElement("iframe");
        fr.src = "https://www.youtube-nocookie.com/embed/" + vid + "?autoplay=1&rel=0";
        fr.title = t.video;
        fr.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        fr.allowFullscreen = true;
        fr.loading = "lazy";
        facade.innerHTML = "";
        facade.classList.add("playing");
        facade.appendChild(fr);
      };
      facade.addEventListener("click", playVideo);
      facade.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playVideo(); } });
    }

    if (!imgs.length) return;

    /* ---- gallery interactions ---- */
    var cur = 0;
    var main = document.getElementById("galMain");
    var countEl = document.getElementById("galCount");

    // lightbox
    var lb = document.createElement("div");
    lb.className = "lightbox"; lb.hidden = true;
    lb.innerHTML = '<button class="lb-close" aria-label="close">×</button>' +
      (multi ? '<button class="gal-nav lb-prev" aria-label="prev">‹</button>' : "") +
      '<img id="lbImg" src="" alt="" />' +
      (multi ? '<button class="gal-nav lb-next" aria-label="next">›</button>' : "") +
      (multi ? '<span class="gal-count lb-count"></span>' : "");
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("#lbImg"), lbCount = lb.querySelector(".lb-count");

    function show(i) {
      cur = (i + imgs.length) % imgs.length;
      main.src = imgs[cur];
      if (countEl) countEl.textContent = (cur + 1) + " / " + imgs.length;
      document.querySelectorAll(".gal-thumb").forEach(function (b) { b.classList.toggle("active", +b.dataset.i === cur); });
      var act = document.querySelector(".gal-thumb.active"); if (act) act.scrollIntoView({ block: "nearest", inline: "center" });
      if (!lb.hidden) { lbImg.src = imgs[cur]; if (lbCount) lbCount.textContent = (cur + 1) + " / " + imgs.length; }
    }
    function openLb() { lbImg.src = imgs[cur]; if (lbCount) lbCount.textContent = (cur + 1) + " / " + imgs.length; lb.hidden = false; document.body.style.overflow = "hidden"; }
    function closeLb() { lb.hidden = true; document.body.style.overflow = ""; }

    main.addEventListener("click", openLb);
    var p = document.querySelector(".gal-prev"), n = document.querySelector(".gal-next");
    if (p) p.addEventListener("click", function () { show(cur - 1); });
    if (n) n.addEventListener("click", function () { show(cur + 1); });
    document.querySelectorAll(".gal-thumb").forEach(function (b) {
      b.addEventListener("click", function () { show(+b.dataset.i); });
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.classList.contains("lb-close")) closeLb();
      else if (e.target.classList.contains("lb-prev")) show(cur - 1);
      else if (e.target.classList.contains("lb-next")) show(cur + 1);
    });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowLeft") show(cur - 1);
      else if (e.key === "ArrowRight") show(cur + 1);
    });
  }).catch(function () {
    root.innerHTML = '<p class="cat-empty">' + t.notfound + "</p>";
  });
})();
