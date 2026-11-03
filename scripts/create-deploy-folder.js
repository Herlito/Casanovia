import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DEPLOY_DIR = path.join(ROOT_DIR, 'deploy-folder');
const BACKEND_DIR = path.join(ROOT_DIR, 'public', 'cpanel-backend');

console.log('🚀 Creando carpeta de despliegue temporal...\n');

// Verificar que dist/ existe
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ ERROR: La carpeta dist/ no existe. Ejecuta primero: npm run build');
  process.exit(1);
}

// Limpiar carpeta de deploy anterior
if (fs.existsSync(DEPLOY_DIR)) {
  console.log('🧹 Limpiando carpeta deploy-folder anterior...');
  fs.rmSync(DEPLOY_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DEPLOY_DIR, { recursive: true });

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

// 1. Copiar dist/ a deploy-folder/
console.log('📂 Copiando archivos compilados desde dist/...');
copyFolderSync(DIST_DIR, DEPLOY_DIR);

// 2. Copiar backend PHP a deploy-folder/api/
console.log('🐘 Integrando Backend PHP...');
const apiTarget = path.join(DEPLOY_DIR, 'api');
copyFolderSync(path.join(BACKEND_DIR, 'api'), apiTarget);

// Copiar .htaccess principal
if (fs.existsSync(path.join(BACKEND_DIR, '.htaccess'))) {
  fs.copyFileSync(path.join(BACKEND_DIR, '.htaccess'), path.join(DEPLOY_DIR, '.htaccess'));
}

// 3. Crear carpetas necesarias
console.log('📁 Creando estructura de carpetas...');

// uploads/
const uploadsDir = path.join(DEPLOY_DIR, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
fs.writeFileSync(path.join(uploadsDir, 'index.html'), '<!DOCTYPE html><html><head><title>Uploads</title></head><body>Acceso protegido.</body></html>');
fs.writeFileSync(path.join(uploadsDir, '.htaccess'), '<IfModule mod_rewrite.c>\nRewriteEngine Off\n</IfModule>\nOptions -Indexes\n');

// api/data/
const dataDir = path.join(DEPLOY_DIR, 'api', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
fs.writeFileSync(path.join(dataDir, '.htaccess'), 'Order deny,allow\nDeny from all\n');

// 4. Cargar y copiar datos de semilla
console.log('📋 Integrando datos de semilla...');
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
  console.warn('⚠️  No se pudo leer publishedDesignsData.json:', e.message);
}

// Crear seed.json
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

// Crear diseños publicados individuales
const publishedDir = path.join(DEPLOY_DIR, 'api', 'data', 'weddingcraft', 'published');
fs.mkdirSync(publishedDir, { recursive: true });
for (const [wId, pDoc] of Object.entries(seedPublishedDesigns)) {
  fs.writeFileSync(
    path.join(publishedDir, `${wId}.json`),
    JSON.stringify({ wedding_id: wId, design: { document: pDoc } }, null, 2)
  );
}

// 5. Crear instrucciones
const readmeContent = `========================================================================
 CARPETA DE DESPLIEGUE TEMPORAL
========================================================================

Esta carpeta contiene los archivos listos para subir al servidor:
- dist/ (frontend compilado)
- api/ (backend PHP)
- uploads/ (carpeta protegida para uploads)
- Configuraciones de servidor

INSTRUCCIONES DE SUBIDA:
1. Sube TODO el contenido de esta carpeta a public_html/ en tu servidor
2. Asegúrate de que los permisos de carpetas sean correctos (755)
3. Asegúrate de que los permisos de archivos sean correctos (644)

⚠️  IMPORTANTE:
- Esta carpeta es TEMPORAL. Puedes borrarla después de subir al servidor.
- Para crear una nueva carpeta de despliegue, ejecuta: npm run deploy
========================================================================
`;
fs.writeFileSync(path.join(DEPLOY_DIR, 'INSTRUCCIONES.txt'), readmeContent);

console.log('\n✅ Carpeta de despliegue creada exitosamente: deploy-folder/');
console.log('📦 Contenido: dist/ + api/ + configuraciones');
console.log('💡 Sube esta carpeta al servidor cuando se solicite por escrito');
console.log('🗑️  Puedes borrar deploy-folder/ después de subir al servidor\n');
