import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { FileText, Printer, FileDown, Edit3, Save, X, Edit, AlignLeft, Info } from 'lucide-react';

export const CasanoviaManual: React.FC = () => {
  const { setViewMode } = useWedding();
  const [isEditing, setIsEditing] = useState(false);

  const [manualContent, setManualContent] = useState(`
# Manual de Usuario - Casanovia

¡Bienvenido al manual de uso de Casanovia! Esta guía rápida le ayudará a entender todas las funcionalidades de la plataforma.

## 1. Módulo Público (Vista de Invitados)
Es la página que ven los invitados cuando acceden a su enlace.
- **Cuenta Regresiva:** Muestra el tiempo restante para el evento.
- **Pase de Protocolo (QR):** Permite buscar la invitación por nombre o documento, y muestra el código QR personal y el número de mesa.
- **Detalles del Evento:** Información sobre la ceremonia, recepción y enlaces a Google Maps o Waze.
- **Código de Vestimenta (Dress Code):** Muestra el color temático de la boda y ejemplos visuales de vestimenta.
- **Confirmación de Asistencia (RSVP):** Formulario para que los invitados confirmen si asistirán, si llevan niños, y sus preferencias alimenticias.
- **Lista de Regalos:** Información para transferencias bancarias o Yape/Plin (con botón rápido para copiar el número o cuenta).
- **Muro de los Deseos:** Un espacio donde los invitados confirmados pueden dejar mensajes públicos para los novios.

## 2. Panel de Control (Planner Dashboard)
Es la zona privada para gestionar la boda.
- **Resumen:** Estadísticas rápidas sobre invitados confirmados, pendientes, monto recaudado en regalos, etc.
- **Gestión de Invitados:** Permite agregar, editar o eliminar invitados. Muestra quiénes han confirmado asistencia.
- **Verificador QR:** Herramienta para escanear el pase de los invitados en la puerta el día del evento.
- **Regalos (Transferencias):** Para ver y validar comprobantes de pago subidos por los invitados (Yape, Plin o depósitos).
- **Mesas:** Permite asignar a cada invitado a una mesa específica.
- **Configuración:** Permite cambiar nombres, fechas, enlaces de mapas, colores del código de vestimenta, y ocultar/mostrar secciones de la web.
- **Imprimir QR:** Permite exportar la lista de invitados junto con sus códigos QR en formato PDF.

## 3. Acceso y Menú Principal
El icono de la esquina superior derecha (Menú o Hamburguesa) permite acceder a herramientas globales:
- **Compartir Web:** Genera un enlace rápido para enviar por WhatsApp a sus invitados.
- **Administrar Usuarios:** Permite crear accesos para los organizadores, anfitriones (novios) o staff.
- **Nueva Boda:** Para crear un evento adicional si su plan lo permite.
- **Planes & Precios:** Para recargar tokens o ampliar su paquete de servicios.

---
*Para exportar este manual a PDF, utilice el botón "Imprimir/PDF" en la esquina superior derecha de esta pantalla. En la ventana de impresión, seleccione "Guardar como PDF".*
  `);

  const handlePrint = () => {
    // Print window triggers the native browser print/save as PDF dialog.
    window.print();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManualContent(e.target.value);
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto print:max-w-full">
        {/* Header - Hidden during printing */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-gray-200 print:hidden space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-300">
              <FileText className="w-6 h-6 text-gray-800" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">Manual de Casanovia</h1>
              <p className="text-sm text-gray-600">Guía de usuario y funcionalidades</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-black border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar Manual</span>
              </button>
            )}
            
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-black border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
            
            <button
              onClick={() => setViewMode('private')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-black border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cerrar</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        {isEditing ? (
          <div className="print:hidden">
            <div className="mb-2 flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 p-3 rounded-lg border border-gray-200">
              <Info className="w-4 h-4" />
              <span>Puedes usar formato Markdown (## para títulos, - para listas, ** para negritas).</span>
            </div>
            <textarea
              value={manualContent}
              onChange={handleChange}
              className="w-full h-[60vh] p-6 text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-mono leading-relaxed resize-y"
            />
          </div>
        ) : (
          <div className="prose prose-sm sm:prose-base prose-headings:font-bold prose-headings:text-black prose-p:text-gray-800 prose-li:text-gray-800 max-w-none print:prose-p:text-black print:prose-li:text-black">
            {/* Simple Markdown Parser for Display */}
            {manualContent.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} className="text-3xl mb-6 mt-4 border-b border-gray-200 pb-2">{line.replace('# ', '')}</h1>;
              if (line.startsWith('## ')) return <h2 key={i} className="text-2xl mt-8 mb-4">{line.replace('## ', '')}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} className="text-xl mt-6 mb-3">{line.replace('### ', '')}</h3>;
              if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-2 list-disc pl-2" dangerouslySetInnerHTML={{ __html: parseBold(line.replace('- ', '')) }} />;
              if (line.startsWith('---')) return <hr key={i} className="my-8 border-gray-300" />;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: parseBold(line) }} />;
            })}
          </div>
        )}
        
        {/* Print Footer */}
        <div className="hidden print:block mt-16 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          Documento generado por Casanovia Platform
        </div>
      </div>
    </div>
  );
};

// Helper to parse **bold** text manually without a library for simplicity
function parseBold(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
}
