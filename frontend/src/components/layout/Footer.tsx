'use client';

import Link from 'next/link';
import { Swords, Github, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#080b14] border-t border-[#1e2535] py-8 z-10 relative">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00f2ff]/10 border border-[#00f2ff]/30 rounded-xl flex items-center justify-center">
            <Swords size={20} className="text-[#00f2ff]" />
          </div>
          <div>
            <span className="text-xl font-black tracking-widest text-white uppercase">
              Code<span className="text-[#00f2ff]">Battle</span>
            </span>
            <p className="text-xs text-gray-500 font-mono tracking-widest uppercase mt-1">Platform OS v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-400 font-bold tracking-widest uppercase">
          <Link href="/protocol" className="hover:text-[#00f2ff] transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-[#00f2ff] transition-colors">Privacy</Link>
          <Link href="/support" className="hover:text-[#00f2ff] transition-colors">Support</Link>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="w-10 h-10 rounded-full bg-[#121826] border border-[#1e2535] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#00f2ff] transition-all">
            <Github size={18} />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-[#121826] border border-[#1e2535] flex items-center justify-center text-gray-400 hover:text-[#1da1f2] hover:border-[#1da1f2] transition-all">
            <Twitter size={18} />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-[#121826] border border-[#1e2535] flex items-center justify-center text-gray-400 hover:text-[#5865F2] hover:border-[#5865F2] transition-all">
            <MessageCircle size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
