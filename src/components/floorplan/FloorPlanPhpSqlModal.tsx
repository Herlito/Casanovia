import React, { useState } from 'react';
import { X, Copy, Check, Download, Database, Code, FileText, Server } from 'lucide-react';
import {
  SQL_SCHEMA_CODE,
  PHP_GET_INVITADOS_CODE,
  PHP_GUARDAR_PLANO_CODE,
  PHP_GET_PLANO_CODE
} from '../../data/backendPhpCode';

interface FloorPlanPhpSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'sql' | 'get_invitados' | 'guardar_plano' | 'get_plano';

export const FloorPlanPhpSqlModal: React.FC<FloorPlanPhpSqlModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('sql');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (!isOpen) return null;

  const getCodeContent = (tab: TabType): { filename: string; code: string; language: string; description: string } => {
    switch (tab) {
      case 'sql':
        return {
          filename: 'db_floor_plans.sql',
          code: SQL_SCHEMA_CODE,
          language: 'sql',
          description: 'Crea la nueva tabla `planos_distribucion_boda` en MySQL sin tocar ni alterar las tablas actuales de `bodas` o `invitados`.'
        };
      case 'get_invitados':
        return {
          filename: 'get_invitados.php',
          code: PHP_GET_INVITADOS_CODE,
          language: 'php',
          description: 'Lee los invitados de la boda activa desde tu tabla existente `invitados` para alimentar el gestor de asientos.'
        };
      case 'guardar_plano':
        return {
          filename: 'guardar_plano.php',
          code: PHP_GUARDAR_PLANO_CODE,
          language: 'php',
          description: 'Recibe el objeto JSON serializado con mesas, sillas, coordenadas XY, escala y asignaciones y lo guarda en la nueva tabla.'
        };
      case 'get_plano':
        return {
          filename: 'get_plano.php',
          code: PHP_GET_PLANO_CODE,
          language: 'php',
          description: 'Carga el diseño guardado del plano para la boda especificada por parámetro GET `boda_id`.'
        };
    }
  };

  const current = getCodeContent(activeTab);

  const handleCopy = (code: string, tabId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tabId);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    const files = [
      getCodeContent('sql'),
      getCodeContent('get_invitados'),
      getCodeContent('guardar_plano'),
      getCodeContent('get_plano')
    ];
    files.forEach(f => {
      handleDownload(f.filename, f.code);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E8DCCF] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DCCF] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#8B3A4A] shadow-2xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2D2A26] font-serif">
                Endpoints PHP & Script SQL de Integración
              </h2>
              <p className="text-xs text-[#8C8276]">
                Scripts de backend para integrar el diseñador de planos con bases de datos MySQL existentes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 border-b border-[#E8DCCF] bg-[#FAF8F5] overflow-x-auto gap-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-t border-x ${
                activeTab === 'sql'
                  ? 'bg-white text-[#8B3A4A] border-[#E8DCCF] -mb-px shadow-2xs'
                  : 'bg-transparent text-[#8C8276] border-transparent hover:text-[#2D2A26]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>db_floor_plans.sql</span>
            </button>
            <button
              onClick={() => setActiveTab('get_invitados')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-t border-x ${
                activeTab === 'get_invitados'
                  ? 'bg-white text-[#8B3A4A] border-[#E8DCCF] -mb-px shadow-2xs'
                  : 'bg-transparent text-[#8C8276] border-transparent hover:text-[#2D2A26]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>get_invitados.php</span>
            </button>
            <button
              onClick={() => setActiveTab('guardar_plano')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-t border-x ${
                activeTab === 'guardar_plano'
                  ? 'bg-white text-[#8B3A4A] border-[#E8DCCF] -mb-px shadow-2xs'
                  : 'bg-transparent text-[#8C8276] border-transparent hover:text-[#2D2A26]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>guardar_plano.php</span>
            </button>
            <button
              onClick={() => setActiveTab('get_plano')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-t border-x ${
                activeTab === 'get_plano'
                  ? 'bg-white text-[#8B3A4A] border-[#E8DCCF] -mb-px shadow-2xs'
                  : 'bg-transparent text-[#8C8276] border-transparent hover:text-[#2D2A26]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>get_plano.php</span>
            </button>
          </div>

          <button
            onClick={downloadAll}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-[#F3EFEA] border border-[#D9CEBF] text-xs font-semibold text-[#2D2A26] rounded-lg shadow-2xs transition-colors shrink-0 mb-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Descargar Todos (.zip / archivos)</span>
          </button>
        </div>

        {/* Info banner */}
        <div className="px-6 py-2.5 bg-amber-50/70 border-b border-amber-100/80 flex items-center justify-between text-xs text-amber-900">
          <span>{current.description}</span>
          <div className="flex items-center space-x-2 shrink-0 ml-4">
            <button
              onClick={() => handleCopy(current.code, activeTab)}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-amber-100/60 border border-amber-200 rounded-md font-semibold text-amber-900 transition-colors cursor-pointer"
            >
              {copiedTab === activeTab ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleDownload(current.filename, current.code)}
              className="flex items-center space-x-1 px-2.5 py-1 bg-[#8B3A4A] hover:bg-[#722F3D] text-white rounded-md font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Descargar</span>
            </button>
          </div>
        </div>

        {/* Code View Area */}
        <div className="flex-1 p-4 bg-[#1E1E1E] overflow-auto text-stone-200 font-mono text-xs leading-relaxed select-text">
          <pre className="p-2">
            <code>{current.code}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white border-t border-[#E8DCCF] flex items-center justify-between text-xs text-[#8C8276]">
          <span>
            Archivo: <strong className="text-[#2D2A26]">{current.filename}</strong> (Listo para producción en Apache / Nginx + PHP 7.4/8.x)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#FAF8F5] hover:bg-[#E8DCCF] text-[#2D2A26] font-semibold rounded-lg border border-[#D9CEBF] transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
