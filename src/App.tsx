import React, { useEffect } from 'react';
import { WeddingProvider, useWedding } from './context/WeddingContext';
import { Navbar } from './components/Navbar';
import { HeroCountdown } from './components/public/HeroCountdown';
import { PlannerDashboard } from './components/private/PlannerDashboard';
import { NewWeddingTasksScreen } from './components/private/NewWeddingTasksScreen';
import { TokensPurchaseScreen } from './components/tokens/TokensPurchaseScreen';
import { AuthModal } from './components/modals/AuthModal';
import { NewWeddingModal } from './components/modals/NewWeddingModal';
import { UserManagementModal } from './components/modals/UserManagementModal';
import { ShareWeddingModal } from './components/modals/ShareWeddingModal';
import { AdminUploadedImagesModal } from './components/modals/AdminUploadedImagesModal';
import { FloorPlanDesignerModal } from './components/floorplan/FloorPlanDesignerModal';
import { RsvpFullScreenModal } from './components/modals/RsvpFullScreenModal';
import { WeddingCraftEditor } from './WeddingCraft/components/WeddingCraftEditor';
import { WeddingThemeWrapper } from './components/public/WeddingThemeWrapper';
import { CasanoviaLoadingScreen } from './components/CasanoviaLoadingScreen';
import { CasanoviaManual } from './components/private/CasanoviaManual';
import { CasanoviaHomeLanding } from './components/public/CasanoviaHomeLanding';
import { Heart, Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { 
    viewMode,
    appTheme, 
    settings, 
    isFirebaseLoading, 
    isPublicHomeLanding,
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

  // While wedding data is resolving from Firebase, display centered Casanovia logo loading screen
  if (isFirebaseLoading) {
    return <CasanoviaLoadingScreen />;
  }

  return (
        <div data-theme={appTheme} className={`min-h-screen flex flex-col ${isPublicHomeLanding ? "bg-[#EBEBEB] flex-1" : "bg-[#EBEBEB]"} text-[#2D2A26] font-sans antialiased selection:bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/20 selection:text-[#2D3748]`}>
      
      {/* Top Fixed Navigation & View Toggle */}
      <Navbar />

      {/* Conditional View Rendering */}
      {viewMode === 'public' ? (
        <main className="flex-1 animate-fadeIn">
          {isPublicHomeLanding ? (
            /* Home Landing: Solo el logo de Casanovia centrado en la pantalla */
            <CasanoviaHomeLanding />
          ) : (
            <WeddingThemeWrapper>
              {/* Web Invitados 100% editada y controlada en WeddingCraft Design */}
              <HeroCountdown />
            </WeddingThemeWrapper>
          )}
        </main>
      ) : viewMode === 'new_wedding_tasks' ? (
        <main className="flex-1 animate-fadeIn">
          {/* Post-Wedding Creation Interactive Task Checklist Screen */}
          <NewWeddingTasksScreen />
        </main>
      ) : viewMode === 'tokens' ? (
        <main className="flex-1 animate-fadeIn">
          {/* Tokens & Services Purchase Screen */}
          <TokensPurchaseScreen />
        </main>
      ) : viewMode === 'manual' ? (
        <main className="flex-1 animate-fadeIn">
          <CasanoviaManual />
        </main>
      ) : (
        <main className="flex-1 animate-fadeIn">
          {/* Private Organizer & Wedding Planner Dashboard */}
          <PlannerDashboard />
        </main>
      )}

      {/* Global Modals for Level 1 Auth, Multi-Wedding Creation & User Management */}
      <AuthModal />
      <NewWeddingModal />
      <UserManagementModal />
      <ShareWeddingModal />
      <AdminUploadedImagesModal
        isOpen={showUploadedImagesModal}
        onClose={() => setShowUploadedImagesModal(false)}
      />
      <FloorPlanDesignerModal
        isOpen={showFloorPlanModal}
        onClose={() => setShowFloorPlanModal(false)}
      />
      <RsvpFullScreenModal
        isOpen={isRsvpModalOpen}
        onClose={closeRsvpModal}
      />
      {showWeddingCraftModal && (
        <WeddingCraftEditor
          externalAPI={{
            getEventData: () => {
              const names = settings?.coupleNames?.includes(' & ')
                ? settings.coupleNames.split(' & ')
                : [settings?.groomName || 'Novio', settings?.brideName || 'Novia'];
              return {
                eventId: activeWedding?.id || activeWeddingId || (settings as any)?.id || 'demo_event',
                coupleNames: [names[0] || 'Novio', names[1] || 'Novia'],
                eventDate: settings?.weddingDate || new Date().toISOString(),
                venueName: settings?.ceremonyVenue?.name || 'Lugar',
                venueAddress: settings?.ceremonyVenue?.address || '',
                romanticQuote: settings?.romanticQuote || '',
                ceremonyVenue: settings?.ceremonyVenue,
                receptionVenue: settings?.receptionVenue,
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
          }}
          onClose={() => setShowWeddingCraftModal(false)}
        />
      )}

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
