import React from 'react';
import { useWedding } from '../../context/WeddingContext';
import { formatWeddingDateCustom } from '../../lib/dateUtils';
import { formatAltibajas } from '../../lib/formatUtils';
import { printElementById } from '../../lib/printUtils';
import { X, Printer, Download, MapPin, User, Sparkles, Star } from 'lucide-react';

interface ProtocolPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProtocolPrintModal: React.FC<ProtocolPrintModalProps> = ({ isOpen, onClose }) => {
  const { settings, timeline, guests, activeWedding } = useWedding();

  if (!isOpen) return null;

  const coupleNamesDisplay = activeWedding?.coupleNames || settings.coupleNames || (settings.brideName && settings.groomName ? `${settings.brideName} & ${settings.groomName}` : 'Nuestra Boda');
  const weddingDateDisplay = formatWeddingDateCustom(activeWedding?.weddingDate || settings.weddingDate);
  const locationDisplay = activeWedding?.locationSummary || settings.locationSummary || settings.receptionVenue?.name || settings.ceremonyVenue?.name || 'Ubicación Oficial';

  const handlePrint = () => {
    printElementById('print-area', `Escaleta_Oficial_${coupleNamesDisplay.replace(/\s+/g, '_')}`);
  };

  const handleDownloadPdf = () => {
    printElementById('print-area', `Escaleta_Oficial_${coupleNamesDisplay.replace(/\s+/g, '_')}`);
  };

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'preparacion':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">Preparación</span>;
      case 'ceremonia':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">Ceremonia Religiosa</span>;
      case 'ceremonia_civil':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">Ceremonia Civil</span>;
      case 'coctel':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Cóctel de Bienvenida</span>;
      case 'sesion_fotos':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">Sesión de Fotos</span>;
      case 'recepcion':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">Recepción & Banquete</span>;
      case 'servir_alimentos':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">Servir Alimentos / Banquete</span>;
      case 'saludo_mesas':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">Saludo a Mesas</span>;
      case 'protocolo':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">Protocolo & Brindis</span>;
      case 'baile_novios_familia':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-pink-100 text-pink-800 border border-pink-200">Vals & Baile Familiar</span>;
      case 'fiesta':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200">Fiesta & Baile General</span>;
      case 'cierre':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-800 border border-stone-200">Cierre & Despedida</span>;
      default:
        return cat ? (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
            {formatAltibajas(cat)}
          </span>
        ) : null;
    }
  };

  const protocolGuests = guests.filter(g => g.isProtocolParticipant);
  
  // Sort timeline chronologically
  const sortedTimeline = [...timeline].sort((a, b) => a.time.localeCompare(b.time));

  // Calculate duration between current milestone and the next one (from first to penultimate)
  const getDurationToNext = (idx: number): string | null => {
    if (idx >= sortedTimeline.length - 1) return null;
    const current = sortedTimeline[idx].time;
    const next = sortedTimeline[idx + 1].time;
    if (!current || !next) return null;

    const [h1, m1] = current.split(':').map(Number);
    const [h2, m2] = next.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return null;

    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) {
      // Crosses midnight
      diff += 24 * 60;
    }
    return `${diff} mins`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:w-full print:h-auto print:max-h-none print:shadow-none print:border-none">
      {/* Outer Modal Box */}
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl border border-[#D9CEBF] my-6 relative max-h-[92vh] overflow-y-auto print:static print:max-w-none print:w-full print:max-h-none print:overflow-visible print:p-0 print:m-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Floating Top Actions (Hidden in Print) */}
        <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-[#E8DCCF]">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-[#8B3A4A]/10 text-[#8B3A4A] text-xs font-bold uppercase tracking-wider">
              Vista Imprimible / Escaleta Oficial
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="btn-download-protocol-pdf"
              onClick={handleDownloadPdf}
              className="px-3.5 sm:px-4 py-2 bg-[#8B3A4A] text-white text-xs font-bold rounded-xl hover:bg-[#6E2937] transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>
            <button
              type="button"
              id="btn-print-protocol"
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 bg-[#FAF7F2] text-[#524B42] border border-[#D9CEBF] text-xs font-semibold rounded-xl hover:bg-white hover:text-[#8B3A4A] transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#8B3A4A]" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#7A7268] hover:text-[#2D2A26] rounded-xl hover:bg-[#FAF7F2] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DEDICATED DOCUMENT CONTAINER */}
        <div id="print-area" className="print-container w-full bg-white text-black font-sans">
          
          {/* DOCUMENT HEADER */}
          <div className="item-listado print-avoid-break text-center border-b-2 border-black/80 pb-4 pt-1 mb-6">
            <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-600 mb-1">
              PROGRAMA Y PROTOCOLO OFICIAL
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-1">
              Boda {coupleNamesDisplay}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-neutral-700">
              {weddingDateDisplay} • {locationDisplay}
            </p>
          </div>

          {/* SECTION 1: DIRECTORY OF PROTOCOL PARTICIPANTS & ROLES */}
          <div 
            className="item-listado print-avoid-break mb-6"
            style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
          >
            <h2 className="text-xs font-bold uppercase tracking-wider bg-neutral-100 px-2.5 py-1.5 border-l-4 border-black mb-2.5">
              1. Directorio del Cortejo de Honor & Participantes Clave ({protocolGuests.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-0 border-none border-collapse">
                <thead className="text-[11px] font-bold text-neutral-900 border-0 border-none">
                  <tr className="border-0 border-none bg-neutral-50/60">
                    <th className="py-1.5 px-2 border-0 border-none font-bold">Nombre</th>
                    <th className="py-1.5 px-2 border-0 border-none font-bold">Rol Protocolar Asignado</th>
                    <th className="py-1.5 px-2 border-0 border-none font-bold">Hora Llegada / Ensayo</th>
                    <th className="py-1.5 px-2 border-0 border-none font-bold">Distintivo / Boutonniere</th>
                    <th className="py-1.5 px-2 border-0 border-none font-bold">Contacto / Mesa</th>
                  </tr>
                </thead>
                <tbody className="border-0 border-none">
                  {protocolGuests.length === 0 ? (
                    <tr className="border-0 border-none">
                      <td colSpan={5} className="py-2.5 px-2 text-center text-neutral-500 italic border-0 border-none">
                        No hay integrantes asignados al cortejo protocolar con pase activo aún.
                      </td>
                    </tr>
                  ) : (
                    protocolGuests.map((g) => (
                      <tr key={g.id} className="item-listado print-avoid-break align-baseline leading-snug border-b border-neutral-100 hover:bg-neutral-50/50">
                        <td className="py-1.5 px-2 font-bold text-neutral-900 border-0 border-none whitespace-nowrap">
                          {formatAltibajas(g.fullName)}
                        </td>
                        <td className="py-1.5 px-2 font-medium text-neutral-800 border-0 border-none whitespace-nowrap">
                          {formatAltibajas(g.protocolRoleTitle) || 'Cortejo'}
                        </td>
                        <td className="py-1.5 px-2 text-neutral-700 border-0 border-none whitespace-nowrap">
                          {g.specialArrivalTime || '15:30 hrs'}
                        </td>
                        <td className="py-1.5 px-2 text-neutral-700 border-0 border-none">
                          {g.accessoryAssigned || g.dressCodeNote || 'Etiqueta de gala'}
                        </td>
                        <td className="py-1.5 px-2 text-neutral-700 border-0 border-none whitespace-nowrap">
                          <span>{g.phone || 'N/A'}</span>
                          {g.assignedTable && (
                            <span className="text-[10px] text-neutral-500 font-mono ml-1.5">({g.assignedTable})</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: TIMELINE MINUTO A MINUTO (Card Design adapted from Tarjetas view) */}
          <div className="mb-6">
            <div className="item-listado print-avoid-break flex items-center justify-between bg-neutral-100 px-3 py-1.5 border-l-4 border-[#8B3A4A] mb-3.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                2. Cronograma Maestro (Minuto a Minuto del Día)
              </h2>
              <span className="text-[11px] font-semibold text-neutral-600 font-mono">
                {sortedTimeline.length} hitos programados
              </span>
            </div>

            <div className="space-y-3.5">
              {sortedTimeline.length === 0 ? (
                <div className="item-listado print-avoid-break p-4 text-center text-xs text-neutral-500 italic border border-dashed border-neutral-300 rounded-lg">
                  No se han registrado hitos en el cronograma de esta boda aún.
                </div>
              ) : (
                sortedTimeline.map((m, idx) => {
                  const duration = getDurationToNext(idx);
                  return (
                    <div 
                      key={m.id || idx}
                      className={`item-listado print-avoid-break rounded-2xl p-4 sm:p-5 border transition-all ${
                        m.isProtocolCrucial 
                          ? 'bg-[#FFFDF9] border-[#D4AF37]/80 ring-1 ring-[#D4AF37]/30 shadow-2xs' 
                          : 'bg-white border-[#E8DCCF] shadow-2xs'
                      }`}
                      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                    >
                      {/* Top Bar: Time Badge, Title, Duration, Crucial Star & Category Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#F2ECE3]">
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                          <span className="font-mono font-bold text-xs sm:text-sm bg-[#2D2A26] text-white px-2.5 py-1 rounded-xl shadow-2xs shrink-0">
                            {m.time} hrs
                          </span>
                          <h3 className="font-serif-display text-base sm:text-lg font-bold text-[#2D2A26] leading-snug">
                            {m.title}
                          </h3>
                          {duration && (
                            <span className="font-semibold text-xs text-[#8B3A4A] bg-[#8B3A4A]/10 px-2 py-0.5 rounded-md font-mono border border-[#8B3A4A]/20">
                              {duration}
                            </span>
                          )}
                          {m.isProtocolCrucial && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#D4AF37]/20 text-[#8B6B23] text-[10px] font-bold uppercase tracking-wider border border-[#D4AF37]/40">
                              <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                              <span>Hito Protocolar</span>
                            </span>
                          )}
                        </div>

                        <div className="shrink-0 self-start sm:self-center">
                          {getCategoryBadge(m.category)}
                        </div>
                      </div>

                      {/* Description */}
                      {m.description && (
                        <p className="text-xs sm:text-sm text-[#524B42] my-2.5 leading-relaxed font-sans">
                          {m.description}
                        </p>
                      )}

                      {/* Bottom Metadata Grid: Location, Responsible Person & Items Required */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-[#F2ECE3] text-xs">
                        <div className="flex items-center space-x-1.5 text-[#6B6358]">
                          <MapPin className="w-3.5 h-3.5 text-[#8A9A86] shrink-0" />
                          <span className="font-medium truncate">{m.location || 'Locación Principal'}</span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-[#8B3A4A] shrink-0" />
                          <span className="text-[#524B42]">A cargo de: </span>
                          <strong className="font-semibold text-[#2D2A26] truncate">
                            {formatAltibajas(m.responsiblePerson) || 'Novios & Coordinación'}
                          </strong>
                        </div>

                        {m.dressOrItemsRequired ? (
                          <div className="flex items-center space-x-1.5 text-[#8B6B23]">
                            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span className="text-[11px] truncate">
                              <strong className="font-semibold">Utilería: </strong>{m.dressOrItemsRequired}
                            </span>
                          </div>
                        ) : (
                          <div className="hidden sm:block"></div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SECTION 3: VENUES & LOGISTICS */}
          <div 
            className="item-listado print-avoid-break grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-300 pt-4 text-xs mb-6"
            style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
          >
            <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
              <h4 className="font-bold mb-1">Capilla / Lugar de Ceremonia:</h4>
              <p className="font-medium">{settings.ceremonyVenue?.name || 'Por definir'}</p>
              {settings.ceremonyVenue?.address && (
                <p className="text-neutral-600">{settings.ceremonyVenue.address}</p>
              )}
              {settings.ceremonyVenue?.time && (
                <p className="text-neutral-800 font-semibold mt-0.5">Hora: {settings.ceremonyVenue.time} hrs</p>
              )}
              {settings.ceremonyVenue?.notes && (
                <p className="text-[10px] text-neutral-500 mt-1">{settings.ceremonyVenue.notes}</p>
              )}
            </div>
            <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
              <h4 className="font-bold mb-1">Lugar de la Recepción:</h4>
              <p className="font-medium">{settings.receptionVenue?.name || 'Por definir'}</p>
              {settings.receptionVenue?.address && (
                <p className="text-neutral-600">{settings.receptionVenue.address}</p>
              )}
              {settings.receptionVenue?.time && (
                <p className="text-neutral-800 font-semibold mt-0.5">Hora: {settings.receptionVenue.time} hrs</p>
              )}
              {settings.receptionVenue?.notes && (
                <p className="text-[10px] text-neutral-500 mt-1">{settings.receptionVenue.notes}</p>
              )}
            </div>
          </div>

          {/* Footer of Protocol Sheet */}
          <div className="item-listado print-avoid-break text-center text-[10px] text-neutral-500 border-t border-neutral-200 pt-4">
            Wedding Hub & Protocol Management System • Generado automáticamente para uso del staff y cortejo oficial.
          </div>

        </div>

      </div>
    </div>
  );
};



