/* ADLER Real Estate — interactions */
(function () {
  "use strict";
  var dict = window.I18N || {};

  /* ---------- i18n ---------- */
  function applyLang(lang) {
    var table = dict[lang] || dict.de;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = table[el.getAttribute("data-i18n")];
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var v = table[el.getAttribute("data-i18n-ph")];
      if (v != null) el.setAttribute("placeholder", v);
    });
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false");
    });
    try { localStorage.setItem("adler_lang", lang); } catch (e) {}
  }

  var saved = "de";
  try { saved = localStorage.getItem("adler_lang") || "de"; } catch (e) {}
  applyLang(saved);

  document.getElementById("lang").addEventListener("click", function (e) {
    var btn = e.target.closest(".lang-btn");
    if (btn) applyLang(btn.dataset.lang);
  });

  /* ---------- Sticky header ---------- */
  var header = document.getElementById("header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 40); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  burger.addEventListener("click", function () { nav.classList.toggle("open"); });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") nav.classList.remove("open");
  });

  /* ---------- Reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  document.querySelectorAll("[data-lightbox]").forEach(function (img) {
    img.addEventListener("click", function () {
      lbImg.src = img.src; lbImg.alt = img.alt; lb.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });
  function closeLb() { lb.hidden = true; lbImg.src = ""; document.body.style.overflow = ""; }
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-close")) closeLb(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !lb.hidden) closeLb(); });

  /* ---------- Demo forms ---------- */
  function wireDemoForm(formId, successId) {
    var f = document.getElementById(formId);
    if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var s = document.getElementById(successId);
      if (s) s.hidden = false;
      var btn = f.querySelector("button[type=submit]");
      if (btn) btn.disabled = true;
    });
  }
  wireDemoForm("signup", "formSuccess");
  wireDemoForm("contactForm", "contactSuccess");
  wireDemoForm("projectSignup", "projectSuccess");

  /* ---------- Count-up numbers ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (target === 0) { el.textContent = prefix + "0" + suffix; return; }
    var dur = 1500, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = prefix + Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var countEls = document.querySelectorAll(".trust-num[data-count]");
  if (countEls.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    countEls.forEach(function (el) { co.observe(el); });
  }

  /* ---------- Video-Touren (horizontal scroller, from listings.json) ---------- */
  (function buildVideos() {
    var section = document.getElementById("videos");
    var track = document.getElementById("videoScroller");
    if (!section || !track) return;
    var esc = function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
    var play = '<span class="video-play" aria-hidden="true"><svg viewBox="0 0 68 48" width="54" height="38"><path class="vp-bg" d="M66.5 7.7a8 8 0 0 0-5.6-5.7C56 .6 34 .6 34 .6s-22 0-26.9 1.4a8 8 0 0 0-5.6 5.7A83 83 0 0 0 .5 24a83 83 0 0 0 1 16.3 8 8 0 0 0 5.6 5.7C12 47.4 34 47.4 34 47.4s22 0 26.9-1.4a8 8 0 0 0 5.6-5.7A83 83 0 0 0 67.5 24a83 83 0 0 0-1-16.3z"/><path d="M27 34V14l18 10z" fill="#fff"/></svg></span>';
    fetch("assets/data/listings.json?v=13").then(function (r) { return r.json(); }).then(function (data) {
      var vids = (data || []).filter(function (l) { return l.video; });
      if (!vids.length) return;
      track.innerHTML = vids.map(function (l) {
        return '<a class="vid-card" href="objekt.html?id=' + encodeURIComponent(l.id) + '">' +
            '<div class="vid-thumb"><img src="https://i.ytimg.com/vi/' + esc(l.video) + '/hqdefault.jpg" loading="lazy" alt="" />' + play + "</div>" +
            '<div class="vid-card-body"><p class="card-loc">' + esc(l.location || "Paraguay") + "</p><h3>" + esc(l.title || "") + "</h3></div>" +
          "</a>";
      }).join("");
      section.hidden = false;
    }).catch(function () {});
  })();

  /* ---------- Year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
