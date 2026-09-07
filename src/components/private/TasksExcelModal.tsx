import React, { useState, useRef } from 'react';
import { WeddingTask } from '../../types';
import {
  exportTasksToExcel,
  downloadTaskExcelTemplate,
  parseTasksFile,
  PHASE_NAME_MAP,
} from '../../lib/taskExcelUtils';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RotateCcw,
  PlusCircle,
  Layers,
  Loader2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface TasksExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: WeddingTask[];
  coupleNames: string;
  onImport: (newTasks: WeddingTask[], mode: 'append' | 'replace') => Promise<void> | void;
}

export const TasksExcelModal: React.FC<TasksExcelModalProps> = ({
  isOpen,
  onClose,
  tasks,
  coupleNames,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  // Import state
  const [file, setFile] = useState<File | null>(null);
  const [parsedTasks, setParsedTasks] = useState<WeddingTask[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMessage(null);
    setSaveSuccess(false);
    setIsLoading(true);

    try {
      const result = await parseTasksFile(selectedFile);
      if (result.error) {
        setErrorMessage(result.error);
        setParsedTasks([]);
      } else {
        setParsedTasks(result.tasks);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar el archivo Excel.');
      setParsedTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (parsedTasks.length === 0 || isSaving) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await onImport(parsedTasks, importMode);
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar las tareas en la base de datos.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setParsedTasks([]);
    setErrorMessage(null);
    setSaveSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#EBEBEB] w-full max-w-2xl rounded-3xl shadow-[12px_12px_24px_#a3a3a3,-12px_-12px_24px_#ffffff] border border-transparent overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-200/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Gestión Excel • Tareas
              </span>
              <h2 className="font-serif-display text-xl font-bold text-gray-900">
                Exportar / Importar Tareas
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4">
          <div className="p-1 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex space-x-1">
            <button
              type="button"
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-900'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Exportar a Excel</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('import')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'import'
                  ? 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-900'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Importar desde Excel</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: EXPORTAR */}
          {activeTab === 'export' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Summary Card */}
              <div className="p-5 rounded-3xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Resumen de Lista Actual</span>
                  <span className="px-3 py-1 rounded-xl bg-[#EBEBEB] shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff] text-xs font-bold text-emerald-700">
                    {tasks.length} Tareas Registradas
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Descarga un archivo <strong>.xlsx</strong> compatible con Microsoft Excel, Google Sheets y Numbers con la estructura cronológica completa: Fase, Tarea, Prioridad, Responsable, Estado de completitud y Fecha límite.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-gray-600">
                  <div className="px-3 py-2 rounded-xl bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff]">
                    <span className="text-gray-400 block text-[10px]">Completadas</span>
                    <strong className="text-emerald-600 font-bold">{tasks.filter(t => t.isCompleted).length}</strong>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff]">
                    <span className="text-gray-400 block text-[10px]">Pendientes</span>
                    <strong className="text-amber-600 font-bold">{tasks.filter(t => !t.isCompleted).length}</strong>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] col-span-2 sm:col-span-1">
                    <span className="text-gray-400 block text-[10px]">Evento</span>
                    <strong className="text-gray-800 font-semibold truncate block">{coupleNames}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => exportTasksToExcel(tasks, coupleNames)}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-800 text-xs font-bold transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Descargar Lista Actual (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={downloadTaskExcelTemplate}
                  className="sm:w-auto py-3.5 px-4 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-600 hover:text-gray-900 text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  title="Descargar archivo modelo con ejemplos de columnas"
                >
                  <FileSpreadsheet className="w-4 h-4 text-gray-500" />
                  <span>Descargar Plantilla Vacía</span>
                </button>
              </div>

              {/* Column Reference */}
              <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-[11px] text-gray-500 space-y-1.5">
                <div className="font-bold text-gray-700 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Columnas generadas automáticamente:</span>
                </div>
                <p>
                  <span className="font-medium text-gray-700">No.</span> •{' '}
                  <span className="font-medium text-gray-700">Fase</span> •{' '}
                  <span className="font-medium text-gray-700">Tarea</span> •{' '}
                  <span className="font-medium text-gray-700">Prioridad</span> (Alta / Media / Baja) •{' '}
                  <span className="font-medium text-gray-700">Responsable</span> •{' '}
                  <span className="font-medium text-gray-700">Estado</span> (Completada / Pendiente) •{' '}
                  <span className="font-medium text-gray-700">Fecha Límite</span>.
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: IMPORTAR */}
          {activeTab === 'import' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* File Dropzone */}
              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                    dragActive
                      ? 'border-emerald-500 bg-emerald-50/30'
                      : 'border-gray-300 hover:border-gray-400 bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center text-emerald-600 mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-800 mb-1">
                    Arrastra tu archivo Excel aquí o haz clic para seleccionarlo
                  </h4>
                  <p className="text-[11px] text-gray-500 max-w-sm">
                    Soporta formatos <strong>.xlsx</strong>, <strong>.xls</strong> o <strong>.csv</strong>. Si no tienes un archivo preparado, puedes descargar la plantilla de ejemplo.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadTaskExcelTemplate();
                    }}
                    className="mt-4 inline-flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold underline hover:text-emerald-900"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Plantilla .xlsx</span>
                  </button>
                </div>
              ) : (
                /* File Selected Card */
                <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] flex items-center justify-center text-emerald-600 shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-gray-800 truncate">{file.name}</p>
                      <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetImport}
                    className="px-3 py-1 rounded-xl bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-xs font-medium text-gray-600 hover:text-rose-600 transition-all cursor-pointer shrink-0"
                  >
                    Cambiar
                  </button>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="py-8 flex flex-col items-center justify-center space-y-2 text-gray-600">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <p className="text-xs font-medium">Analizando filas y fases del archivo...</p>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="block font-bold">Error en el archivo</strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Parsed Preview and Mode Selection */}
              {parsedTasks.length > 0 && !isLoading && (
                <div className="space-y-4">
                  
                  {/* Mode Selector: Añadir o Reemplazar */}
                  <div className="p-4 rounded-3xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] space-y-3">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Método de Importación
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Mode: Añadir */}
                      <div
                        onClick={() => setImportMode('append')}
                        className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-start space-x-3 ${
                          importMode === 'append'
                            ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border-2 border-emerald-500/60'
                            : 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff]'
                        }`}
                      >
                        <div className="mt-0.5">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            importMode === 'append' ? 'border-emerald-600 bg-emerald-600' : 'border-gray-400'
                          }`}>
                            {importMode === 'append' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Añadir a la lista existente</span>
                          </h5>
                          <p className="text-[11px] text-gray-500 mt-1 leading-tight">
                            Conserva las <strong>{tasks.length}</strong> tareas actuales y suma las <strong>{parsedTasks.length}</strong> nuevas (Total: {tasks.length + parsedTasks.length}).
                          </p>
                        </div>
                      </div>

                      {/* Mode: Reemplazar */}
                      <div
                        onClick={() => setImportMode('replace')}
                        className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-start space-x-3 ${
                          importMode === 'replace'
                            ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border-2 border-rose-500/60'
                            : 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff]'
                        }`}
                      >
                        <div className="mt-0.5">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            importMode === 'replace' ? 'border-rose-600 bg-rose-600' : 'border-gray-400'
                          }`}>
                            {importMode === 'replace' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                            <span>Reemplazar lista completa</span>
                          </h5>
                          <p className="text-[11px] text-gray-500 mt-1 leading-tight">
                            Sustituye todas las tareas actuales por las <strong>{parsedTasks.length}</strong> tareas del archivo Excel.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Preview of Parsed Tasks */}
                  <div className="rounded-3xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700">
                        Vista Previa ({parsedTasks.length} detectadas)
                      </span>
                      <span className="text-[10px] text-gray-500">Mostrando primeras 4 tareas</span>
                    </div>

                    <div className="divide-y divide-gray-200/50">
                      {parsedTasks.slice(0, 4).map((t, idx) => (
                        <div key={idx} className="py-2 flex items-start justify-between gap-2 text-xs">
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{t.title}</p>
                            <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                              <span className="font-semibold text-gray-600 uppercase">{t.phase.replace('_', ' ')}</span>
                              <span>•</span>
                              <span>{t.assignee}</span>
                              {t.dueDate && (
                                <>
                                  <span>•</span>
                                  <span>{t.dueDate}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                              t.priority === 'alta' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                              t.priority === 'media' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                              'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            }`}>
                              {t.priority.toUpperCase()}
                            </span>
                            {t.isCompleted && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Success Feedback */}
              {saveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-emerald-800 text-xs flex items-center space-x-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block font-bold">¡Importación Exitosa!</strong>
                    <span>Las tareas se han sincronizado en Firestore. Cerrando ventana...</span>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-gray-200/50 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cerrar
          </button>

          {activeTab === 'import' && parsedTasks.length > 0 && !saveSuccess && (
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isSaving}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center space-x-2 cursor-pointer disabled:opacity-50 ${
                importMode === 'replace'
                  ? 'bg-[#EBEBEB] text-rose-700 hover:text-rose-800'
                  : 'bg-[#EBEBEB] text-emerald-700 hover:text-emerald-800'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sincronizando en Firestore...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {importMode === 'replace'
                      ? `Reemplazar con ${parsedTasks.length} Tareas`
                      : `Añadir ${parsedTasks.length} Tareas`}
                  </span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
