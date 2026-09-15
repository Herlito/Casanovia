import React, { useState, useRef } from 'react';
import { 
  FolderUp, 
  Download, 
  CheckCircle2, 
  Server, 
  Database, 
  HardDrive, 
  Sparkles, 
  X, 
  ArrowRight,
  ShieldCheck,
  Globe,
  FileCode,
  Image,
  ExternalLink,
  Upload,
  FileJson,
  Users,
  Heart,
  AlertCircle
} from 'lucide-react';
import JSZip from 'jszip';
import { useWedding } from '../../context/WeddingContext';

interface SubirWebModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubirWebModal: React.FC<SubirWebModalProps> = ({ isOpen, onClose }) => {
  const { 
    weddings, 
    guests, 
    activeWedding, 
    systemUsers, 
    tokensPaymentConfig,
    exportAllDatabaseJson,
    importAllDatabaseJson 
  } = useWedding();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'express' | 'migrate' | 'advanced'>('express');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const totalGuestsCount = weddings.reduce((acc, w) => acc + (w.guests?.length || 0), 0);

  const handleDownloadZip = async () => {
    setIsGenerating(true);
    try {
      // 1. Preparar objeto de semilla con los datos EXACTOS y actuales del usuario
      const seedData = {
        casanoviaVersion: '3.0.0-complete-suite',
        exportedAt: new Date().toISOString(),
        systemUsers,
        weddings,
        tokensPaymentConfig,
        stats: {
          totalWeddings: weddings.length,
          totalUsers: systemUsers.length,
          totalGuests: totalGuestsCount,
        }
      };
      const seedJsonString = JSON.stringify(seedData, null, 2);

      // 2. Intentar descargar el archivo pre-generado SubirWeb.zip e inyectarle los datos actuales
      const response = await fetch('/SubirWeb.zip');
      if (response.ok) {
        const baseBlob = await response.blob();
        const zip = await JSZip.loadAsync(baseBlob);

        // Inyectar datos en api/data/seed.json y en la raíz
        zip.file("api/data/seed.json", seedJsonString);
        zip.file("casanovia_database_seed.json", seedJsonString);

        const updatedZipBlob = await zip.generateAsync({ 
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 9 }
        });

        const url = window.URL.createObjectURL(updatedZipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'SubirWeb.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback: generar ZIP en cliente con los datos completos
        const zip = new JSZip();
        zip.file("casanovia_database_seed.json", seedJsonString);
        zip.file("api/data/seed.json", seedJsonString);
        zip.file("LEEME-INSTRUCCIONES.txt", "Sube el contenido a public_html en casanovia.pe.");
        const content = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'SubirWeb.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Error al generar/descargar ZIP con datos:", err);
      // Descargar JSON de respaldo directo en caso extremo
      exportAllDatabaseJson();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = await importAllDatabaseJson(content);
        setImportStatus(res);
        setTimeout(() => {
          if (res.success) {
            setImportStatus(null);
          }
        }, 5000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#EBEBEB] text-gray-800 rounded-3xl p-6 sm:p-8 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-300">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center justify-center text-amber-600">
              <FolderUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Publicar en mi Hosting Propio
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                  casanovia.pe
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Base de datos, usuarios, contraseñas, registros e imágenes en tu servidor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen de Datos que se van a empaquetar */}
        <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
          <div className="flex items-center space-x-2 px-2 py-1">
            <Heart className="w-4 h-4 text-rose-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 font-semibold uppercase">Bodas</p>
              <p className="text-xs font-bold text-gray-900">{weddings.length} bodas activas</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-2 py-1 border-x border-gray-300">
            <Users className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 font-semibold uppercase">Usuarios</p>
              <p className="text-xs font-bold text-gray-900">{systemUsers.length} administradores</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-2 py-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 font-semibold uppercase">Invitados</p>
              <p className="text-xs font-bold text-gray-900">{totalGuestsCount} registrados</p>
            </div>
          </div>
        </div>

        {/* Selector de modo */}
        <div className="grid grid-cols-3 gap-2 mt-4 p-1.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
          <button
            type="button"
            onClick={() => setActiveTab('express')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'express'
                ? 'bg-[#EBEBEB] text-amber-700 shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Paquete SubirWeb</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('migrate')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'migrate'
                ? 'bg-[#EBEBEB] text-blue-700 shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileJson className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Migrar Datos (1-Clic)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('advanced')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'advanced'
                ? 'bg-[#EBEBEB] text-amber-700 shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Técnico & MySQL</span>
          </button>
        </div>

        {/* TAB 1: PAQUETE SUBIRWEB CON DATOS */}
        {activeTab === 'express' && (
          <div className="space-y-4 mt-4">
            {/* Banner Destacado de Descarga */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5 justify-center sm:justify-start">
                    <HardDrive className="w-4 h-4 text-amber-600" />
                    Paquete Completo "SubirWeb.zip"
                  </h3>
                  <p className="text-xs text-gray-600 max-w-md leading-relaxed">
                    Incluye todas tus <strong>{weddings.length} bodas</strong>, tus <strong>{systemUsers.length} usuarios con sus contraseñas</strong>, y la base de datos local preconfigurada.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={isGenerating}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-[6px_6px_12px_#d97706,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#b45309] transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGenerating ? 'Empaquetando datos...' : 'Descargar SubirWeb.zip con Mis Datos'}</span>
                </button>
              </div>
            </div>

            {/* Pasos Visuales */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Pasos para actualizar en cPanel (casanovia.pe):
              </h4>
              <div className="grid gap-2">
                <div className="p-3 rounded-2xl bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-gray-900">Descarga el nuevo paquete</p>
                    <p className="text-gray-500">Pulsa en el botón naranja superior para descargar <strong>SubirWeb.zip</strong> con tus datos actuales.</p>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-gray-900">Sube y descomprime en cPanel</p>
                    <p className="text-gray-500">En <strong>public_html</strong> de tu cPanel, sube el archivo y haz clic en <strong>"Extract" (Descomprimir)</strong>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MIGRACIÓN DIRECTA JSON */}
        {activeTab === 'migrate' && (
          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-300/60 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
              <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                <FileJson className="w-4 h-4 text-blue-600" />
                Migración Rápida de Datos sin re-subir el sitio
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Si ya subiste los archivos a <code>casanovia.pe</code> y solo quieres transferir tus bodas y usuarios de inmediato, utiliza esta herramienta:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Paso 1: Exportar */}
              <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Paso 1: Aquí
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 mt-1">Exportar Copia Total de Datos</h4>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Descarga un archivo <code>.json</code> con todas tus {weddings.length} bodas, invitados, usuarios y contraseñas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportAllDatabaseJson}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#EBEBEB] text-gray-800 font-bold text-xs shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-600" />
                  <span>Descargar Copia JSON</span>
                </button>
              </div>

              {/* Paso 2: Importar */}
              <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Paso 2: En casanovia.pe
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 mt-1">Restaurar en tu Hosting</h4>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Abre este mismo menú en <code>casanovia.pe</code> y carga el archivo JSON para restaurar todo al 100%.
                  </p>
                </div>
                <div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".json,application/json" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    id="subirweb-import-file-input"
                  />
                  <label
                    htmlFor="subirweb-import-file-input"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-[4px_4px_8px_#059669,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#047857] transition-all flex items-center justify-center space-x-2 cursor-pointer text-center"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar Archivo JSON</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Mensaje de estado de importación */}
            {importStatus && (
              <div className={`p-3.5 rounded-2xl flex items-center space-x-2.5 text-xs font-semibold ${
                importStatus.success ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                {importStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DETALLES TÉCNICOS */}
        {activeTab === 'advanced' && (
          <div className="space-y-3 mt-4">
            <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] space-y-2">
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-amber-600" />
                Estructura de la carpeta SubirWeb
              </h4>
              <ul className="text-[11px] text-gray-600 space-y-1 font-mono">
                <li>📁 <strong>/api/data/seed.json</strong> : Base de datos inicial con tus {weddings.length} bodas y {systemUsers.length} usuarios.</li>
                <li>📁 <strong>/api/data/casanovia.sqlite</strong> : Base de datos SQLite local autoprovisionada.</li>
                <li>📁 <strong>/uploads/</strong> : Almacén local de fotos y galerías de los novios.</li>
                <li>📄 <strong>/.htaccess</strong> : Enrutador para Apache que mantiene las rutas limpias (SPA).</li>
                <li>📄 <strong>/index.html & assets/</strong> : Interfaz de usuario moderna y rápida de Casanovia.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] space-y-2">
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                ¿Deseas usar MySQL en cPanel en vez de SQLite? (Opcional)
              </h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Por defecto el paquete crea la base de datos automáticamente. Si prefieres MySQL de cPanel, abre <code>api/db.php</code> y cambia <code>$USE_MYSQL = true;</code> indicando tus credenciales MySQL.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-gray-300 flex items-center justify-between">
          <div className="text-[10px] text-gray-500">
            Casanovia Suite v3.0 • Compatible con casanovia.pe
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-[#EBEBEB] text-gray-700 font-bold text-xs shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

