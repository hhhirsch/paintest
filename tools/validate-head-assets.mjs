import { readFileSync, existsSync } from 'node:fs';
import { extname } from 'node:path';

const htmlPath = 'index.html';
const html = readFileSync(htmlPath, 'utf8');

const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
if (!headMatch) {
  console.error('❌ Kein <head>-Bereich in index.html gefunden.');
  process.exit(1);
}

const head = headMatch[1];
const scriptTags = [...head.matchAll(/<script\b[^>]*>/gi)].map((m) => m[0]);
const linkTags = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return m?.[2] ?? null;
};

const jsExt = new Set(['.js', '.mjs', '.cjs']);
const cssExt = new Set(['.css']);
const binaryExt = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.otf', '.mp4', '.mp3'
]);

let hasErrors = false;

for (const tag of scriptTags) {
  const src = attr(tag, 'src');
  if (!src) continue;
  const ext = extname(src.split('?')[0]);
  if (!jsExt.has(ext)) {
    hasErrors = true;
    console.error(`❌ Script verweist nicht auf JavaScript: ${src}`);
  }
}

for (const tag of linkTags) {
  const rel = (attr(tag, 'rel') || '').toLowerCase();
  const href = attr(tag, 'href');
  if (!href) continue;

  if (rel === 'stylesheet') {
    const normalizedHref = href.split('?')[0];
    const ext = extname(normalizedHref);
    const isGoogleFontsCss = /^https:\/\/fonts\.googleapis\.com\/css2/i.test(normalizedHref);

    if (!cssExt.has(ext) && !isGoogleFontsCss) {
      hasErrors = true;
      console.error(`❌ Stylesheet-Link verweist nicht auf CSS: ${href}`);
    }
  }

  if (rel === 'stylesheet' || rel === 'preload' || rel === 'modulepreload') {
    const ext = extname(href.split('?')[0]);
    if (binaryExt.has(ext) && rel === 'stylesheet') {
      hasErrors = true;
      console.error(`❌ Binärdatei als Stylesheet eingebunden: ${href}`);
    }
  }
}

const localAssetsToCheck = [
  { path: 'styles.css', expected: 'text/css' },
  { path: 'script.js', expected: 'text/javascript' }
];

for (const file of localAssetsToCheck) {
  if (!existsSync(file.path)) {
    hasErrors = true;
    console.error(`❌ Erwartete Datei fehlt: ${file.path}`);
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log('✅ Head-Check erfolgreich: <script> nutzt JS, <link rel="stylesheet"> nutzt CSS.');
console.log('ℹ️ MIME-Hinweis: Server sollte script.js als text/javascript und styles.css als text/css ausliefern.');
