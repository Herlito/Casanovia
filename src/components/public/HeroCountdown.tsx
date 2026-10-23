import React from 'react';
import { useWedding } from '../../context/WeddingContext';
import { useSyncedInvitationDesign } from '../../hooks/useSyncedInvitationDesign';
import { SyncedInvitationHero } from './SyncedInvitationHero';
import { CasanoviaLoadingScreen } from '../CasanoviaLoadingScreen';
import { FileX, Sparkles } from 'lucide-react';

export const HeroCountdown: React.FC = () => {
  const { settings, activeWedding, activeWeddingId, currentUser, isLevel1Admin, setShowWeddingCraftModal } = useWedding();

  const targetEventId = activeWedding?.id || activeWeddingId || (settings as any)?.id || 'demo_event';

  const isCivilOnly = settings.hasReligiousCeremony === false;
  const receptionName = settings.receptionVenue?.name?.trim();
  const ceremonyName = settings.ceremonyVenue?.name?.trim();
  const targetVenue = receptionName ? settings.receptionVenue : (isCivilOnly ? settings.receptionVenue : settings.ceremonyVenue);
  const venueName = receptionName || ceremonyName || targetVenue?.name || 'Fundo Paraíso';

  const brideFirstName = (settings.brideName ? settings.brideName.split(' ')[0] : settings.coupleNames?.split('&')[0]?.trim()) || 'Erika';
  const groomFirstName = (settings.groomName ? settings.groomName.split(' ')[0] : settings.coupleNames?.split('&')[1]?.trim()) || 'Yemar';

  const fallbackData = {
    eventId: targetEventId,
    coupleNames: [brideFirstName, groomFirstName] as [string, string],
    eventDate: settings.weddingDate,
    venueName: venueName,
    venueAddress: targetVenue?.address,
    romanticQuote: settings.romanticQuote,
    receptionVenue: settings.receptionVenue,
    ceremonyVenue: settings.ceremonyVenue,
    publishedDesign: activeWedding?.weddingCraftDesign || (settings as any)?.weddingCraftDesign,
  };

  const { document: syncedDesign, isLoading } = useSyncedInvitationDesign(targetEventId, fallbackData);

  // 1. Show loading indicator while resolving design from server if not cached synchronously
  if (isLoading) {
    return <CasanoviaLoadingScreen />;
  }

  // 2. If no published design exists for this wedding, show mandatory notice
  if (!syncedDesign) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 sm:p-10 text-center max-w-lg mx-auto my-12 bg-[#EBEBEB] rounded-[2.5rem] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-white/50 animate-fadeIn">
        <div className="w-20 h-20 mb-6 rounded-full bg-[#EBEBEB] shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] flex items-center justify-center text-amber-600/80">
          <FileX className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3 font-serif">No se dispone de tarjeta de invitación</h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-md">
          Esta boda aún no cuenta con una tarjeta de invitación digital publicada. Por favor consulta con el administrador o diseñador para su publicación desde WeddingCraft Design.
        </p>
        {isLevel1Admin && (
          <button
            onClick={() => setShowWeddingCraftModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-xs font-bold uppercase tracking-wider text-amber-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Diseñar y Publicar en WeddingCraft
          </button>
        )}
      </div>
    );
  }

  return (
    <SyncedInvitationHero
      document={syncedDesign}
      onOpenEditor={() => setShowWeddingCraftModal(true)}
      showEditTrigger={Boolean(currentUser?.isAuthenticated && isLevel1Admin)}
    />
  );
};
