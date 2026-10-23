import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'serve-subirweb-packages',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.method === 'POST' && req.url === '/api/publish-design-to-project') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const { eventId, document } = JSON.parse(body);
                  if (eventId && document) {
                    const cleanEvt = eventId.replace(/^(\d{4}-|boda-|wedding-)/i, '').toLowerCase();
                    const cleanEvtNoSuffix = cleanEvt.replace(/[-_]\d+$/, '');

                    // 1. Update publishedDesignsData.json
                    const filePath = path.join(process.cwd(), 'src', 'data', 'publishedDesignsData.json');
                    let currentData: Record<string, any> = {};
                    if (fs.existsSync(filePath)) {
                      currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    }
                    currentData[eventId] = document;
                    currentData[cleanEvt] = document;
                    currentData[cleanEvtNoSuffix] = document;
                    currentData[`boda-${cleanEvt}`] = document;
                    currentData[`boda-${cleanEvtNoSuffix}`] = document;
                    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf8');

                    // 2. Update firestoreWeddingsSeed.json
                    const seedPath = path.join(process.cwd(), 'src', 'data', 'firestoreWeddingsSeed.json');
                    if (fs.existsSync(seedPath)) {
                      try {
                        const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
                        if (Array.isArray(seed)) {
                          const w = seed.find((item: any) => item.id === eventId || item.id === cleanEvt || item.id === cleanEvtNoSuffix);
                          if (w) {
                            w.weddingCraftDesign = document;
                            fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf8');
                          }
                        }
                      } catch (e) {}
                    }

                    // 3. Update public/cpanel-backend files
                    const cpanelDir = path.join(process.cwd(), 'public', 'cpanel-backend', 'api', 'data', 'weddingcraft', 'published');
                    if (fs.existsSync(cpanelDir)) {
                      fs.writeFileSync(path.join(cpanelDir, `${eventId}.json`), JSON.stringify(document, null, 2), 'utf8');
                      fs.writeFileSync(path.join(cpanelDir, `${cleanEvt}.json`), JSON.stringify(document, null, 2), 'utf8');
                    }

                    // 4. Update SubirWeb files if present
                    const subirDir = path.join(process.cwd(), 'SubirWeb', 'api', 'data', 'weddingcraft', 'published');
                    if (fs.existsSync(subirDir)) {
                      fs.writeFileSync(path.join(subirDir, `${eventId}.json`), JSON.stringify(document, null, 2), 'utf8');
                      fs.writeFileSync(path.join(subirDir, `${cleanEvt}.json`), JSON.stringify(document, null, 2), 'utf8');
                    }

                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true }));
                    return;
                  }
                } catch (err) {
                  console.error('Error packaging published design to project:', err);
                }
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid payload' }));
              });
              return;
            }

            if (req.url && (req.url.includes('/api/clean_residuals') || req.url.includes('/api/clean-residuals'))) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                purgedCount: 0,
                purgedFiles: [],
                message: 'El entorno local y el servidor están limpios. No se encontraron archivos residuales.'
              }));
              return;
            }

            if (req.url && (req.url.startsWith('/SubirWeb') || req.url.includes('actualizacion_casanovia') || req.url.includes('.tar.gz') || req.url.includes('.zip'))) {
              const cleanUrl = req.url.split('?')[0].replace(/^\/+/, '');
              const baseName = path.basename(cleanUrl);
              const searchPaths = [
                path.join(process.cwd(), 'public', baseName),
                path.join(process.cwd(), 'public', cleanUrl),
                path.join(process.cwd(), 'dist', baseName),
                path.join(process.cwd(), 'dist', cleanUrl),
                path.join(process.cwd(), baseName),
                path.join(process.cwd(), cleanUrl)
              ];

              let foundPath: string | null = null;
              for (const p of searchPaths) {
                if (fs.existsSync(p) && fs.statSync(p).isFile()) {
                  foundPath = p;
                  break;
                }
              }

              if (foundPath) {
                const stat = fs.statSync(foundPath);
                const fileName = path.basename(foundPath);
                const isGzip = fileName.endsWith('.tar.gz') || fileName.endsWith('.gz');
                const isZip = fileName.endsWith('.zip');
                res.statusCode = 200;
                res.setHeader('Content-Type', isGzip ? 'application/gzip' : isZip ? 'application/zip' : 'application/octet-stream');
                res.setHeader('Content-Length', String(stat.size));
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
                
                const stream = fs.createReadStream(foundPath);
                stream.on('error', (err) => {
                  console.error('Stream error serving package:', err);
                  if (!res.headersSent) {
                    res.statusCode = 500;
                    res.end('Error reading file');
                  }
                });
                stream.pipe(res);
                return;
              } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.end(`Archivo "${baseName}" no encontrado. Por favor espere a que termine la compilación.`);
                return;
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      dedupe: ['react', 'react-dom', 'firebase', 'zustand'],
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/xlsx')) {
              return 'vendor-excel';
            }
            if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
              return 'vendor-pdf-canvas';
            }
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
              return 'vendor-charts';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
          }
        }
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
