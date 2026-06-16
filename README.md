# Panino – Ristorante Erding

One-Page-Website für Panino, Cucina italiana am Schrannenplatz, Erding.

## Lokales Testen

```powershell
cd C:\cursor\panino
python -m http.server 8080
```

Browser: http://localhost:8080

## Dateistruktur

```
panino/
├── index.html              Komplette One-Page-Seite (7 Sektionen)
├── css/style.css           Alle Styles (kein Framework)
├── js/main.js              Navigation, Tabs, Modal, GSAP, Counter
├── assets/
│   ├── images/menu/        Echte Speisekarten-Fotos hier ablegen
│   ├── images/gallery/     Ambiente-Fotos (Saal, Bar, Terrasse, Küche)
│   ├── icons/favicon.svg   Logo-Favicon (gold P auf dunklem Grund)
│   └── docs/speisekarte.pdf  Vollständige Karte als PDF (optional)
└── README.md               Diese Datei
```

## Platzhalter ersetzen

Alle eckigen Klammern `[...]` im HTML sind Platzhalter für echte Daten:

| Platzhalter | Ersetzen durch |
|---|---|
| `[JAHR]` | Gründungsjahr des Restaurants |
| `[Inhaber Name]` | Name des Inhabers / Gründers |
| `[+49 8122 XXX XXX]` | Echte Telefonnummer |
| `[info@panino-erding.de]` | Echte E-Mail-Adresse |
| `Schrannenplatz [Nr.]` | Hausnummer am Schrannenplatz |

## resmio Widget aktivieren

1. Konto anlegen: https://app.resmio.com  
2. Einstellungen → Widget → Widget-ID notieren  
3. In `js/main.js` die auskommentierten Zeilen in `loadReservationWidget()` aktivieren  
4. Widget-ID eintragen  
5. In `index.html` den `<div class="widget-placeholder">` ersetzen durch:  
   `<div id="resmio-booking-widget"></div>`

## Empfohlene resmio-Einstellungen (Spam-Schutz)

- E-Mail-Bestätigung erforderlich (Double-Opt-In) aktivieren
- Neue Buchungen zuerst als "Anfrage" (manuelle Freigabe)
- Max. Buchungen pro E-Mail-Adresse: 1 pro Zeitfenster
- Telefonnummer als Pflichtfeld

## Eigene Bilder eintragen

Unsplash-Platzhalter in `index.html` durch echte Fotos ersetzen:

- Hero-Hintergrund: `css/style.css` → `.hero-bg` → `background-image: url('...')`  
- Speisekarten-Fotos: `<img src="assets/images/menu/GERICHT.jpg">`  
- Galerie-Fotos: `<img src="assets/images/gallery/RAUM.jpg">`  

Empfohlenes Format: WebP, max. 1920×1280 px, ~100–150 KB pro Datei.

## CDN-Abhängigkeiten

| Bibliothek | Version | Zweck |
|---|---|---|
| GSAP | 3.12.5 | Scroll-Animationen, Hero-Einblendung |
| ScrollTrigger | 3.12.5 | Animations-Trigger beim Scrollen |
| Lucide Icons | latest | Telefon, Uhr, Standort, Download-Icons |
| Google Fonts | — | Playfair Display + DM Sans |

Alle via CDN — kein npm, kein Build-Step nötig.
