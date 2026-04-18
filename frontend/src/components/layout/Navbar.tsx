'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, FolderGit2, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { user, logout } = useAuth();
  
  const currentUser = session?.user || user;

  const handleLogout = async () => {
    if (session) {
      await signOut({ redirect: false });
    }
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#080b14] border-b border-[#1e2535]">
      <div className="flex items-center justify-between h-20 px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-black tracking-widest text-[#00f2ff] uppercase drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]">
            CODE_BATTLE_ARENA
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          <NavLink href="/dashboard" text="DASHBOARD" currentPath={pathname} />
          <NavLink href="/rankings" text="LEADERBOARD" currentPath={pathname} />
          <NavLink href="/lobby" text="LOBBY" currentPath={pathname} />
          <NavLink href="/game" text="ARENA" currentPath={pathname} />
        </div>

        {/* Auth / Actions */}
        <div className="flex items-center gap-6">
          {currentUser ? (
            <div className="flex items-center gap-6">
              <button className="text-gray-400 hover:text-[#00f2ff] transition-colors relative">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>
              <button className="text-gray-400 hover:text-[#00f2ff] transition-colors">
                <FolderGit2 size={18} />
              </button>
              <div className="flex items-center gap-4 pl-6 border-l border-[#1e2535]">
                <div className="w-10 h-10 rounded bg-gradient-to-b from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center cursor-pointer hover:border-[#00f2ff] transition-colors overflow-hidden">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4" alt="avatar" className="w-full h-full object-cover opacity-80" />
                </div>
                <button onClick={handleLogout} className="text-red-500 opacity-60 hover:opacity-100 hover:text-red-400 font-bold text-xs uppercase tracking-widest transition-opacity" title="Disconnect">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors py-2 px-3">
                Log In
              </Link>
              <Link href="/login" className="text-xs font-black uppercase tracking-[0.2em] bg-primary-600/10 border border-primary-500/50 hover:bg-primary-500 hover:border-primary-400 text-white px-5 py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(0,242,255,0.2)]">
                Initialize
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

function NavLink({ href, text, currentPath }: any) {
  const isActive = currentPath === href || currentPath.startsWith(`${href}/`);
  return (
    <Link 
      href={href}
      className={`px-5 py-7 text-xs font-bold uppercase tracking-[0.15em] transition-all relative
        ${isActive ? 'text-[#00f2ff]' : 'text-gray-500 hover:text-gray-300'}
      `}
    >
      <div className="relative z-10">{text}</div>
      {isActive && (
        <motion.div layoutId="nav_underline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.8)]" />
      )}
    </Link>
  );
}
