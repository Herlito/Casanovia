import React, { useState, useRef } from 'react';
import { Guest } from '../../types';
import { parseGuestsFile, downloadGuestExcelTemplate, exportGuestsToExcel, ROLE_LABEL_MAP } from '../../lib/excelUtils';
import { 
  X, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  ArrowRight,
  Sparkles,
  FileCheck,
  CloudUpload,
  Loader2,
  Database
} from 'lucide-react';

interface GuestImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedGuests: Guest[], mode: 'append' | 'replace') => Promise<void> | void;
  currentCount: number;
  coupleNames: string;
}

export const GuestImportModal: React.FC<GuestImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentCount,
  coupleNames,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedGuests, setParsedGuests] = useState<Guest[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
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
      const result = await parseGuestsFile(selectedFile);
      if (result.error) {
        setErrorMessage(result.error);
        setParsedGuests([]);
      } else {
        setParsedGuests(result.guests);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar el archivo Excel.');
      setParsedGuests([]);
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
    if (parsedGuests.length === 0 || isSavingCloud) return;
    setIsSavingCloud(true);
    setErrorMessage(null);
    try {
      await onImport(parsedGuests, importMode);
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 750);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error guardando los datos en la nube.');
    } finally {
      setIsSavingCloud(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-[#E8DCCF] my-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C827A] hover:text-[#2D2A26] p-1.5 rounded-lg hover:bg-[#EFEAE2] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#8A9A86]/20 text-[#4A5D46] flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-display text-xl font-bold text-[#2D2A26]">
              Importar Lista de Invitados (Excel / CSV)
            </h3>
            <p className="text-xs text-[#7A7268]">
              Carga tu archivo de Excel con roles (Anfitrión, Invitado, Familia, Planner, Cortejo, Proveedor)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          
          {/* Template Download Banner */}
          <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <div className="text-xs text-amber-900">
                <span className="font-bold">¿No tienes el formato exacto?</span>
                <span className="block sm:inline sm:ml-1 text-amber-800/90">
                  Descarga nuestra plantilla oficial con columnas y roles preconfigurados.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={downloadGuestExcelTemplate}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shrink-0 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Plantilla .xlsx</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-[#8B3A4A] bg-[#8B3A4A]/5' 
                : 'border-[#D9CEBF] bg-white hover:border-[#8B3A4A]/50 hover:bg-[#FAF8F5]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
              }}
              className="hidden"
            />
            
            <div className="w-12 h-12 rounded-full bg-[#EFEAE2] text-[#8B3A4A] mx-auto flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>

            <p className="text-sm font-bold text-[#2D2A26] mb-1">
              {file ? file.name : 'Haz clic o arrastra tu archivo Excel aquí'}
            </p>
            <p className="text-xs text-[#7A7268]">
              Formatos soportados: <span className="font-semibold">.xlsx, .xls, .csv</span>
            </p>

            {isLoading && (
              <p className="text-xs text-[#8B3A4A] font-medium mt-2 animate-pulse">
                Procesando filas de la hoja de cálculo...
              </p>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preview of Parsed Guests */}
          {parsedGuests.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900">
                    Se detectaron {parsedGuests.length} invitados listos para importar
                  </span>
                </div>
                <span className="text-[11px] text-[#7A7268]">
                  Vista previa de los primeros 5 registros
                </span>
              </div>

              {/* Mini preview table */}
              <div className="border border-[#E8DCCF] rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#E8DCCF] text-[#7A7268]">
                    <tr>
                      <th className="p-2 font-semibold">Nombre</th>
                      <th className="p-2 font-semibold">Rol</th>
                      <th className="p-2 font-semibold">Mesa</th>
                      <th className="p-2 font-semibold text-center">Pases</th>
                      <th className="p-2 font-semibold text-center">RSVP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EAE1]">
                    {parsedGuests.slice(0, 5).map((g, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF8F5]">
                        <td className="p-2 font-medium text-[#2D2A26]">
                          {g.fullName}
                          {g.protocolRoleTitle && (
                            <span className="block text-[10px] text-[#7A7268]">{g.protocolRoleTitle}</span>
                          )}
                        </td>
                        <td className="p-2">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#8B3A4A]/10 text-[#8B3A4A]">
                            {ROLE_LABEL_MAP[g.category] || g.category}
                          </span>
                        </td>
                        <td className="p-2 text-[#524B42]">{g.assignedTable || '-'}</td>
                        <td className="p-2 text-center text-[#524B42] font-semibold">{g.totalPasses}</td>
                        <td className="p-2 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
                            g.rsvpStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            g.rsvpStatus === 'declined' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {g.rsvpStatus === 'confirmed' ? 'Confirmado' : g.rsvpStatus === 'declined' ? 'Declinado' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Info Note about blank fields & Cloud persistence */}
              <div className="flex items-start space-x-2.5 p-3 bg-[#8A9A86]/10 border border-[#8A9A86]/30 rounded-xl text-xs text-[#3D4D3A]">
                <Database className="w-4 h-4 text-[#4A5D46] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-[#2D2A26]">Sincronización automática con la Nube (Firestore)</p>
                  <p className="text-[11px] text-[#5A6358]">
                    Los invitados importados se guardan de inmediato en la base de datos central. Las filas con campos en blanco o incompletos son auto-completadas con valores válidos por defecto.
                  </p>
                </div>
              </div>

              {/* Import Mode Selector */}
              <div className="bg-white p-3.5 rounded-xl border border-[#E8DCCF] space-y-2">
                <label className="block text-xs font-bold text-[#524B42]">
                  ¿Cómo deseas incorporar estos {parsedGuests.length} invitados?
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-start space-x-2.5 ${
                      importMode === 'append'
                        ? 'bg-[#8B3A4A]/10 border-[#8B3A4A] text-[#8B3A4A]'
                        : 'bg-[#FAF8F5] border-[#D9CEBF] text-[#524B42] hover:bg-[#EFEAE2]'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="importMode" 
                      checked={importMode === 'append'} 
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-[#8B3A4A]" 
                    />
                    <div>
                      <span className="font-bold block">Agregar a la lista existente</span>
                      <span className="text-[11px] text-[#7A7268]">
                        Conserva los {currentCount} invitados actuales y suma {parsedGuests.length} más.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-start space-x-2.5 ${
                      importMode === 'replace'
                        ? 'bg-rose-50 border-rose-500 text-rose-800'
                        : 'bg-[#FAF8F5] border-[#D9CEBF] text-[#524B42] hover:bg-[#EFEAE2]'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="importMode" 
                      checked={importMode === 'replace'} 
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-rose-700" 
                    />
                    <div>
                      <span className="font-bold block">Reemplazar lista completa</span>
                      <span className="text-[11px] text-[#7A7268]">
                        Sustituye todos los invitados actuales por los {parsedGuests.length} del archivo.
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E8DCCF]">
            <div className="flex items-center space-x-2 text-xs text-[#7A7268]">
              <CloudUpload className="w-4 h-4 text-[#8B3A4A]" />
              <span>Guardado en la nube en tiempo real</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSavingCloud}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#7A7268] hover:bg-[#EFEAE2] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={parsedGuests.length === 0 || isLoading || isSavingCloud}
                onClick={handleConfirmImport}
                className={`inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  saveSuccess
                    ? 'bg-emerald-600 text-white cursor-default'
                    : isSavingCloud
                    ? 'bg-[#8B3A4A] text-white opacity-80 cursor-wait'
                    : parsedGuests.length > 0 && !isLoading
                    ? 'bg-[#8B3A4A] hover:bg-[#6E2937] text-white cursor-pointer'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Guardado en la nube!</span>
                  </>
                ) : isSavingCloud ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando en la nube...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Confirmar e Importar {parsedGuests.length > 0 ? `(${parsedGuests.length})` : ''}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
