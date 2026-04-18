'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, BrainCircuit, Swords, History, Cpu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { icon: <Zap className="w-4 h-4 mr-3" />, label: 'Compete', href: '/game' },
  { icon: <BrainCircuit className="w-4 h-4 mr-3" />, label: 'Training', href: '/practice' },
  { icon: <Swords className="w-4 h-4 mr-3" />, label: 'Arsenal', href: '/arsenal' },
  { icon: <History className="w-4 h-4 mr-3" />, label: 'History', href: '/history' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { user } = useAuth();
  
  const currentUser = session?.user || user;

  return (
    <div className="w-[260px] flex-shrink-0 min-h-screen bg-[#080b14] border-r border-[#1e2535] flex flex-col hidden md:flex">
      
      {/* User Card */}
      <div className="px-6 mb-8 mt-6">
        <div className="bg-[#121826] border border-[#232b3b] p-4 rounded-xl flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-primary-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#121826] rounded-full animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary-400 mb-0.5">Neural_Link</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status: Ready</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} className="relative group">
              <div className={`px-8 py-4 flex items-center text-sm font-bold tracking-wider uppercase transition-colors ${isActive ? 'text-primary-400 bg-primary-900/10' : 'text-gray-500 hover:text-gray-300'}`}>
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
                )}
                <span className={`transition-transform duration-200 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                  {item.icon}
                </span>
                <span className={`transition-transform duration-200 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-8 mt-auto py-8 text-xs font-bold text-gray-600 uppercase tracking-widest space-y-3">
        <Link href="/settings" className="block hover:text-gray-400 transition-colors">Settings</Link>
        <Link href="/support" className="block hover:text-gray-400 transition-colors">Support</Link>
      </div>
    </div>
  );
}
