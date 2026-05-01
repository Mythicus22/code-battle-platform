'use client';

import GlobalDialogs from './GlobalDialogs';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import Navbar from './Navbar';
import FriendsSidebar from './FriendsSidebar';
import { AIAssistant } from '../chat/AIAssistant';
import { useState, createContext, useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/hooks/useAuth';
import Footer from './Footer';

export const UIContext = createContext({
  isCommLinkOpen: false,
  toggleCommLink: () => {},
  hideSidebar: false,
  setHideSidebar: (val: boolean) => {},
});

export function useUI() {
  return useContext(UIContext);
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  const [hideSidebar, setHideSidebar] = useState(false);
  const showSidebar = !hideSidebar && ['/dashboard', '/rankings', '/chat', '/game'].some(p => pathname?.startsWith(p));

  const [isCommLinkOpen, setIsCommLinkOpen] = useState(false);
  const toggleCommLink = () => setIsCommLinkOpen(!isCommLinkOpen);

  const showNavbar = !pathname?.startsWith('/game') && !isLandingPage;

  return (
    <SessionProvider>
      <AuthProvider>
        <UIContext.Provider value={{ isCommLinkOpen, toggleCommLink, hideSidebar, setHideSidebar }}>
          <div className="flex flex-col min-h-screen bg-[#080b14] text-white overflow-hidden">
            {showNavbar && <Navbar />}

            <GlobalDialogs />
            <Toaster position="top-right" toastOptions={{ style: { background: '#121826', color: '#fff', border: '1px solid #2a3040' } }} />

            <div className="flex flex-1 overflow-hidden relative">
                <main className="flex-1 overflow-x-hidden overflow-y-auto w-full relative">
                  {children}
                </main>
                
                {showSidebar && (
                  <div className="w-[320px] shrink-0 border-l border-[#1e2535] bg-[#0d1117] relative z-20 flex flex-col">
                    <FriendsSidebar />
                  </div>
                )}
            </div>

            {showNavbar && <Footer />}
            <AIAssistant isOpen={isCommLinkOpen} onClose={() => setIsCommLinkOpen(false)} />
          </div>
        </UIContext.Provider>
      </AuthProvider>
    </SessionProvider>
  );
}
