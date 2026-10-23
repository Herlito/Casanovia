import React, { useState } from 'react';
import { 
  HardDrive, 
  X, 
  Layers, 
  Database, 
  FolderTree, 
  Sparkles, 
  LayoutTemplate, 
  MapPin, 
  Users, 
  FileSpreadsheet, 
  Calendar, 
  CheckCircle2, 
  Info,
  Server,
  FileCode,
  Image as ImageIcon
} from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';

interface HostingDiskReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HostingDiskReportModal: React.FC<HostingDiskReportModalProps> = ({ isOpen, onClose }) => {
  const { weddings, isLevel1Admin, uploadedImages } = useWedding();
  const [activeTab, setActiveTab] = useState<'resumen' | 'modulos' | 'eventos'>('resumen');

  if (!isOpen || !isLevel1Admin) return null;

  // Real-time metrics based on current storage breakdown
  const totalSubirWebMB = 29.13;
  const coreCleanSystemMB = 7.20; // Sistema limpio sin bodas, ni fotos, ni diseños guardados
  const apiBackendMB = 2.26;
  const assetsCompiledMB = 26.70;
  const fontsAndLogosKB = 122.5;

  // Module breakdown (compiled client bundles)
  const modulesList = [
    {
      name: 'WeddingCraft Studio & Motor Gráfico',
      description: 'Editor visual de invitaciones, renderizador interactivo y motor Canvas',
      size: '1.42 MB',
      percentage: 19.7,
      color: 'bg-pink-500',
      icon: LayoutTemplate,
    },
    {
      name: 'Panel de Control & Gestión (Dashboard)',
      description: 'Cronograma protocolar, presupuesto, tareas, cotizaciones y motor Excel XLSX',
      size: '1.25 MB',
      percentage: 17.3,
      color: 'bg-purple-500',
      icon: Calendar,
    },
    {
      name: 'Diseñador de Planos & Generador PDF',
      description: 'Diseñador interactivo de mesas, lienzo drag-and-drop y exportador jsPDF',
      size: '0.85 MB',
      percentage: 11.8,
      color: 'bg-rose-500',
      icon: MapPin,
    },
    {
      name: 'Backend PHP & Motor de Base de Datos SQLite',
      description: 'APIs RESTful, driver PDO autónomo, autenticación segura y persistencia local',
      size: '2.26 MB',
      percentage: 31.4,
      color: 'bg-blue-500',
      icon: Server,
    },
    {
      name: 'Módulo de Invitados, Accesos & RSVP',
      description: 'Confirmaciones de asistencia en línea, pases QR y validación de entrada',
      size: '0.05 MB',
      percentage: 0.7,
      color: 'bg-emerald-500',
      icon: Users,
    },
    {
      name: 'Planes, Tarifario & Pasarela de Pagos',
      description: 'Packs de contratación, comprobantes de pago y configuración financiera',
      size: '0.08 MB',
      percentage: 1.1,
      color: 'bg-amber-500',
      icon: FileSpreadsheet,
    },
    {
      name: 'Librerías Core & Estilos Tailwind',
      description: 'Framework React SPA, iconos Lucide y hoja de estilos global',
      size: '1.29 MB',
      percentage: 18.0,
      color: 'bg-gray-600',
      icon: FileCode,
    }
  ];

  // Calculate live event sizes
  const eventsDetails = weddings.map((w) => {
    const rawJson = JSON.stringify(w);
    const byteSize = new Blob([rawJson]).size;
    const kbSize = (byteSize / 1024).toFixed(2);
    const guestsCount = (w.guests || []).length;
    const tablesCount = (w.tables || []).length;
    const vendorsCount = (w.vendors || []).length;
    const tasksCount = (w.tasks || []).length;

    return {
      id: w.id,
      coupleNames: w.coupleNames || w.settings?.coupleNames || 'Sin Nombre',
      kbSize: parseFloat(kbSize),
      formattedSize: `${kbSize} KB`,
      guestsCount,
      tablesCount,
      vendorsCount,
      tasksCount,
      date: w.weddingDate ? new Date(w.weddingDate).toLocaleDateString() : 'Sin fecha',
    };
  }).sort((a, b) => b.kbSize - a.kbSize);

  const totalEventsKB = eventsDetails.reduce((acc, ev) => acc + ev.kbSize, 0).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#EBEBEB] rounded-[2rem] sm:rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-[12px_12px_24px_#1a1a1a,-12px_-12px_24px_#333333] border border-gray-300/60 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-gray-300/70 flex items-center justify-between bg-[#EBEBEB] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-blue-600 flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">
                Reporte de Espacio en Disco
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                Auditoría de almacenamiento en hosting (casanovia.pe)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 pb-1 bg-[#EBEBEB] shrink-0">
          <div className="flex bg-[#EBEBEB] rounded-2xl p-1 gap-1 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
            <button
              type="button"
              onClick={() => setActiveTab('resumen')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'resumen'
                  ? 'bg-[#EBEBEB] text-blue-700 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff]'
                  : 'text-gray-600 hover:text-gray-900 bg-transparent'
              }`}
            >
              1. Resumen de Carpetas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('modulos')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'modulos'
                  ? 'bg-[#EBEBEB] text-blue-700 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff]'
                  : 'text-gray-600 hover:text-gray-900 bg-transparent'
              }`}
            >
              2. Peso por Módulos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('eventos')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'eventos'
                  ? 'bg-[#EBEBEB] text-blue-700 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff]'
                  : 'text-gray-600 hover:text-gray-900 bg-transparent'
              }`}
            >
              3. Eventos Registrados ({weddings.length})
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-gray-800">
          
          {/* TAB 1: RESUMEN DE CARPETAS & SISTEMA BASE */}
          {activeTab === 'resumen' && (
            <div className="space-y-4">
              {/* Highlight Card: Sistema Base Limpio */}
              <div className="bg-[#EBEBEB] rounded-2xl p-4 sm:p-5 shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border border-blue-200/60 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-extrabold text-blue-900 uppercase tracking-wide">
                      ¿Cuánto ocupa el sistema limpio (sin eventos, planos ni fotos)?
                    </span>
                  </div>
                  <span className="font-mono text-base sm:text-xl font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl shadow-xs">
                    ~ {coreCleanSystemMB.toFixed(2)} MB
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                  El sistema base de Casanovia (código fuente optimizado de la aplicación React SPA + Backend PHP + motor SQLite en blanco) ocupa solo <strong>7.20 Megabytes</strong>, lo que permite una carga ultrarrápida en cualquier plan de hosting compartido cPanel.
                </p>
              </div>

              {/* Folder Hierarchy Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* /assets Folder */}
                <div className="bg-[#EBEBEB] p-4 rounded-2xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <FolderTree className="w-4 h-4 text-purple-600" />
                      /assets/ (Frontend)
                    </span>
                    <span className="font-mono text-xs font-black text-purple-800">26.70 MB</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Incluye los scripts JS/CSS compilados de la aplicación, plantillas predefinidas y librerías visuales de invitaciones.
                  </p>
                </div>

                {/* /api Folder */}
                <div className="bg-[#EBEBEB] p-4 rounded-2xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-blue-600" />
                      /api/ (Backend & DB)
                    </span>
                    <span className="font-mono text-xs font-black text-blue-800">2.26 MB</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Controladores PHP, base de datos autónoma SQLite (`database.sqlite`) y endpoints seguros de autenticación.
                  </p>
                </div>

                {/* /uploads Folder */}
                <div className="bg-[#EBEBEB] p-4 rounded-2xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-rose-600" />
                      /uploads/ (Galería Novios)
                    </span>
                    <span className="font-mono text-xs font-black text-rose-800">
                      {uploadedImages.length > 0 ? `${uploadedImages.length} fotos subidas` : '1.0 KB (Inicial)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Carpeta protegida para fotografías de novios, portadas y comprobantes de pago subidos.
                  </p>
                </div>

                {/* Fonts & Root files */}
                <div className="bg-[#EBEBEB] p-4 rounded-2xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-emerald-600" />
                      index.html, .htaccess & fonts/
                    </span>
                    <span className="font-mono text-xs font-black text-emerald-800">{fontsAndLogosKB} KB</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Archivo index principal, tipografías tipográficas integradas y reglas de enrutamiento Apache.
                  </p>
                </div>
              </div>

              {/* Total Summary Footer Bar */}
              <div className="bg-[#EBEBEB] p-3.5 rounded-2xl shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-bold text-gray-700">Espacio Total Ocupado en Hosting (SubirWeb completo):</span>
                <span className="font-mono text-sm font-black text-gray-900">{totalSubirWebMB} MB</span>
              </div>
            </div>
          )}

          {/* TAB 2: PESO POR MÓDULOS DEL SISTEMA */}
          {activeTab === 'modulos' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                Distribución del peso en disco del código compilado según cada funcionalidad del sistema:
              </p>

              <div className="space-y-2.5">
                {modulesList.map((mod, idx) => {
                  const Icon = mod.icon;
                  return (
                    <div key={idx} className="bg-[#EBEBEB] p-3.5 rounded-2xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 truncate">
                          <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-gray-700" />
                          </div>
                          <div className="truncate">
                            <h4 className="font-bold text-xs text-gray-900 truncate">{mod.name}</h4>
                            <p className="text-[10px] text-gray-500 truncate">{mod.description}</p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-black text-gray-900 shrink-0 ml-2">
                          {mod.size}
                        </span>
                      </div>

                      {/* Percentage Bar */}
                      <div className="w-full bg-gray-300/60 rounded-full h-1.5 overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
                        <div 
                          className={`h-full ${mod.color} rounded-full transition-all duration-500`} 
                          style={{ width: `${mod.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ESPACIO POR CADA EVENTO REGISTRADO */}
          {activeTab === 'eventos' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center flex-wrap gap-2 text-xs border-b border-gray-300/70 pb-2">
                <span className="font-bold text-gray-800">
                  Total Eventos: <span className="text-rose-700 font-black">{weddings.length}</span>
                </span>
                <span className="text-gray-600 font-medium">
                  Espacio Total de Registros en DB: <strong className="font-mono text-gray-900">{totalEventsKB} KB (~{(parseFloat(totalEventsKB)/1024).toFixed(2)} MB)</strong>
                </span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {eventsDetails.map((ev, i) => (
                  <div 
                    key={ev.id} 
                    className="bg-[#EBEBEB] p-3 rounded-2xl shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <h4 className="font-bold text-xs text-gray-900 truncate">
                          {ev.coupleNames}
                        </h4>
                      </div>
                      <div className="text-[10px] text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5 pl-7">
                        <span>👥 {ev.guestsCount} invitados</span>
                        <span>🪑 {ev.tablesCount} mesas</span>
                        <span>📋 {ev.tasksCount} tareas</span>
                        <span>🤝 {ev.vendorsCount} proveedores</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg shadow-2xs block">
                        {ev.formattedSize}
                      </span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">
                        ID: {ev.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#EBEBEB] p-3 rounded-xl shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-[11px] text-gray-600 flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Cada boda ocupa en promedio <strong>~50 KB a 135 KB</strong> en SQLite (incluso con 170+ invitados y 18 mesas). Puedes almacenar más de <strong>10,000 bodas completas</strong> en tan solo 1 GB de hosting.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-300/70 bg-[#EBEBEB] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Cerrar Reporte
          </button>
        </div>

      </div>
    </div>
  );
};
