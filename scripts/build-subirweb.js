import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const OUTPUT_DIR = path.join(ROOT_DIR, 'SubirWeb');
const BACKEND_DIR = path.join(ROOT_DIR, 'public', 'cpanel-backend');

console.log('🚀 Iniciando empaquetado de la carpeta "SubirWeb" para casanovia.pe / cPanel...');

// 1. Ejecutar build de Vite si no existe dist o para asegurar última versión
try {
  console.log('📦 Compilando aplicación React con Vite...');
  execSync('npm run build', { stdio: 'inherit' });
} catch (e) {
  console.error('Error durante npm run build:', e);
}

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

// 3. Copiar todo el contenido de dist/ a SubirWeb/
console.log('📂 Copiando archivos de la interfaz web a SubirWeb/...');
copyFolderSync(DIST_DIR, OUTPUT_DIR);

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

// Crear archivo seed.json inicial
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
    {
      id: 'user-planner-guest',
      username: 'Guest Planner',
      clave: '952341165',
      level: 3,
      roleTitle: 'Wedding Planner (Nivel 3 - Wedding Planner)',
      assignedWeddingIds: ['boda-sofia-alejandro', 'boda-valentina-mateo'],
      createdWeddingIds: ['boda-sofia-alejandro', 'boda-valentina-mateo'],
      isSystemDefault: true,
      createdAt: '2026-04-01T00:00:00Z',
    },
    {
      id: 'user-zenaida',
      username: 'Zenaida Anahua',
      clave: '70242438',
      level: 2,
      roleTitle: 'Anfitriona de Boda (Nivel 2 - Anfitrión)',
      assignedWeddingIds: ['boda-zenaida-ronny', 'boda-zenaida-ronald'],
      isSystemDefault: true,
      createdAt: '2026-08-17T00:00:00Z',
    },
    {
      id: 'user-observador',
      username: 'Observador Invitado',
      clave: '55555555',
      level: 5,
      roleTitle: 'Observador Protocolar (Nivel 5 - Solo Lectura)',
      assignedWeddingIds: ['boda-sofia-alejandro', 'boda-valentina-mateo', 'boda-zenaida-ronny'],
      isSystemDefault: true,
      createdAt: '2026-09-01T00:00:00Z',
    },
  ],
  stats: {
    totalUsers: 4,
    description: 'Semilla inicial autoprovisionada para casanovia.pe'
  }
};
fs.writeFileSync(path.join(dataDir, 'seed.json'), JSON.stringify(baseSeedData, null, 2));

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
4. Sube y descomprime TODOS los archivos de esta carpeta "SubirWeb"
   directamente dentro de "public_html".

¡Y LISTO!
Abre https://casanovia.pe en tu navegador.
Tu web, base de datos local y panel de control funcionarán inmediatamente.

------------------------------------------------------------------------
ESTRUCTURA DE ARCHIVOS INCLUIDA:
- index.html, assets/  -> Aplicación interactiva de Casanovia
- api/                 -> Backend PHP y base de datos SQLite autónoma
- uploads/             -> Almacén de fotos y galerías de los novios
- .htaccess            -> Enrutamiento automático para cPanel / Apache
========================================================================
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'LEEME-INSTRUCCIONES.txt'), readmeContent);

// 5. Crear el archivo ZIP comprimido (SubirWeb.zip)
console.log('🗜️ Generando archivo comprimido SubirWeb.zip...');
const zip = new JSZip();

function addFolderToZip(folderPath, zipFolder) {
  const items = fs.readdirSync(folderPath);
  for (const item of items) {
    const fullPath = path.join(folderPath, item);
    const stat = fs.lstatSync(fullPath);
    if (stat.isFile()) {
      zipFolder.file(item, fs.readFileSync(fullPath));
    } else if (stat.isDirectory()) {
      const subZip = zipFolder.folder(item);
      addFolderToZip(fullPath, subZip);
    }
  }
}

addFolderToZip(OUTPUT_DIR, zip);

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } }).then((content) => {
  const zipDistPath = path.join(DIST_DIR, 'SubirWeb.zip');
  const zipPublicPath = path.join(ROOT_DIR, 'public', 'SubirWeb.zip');
  const zipRootPath = path.join(ROOT_DIR, 'SubirWeb.zip');

  fs.writeFileSync(zipDistPath, content);
  fs.writeFileSync(zipPublicPath, content);
  fs.writeFileSync(zipRootPath, content);

  console.log('✅ ¡Carpeta "SubirWeb" y archivo "SubirWeb.zip" creados exitosamente!');
  console.log(`📁 Ubicación de la carpeta lista: ${OUTPUT_DIR}`);
  console.log(`🎁 Ubicación del archivo ZIP: ${zipRootPath}`);
});
