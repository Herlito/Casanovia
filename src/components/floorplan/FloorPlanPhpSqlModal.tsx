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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#EBEBEB] w-full max-w-4xl rounded-3xl shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between bg-[#EBEBEB] border-b border-gray-300">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center text-gray-800">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Endpoints PHP & Script SQL de Integración
              </h2>
              <p className="text-xs text-gray-500">
                Scripts de backend para integrar el diseñador de planos con bases de datos MySQL existentes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all cursor-pointer border-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#EBEBEB] overflow-x-auto gap-2 border-b border-gray-300">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-2xl transition-all cursor-pointer border-none ${
                activeTab === 'sql'
                  ? 'bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-900 font-bold'
                  : 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-600 hover:text-gray-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>db_floor_plans.sql</span>
            </button>
            <button
              onClick={() => setActiveTab('get_invitados')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-2xl transition-all cursor-pointer border-none ${
                activeTab === 'get_invitados'
                  ? 'bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-900 font-bold'
                  : 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>get_invitados.php</span>
            </button>
            <button
              onClick={() => setActiveTab('guardar_plano')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-2xl transition-all cursor-pointer border-none ${
                activeTab === 'guardar_plano'
                  ? 'bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-900 font-bold'
                  : 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>guardar_plano.php</span>
            </button>
            <button
              onClick={() => setActiveTab('get_plano')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-2xl transition-all cursor-pointer border-none ${
                activeTab === 'get_plano'
                  ? 'bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-900 font-bold'
                  : 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>get_plano.php</span>
            </button>
          </div>

          <button
            onClick={downloadAll}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-xs font-semibold text-gray-800 rounded-2xl transition-all shrink-0 cursor-pointer border-none"
          >
            <Download className="w-3.5 h-3.5 text-gray-700" />
            <span>Descargar Todos (.zip / archivos)</span>
          </button>
        </div>

        {/* Info banner */}
        <div className="px-6 py-3 bg-[#EBEBEB] flex items-center justify-between text-xs text-gray-700 border-b border-gray-300">
          <span>{current.description}</span>
          <div className="flex items-center space-x-2 shrink-0 ml-4">
            <button
              onClick={() => handleCopy(current.code, activeTab)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] rounded-xl font-semibold text-gray-800 transition-all cursor-pointer border-none"
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
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-800 rounded-xl font-semibold transition-all cursor-pointer border-none"
            >
              <Download className="w-3 h-3" />
              <span>Descargar</span>
            </button>
          </div>
        </div>

        {/* Code View Area */}
        <div className="flex-1 p-4 bg-[#1E1E1E] overflow-auto text-gray-300 font-mono text-xs leading-relaxed select-text shadow-[inset_4px_4px_8px_#0a0a0a]">
          <pre className="p-2">
            <code>{current.code}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#EBEBEB] border-t border-gray-300 flex items-center justify-between text-xs text-gray-500">
          <span>
            Archivo: <strong className="text-gray-900">{current.filename}</strong> (Listo para producción en Apache / Nginx + PHP 7.4/8.x)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-800 font-semibold rounded-2xl transition-all cursor-pointer border-none"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
