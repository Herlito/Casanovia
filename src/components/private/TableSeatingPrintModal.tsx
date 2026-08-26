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
  const { settings, activeWedding } = useWedding();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const coupleNamesDisplay = activeWedding?.coupleNames || settings.coupleNames || 'Nuestra Boda';

  const handlePrint = () => {
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:w-full print:h-auto print:max-h-none print:shadow-none print:border-none">
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E8DCCF] overflow-hidden print:static print:max-w-none print:w-full print:max-h-none print:overflow-visible print:p-0 print:m-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Header (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-[#6B2D38] text-white shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-[#F7E7CE]" />
            </div>
            <div>
              <h2 className="font-serif-display font-bold text-base sm:text-lg">
                Reporte Protocolar de Mesas & Seating Chart
              </h2>
              <p className="text-[11px] text-stone-200">
                {coupleNamesDisplay} • Documento oficial para Maître, Hostess y Capitán de Banquete
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="btn-download-seating-pdf"
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#F7E7CE] text-[#54212C] font-bold text-xs hover:bg-white transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#8B3A4A]" />
              <span>Descargar PDF</span>
            </button>
            <button
              type="button"
              id="btn-print-seating"
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Body Content (Dedicated #print-area) */}
        <div 
          id="print-area" 
          ref={printRef} 
          className="print-container flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-white font-sans text-[#2D2A26]"
        >
          
          {/* Document Header */}
          <div className="item-listado print-avoid-break border-b-2 border-[#8B3A4A] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B3A4A] block mb-1">
                Wedding Protocol & Banquet Logistics
              </span>
              <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
                Plano de Mesas & Directorio de Invitados
              </h1>
              <p className="text-sm font-serif-display italic text-[#7A7268] mt-1">
                Boda de {coupleNamesDisplay}
              </p>
            </div>

            <div className="text-xs text-[#524B42] space-y-1 sm:text-right bg-[#FAF8F5] p-3 rounded-xl border border-[#E8DCCF] sm:bg-transparent sm:p-0 sm:border-none">
              <div className="font-semibold text-[#2D2A26]">
                Fecha: {activeWedding?.weddingDate?.split('T')[0] || settings.weddingDate?.split('T')[0] || '2026-10-24'}
              </div>
              <div className="text-[#7A7268]">
                Recepción: {settings.receptionVenue?.name || 'Salón Principal'}
              </div>
              <div className="text-[#7A7268]">
                Total Mesas: {tables.length} • Total Invitados: {guests.length}
              </div>
            </div>
          </div>

          {/* Section 1: Seating Tables Breakdown */}
          <div className="space-y-4">
            <div className="item-listado print-avoid-break flex items-center justify-between pb-1 border-b border-[#E8DCCF]">
              <h3 className="font-serif-display text-lg font-bold text-[#8B3A4A] uppercase tracking-wider flex items-center space-x-2">
                <UtensilsCrossed className="w-4 h-4 text-[#8B3A4A]" />
                <span>1. Distribución Detallada por Mesa</span>
              </h3>
              <span className="text-xs text-[#7A7268]">
                {tables.length} mesas configuradas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
              {guestsByTable.map(({ table, guests: seatedGuests, totalPasses }) => (
                <div
                  key={table.id}
                  className="item-listado print-avoid-break bg-[#FAF8F5] rounded-2xl p-4 border border-[#E8DCCF] space-y-3 print:bg-white print:border-stone-300"
                  style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                >
                  <div className="flex items-start justify-between border-b border-[#E8DCCF] pb-2">
                    <div>
                      <h4 className="font-bold text-sm text-[#2D2A26] flex items-center space-x-1.5">
                        <span>{table.name}</span>
                      </h4>
                      {table.zone && (
                        <p className="text-[11px] text-[#8C8276] flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{table.zone}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        totalPasses > table.capacity
                          ? 'bg-rose-100 text-rose-800'
                          : totalPasses === table.capacity
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {totalPasses} / {table.capacity} lugares
                      </span>
                    </div>
                  </div>

                  {/* Seated Guests List */}
                  {seatedGuests.length === 0 ? (
                    <p className="text-xs text-[#8C8276] italic py-2">
                      Mesa disponible (sin comensales asignados).
                    </p>
                  ) : (
                    <ul className="space-y-1.5 text-xs divide-y divide-[#F0EAE1]">
                      {seatedGuests.map((guest, idx) => {
                        const isCompanion = Boolean(guest.mainGuestId);
                        const mainGuest = isCompanion ? guests.find((g) => g.id === guest.mainGuestId) : null;
                        const companionsInTable = !isCompanion ? seatedGuests.filter((c) => c.mainGuestId === guest.id) : [];

                        return (
                          <li key={guest.id} className="item-listado pt-1.5 flex items-start justify-between gap-2" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-[#2D2A26] flex items-center space-x-1.5">
                                <span className="text-[#8C8276] text-[10px] w-4">{idx + 1}.</span>
                                <span className="truncate">{guest.fullName}</span>
                                {isCompanion ? (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 shrink-0 font-medium">
                                    Acompañante{mainGuest ? ` de ${mainGuest.fullName.split(' ')[0]}` : ''}
                                  </span>
                                ) : (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white border border-[#D9CEBF] text-[#7A7268] shrink-0 font-normal">
                                    {getRoleLabel(guest.category)}
                                  </span>
                                )}
                              </div>
                              {guest.dietaryRestrictions && guest.dietaryRestrictions !== 'Ninguna' && (
                                <p className="text-[10px] text-amber-800 pl-5 font-semibold">
                                  Dieta: {guest.dietaryRestrictions}
                                </p>
                              )}
                            </div>
                            <span className="text-[11px] font-semibold text-[#524B42] shrink-0">
                              {isCompanion ? (
                                <span className="text-[#8C8276] font-normal italic text-[10px]">(Incluido con titular)</span>
                              ) : (
                                `${guest.confirmedPasses || guest.totalPasses || 1} ${((guest.confirmedPasses || guest.totalPasses || 1) === 1) ? 'pase' : 'pases'}`
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {table.notes && (
                    <div className="pt-2 text-[10px] text-[#7A7268] border-t border-[#F0EAE1] italic">
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
              className="item-listado print-avoid-break p-4 rounded-2xl bg-amber-50 border border-amber-200"
              style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
            >
              <h3 className="font-serif-display text-sm font-bold text-amber-900 mb-2 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Invitados Pendientes de Asignar Mesa ({unassignedGuests.length})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {unassignedGuests.map((g) => (
                  <span key={g.id} className="text-xs px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-950 font-medium">
                    {g.fullName} ({g.totalPasses} p)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Alphabetical Seating Directory (A-Z) */}
          <div className="space-y-4 pt-4 border-t-2 border-[#8B3A4A] break-before-page">
            <div className="item-listado print-avoid-break flex items-center justify-between pb-1 border-b border-[#E8DCCF]">
              <h3 className="font-serif-display text-lg font-bold text-[#8B3A4A] uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#8B3A4A]" />
                <span>2. Directorio Alfabético de Invitados (A-Z)</span>
              </h3>
              <span className="text-xs text-[#7A7268]">
                Control de Recepción & Hostess
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="table-header-group">
                  <tr className="bg-[#6B2D38] text-white">
                    <th className="py-2.5 px-3 font-semibold rounded-l-lg">Invitado (Nombre Completo)</th>
                    <th className="py-2.5 px-3 font-semibold">Rol Protocolar</th>
                    <th className="py-2.5 px-3 font-semibold">Mesa Asignada</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Pases</th>
                    <th className="py-2.5 px-3 font-semibold">Restricción Dietética</th>
                    <th className="py-2.5 px-3 font-semibold text-center rounded-r-lg">RSVP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE1]">
                  {sortedAlphabeticalGuests.map((guest, idx) => (
                    <tr 
                      key={guest.id}
                      className={`item-listado print-avoid-break ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F5]'}`}
                      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                    >
                      <td className="py-2 px-3 font-medium text-[#2D2A26]">
                        {guest.fullName}
                      </td>
                      <td className="py-2 px-3 text-[#7A7268]">
                        {getRoleLabel(guest.category)}
                      </td>
                      <td className="py-2 px-3 font-bold text-[#8B3A4A]">
                        {guest.assignedTable && guest.assignedTable.trim() !== '' && !guest.assignedTable.toLowerCase().includes('por asignar')
                          ? guest.assignedTable
                          : '⚠️ Sin asignar'}
                      </td>
                      <td className="py-2 px-3 text-center font-semibold text-[#2D2A26]">
                        {guest.confirmedPasses || guest.totalPasses}
                      </td>
                      <td className="py-2 px-3 text-[#7A7268] text-[11px]">
                        {guest.dietaryRestrictions && guest.dietaryRestrictions !== 'Ninguna'
                          ? <span className="text-amber-800 font-medium">{guest.dietaryRestrictions}</span>
                          : '—'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          guest.rsvpStatus === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : guest.rsvpStatus === 'declined'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {guest.rsvpStatus === 'confirmed' ? 'Confirmado' : guest.rsvpStatus === 'declined' ? 'Declinado' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Note */}
          <div className="item-listado print-avoid-break pt-6 border-t border-[#E8DCCF] text-center text-[11px] text-[#8C8276] space-y-1">
            <p>Generado automáticamente desde el Sistema de Gestión de Protocolo Nupcial.</p>
            <p className="font-serif-display italic font-medium text-[#524B42]">
              {coupleNamesDisplay} • ¡Gracias por celebrar este día inolvidable con nosotros!
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
