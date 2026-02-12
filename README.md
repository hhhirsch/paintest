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
