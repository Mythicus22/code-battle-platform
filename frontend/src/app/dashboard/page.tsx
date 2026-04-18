'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target as TargetIcon, 
  Swords, 
  TrendingUp, 
  LayoutDashboard, 
  BarChart3, 
  Bell, 
  ChevronRight,
  Zap,
  Shield,
  Flame,
  Code2,
  Star,
  Award,
  Skull
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { users } from '@/lib/api';
import { ARENAS, getArenaByTrophies } from '@/constants/arenas';
import toast from 'react-hot-toast';
import React from 'react';

const ARENA_TIERS = ['ROOKIE', 'AMATEUR', 'ELITE', 'MASTER', 'GRANDMASTER'];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      Promise.all([users.getProfile(), users.getBadges()])
        .then(([profileRes, badgesRes]) => {
          setRecentMatches(profileRes.data.recentMatches || []);
          setBadges(badgesRes.data.badges || []);
        })
        .catch(() => toast.error('Failed to load dashboard data'));
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
      </div>
    );
  }

  const currentArena = getArenaByTrophies(user.trophies);
  const nextArena = ARENAS.find(a => a.minTrophies > user.trophies);
  const trophiesNeeded = nextArena ? nextArena.minTrophies - user.trophies : 0;
  const progressPct = nextArena
    ? Math.min(100, ((user.trophies - currentArena.minTrophies) / (nextArena.minTrophies - currentArena.minTrophies)) * 100)
    : 100;
  const winrate = parseFloat(user.winrate || '0');
  const globalRank = Math.max(1, 2000 - Math.floor(user.trophies / 2));

  // Extracted logic to properly define unlocked state.
  const BADGE_DEFS = [
    { key: 'FIRST_BLOOD', icon: <Skull className="text-red-500" /> },
    { key: 'FLAWLESS', icon: <Shield className="text-blue-500" /> },
    { key: 'SPEEDSTER', icon: <Zap className="text-yellow-500" /> },
    { key: 'WIN_STREAK', icon: <Flame className="text-orange-500" /> },
    { key: 'BUG_HUNTER', icon: <Code2 className="text-[#bc00ff]" /> },
    { key: 'ARENA_CHAMPION', icon: <Star className="text-gray-700" /> },
    { key: 'COMEBACK_KID', icon: <Award className="text-gray-700" /> },
    { key: 'BET_MASTER', icon: <TargetIcon className="text-green-500" /> },
    { key: 'TROPHY_HUNTER', icon: <Trophy className="text-gray-700" /> },
  ];

  return (
    <div className="min-h-screen bg-[#080b14] text-white font-sans selection:bg-cyan-500/30">
      
      <main className="max-w-[1400px] mx-auto px-4 md:px-10 py-8 md:py-12 space-y-8 md:space-y-12">
        
        {/* --- WELCOME HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">
              WELCOME BACK, <span className="text-primary-500 drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">{user.username.toUpperCase()}</span>
            </h1>
            <p className="text-gray-400 flex items-center gap-2 text-xs md:text-sm font-medium">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Your performance increased <span className="text-white border-b border-primary-500 pb-0.5">12.5%</span> this week. Ready for the next duel?
            </p>
          </motion.div>
          <motion.button 
             initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
             onClick={() => router.push('/game')}
             className="w-full md:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-500 hover:to-primary-300 px-8 py-4 rounded-xl font-black uppercase tracking-[0.1em] text-sm md:text-lg shadow-[0_0_25px_rgba(0,242,255,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            <Swords className="w-5 h-5 fill-current" />
            Enter Battle
          </motion.button>
        </header>

        {/* --- QUICK STATS GRID --- */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard icon={<Trophy className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" />} label="TOTAL TROPHIES" value={user.trophies.toLocaleString()} change="+120" delay={0} />
          <StatCard icon={<TargetIcon className="text-secondary-500 drop-shadow-[0_0_8px_rgba(188,0,255,0.6)]" />} label="WIN RATE" value={`${winrate.toFixed(1)}%`} change="+2.1%" delay={0.1} />
          <StatCard icon={<Swords className="text-primary-500 drop-shadow-[0_0_8px_rgba(0,242,255,0.6)]" />} label="TOTAL BATTLES" value={user.totalGames.toString()} delay={0.2} />
          <StatCard icon={<TrendingUp className="text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />} label="GLOBAL RANK" value={`#${globalRank.toLocaleString()}`} change="+42" delay={0.3} />
        </section>

        {/* --- ARENA LEVEL PROGRESS CARD --- */}
        <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-[#111827] border border-gray-800 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-2xl"
        >
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start relative z-10 gap-8 md:gap-0">
            <div className="w-full md:w-2/3 space-y-6 md:space-y-8">
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h2 className="text-xl md:text-2xl font-black italic tracking-tight uppercase">Arena Level <span className="text-secondary-500 ml-1 drop-shadow-[0_0_8px_rgba(188,0,255,0.6)]">{Math.floor(user.trophies / 100)}</span></h2>
                  <span className="bg-secondary-500/20 text-secondary-400 text-[10px] px-2 py-0.5 rounded font-black tracking-widest border border-secondary-500/30">CODER</span>
                </div>
                <p className="text-gray-400 text-xs md:text-sm">
                  You are <span className="text-white font-bold">{trophiesNeeded} XP</span> away from achieving <span className="text-secondary-500 font-bold drop-shadow-[0_0_5px_rgba(188,0,255,0.3)]">{nextArena?.name || 'Max'} Rank</span>. Keep winning battles to climb!
                </p>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="flex justify-end text-[10px] font-black tracking-widest text-gray-500">
                  CURRENT XP <span className="text-white ml-2">{user.trophies.toLocaleString()} / {(nextArena?.minTrophies || user.trophies + 1000).toLocaleString()}</span>
                </div>
                
                {/* Custom glowing progress bar */}
                <div className="h-2 md:h-2.5 w-full bg-gray-900/50 rounded-full overflow-hidden flex border border-gray-800 shadow-inner relative">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary-600 via-cyan-400 to-secondary-500 rounded-full relative shadow-[0_0_15px_rgba(0,242,255,0.8)]"
                  >
                     <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/60 blur-[2px]" 
                     />
                  </motion.div>
                </div>

                <div className="flex justify-between text-[8px] md:text-[10px] font-black tracking-widest px-1 overflow-x-auto">
                   {ARENA_TIERS.map((tier, idx) => (
                      <span key={tier} className={idx === 2 ? "text-secondary-500 underline underline-offset-4" : "text-gray-600"}>{tier}</span>
                   ))}
                </div>
              </div>
            </div>

            {/* Level Circle */}
            <div className="relative transform scale-100 md:scale-125 md:translate-x-[-20%] md:translate-y-[10%] drop-shadow-[0_0_15px_rgba(188,0,255,0.2)]">
              <svg className="w-24 h-24 md:w-32 md:h-32 transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-900" />
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${progressPct * 2.83}% 283%`} className="text-secondary-500 transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl md:text-3xl font-black italic">{Math.floor(user.trophies / 100)}</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          
          {/* Recent Activity Table */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
             className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 md:space-y-8 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary-500/10 border border-primary-500/20 rounded-lg text-primary-500 shadow-[0_0_10px_rgba(0,242,255,0.1)]">
                    <TrendingUp size={20} />
                 </div>
                 <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tight">Recent Activity</h3>
              </div>
              <button className="text-[8px] md:text-[10px] font-black tracking-widest text-gray-500 hover:text-white transition-colors uppercase border-b border-gray-800 pb-1">View All History</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                <thead>
                    <tr className="text-[8px] md:text-[10px] text-gray-500 font-black tracking-widest uppercase border-b border-gray-800">
                    <th className="pb-4 md:pb-6 font-black pl-2">OPPONENT</th>
                    <th className="pb-4 md:pb-6 font-black">LANGUAGE</th>
                    <th className="pb-4 md:pb-6 font-black text-center">OUTCOME</th>
                    <th className="pb-4 md:pb-6 font-black text-right pr-2">POINTS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/20">
                    {recentMatches.length > 0 ? (
                        recentMatches.slice(0, 5).map((match: any, i: number) => (
                            <ActivityRow 
                                key={i}
                                name={match.opponentUsername || 'Unknown'} 
                                lang={match.language || 'JS'} 
                                outcome={match.result === 'win' ? 'WIN' : 'LOSS'} 
                                points={match.result === 'win' ? '+45 XP' : '-20 XP'} 
                                win={match.result === 'win'} 
                            />
                        ))
                    ) : (
                        <tr><td colSpan={4} className="py-8 text-center text-gray-600 text-sm italic font-medium">No battles recorded yet. Enter the arena!</td></tr>
                    )}
                </tbody>
                </table>
            </div>
          </motion.div>

          {/* Milestones Card */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
             className="bg-[#111827] border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl"
          >
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-500/10 border border-secondary-500/20 rounded-lg shadow-[0_0_10px_rgba(188,0,255,0.1)]">
                    <Award className="w-5 h-5 text-secondary-500" />
                </div>
                <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tight">Milestones</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {BADGE_DEFS.map((b, i) => (
                    <BadgeIcon key={i} icon={b.icon} locked={!badges.includes(b.key) && i > 4} /> // Visual locked demo for wireframe
                ))}
              </div>
            </div>
            
            <button className="w-full mt-6 py-4 bg-black/40 border border-gray-800 text-[10px] font-black tracking-[0.2em] uppercase text-gray-500 hover:text-white hover:border-secondary-500 transition-all rounded-xl hover:shadow-[0_0_15px_rgba(188,0,255,0.2)]">
              VIEW ALL {badges.length || 42} BADGES
            </button>
          </motion.div>
        </div>

        {/* --- PRO TIP BAR --- */}
        <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="bg-[#111827] border border-gray-800 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 group shadow-lg"
        >
          <div className="flex items-start md:items-center gap-4 md:gap-6">
            <div className="p-3 bg-primary-600/10 border border-primary-500/20 rounded-xl shadow-[0_0_15px_rgba(0,242,255,0.15)] group-hover:bg-primary-500/20 transition-colors">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
            </div>
            <div>
              <h4 className="font-bold text-base md:text-lg">Pro Tip: <span className="italic">Study Your Last Loss</span></h4>
              <p className="text-gray-400 text-xs md:text-sm italic mt-1 leading-relaxed">
                Analysing your failed test cases in match <span className="text-white font-mono bg-gray-900 px-1 py-0.5 rounded border border-gray-800">#SyntaxError</span> could improve your runtime efficiency score by up to <span className="text-primary-500 font-bold drop-shadow-[0_0_5px_rgba(0,242,255,0.4)]">20%</span>.
              </p>
            </div>
          </div>
          <button className="text-primary-500 hover:text-primary-400 font-black text-xs md:text-sm flex items-center gap-1 transition-colors whitespace-nowrap self-end md:self-auto uppercase tracking-wide">
            Review Match <ChevronRight size={18} />
          </button>
        </motion.section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="max-w-[1400px] mx-auto px-6 md:px-10 py-8 md:py-12 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 text-[8px] md:text-[10px] font-black tracking-widest text-gray-600 uppercase">
        <div>© 2024 Code Battle Arena. All rights reserved.</div>
        <div className="flex gap-6 md:gap-8">
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">System Status</a>
        </div>
      </footer>
    </div>
  );
}

/* --- SUB-COMPONENTS --- */

const StatCard = ({ icon, label, value, change, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, type: 'spring' }}
    className="bg-[#111827] border border-gray-800 rounded-2xl p-4 md:p-6 space-y-3 md:space-y-4 hover:border-gray-600 shadow-xl transition-all cursor-pointer relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
    <div className="flex justify-between items-start relative z-10">
      <div className="p-2 md:p-2.5 bg-gray-900 border border-gray-800 rounded-lg shadow-inner">{icon}</div>
      {change && (
        <span className={`text-[8px] md:text-[10px] font-black bg-gray-900 border border-gray-800 px-2 md:px-2.5 py-1 rounded tracking-tighter ${change.includes('+') ? 'text-success-400 drop-shadow-[0_0_5px_rgba(0,255,136,0.3)]' : 'text-red-400'}`}>
          {change}
        </span>
      )}
    </div>
    <div className="relative z-10">
      <p className="text-[8px] md:text-[10px] text-gray-500 font-black tracking-[0.1em] uppercase">{label}</p>
      <h3 className="text-2xl md:text-4xl font-black italic mt-0.5 md:mt-1 tracking-tighter drop-shadow-md">{value}</h3>
    </div>
  </motion.div>
);

const ActivityRow = ({ name, lang, outcome, points, win }: any) => (
  <tr className="group transition-colors border-b last:border-0 border-gray-800/30 hover:bg-white/[0.02]">
    <td className="py-4 md:py-6 pl-2 flex items-center gap-2 md:gap-3 font-bold text-xs md:text-sm tracking-tight text-gray-300">
      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-800 border border-gray-700 flex items-center justify-center text-[10px] text-white font-bold shadow-inner uppercase overflow-hidden">
        {name.charAt(0)}
      </div>
      {name}
    </td>
    <td className="py-4 md:py-6">
      <span className="text-[8px] md:text-[10px] font-black bg-gray-900 border border-gray-800 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-gray-400 shadow-inner">{lang}</span>
    </td>
    <td className="py-4 md:py-6 text-center">
      <span className={`text-[8px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full border shadow-sm ${win ? 'bg-primary-500/10 text-primary-400 border-primary-500/30 drop-shadow-[0_0_5px_rgba(0,242,255,0.2)]' : 'bg-danger-500/10 text-danger-500 border-danger-500/30'}`}>
        {outcome}
      </span>
    </td>
    <td className={`py-4 md:py-6 pr-2 text-right font-black italic text-xs md:text-sm ${win ? 'text-primary-400 drop-shadow-[0_0_5px_rgba(0,242,255,0.4)]' : 'text-danger-500'}`}>
      {points}
    </td>
  </tr>
);

const BadgeIcon = ({ icon, locked }: any) => (
  <div className={`aspect-square flex items-center justify-center rounded-xl md:rounded-2xl border ${locked ? 'bg-black/40 border-gray-900 opacity-50' : 'bg-gray-900/50 border-gray-800 hover:border-gray-600 shadow-inner'} transition-all cursor-pointer group`}>
    {React.cloneElement(icon, { size: 24, className: `${icon.props.className} group-hover:scale-110 transition-transform ${locked ? 'grayscale' : 'drop-shadow-md'}` })}
  </div>
);
