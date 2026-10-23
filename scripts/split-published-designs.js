/**
 * Divide `src/data/publishedDesignsData.json` (14.9 MB) en:
 *  - `publishedDesigns.light.json`   -> diseños pequeños, importacion estatica (~110 KB)
 *  - `publishedDesigns.heavy.json`   -> diseños grandes con fotos base64, carga diferida
 *  - `publishedDesigns.heavyIndex.json` -> slug -> hash del diseño pesado (indice estatico pequeño)
 *
 * El archivo original se conserva intacto: `scripts/build-subirweb.js` lo sigue
 * leyendo para generar el seed.json del hosting.
 *
 * Uso: node scripts/split-published-designs.js
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(HERE, '..', 'src', 'data');
const SRC = path.join(DATA_DIR, 'publishedDesignsData.json');
const LIGHT = path.join(DATA_DIR, 'publishedDesigns.light.json');
const HEAVY = path.join(DATA_DIR, 'publishedDesigns.heavy.json');
const HEAVY_INDEX = path.join(DATA_DIR, 'publishedDesigns.heavyIndex.json');
const HEAVY_THRESHOLD = 200 * 1024;

const source = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const light = {};
const docs = {};
const slugs = {};

for (const [slug, doc] of Object.entries(source)) {
  const serialized = JSON.stringify(doc);
  if (serialized.length <= HEAVY_THRESHOLD) {
    light[slug] = doc;
    continue;
  }
  const hash = crypto.createHash('sha1').update(serialized).digest('hex').slice(0, 12);
  if (!docs[hash]) docs[hash] = doc;
  slugs[slug] = hash;
}

fs.writeFileSync(LIGHT, JSON.stringify(light), 'utf8');
fs.writeFileSync(HEAVY, JSON.stringify({ docs, slugs }), 'utf8');
fs.writeFileSync(HEAVY_INDEX, JSON.stringify(slugs), 'utf8');

const kb = (p) => (fs.statSync(p).size / 1024).toFixed(1) + ' KB';
console.log('light  :', Object.keys(light).length, 'entradas ->', kb(LIGHT));
console.log('heavy  :', Object.keys(docs).length, 'docs unicos /', Object.keys(slugs).length, 'slugs ->', kb(HEAVY));
console.log('indice :', kb(HEAVY_INDEX));
console.log('original:', kb(SRC));
