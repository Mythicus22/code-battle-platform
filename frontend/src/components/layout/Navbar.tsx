'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Trophy, Swords, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useUI } from './LayoutWrapper';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { user, logout } = useAuth();
  const { toggleCommLink } = useUI();
  const currentUser = session?.user || user;
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    setProfileOpen(false);
    if (session) await signOut({ redirect: false });
    await logout();
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/game', label: 'Arena', icon: Swords },
    { href: '/rankings', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#080b14]/95 backdrop-blur-md border-b border-[#1e2535]">
      <div className="flex items-center justify-between h-16 px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-[#00f2ff]/10 border border-[#00f2ff]/30 rounded-lg flex items-center justify-center">
            <Swords size={16} className="text-[#00f2ff]" />
          </div>
          <span className="text-sm font-black tracking-widest text-white uppercase hidden sm:block">
            Code<span className="text-[#00f2ff]">Battle</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? 'text-[#00f2ff] bg-[#00f2ff]/10'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="nav_active"
                    className="absolute inset-0 rounded-lg border border-[#00f2ff]/30"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              {/* Global Chat */}
              <Link
                href="/chat"
                className="flex items-center gap-2 px-3 py-2 bg-[#bc00ff]/10 border border-[#bc00ff]/30 rounded-lg text-[#bc00ff] hover:bg-[#bc00ff]/20 transition-all text-xs font-bold uppercase tracking-widest"
              >
                <MessageSquare size={14} />
                <span className="hidden sm:block">Global Chat</span>
              </Link>

              {/* Notification Bell */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast('Pending requests will appear as Global Overlays!', { icon: '🔔' })}
                className="flex items-center justify-center w-8 h-8 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500 hover:bg-amber-500/20 transition-all relative"
              >
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </motion.button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-3 border-l border-[#1e2535]"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#080b14] border border-[#1e2535] flex items-center justify-center overflow-hidden hover:border-[#00f2ff]/50 transition-colors">
                    <img
                      src={(currentUser as any)?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(currentUser as any)?.username || currentUser?.name || 'user'}&backgroundColor=121826`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-white leading-none">
                      {(currentUser as any)?.username || currentUser?.name || 'Player'}
                    </div>
                    <div className="text-[10px] text-[#00f2ff] font-bold mt-0.5">
                      {(currentUser as any)?.trophies?.toLocaleString() || user?.trophies?.toLocaleString() || '0'} 🏆
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-44 bg-[#0d1117] border border-[#1e2535] rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-widest"
                      >
                        <User size={14} /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-widest border-t border-[#1e2535]"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors px-3 py-2"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="text-xs font-bold uppercase tracking-widest bg-[#00f2ff]/10 border border-[#00f2ff]/40 text-[#00f2ff] hover:bg-[#00f2ff]/20 px-4 py-2 rounded-lg transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
