import React, { useEffect } from 'react';
import { WeddingProvider, useWedding } from './context/WeddingContext';
import { Navbar } from './components/Navbar';
import { HeroCountdown } from './components/public/HeroCountdown';
import { ProtocolPassLookup } from './components/public/ProtocolPassLookup';
import { EventDetails } from './components/public/EventDetails';
import { DressCodeSection } from './components/public/DressCodeSection';
import { RsvpSection } from './components/public/RsvpSection';
import { GiftRegistrySection } from './components/public/GiftRegistrySection';
import { WishesWall } from './components/public/WishesWall';
import { PlannerDashboard } from './components/private/PlannerDashboard';
import { NewWeddingTasksScreen } from './components/private/NewWeddingTasksScreen';
import { TokensPurchaseScreen } from './components/tokens/TokensPurchaseScreen';
import { AuthModal } from './components/modals/AuthModal';
import { NewWeddingModal } from './components/modals/NewWeddingModal';
import { UserManagementModal } from './components/modals/UserManagementModal';
import { ShareWeddingModal } from './components/modals/ShareWeddingModal';
import { PublicFooter } from './components/public/PublicFooter';
import { Heart, Sparkles } from 'lucide-react';
import { isRsvpDeadlinePassed } from './lib/dateUtils';

const MainLayout: React.FC = () => {
  const { viewMode, settings } = useWedding();
  const isDeadlinePassed = isRsvpDeadlinePassed(settings.rsvpDeadline);

  useEffect(() => {
    document.title = 'Casanovia';
  }, [settings?.coupleNames]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2D2A26] font-sans antialiased selection:bg-[#8B3A4A]/20 selection:text-[#8B3A4A]">
      
      {/* Top Fixed Navigation & View Toggle */}
      <Navbar />

      {/* Conditional View Rendering */}
      {viewMode === 'public' ? (
        <main className="flex-1 animate-fadeIn">
          {/* 1. Hero & Real-time Countdown */}
          <HeroCountdown />

          {/* 2. Interactive Protocol Pass & Personalized Guide Lookup (Oculto si vence la fecha límite) */}
          {!isDeadlinePassed && <ProtocolPassLookup />}

          {/* 3. Venue Details & Map Links */}
          <EventDetails />

          {/* 4. Dress Code & Interactive Color Palette */}
          <DressCodeSection />

          {/* 5. Dynamic RSVP Form (Oculto si vence la fecha límite) */}
          {!isDeadlinePassed && <RsvpSection />}

          {/* 6. Gift Registry & Bank Transfer with 1-Click Copy */}
          <GiftRegistrySection />

          {/* 7. Wall of Wishes from Confirmed Guests */}
          <WishesWall />

          {/* Public Footer with Editable Romantic Quote, Couple Names & Contacts */}
          <PublicFooter />
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
