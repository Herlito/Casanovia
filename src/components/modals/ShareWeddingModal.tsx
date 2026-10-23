import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Globe, 
  MessageCircle, 
  QrCode, 
  Sparkles, 
  Heart,
  Calendar,
  MapPin,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function ShareWeddingModal() {
  const { 
    showShareModal, 
    setShowShareModal, 
    activeWedding, 
    weddings,
    accessibleWeddings,
    isLevel3Planner,
    getShareableWeddingUrl,
    selectWedding
  } = useWedding();
  const { appTheme } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedWeddingForShare, setSelectedWeddingForShare] = useState<string>('');

  if (!showShareModal) return null;

  const currentWedding = selectedWeddingForShare 
    ? weddings.find(w => w.id === selectedWeddingForShare) || activeWedding 
    : activeWedding;

  const shareUrl = getShareableWeddingUrl(currentWedding?.id);

  const handleCopyLink = async (url: string, idToMark: string = 'current') => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for iframe environments
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(idToMark);
      setTimeout(() => {
        setCopiedId(null);
      }, 3000);
    } catch (err) {
      console.error('Error copying text:', err);
    }
  };

  const handleShareWhatsApp = () => {
    if (!currentWedding) return;
    const message = `💍 *¡Estás invitado a la boda de ${currentWedding.coupleNames}!* \n\n` +
      `📅 Fecha: ${currentWedding.weddingDate ? new Date(currentWedding.weddingDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Próximamente'}\n` +
      `📍 Lugar: ${currentWedding.locationSummary || 'Recepción'}\n\n` +
      `👉 Ingresa a nuestra web para ver los detalles del evento, consultar tu pase de protocolo y confirmar tu asistencia (RSVP):\n` +
      `${shareUrl}`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenPreview = () => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const availableWeddingsList = isLevel3Planner ? accessibleWeddings : weddings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFDFB] rounded-3xl border border-transparent shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className={isNeumorphic ? "p-6 relative text-gray-800" : "bg-gradient-to-r from-[#2D3748] to-[#2D3748] text-[#2D3748] p-6 relative"}>
          <button
            type="button"
            onClick={() => setShowShareModal(false)}
            className="absolute top-5 right-5 text-[#2D3748]/80 hover:text-[#2D3748] bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EBEBEB]/10 backdrop-blur-xs flex items-center justify-center border border-transparent shadow-inner">
              <Share2 className="w-6 h-6 text-[#4A5568]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#4A5568] block">
                Enlace Público para Invitados
              </span>
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2D3748]">
                Compartir Web de Bodas
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2D2A26]">
          
          {/* Information Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start space-x-3 text-xs leading-relaxed">
            <Globe className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-900 block mb-0.5">
                Acceso 100% libre sin contraseña
              </span>
              Los invitados que reciban este enlace podrán consultar el itinerario, buscar su pase de protocolo, confirmar asistencia (RSVP) y ver la mesa de regalos sin necesidad de iniciar sesión.
            </div>
          </div>

          {/* Wedding Selector if multiple weddings exist */}
          {availableWeddingsList.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-[#524B42] mb-1.5 uppercase tracking-wider">
                Seleccionar Boda para Compartir:
              </label>
              <select
                value={currentWedding?.id || ''}
                onChange={(e) => {
                  setSelectedWeddingForShare(e.target.value);
                  selectWedding(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-transparent bg-[#EBEBEB] text-sm text-[#2D2A26] font-medium focus:ring-2 focus:ring-[#d1d1d1]/20 focus:border-transparent outline-none"
              >
                {availableWeddingsList.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.coupleNames} — {w.locationSummary || 'Boda'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Current Wedding Highlight Card */}
          {currentWedding && (
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-transparent space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif-display text-lg font-bold text-[#2D2A26]">
                    {currentWedding.coupleNames}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A7268] mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#8C8276]" />
                      {currentWedding.weddingDate ? new Date(currentWedding.weddingDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Fecha por definir'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#8C8276]" />
                      {currentWedding.locationSummary || 'Ubicación'}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748] border border-transparent">
                  Web Activa
                </span>
              </div>

              {/* Share URL Box */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-[#7A7268] mb-1">
                  Enlace directo para enviar a los invitados:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-transparent bg-[#EBEBEB] text-xs text-[#2D2A26] font-mono select-all focus:outline-none focus:border-transparent"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    type="button"
                    id="btn-modal-copy-link"
                    onClick={() => handleCopyLink(shareUrl, 'current')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] ${
                      copiedId === 'current'
                        ? 'bg-emerald-600 text-[#2D3748]'
                        : 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#EBEBEB]'
                    }`}
                  >
                    {copiedId === 'current' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  id="btn-modal-share-whatsapp"
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[#2D3748] text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Compartir por WhatsApp</span>
                </button>

                <button
                  type="button"
                  id="btn-modal-open-preview"
                  onClick={handleOpenPreview}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#EBEBEB] border border-transparent hover:bg-[#FAF8F5] text-[#2D2A26] text-xs font-semibold transition-colors flex items-center justify-center space-x-2 shadow-2xs cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-[#8C8276]" />
                  <span>Abrir Web de Invitados</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick List of All Weddings Links */}
          {availableWeddingsList.length > 1 && (
            <div className="space-y-2 pt-2 border-t border-[#F0EAE1]">
              <h5 className="text-xs font-bold text-[#524B42] uppercase tracking-wider">
                Enlaces directos de todas tus bodas ({availableWeddingsList.length}):
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {availableWeddingsList.map((w) => {
                  const wUrl = getShareableWeddingUrl(w.id);
                  const isCopied = copiedId === w.id;
                  return (
                    <div 
                      key={w.id} 
                      className="p-3 rounded-xl bg-[#FAF8F5] border border-transparent flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[#2D2A26] truncate">{w.coupleNames}</div>
                        <div className="text-[11px] text-[#7A7268] font-mono truncate">{wUrl}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(wUrl, w.id)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer shrink-0 ${
                          isCopied 
                            ? 'bg-emerald-600 text-[#2D3748]' 
                            : 'bg-[#EBEBEB] border border-transparent text-[#524B42] hover:border-transparent hover:text-[#2D3748]'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-transparent flex justify-end">
          <button
            type="button"
            onClick={() => setShowShareModal(false)}
            className="px-5 py-2 rounded-xl bg-[#2D2A26] hover:bg-[#1F1D1B] text-[#2D3748] text-xs font-semibold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
