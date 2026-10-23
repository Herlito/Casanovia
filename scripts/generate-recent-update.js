import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const TARGET_DIR = path.join(ROOT_DIR, 'Actualizacion_Reciente');
if (fs.existsSync(TARGET_DIR)) {
  fs.rmSync(TARGET_DIR, { recursive: true, force: true });
}
fs.mkdirSync(path.join(TARGET_DIR, 'assets'), { recursive: true });

// Copy index.html
fs.copyFileSync(path.join(DIST_DIR, 'index.html'), path.join(TARGET_DIR, 'index.html'));

// Copy only the compiled dist/assets that changed
const assets = fs.readdirSync(path.join(DIST_DIR, 'assets'));
for (const a of assets) {
  const full = path.join(DIST_DIR, 'assets', a);
  if (fs.lstatSync(full).isFile()) {
    fs.copyFileSync(full, path.join(TARGET_DIR, 'assets', a));
  }
}

// Create README
const readme = `========================================================================
ACTUALIZACIÓN CASANOVIA: WEDDINGCRAFT DESIGN Y MEJORAS RECIENTES
========================================================================
Este paquete contiene ÚNICAMENTE los archivos que han sido modificados:
- index.html (conector principal actualizado con los nuevos scripts)
- assets/ (código JavaScript y CSS con los nuevos roles y módulo Finanzas)

NO CONTIENE archivos no modificados:
- Ni base de datos (tus datos, eventos, usuarios y contraseñas quedan intactos).
- Ni imágenes ni fotos de novios (uploads).
- Ni fuentes, íconos o archivos estáticos no modificados.

INSTRUCCIONES DE SUBIDA A CPANEL:
1. Entra a cPanel -> Administrador de archivos -> public_html
2. Sube y descomprime 'Actualizacion_Reciente.zip' (o 'Actualizacion_Reciente.tar.gz')
   reemplazando los archivos coincidentes.
3. ¡Listo! Recarga tu navegador en casanovia.pe con Ctrl + F5.
========================================================================`;
fs.writeFileSync(path.join(TARGET_DIR, 'LEEME-ACTUALIZACION.txt'), readme);

// Create ZIP
const zip = new JSZip();
function addDir(dir, zipNode) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const p = path.join(dir, item);
    if (fs.lstatSync(p).isDirectory()) {
      addDir(p, zipNode.folder(item));
    } else {
      zipNode.file(item, fs.readFileSync(p));
    }
  }
}
addDir(TARGET_DIR, zip);

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } }).then((content) => {
  fs.writeFileSync(path.join(PUBLIC_DIR, 'Actualizacion_Reciente.zip'), content);
  fs.writeFileSync(path.join(DIST_DIR, 'Actualizacion_Reciente.zip'), content);
  console.log('✅ Actualizacion_Reciente.zip generado!');

  execSync(`tar -czf "${path.join(PUBLIC_DIR, 'Actualizacion_Reciente.tar.gz')}" -C "${TARGET_DIR}" .`);
  fs.copyFileSync(path.join(PUBLIC_DIR, 'Actualizacion_Reciente.tar.gz'), path.join(DIST_DIR, 'Actualizacion_Reciente.tar.gz'));
  console.log('✅ Actualizacion_Reciente.tar.gz generado!');
});
