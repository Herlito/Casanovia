import React, { useRef } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { WeddingTable, Guest, GUEST_ROLES_CONFIG } from '../../types';
import { sortGuestsWithCompanions } from './TableAssignmentModule';
import { printElementById } from '../../lib/printUtils';
import { 
  X, 
  Printer, 
  Download,
  UtensilsCrossed, 
  Users, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

interface TableSeatingPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: WeddingTable[];
  guests: Guest[];
}

export const TableSeatingPrintModal: React.FC<TableSeatingPrintModalProps> = ({
  isOpen,
  onClose,
  tables,
  guests,
}) => {
  const { settings, activeWedding, isLevel5Observer, isLevel4Free, showUpgradeNotice } = useWedding();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || isLevel5Observer) return null;

  const coupleNamesDisplay = activeWedding?.coupleNames || settings.coupleNames || 'Nuestra Boda';

  const handlePrint = () => {
    if (isLevel4Free) {
      showUpgradeNotice('Imprimir Mesas', 'La exportación e impresión de la distribución de mesas no está disponible para cuentas Nivel 4 (Novia Free). Sube a un plan de pago para imprimir y exportar reportes.');
      return;
    }
    printElementById('print-area', `Distribucion_Mesas_${coupleNamesDisplay.replace(/\s+/g, '_')}`);
  };

  // Group guests by table
  const guestsByTable = (tables || []).map((tbl) => {
    const seatedGuests = (guests || []).filter(
      (g) => g && g.assignedTable && (g.assignedTable || '').trim().toLowerCase() === (tbl?.name || '').trim().toLowerCase()
    );
    // Companions (with mainGuestId) are not added to the pass sum because the titular guest already includes them
    const totalSeatedPasses = seatedGuests.reduce((acc, g) => {
      if (!g || g.mainGuestId) return acc;
      return acc + (g.confirmedPasses || g.totalPasses || 1);
    }, 0);

    return {
      table: tbl,
      guests: sortGuestsWithCompanions(seatedGuests),
      totalPasses: totalSeatedPasses,
    };
  });

  // Unassigned guests
  const unassignedGuests = sortGuestsWithCompanions(
    (guests || []).filter(
      (g) => g && (!g.assignedTable || g.assignedTable.trim() === '' || g.assignedTable.toLowerCase().includes('por asignar'))
    )
  );

  // Alphabetical list of all guests
  const sortedAlphabeticalGuests = [...(guests || [])].filter(Boolean).sort((a, b) =>
    (a?.fullName || '').localeCompare(b?.fullName || '', 'es', { sensitivity: 'base' })
  );

  const getRoleLabel = (cat: string) => {
    const config = GUEST_ROLES_CONFIG.find((r) => r.id === cat);
    return config?.shortLabel || 'Invitado';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:static print:inset-auto print:p-0 print:m-0 print:bg-[#EBEBEB] print:overflow-visible print:block print:w-full print:h-auto print:max-h-none print:shadow-none print:border-none">
      {/* Container */}
      <div className="bg-[#EBEBEB] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-transparent overflow-hidden print:static print:max-w-none print:w-full print:max-h-none print:overflow-visible print:p-0 print:m-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Header (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBEBEB]/10 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-[#4A5568]" />
            </div>
            <div>
              <h2 className="font-serif-display font-bold text-base sm:text-lg">
                Reporte Protocolar de Mesas & Seating Chart
              </h2>
              <p className="text-[11px] text-[#4A5568]">
                {coupleNamesDisplay} • Documento oficial para Maître, Hostess y Capitán de Banquete
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="btn-download-seating-pdf"
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#F7E7CE] text-[#2D3748] font-bold text-xs hover:bg-[#EBEBEB] transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#2D3748]" />
              <span>Descargar PDF</span>
            </button>
            <button
              type="button"
              id="btn-print-seating"
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#EBEBEB]/10 text-[#2D3748] font-semibold text-xs hover:bg-[#EBEBEB]/20 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-300 hover:text-[#2D3748] hover:bg-[#EBEBEB]/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Body Content (Dedicated #print-area) */}
        <div 
          id="print-area" 
          ref={printRef} 
          className="print-container flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white font-sans text-black w-full"
        >
          <style>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 8mm 8mm 8mm 8mm;
              }
              html, body, #print-area, #print-area * {
                background-color: #ffffff !important;
                background: #ffffff !important;
                color: #000000 !important;
                border-color: #000000 !important;
                box-shadow: none !important;
                text-shadow: none !important;
              }
              .print-a4-full {
                width: 100% !important;
                max-width: 100% !important;
              }
            }
          `}</style>

          {/* Document Header */}
          <div className="item-listado print-avoid-break border-b-2 border-black pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-black block mb-1">
                Wedding Protocol & Banquet Logistics
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-black uppercase tracking-tight">
                Plano de Mesas & Directorio de Invitados
              </h1>
              <p className="text-sm italic text-black mt-1">
                Boda de {coupleNamesDisplay}
              </p>
            </div>

            <div className="text-xs text-black space-y-0.5 sm:text-right">
              <div className="font-semibold text-black">
                Fecha: {activeWedding?.weddingDate?.split('T')[0] || settings.weddingDate?.split('T')[0] || '2026-10-24'}
              </div>
              <div className="text-black">
                Recepción: {settings.receptionVenue?.name || 'Salón Principal'}
              </div>
              <div className="text-black font-medium">
                Total Mesas: {tables.length} • Total Invitados: {guests.length}
              </div>
            </div>
          </div>

          {/* Section 1: Seating Tables Breakdown */}
          <div className="space-y-3 w-full print-a4-full">
            <div className="item-listado print-avoid-break flex items-center justify-between pb-1 border-b border-black">
              <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                1. Distribución Detallada por Mesa
              </h3>
              <span className="text-xs text-black font-medium">
                {tables.length} mesas configuradas
              </span>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2 print:gap-3 print-a4-full">
              {guestsByTable.map(({ table, guests: seatedGuests }) => (
                <div
                  key={table.id}
                  className="item-listado print-avoid-break bg-white p-3 border border-black space-y-1.5 w-full"
                  style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                >
                  <div className="flex items-center justify-between border-b border-black pb-1">
                    <h4 className="font-bold text-xs uppercase text-black tracking-wide">
                      {table.name} {table.zone ? `• ${table.zone}` : ''}
                    </h4>
                    <span className="text-[11px] font-semibold text-black">
                      Capacidad: {table.capacity}
                    </span>
                  </div>

                  {/* Seated Guests List: Número de asiento y solo nombre de invitados */}
                  {seatedGuests.length === 0 ? (
                    <p className="text-xs text-black italic py-1">
                      Mesa disponible (sin comensales asignados).
                    </p>
                  ) : (
                    <ol className="text-xs text-black space-y-0.5 list-none p-0 m-0">
                      {seatedGuests.map((guest, idx) => (
                        <li 
                          key={guest.id} 
                          className="flex items-center text-black leading-tight"
                          style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                        >
                          <span className="w-6 font-bold text-black shrink-0">{idx + 1}.</span>
                          <span className="text-black truncate font-normal">{guest.fullName}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  {table.notes && (
                    <div className="pt-1 text-[10px] text-black border-t border-black/30 italic">
                      Nota: {table.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Unassigned Guests if any */}
          {unassignedGuests.length > 0 && (
            <div 
              className="item-listado print-avoid-break p-3 border border-black bg-white text-black w-full"
              style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
            >
              <h3 className="text-xs font-bold text-black uppercase mb-1">
                Invitados Pendientes de Asignar Mesa ({unassignedGuests.length})
              </h3>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-black">
                {unassignedGuests.map((g, idx) => (
                  <span key={g.id} className="text-black">
                    {idx + 1}. {g.fullName} ({g.totalPasses || 1} pases)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Alphabetical Seating Directory (A-Z) */}
          <div className="space-y-3 pt-4 border-t-2 border-black break-before-page w-full print-a4-full">
            <div className="item-listado print-avoid-break flex items-center justify-between pb-1 border-b border-black">
              <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                2. Directorio Alfabético de Invitados (A-Z)
              </h3>
              <span className="text-xs text-black font-medium">
                Control de Recepción & Hostess ({sortedAlphabeticalGuests.length} invitados)
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="table-header-group">
                  <tr className="border-b-2 border-black text-black bg-white">
                    <th className="py-1 px-2 font-bold text-black text-left">#</th>
                    <th className="py-1 px-2 font-bold text-black text-left">Invitado (Nombre Completo)</th>
                    <th className="py-1 px-2 font-bold text-black text-left">Rol Protocolar</th>
                    <th className="py-1 px-2 font-bold text-black text-left">Mesa Asignada</th>
                    <th className="py-1 px-2 font-bold text-black text-center">Pases</th>
                    <th className="py-1 px-2 font-bold text-black text-left">Restricción Dietética</th>
                    <th className="py-1 px-2 font-bold text-black text-center">RSVP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/20">
                  {sortedAlphabeticalGuests.map((guest, idx) => (
                    <tr 
                      key={guest.id}
                      className="item-listado print-avoid-break bg-white text-black"
                      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                    >
                      <td className="py-0.5 px-2 font-semibold text-black text-[11px] leading-tight">
                        {idx + 1}
                      </td>
                      <td className="py-0.5 px-2 font-medium text-black text-[11px] leading-tight">
                        {guest.fullName}
                      </td>
                      <td className="py-0.5 px-2 text-black text-[11px] leading-tight">
                        {getRoleLabel(guest.category)}
                      </td>
                      <td className="py-0.5 px-2 font-bold text-black text-[11px] leading-tight">
                        {guest.assignedTable && guest.assignedTable.trim() !== '' && !guest.assignedTable.toLowerCase().includes('por asignar')
                          ? guest.assignedTable
                          : 'Sin asignar'}
                      </td>
                      <td className="py-0.5 px-2 text-center text-black text-[11px] leading-tight">
                        {guest.confirmedPasses || guest.totalPasses || 1}
                      </td>
                      <td className="py-0.5 px-2 text-black text-[11px] leading-tight">
                        {guest.dietaryRestrictions && guest.dietaryRestrictions !== 'Ninguna'
                          ? guest.dietaryRestrictions
                          : '—'}
                      </td>
                      <td className="py-0.5 px-2 text-center text-black text-[11px] leading-tight">
                        {guest.rsvpStatus === 'confirmed' ? 'Confirmado' : guest.rsvpStatus === 'declined' ? 'Declinado' : 'Pendiente'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Note */}
          <div className="item-listado print-avoid-break pt-4 border-t border-black text-center text-[11px] text-black space-y-0.5">
            <p>Generado automáticamente desde el Sistema de Gestión de Protocolo Nupcial.</p>
            <p className="font-semibold text-black">
              {coupleNamesDisplay}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
