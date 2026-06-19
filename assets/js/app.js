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

  /* ---------- Year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
