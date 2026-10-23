import React, { useEffect, useMemo, Suspense, lazy } from 'react';
import { Globe } from 'lucide-react';
import { WeddingProvider, useWedding } from './context/WeddingContext';
import { Navbar } from './components/Navbar';
import { HeroCountdown } from './components/public/HeroCountdown';
import { WeddingThemeWrapper } from './components/public/WeddingThemeWrapper';
import { CasanoviaHomeLanding } from './components/public/CasanoviaHomeLanding';
import { NoviasLandingPage } from './components/public/NoviasLandingPage';
import { CasanoviaLoadingScreen } from './components/CasanoviaLoadingScreen';

import { UpgradeNoticeModal } from './components/modals/UpgradeNoticeModal';
import { TrialExpiredModal } from './components/modals/TrialExpiredModal';

// Lazy-loaded heavy modules for Code-Splitting (Guest web loads instantly without downloading WeddingCraft or Admin)
const PlannerDashboard = lazy(() => import('./components/private/PlannerDashboard').then(m => ({ default: m.PlannerDashboard })));
const NewWeddingTasksScreen = lazy(() => import('./components/private/NewWeddingTasksScreen').then(m => ({ default: m.NewWeddingTasksScreen })));
const TokensPurchaseScreen = lazy(() => import('./components/tokens/TokensPurchaseScreen').then(m => ({ default: m.TokensPurchaseScreen })));
const WeddingCraftEditor = lazy(() => import('./WeddingCraft/components/WeddingCraftEditor').then(m => ({ default: m.WeddingCraftEditor })));
const FloorPlanDesignerModal = lazy(() => import('./components/floorplan/FloorPlanDesignerModal').then(m => ({ default: m.FloorPlanDesignerModal })));
const AuthModal = lazy(() => import('./components/modals/AuthModal').then(m => ({ default: m.AuthModal })));
const NewWeddingModal = lazy(() => import('./components/modals/NewWeddingModal').then(m => ({ default: m.NewWeddingModal })));
const UserManagementModal = lazy(() => import('./components/modals/UserManagementModal').then(m => ({ default: m.UserManagementModal })));
const ShareWeddingModal = lazy(() => import('./components/modals/ShareWeddingModal'));
const AdminUploadedImagesModal = lazy(() => import('./components/modals/AdminUploadedImagesModal').then(m => ({ default: m.AdminUploadedImagesModal })));
const RsvpFullScreenModal = lazy(() => import('./components/modals/RsvpFullScreenModal').then(m => ({ default: m.RsvpFullScreenModal })));

const MainLayout: React.FC = () => {
  const { 
    viewMode,
    appTheme, 
    settings, 
    isFirebaseLoading, 
    isPublicHomeLanding,
    isNoviasLanding,
    isAppLoading,
    currentUser,
    showUploadedImagesModal,
    setShowUploadedImagesModal,
    showFloorPlanModal,
    showWeddingCraftModal,
    setShowWeddingCraftModal,
    setShowFloorPlanModal,
    updateSettings,
    activeWedding,
    activeWeddingId,
    weddings,
    guests,
    isRsvpModalOpen,
    closeRsvpModal
  } = useWedding();

  useEffect(() => {
    document.title = 'Casanovia';
  }, [settings?.coupleNames]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editorExternalAPI = useMemo(() => {
    const names = settings?.coupleNames?.includes(' & ')
      ? settings.coupleNames.split(' & ')
      : [settings?.groomName || 'Novio', settings?.brideName || 'Novia'];
    return {
      getEventData: () => {
        const latestNames = settings?.coupleNames?.includes(' & ')
          ? settings.coupleNames.split(' & ')
          : [settings?.groomName || 'Novio', settings?.brideName || 'Novia'];
        // Link venueName strictly to receptionVenue (Nombre del Salón / Hacienda de la Sede de la Recepción & Fiesta)
        const curWed = activeWedding || weddings.find(w => w.id === activeWeddingId);
        const liveReception = settings?.receptionVenue || curWed?.settings?.receptionVenue;
        const liveCeremony = settings?.ceremonyVenue || curWed?.settings?.ceremonyVenue;
        const receptionVenueName = liveReception?.name?.trim() || '';
        const ceremonyVenueName = liveCeremony?.name?.trim() || '';
        const resolvedVenueName = receptionVenueName || ceremonyVenueName || 'Salón de Recepciones';

        const receptionVenueAddress = liveReception?.address?.trim() || '';
        const ceremonyVenueAddress = liveCeremony?.address?.trim() || '';
        const resolvedVenueAddress = receptionVenueAddress || ceremonyVenueAddress || '';

        return {
          eventId: activeWedding?.id || activeWeddingId || 'demo_event',
          coupleNames: [latestNames[0] || 'Novio', latestNames[1] || 'Novia'] as [string, string],
          coupleNamesText: settings?.coupleNames || `${latestNames[0] || 'Novio'} & ${latestNames[1] || 'Novia'}`,
          brideName: settings?.brideName || latestNames[1] || 'Novia',
          groomName: settings?.groomName || latestNames[0] || 'Novio',
          eventDate: settings?.weddingDate || new Date().toISOString(),
          venueName: resolvedVenueName,
          venueAddress: resolvedVenueAddress,
          romanticQuote: settings?.romanticQuote || '',
          ceremonyVenue: liveCeremony,
          receptionVenue: liveReception,
          additionalVenues: settings?.additionalVenues || curWed?.settings?.additionalVenues || [],
          settings: settings,
          hasReligiousCeremony: settings?.hasReligiousCeremony,
          dressCodeStyle: settings?.dressCodeStyle,
          dressCodeDescription: settings?.dressCodeDescription,
          suggestedColors: settings?.suggestedColors,
          sampleWishes: guests.filter(g => g.congratulationMessage && g.congratulationMessage.trim().length > 0).map(g => ({
            author: g.fullName,
            message: g.congratulationMessage || '',
            protocolRoleTitle: g.protocolRoleTitle
          }))
        };
      },
      syncSettings: async (updates: any) => {
        await updateSettings(updates);
      }
    };
  }, [
    activeWedding?.id, 
    activeWeddingId, 
    settings?.coupleNames, 
    settings?.groomName, 
    settings?.brideName, 
    settings?.weddingDate, 
    settings?.ceremonyVenue, 
    settings?.receptionVenue, 
    settings?.additionalVenues,
    settings?.hasReligiousCeremony, 
    settings?.dressCodeStyle, 
    settings?.dressCodeDescription, 
    settings?.suggestedColors, 
    settings?.romanticQuote,
    guests,
    updateSettings
  ]);

  return (
        <div data-theme={appTheme} className={`min-h-screen flex flex-col ${isPublicHomeLanding || isNoviasLanding ? "bg-[#EBEBEB] flex-1" : "bg-[#EBEBEB]"} text-[#2D2A26] font-sans antialiased selection:bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/20 selection:text-[#2D3748]`}>
      
      {/* Top Fixed Navigation & View Toggle - Omitido en home landing y en la landing /novias */}
      {!isPublicHomeLanding && !isNoviasLanding && <Navbar />}

      {/* Conditional View Rendering */}
      {isNoviasLanding ? (
        /* Landing Comercial Pública para Novias & Novios (/novias) */
        <main className="flex-1 animate-fadeIn">
          <NoviasLandingPage />
        </main>
      ) : viewMode === 'public' ? (
        <main className="flex-1 animate-fadeIn">
          {isPublicHomeLanding ? (
            /* Home Landing: Solo el logo de Casanovia centrado en la pantalla */
            <CasanoviaHomeLanding />
          ) : settings?.hasVirtualInvitation !== true ? (
            /* Cuando la casilla "Invitación virtual" NO está marcada */
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 sm:p-10 text-center max-w-lg mx-auto my-12 bg-[#EBEBEB] rounded-[2.5rem] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-white/50 animate-fadeIn">
              <div className="w-20 h-20 mb-6 rounded-full bg-[#EBEBEB] shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] flex items-center justify-center text-amber-700/80">
                <Globe className="w-10 h-10 text-[#2D3748]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 font-serif">Invitación Virtual No Disponible</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-md">
                Este evento actualmente no tiene habilitada una tarjeta ni acceso a la Web de Invitados.
              </p>
              {currentUser?.isAuthenticated && (
                <p className="text-xs font-semibold text-amber-800 bg-amber-100/60 px-4 py-2.5 rounded-2xl border border-amber-200/80 shadow-2xs">
                  Para activarla, marca el check <strong>"Invitación virtual"</strong> en la sección <strong>Ajustes</strong>.
                </p>
              )}
            </div>
          ) : (
            <WeddingThemeWrapper>
              {/* Web Invitados 100% editada y controlada en WeddingCraft Design accesible para todos los usuarios */}
              <HeroCountdown />
            </WeddingThemeWrapper>
          )}
        </main>
      ) : viewMode === 'new_wedding_tasks' ? (
        <main className="flex-1 animate-fadeIn">
          <Suspense fallback={<CasanoviaLoadingScreen />}>
            <NewWeddingTasksScreen />
          </Suspense>
        </main>
      ) : viewMode === 'tokens' ? (
        <main className="flex-1 animate-fadeIn">
          <Suspense fallback={<CasanoviaLoadingScreen />}>
            <TokensPurchaseScreen />
          </Suspense>
        </main>
      ) : (
        <main className="flex-1 animate-fadeIn">
          <Suspense fallback={<CasanoviaLoadingScreen />}>
            <PlannerDashboard />
          </Suspense>
        </main>
      )}

      {/* Global Modals for Level 1 Auth, Multi-Wedding Creation & User Management */}
      <UpgradeNoticeModal />
      <TrialExpiredModal />
      <Suspense fallback={null}>
        <AuthModal />
        <NewWeddingModal />
        <UserManagementModal />
        <ShareWeddingModal />
        <AdminUploadedImagesModal
          isOpen={showUploadedImagesModal}
          onClose={() => setShowUploadedImagesModal(false)}
        />
        {showFloorPlanModal && (
          <FloorPlanDesignerModal
            isOpen={showFloorPlanModal}
            onClose={() => setShowFloorPlanModal(false)}
          />
        )}
        <RsvpFullScreenModal
          isOpen={isRsvpModalOpen}
          onClose={closeRsvpModal}
        />
        {showWeddingCraftModal && (
          <WeddingCraftEditor
            externalAPI={editorExternalAPI}
            onClose={() => setShowWeddingCraftModal(false)}
            initialDocument={activeWedding?.weddingCraftDesign}
          />
        )}
      </Suspense>

    </div>
  );
};

export function App() {
  return (
    <WeddingProvider>
      <MainLayout />
    </WeddingProvider>
  );
}

export default App;
