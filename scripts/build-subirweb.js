import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const OUTPUT_DIR = path.join(ROOT_DIR, 'SubirWeb');
const BACKEND_DIR = path.join(ROOT_DIR, 'public', 'cpanel-backend');

console.log('🚀 Iniciando empaquetado de la carpeta "SubirWeb" para casanovia.pe / cPanel...');

// 1. Usar la compilación fresca de dist/
console.log('📦 Empaquetando distribución compilada...');

// 2. Limpiar o crear carpeta SubirWeb
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Función recursiva para copiar directorios
function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });

  fs.readdirSync(from).forEach((element) => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

// 3. Copiar todo el contenido de dist/ a SubirWeb/ (omitiendo archivos empaquetados previos)
console.log('📂 Copiando archivos de la interfaz web a SubirWeb/...');
function copyWebAssetsSync(from, to) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });

  fs.readdirSync(from).forEach((element) => {
    if (element.startsWith('SubirWeb') || element.endsWith('.zip') || element.endsWith('.tar.gz') || element.endsWith('.tar') || element === 'cpanel-backend') return;
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyWebAssetsSync(path.join(from, element), path.join(to, element));
    }
  });
}
copyWebAssetsSync(DIST_DIR, OUTPUT_DIR);

// 4. Copiar los archivos del backend PHP (api, .htaccess, schema) a SubirWeb/
console.log('🐘 Integrando Backend PHP y base de datos autónoma en SubirWeb/...');
const apiTarget = path.join(OUTPUT_DIR, 'api');
copyFolderSync(path.join(BACKEND_DIR, 'api'), apiTarget);

// Copiar .htaccess principal
if (fs.existsSync(path.join(BACKEND_DIR, '.htaccess'))) {
  fs.copyFileSync(path.join(BACKEND_DIR, '.htaccess'), path.join(OUTPUT_DIR, '.htaccess'));
}

// Crear carpeta uploads/ con protección y permisos
const uploadsDir = path.join(OUTPUT_DIR, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
fs.writeFileSync(path.join(uploadsDir, 'index.html'), '<!DOCTYPE html><html><head><title>Uploads</title></head><body>Acceso protegido.</body></html>');
fs.writeFileSync(path.join(uploadsDir, '.htaccess'), '<IfModule mod_rewrite.c>\nRewriteEngine Off\n</IfModule>\nOptions -Indexes\n');

// Crear carpeta api/data/ protegida para SQLite y Semilla de datos
const dataDir = path.join(OUTPUT_DIR, 'api', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
fs.writeFileSync(path.join(dataDir, '.htaccess'), 'Order deny,allow\nDeny from all\n');

// Cargar bodas y diseños publicados guardados
let seedWeddings = [];
let seedPublishedDesigns = {};

try {
  const pdPath = path.resolve(ROOT_DIR, 'src/data/publishedDesignsData.json');
  if (fs.existsSync(pdPath)) {
    seedPublishedDesigns = JSON.parse(fs.readFileSync(pdPath, 'utf8'));
    delete seedPublishedDesigns['boda-sofia-alejandro'];
    delete seedPublishedDesigns['boda-valentina-mateo'];
    delete seedPublishedDesigns['boda-zenaida-ronny'];
  }
} catch (e) {
  console.warn('Could not read publishedDesignsData.json:', e.message);
}

// Crear archivo seed.json inicial completo
const baseSeedData = {
  casanoviaVersion: '3.0.0-complete-suite',
  createdAt: new Date().toISOString(),
  systemUsers: [
    {
      id: 'user-herly',
      username: 'Herly Lizarazo',
      clave: '00448157',
      level: 1,
      roleTitle: 'Director General & Protocolo (Nivel 1 - Super Admin)',
      isSystemDefault: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ],
  weddings: seedWeddings,
  publishedDesigns: seedPublishedDesigns,
  stats: {
    totalUsers: 4,
    totalWeddings: seedWeddings.length,
    totalPublishedDesigns: Object.keys(seedPublishedDesigns).length,
    description: 'Semilla inicial autoprovisionada con todas las bodas y diseños para casanovia.pe'
  }
};
fs.writeFileSync(path.join(dataDir, 'seed.json'), JSON.stringify(baseSeedData, null, 2));

// Escribir diseños publicados individuales para carga ultra-rápida de invitados
const publishedDir = path.join(OUTPUT_DIR, 'api', 'data', 'weddingcraft', 'published');
fs.mkdirSync(publishedDir, { recursive: true });
for (const [wId, pDoc] of Object.entries(seedPublishedDesigns)) {
  fs.writeFileSync(
    path.join(publishedDir, `${wId}.json`),
    JSON.stringify({ wedding_id: wId, design: { document: pDoc } }, null, 2)
  );
}

// Crear archivo de instrucciones claras para el usuario
const readmeContent = `========================================================================
 GUÍA RÁPIDA: CÓMO INSTALAR CASANOVIA EN TU CPANEL (casanovia.pe)
========================================================================

¡Todo está 100% configurado y automatizado! 
Tu servidor guardará usuarios, contraseñas, bodas, lista de invitados,
confirmaciones RSVP e imágenes de forma completamente autónoma.

PASO ÚNICO PARA SUBIR A TU CPANEL:
------------------------------------------------------------------------
1. Ingresa a tu cPanel (casanovia.pe).
2. Entra en "Administrador de archivos" (File Manager).
3. Abre la carpeta "public_html".
4. Sube y descomprime 'SubirWeb_Actualizacion.tar.gz' (o 'SubirWeb.tar.gz')
   directamente dentro de "public_html".

¡Y LISTO!
Abre https://casanovia.pe en tu navegador.
========================================================================
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'LEEME-INSTRUCCIONES.txt'), readmeContent);

// 5. Crear paquetes .tar.gz nativos de cPanel directamente (sin generar .zip)
console.log('📦 Generando paquetes .tar.gz nativos para cPanel...');

try {
  // Paquete completo SubirWeb.tar.gz
  execSync(`tar -czf "${path.join(ROOT_DIR, 'SubirWeb.tar.gz')}" -C "${OUTPUT_DIR}" .`);
  fs.copyFileSync(path.join(ROOT_DIR, 'SubirWeb.tar.gz'), path.join(DIST_DIR, 'SubirWeb.tar.gz'));
  fs.copyFileSync(path.join(ROOT_DIR, 'SubirWeb.tar.gz'), path.join(ROOT_DIR, 'public', 'SubirWeb.tar.gz'));

  // Paquete ligero de actualización SubirWeb_Actualizacion.tar.gz (~1.8 MB): Excluye base de datos, fotos y assets estáticos no modificados
  execSync(`tar --exclude="api/database.sqlite" --exclude="uploads" --exclude="assets/weddingcraft" -czf "${path.join(ROOT_DIR, 'SubirWeb_Actualizacion.tar.gz')}" -C "${OUTPUT_DIR}" .`);
  fs.copyFileSync(path.join(ROOT_DIR, 'SubirWeb_Actualizacion.tar.gz'), path.join(DIST_DIR, 'SubirWeb_Actualizacion.tar.gz'));
  fs.copyFileSync(path.join(ROOT_DIR, 'SubirWeb_Actualizacion.tar.gz'), path.join(ROOT_DIR, 'public', 'SubirWeb_Actualizacion.tar.gz'));

  // Paquete alias solo modificados
  fs.copyFileSync(path.join(ROOT_DIR, 'SubirWeb_Actualizacion.tar.gz'), path.join(DIST_DIR, 'solo_modificados_casanovia.tar.gz'));
  fs.copyFileSync(path.join(ROOT_DIR, 'SubirWeb_Actualizacion.tar.gz'), path.join(ROOT_DIR, 'public', 'solo_modificados_casanovia.tar.gz'));

  // Generar Actualizacion_Reciente.tar.gz (solo assets modificados + index.html)
  try {
    const TARGET_DIR = path.join(ROOT_DIR, 'Actualizacion_Reciente');
    if (fs.existsSync(TARGET_DIR)) {
      fs.rmSync(TARGET_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(path.join(TARGET_DIR, 'assets'), { recursive: true });
    fs.copyFileSync(path.join(DIST_DIR, 'index.html'), path.join(TARGET_DIR, 'index.html'));

    const assets = fs.readdirSync(path.join(DIST_DIR, 'assets'));
    for (const a of assets) {
      const full = path.join(DIST_DIR, 'assets', a);
      if (fs.lstatSync(full).isFile()) {
        fs.copyFileSync(full, path.join(TARGET_DIR, 'assets', a));
      }
    }

    execSync(`tar -czf "${path.join(ROOT_DIR, 'public', 'Actualizacion_Reciente.tar.gz')}" -C "${TARGET_DIR}" .`);
    fs.copyFileSync(path.join(ROOT_DIR, 'public', 'Actualizacion_Reciente.tar.gz'), path.join(DIST_DIR, 'Actualizacion_Reciente.tar.gz'));
    fs.copyFileSync(path.join(ROOT_DIR, 'public', 'Actualizacion_Reciente.tar.gz'), path.join(ROOT_DIR, 'Actualizacion_Reciente.tar.gz'));
  } catch (err) {
    console.warn('Advertencia al generar Actualizacion_Reciente.tar.gz:', err.message);
  }

  console.log('✅ ¡SubirWeb_Actualizacion.tar.gz creado exitosamente!');
  console.log('✅ ¡Actualizacion_Reciente.tar.gz creado exitosamente!');
  console.log('🎯 Solo formato .tar.gz listo (sin compresión .zip).');
} catch (tarErr) {
  console.warn('Advertencia al generar tar.gz:', tarErr.message);
}
