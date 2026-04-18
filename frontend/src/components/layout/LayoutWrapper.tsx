'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import { AIAssistant } from '../chat/AIAssistant';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  // Actually, wait, the user's requirement:
  // "navbar should be shown on the game page aswell it should only be hidden on the code editor page where we are actually doing the coding"
  // So we don't hide the navbar on `/game` immediately, but inside the Game components when state is IN_GAME we dispatch an event or use fullscreen
  // Since we use fullscreen API, fullscreen automatically hides the Navbar AND Sidebar! 
  // Perfect. We do NOT need to manually hide them on /game route.
  
  const hideAIAssistant = pathname === '/' || pathname.startsWith('/game');

  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen bg-[#080b14] text-white overflow-hidden">
        {/* Top Navbar spans the entire width */}
        {!isLandingPage && <Navbar />}

        <div className="flex flex-1 overflow-hidden relative">
            {/* Sidebar sits under the Navbar on the left */}
            {!isLandingPage && <Sidebar />}

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto w-full relative">
              {children}
            </main>

            {/* AI Floating Assistant */}
            {!hideAIAssistant && <AIAssistant />}
        </div>
      </div>
    </SessionProvider>
  );
}
