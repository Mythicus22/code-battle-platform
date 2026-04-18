'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Cpu, Code2, Users, TrendingUp, ChevronRight, Shield, Swords, Terminal, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const handleStart = () => router.push(user ? '/dashboard' : '/signup');

  return (
    <div className="min-h-screen bg-[#080b14] text-white overflow-x-hidden selection:bg-primary-500/30">
      
      {/* 1. Hero Section */}
      <section className="relative flex flex-col items-center min-h-[100vh] px-4 pt-32 pb-20 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden perspective-[1000px]">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/4 left-[10%] w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[150px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], x: [0, 100, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 right-[10%] w-[500px] h-[500px] bg-secondary-600/15 rounded-full blur-[150px]" 
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,242,255,0.03),transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-0 w-full h-[60vh] [mask-image:linear-gradient(transparent,black)] pointer-events-none">
             <div className="absolute inset-0 border-t border-primary-500/20 [transform:rotateX(60deg)_scale(2.5)] bg-[linear-gradient(to_right,rgba(0,242,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,242,255,0.08)_1px,transparent_1px)] bg-[size:60px_60px]" />
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center gap-12 text-center"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="max-w-4xl pt-16">
            <h1 className="text-[clamp(4.5rem,10vw,8rem)] font-black leading-[0.85] tracking-tighter text-white uppercase italic drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              CODE. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-500 drop-shadow-[0_0_35px_rgba(0,242,255,0.6)]">BATTLE.</span> <br />
              CONQUER.
            </h1>
            
            <p className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto mt-10 mb-12 leading-relaxed font-medium">
              Forge your legacy in the most intense 1v1 competitive coding arena ever built. AI-powered challenges. Real stakes. Total dominance.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05, textShadow: "0 0 8px rgb(255,255,255)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="bg-primary-600 text-white font-black px-12 py-5 rounded-2xl uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,242,255,0.4)] hover:shadow-[0_0_50px_rgba(0,242,255,0.6)] transition-all flex items-center gap-3 text-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                Initialize Combat <ChevronRight size={22} className="fill-current" />
              </motion.button>
              <Link
                href="/about"
                className="font-black px-12 py-5 bg-[#0a0e18]/80 backdrop-blur-md border border-gray-800 hover:border-secondary-500/50 hover:bg-secondary-900/20 text-gray-400 hover:text-secondary-400 rounded-2xl uppercase tracking-[0.2em] transition-all whitespace-nowrap text-lg shadow-lg"
              >
                Read Protocol
              </Link>
            </div>
            
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="flex items-center justify-center gap-12 mt-20 scale-110">
               <div className="text-left">
                  <div className="text-3xl font-black italic text-primary-400">42,800+</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">Active Coders</div>
               </div>
               <div className="w-[1px] h-10 bg-gray-800" />
               <div className="text-left">
                  <div className="text-3xl font-black italic text-secondary-400">1.2M+</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">Matches Fought</div>
               </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Features Grid */}
      <section className="py-32 px-10 relative z-10 bg-[#060810] border-t border-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
             <span className="text-xs font-black uppercase tracking-[0.4em] text-primary-500 mb-4 block drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">Core Directives</span>
             <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-md">
                The Architecture of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">Excellence</span>
             </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap size={32} className="text-cyan-400" />, title: 'Real-time 1v1', desc: 'Sync with global opponents instantly. Live typing and progress tracking creates unparalleled intensity.' },
              { icon: <Bot size={32} className="text-secondary-400" />, title: 'AI Overlord', desc: 'Every problem is heavily curated by our generative AI, guaranteeing 0 known solutions online and 15+ extreme test cases.' },
              { icon: <TrendingUp size={32} className="text-success-400" />, title: 'ELO Rankings', desc: 'Climb the ladder from Rookie to Grandmaster. True matchmaking based on strict skill parameters.' },
              { icon: <Terminal size={32} className="text-primary-400" />, title: 'Monaco Editor', desc: 'Experience VS-Code level intellisense in browser. Multi-cursor, syntax highlights, auto-completion.' },
              { icon: <Swords size={32} className="text-danger-400" />, title: 'Friend Battles', desc: 'Challenge your friends via invite. Create unrated custom lobbies to settle personal scores.' },
              { icon: <Shield size={32} className="text-gray-400" />, title: 'Anti-Cheat', desc: 'Automated plagiarism detection, tab-switching deterrence, and completely untainted problem sets.' }
            ].map((feat, i) => (
              <div key={i} className="bg-[#0b0e17] border border-gray-800/60 p-10 rounded-3xl hover:border-primary-500/40 hover:bg-[#0f1422] transition-all group shadow-2xl hover:shadow-[0_0_30px_rgba(0,242,255,0.1)]">
                <div className="bg-gray-900/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-gray-800 group-hover:scale-110 group-hover:border-primary-500/30 transition-all shadow-inner">
                  {feat.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight uppercase italic">{feat.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm font-medium">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. "How it Works" / Protocol Summary */}
      <section className="py-32 px-10 relative z-10 bg-[#0a0e18] overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary-900/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 space-y-10">
             <span className="inline-block py-1.5 px-4 bg-secondary-900/30 border border-secondary-500/30 rounded-lg text-secondary-400 text-[10px] font-black uppercase tracking-[0.3em]">
               System Boot Sequence
             </span>
             <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.9]">
               Three Steps to <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-primary-500">Immortality.</span>
             </h2>
             <div className="space-y-8">
                {[
                  { step: '01', title: 'Initialize Link', desc: 'Create your combat profile. Establish your preferred languages and set up your initial ELO calibration.' },
                  { step: '02', title: 'Enter Matchmaking', desc: 'Our socket cluster will find an opponent matching your exact skill level within milliseconds.' },
                  { step: '03', title: 'Execute Code', desc: 'First to pass all 15 hidden test-cases wins. Lose, and your trophies are heavily penalized.' }
                ].map((s, idx) => (
                  <div key={idx} className="flex gap-6 items-start group">
                    <div className="text-4xl font-black italic text-gray-800 group-hover:text-secondary-500/40 transition-colors">{s.step}</div>
                    <div>
                      <h4 className="text-xl font-bold uppercase tracking-tight text-gray-200 group-hover:text-white transition-colors">{s.title}</h4>
                      <p className="text-sm text-gray-500 mt-2 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="lg:w-1/2 relative w-full aspect-square max-w-[500px] mx-auto hidden lg:block">
             <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl animate-pulse" />
             <div className="absolute inset-10 border border-gray-700 rounded-full border-dashed animate-[spin_30s_linear_infinite]" />
             <div className="absolute inset-20 border-2 border-primary-500/30 rounded-full border-solid animate-[spin_20s_linear_infinite_reverse]" />
             <div className="absolute inset-0 flex items-center justify-center">
                <Code2 size={120} className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
             </div>
          </div>
        </div>
      </section>

      {/* 4. Global Leaderboard Call To Action */}
      <section className="py-24 px-10 relative z-10 bg-gradient-to-b from-[#060810] to-[#040508]">
        <div className="max-w-4xl mx-auto text-center bg-[#0d121f] border border-gray-800 rounded-[3rem] p-16 shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-success-500" />
          <Users size={48} className="mx-auto text-gray-400 mb-8" />
          <h2 className="text-4xl font-black uppercase tracking-tight italic mb-6">Are you Grandmaster Material?</h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto">Join the ranks of the elite. See where you stand against the best competitive programmers in the global ladder.</p>
          <Link href="/rankings" className="inline-block bg-white text-black px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform text-sm">
            View Live Ranks
          </Link>
        </div>
      </section>

      {/* 5. Massive Professional Footer */}
      <footer className="bg-[#020305] border-t border-gray-900 pt-24 pb-12 px-10 text-gray-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <Cpu className="text-primary-500" size={28} />
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
                Code Battle
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              The premier platform for high-stakes 1v1 developer combat. Test your logic, speed, and endurance against the global network.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold uppercase tracking-[0.2em] text-xs mb-6">Operations</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/game" className="hover:text-primary-400 transition-colors">The Arena</Link></li>
              <li><Link href="/rankings" className="hover:text-primary-400 transition-colors">Leaderboards</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary-400 transition-colors">Command Center</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-[0.2em] text-xs mb-6">Intelligence</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/about" className="hover:text-primary-400 transition-colors">Protocol & Ethics</Link></li>
              <li><Link href="/lobby" className="hover:text-primary-400 transition-colors">Global Comms</Link></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-[0.2em] text-xs mb-6">Legal</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Security Audit</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-black tracking-widest uppercase">
          <p>© 2026 Code Battle Platform. All rights reserved.</p>
          <div className="flex items-center gap-2 text-success-500 bg-success-500/10 px-3 py-1.5 rounded-lg border border-success-500/20">
            <div className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse" />
            System Operational
          </div>
        </div>
      </footer>

    </div>
  );
}
