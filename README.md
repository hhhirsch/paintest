# Neurolife Demo

## Asset-Guidelines

### Projektstruktur
- `assets/images/`: inhaltliche Bildmotive (z. B. Hero-Bild, Teamfotos, Produktvisuals).
- `assets/icons/`: UI-Icons im einheitlichen, linearen SVG-Stil.
- `assets/graphics/`: erklärende Diagramme, Verläufe und dekorative Info-Grafiken.

### Bildformate
- **Fotos/Motive:** bevorzugt `webp`, optional `jpg` als Fallback.
- **Icons:** ausschließlich `svg` (skalierbar, konsistent, kleine Dateigröße).
- **Diagramme/Illustrationen:** bevorzugt `svg`; bei komplexen Visuals `webp`.

### Icon-Stil
- Linienbasiert, klare Konturen, keine Schatten in der Datei.
- Einheitliches ViewBox-Raster (`64x64` für Standard-UI-Icons).
- Stroke-Farbe über CSS steuern, nicht fest in mehreren Farben exportieren.

### Maximale Dateigrößen
- Hero-/Hauptbilder: **max. 350 KB**.
- Standard-Inhaltsbilder: **max. 220 KB**.
- Icons: **max. 20 KB** pro SVG.
- Grafiken/Diagramme: **max. 180 KB**.

### Deko vs. inhaltlich relevante Grafik
- **Dekorative Elemente** unterstützen nur Stimmung/Branding und können mit leerem `alt=""` versehen werden.
- **Inhaltlich relevante Grafiken** (z. B. Verlauf, Kennzahlen, Therapiepfade) benötigen präzise `alt`-Texte oder `figcaption`.
- Wenn ein Asset Informationen transportiert, muss die Aussage auch ohne Bild verständlich bleiben (Caption oder begleitender Text).

## Header-Assets und MIME-Checks

Für `index.html` gilt:
- Im `<head>` dürfen `script src="..."` nur auf JavaScript-Dateien zeigen.
- `link rel="stylesheet" href="..."` darf nur CSS referenzieren.
- Bilder, Fonts oder andere Binärdateien dürfen **nicht** als Script/Stylesheet eingebunden werden.

### Automatischer Check
```bash
node tools/validate-head-assets.mjs
```

### MIME-Type am Server prüfen
Beispiel mit lokalem Server auf Port `8080`:
```bash
curl -I http://localhost:8080/styles.css
curl -I http://localhost:8080/script.js
```
Erwartung:
- `styles.css` → `Content-Type: text/css`
- `script.js` → `Content-Type: text/javascript` (oder `application/javascript`)

Für Bilder/Fonts entsprechend:
- Bilder: `image/*`
- Fonts: `font/*`

### Browser-Cache leeren und retesten
- Hard-Reload: `Ctrl+Shift+R` (Windows/Linux) oder `Cmd+Shift+R` (macOS).
- Alternativ DevTools öffnen und „Disable cache“ beim Neuladen aktivieren.
