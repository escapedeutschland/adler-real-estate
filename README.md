# ADLER Real Estate — Website

Premium-Website für **ADLER Real Estate** (Immobilien in Paraguay, Caacupé). Vorschau-Entwurf zur Abstimmung — noch nicht live.

## Stack
- Statische Seite: HTML / CSS / Vanilla JS (keine Build-Tools)
- Mehrsprachig **DE / ES / EN** (`assets/js/i18n.js`, Umschalter im Header)
- Gehostet über **GitHub Pages**

## Lokale Vorschau
```bash
python -m http.server 8740
# http://localhost:8740
```

## Struktur
- `index.html` — alle Sektionen (Hero · Service · Objekte · Über uns · Newsletter · Kontakt)
- `assets/css/styles.css` — Designsystem
- `assets/js/i18n.js` — Übersetzungen (DE = Originaltexte der Bestandsseite)
- `assets/js/app.js` — Sprachumschalter, Navigation, Reveal-Animationen, Lightbox, Formulare
- `assets/img/` — Bilder & Logo

## Status / offen
- Inhalte & Bilder teils Platzhalter (saubere Originalfotos ohne Text/Maskottchen nötig)
- Öffnungszeiten bestätigen
- Formulare sind Demo — Live: Anbindung an Dienst (z. B. Brevo / Formspree) + DSGVO Double-Opt-In
- Optional laut Strategie: Aufklärungs-Sektion „So kauft man in Paraguay" + Valle-Ballena-Interessentenliste

🤖 Generated with [Claude Code](https://claude.com/claude-code)
