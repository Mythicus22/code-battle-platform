'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Search, Filter, Users, Swords, TrendingUp, Cpu, Crown, SearchIcon, Play } from 'lucide-react';
import { game, users } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function RankingsPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [currentSeasonEnds, setCurrentSeasonEnds] = useState('14 days');

  useEffect(() => {
    game.getLeaderboard(1)
      .then((res) => {
        // Mock default if empty just for wireframe matching until DB fills
        const apiData = res.data.leaderboard || [];
        setLeaderboard(apiData.length >= 3 ? apiData : MOCK_LEADERBOARD);
        setLoading(false);
      })
      .catch(() => {
        setLeaderboard(MOCK_LEADERBOARD);
        setLoading(false);
      });
  }, []);

  if (loading) {
     return (
        <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
        </div>
     );
  }

  const topPlayers = leaderboard;
  const podium = [topPlayers[1], topPlayers[0], topPlayers[2]]; // Rank 2, Rank 1, Rank 3
  const tablePlayers = topPlayers.slice(3, 10);

  return (
    <div className="min-h-screen bg-[#080b14] text-white overflow-hidden pb-12 selection:bg-cyan-500/30">
      
      {/* Top Decoration */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-primary-900/10 via-primary-900/5 to-transparent pointer-events-none" />



      <div className="max-w-[1400px] mx-auto px-6 mt-12 relative z-10">
        
        {/* Title & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-4 flex items-center gap-4 select-none italic uppercase">
              <Trophy className="w-10 h-10 md:w-12 md:h-12 text-primary-500 drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]" />
              GLOBAL RANKINGS
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-lg leading-relaxed font-medium">
              The world's elite developers battling for supremacy. Only the strongest survive the <span className="text-primary-400">Code Battle Arena</span>.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 h-12 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 lg:w-80">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search champions..." 
                className="w-full h-full bg-[#111827] border border-gray-800 rounded-xl pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 shadow-inner transition-all"
              />
            </div>
            <button className="flex items-center gap-2 bg-[#111827] border border-gray-800 hover:border-gray-700 transition-colors px-6 rounded-xl text-sm font-bold text-gray-300 uppercase tracking-widest shadow-lg shrink-0">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </motion.div>
        </div>

        {/* --- PODIUM --- */}
        <div className="flex justify-center items-end gap-2 sm:gap-4 md:gap-8 mb-20 mt-12 h-[350px]">
          {podium.map((p, i) => {
            if (!p) return null;
            const isRank1 = i === 1;
            const isRank2 = i === 0;
            const rank = isRank2 ? 2 : isRank1 ? 1 : 3;
            
            // Heights and scales exactly matching wireframe proportions
            const sizingClass = isRank1 
                ? 'h-[320px] w-56 md:w-72 scale-110 z-20 shadow-[0_0_50px_rgba(0,242,255,0.15)] bg-gradient-to-b from-[#111827] to-[#080b14]' 
                : isRank2
                    ? 'h-[260px] w-48 md:w-64 z-10 opacity-90 hover:opacity-100 bg-[#111827]'
                    : 'h-[240px] w-48 md:w-64 z-0 opacity-80 hover:opacity-100 bg-[#111827]';
            
            const borderColors = isRank1 ? 'border-primary-500/50' : isRank2 ? 'border-secondary-500/30' : 'border-gray-800';
            const rankBg = isRank1 ? 'bg-primary-600 text-white shadow-[0_0_10px_rgba(0,242,255,0.5)]' : isRank2 ? 'bg-secondary-600/20 text-secondary-400 border border-secondary-500/30' : 'bg-gray-800 text-gray-400';

            return (
              <motion.div 
                key={p._id || Math.random()}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isRank1 ? 0.3 : isRank2 ? 0.2 : 0.4, duration: 0.6, type: 'spring' }}
                className={`border rounded-[2rem] p-6 flex flex-col items-center justify-between text-center transition-all ${sizingClass} ${borderColors} relative group`}
              >
                {/* Crown for Rank 1 */}
                {isRank1 && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce-slow">
                    <Crown className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]" fill="currentColor" />
                  </div>
                )}
                
                {/* Rank Badge */}
                <div className={`absolute -top-3 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${rankBg}`}>
                  RANK {rank}
                </div>
                
                {/* Avatar & Name */}
                <div className={`mt-8 ${isRank1 ? 'scale-110' : ''} transition-transform`}>
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white font-black text-3xl mb-4 shadow-xl border-4 ${isRank1 ? 'bg-gradient-to-br from-primary-500 to-blue-700 border-[#080b14]' : isRank2 ? 'bg-gradient-to-br from-secondary-500 to-purple-800 border-[#080b14]' : 'bg-gradient-to-br from-gray-600 to-gray-800 border-[#080b14]'}`}>
                    {p.username.charAt(0).toUpperCase()}
                  </div>
                  <h3 className={`font-black uppercase tracking-tight italic ${isRank1 ? 'text-primary-400 text-2xl drop-shadow-[0_0_5px_rgba(0,242,255,0.4)]' : 'text-gray-200 text-xl'}`}>{p.username}</h3>
                  <div className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase mt-1">
                      {p.trophies > 15000 ? 'Grandmaster' : p.trophies > 10000 ? 'Master' : 'Elite'}
                  </div>
                </div>

                {/* Stats Grid inside Podium Card */}
                <div className={`w-full grid grid-cols-2 gap-2 mt-auto pt-4 ${isRank1 ? 'border-primary-500/20' : 'border-gray-800/50'} border-t`}>
                  <div>
                    <div className="text-[9px] text-gray-500 font-black tracking-widest uppercase mb-1">TROPHIES</div>
                    <div className={`text-base font-black italic flex items-center justify-center gap-1.5 ${isRank1 ? 'text-white' : 'text-gray-300'}`}>
                      <Trophy className={`w-3.5 h-3.5 ${isRank1 ? 'text-yellow-400' : 'text-gray-500'}`} />
                      {p.trophies.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 font-black tracking-widest uppercase mb-1">WIN RATE</div>
                    <div className={`text-base font-black italic ${isRank1 ? 'text-primary-400' : 'text-secondary-400'}`}>{p.winrate || (isRank1 ? '84' : isRank2 ? '78' : '72')}%</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* --- GLOBAL STATS ROW --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
          {[
            { label: 'ACTIVE CONTENDERS', val: '128,402', icon: <Users className="w-5 h-5 text-primary-400" />, glow: 'shadow-[0_0_15px_rgba(0,242,255,0.1)]' },
            { label: 'BATTLES FOUGHT', val: '1.2M', icon: <Swords className="w-5 h-5 text-secondary-400" />, glow: 'shadow-[0_0_15px_rgba(188,0,255,0.1)]' },
            { label: 'DAILY TREND', val: '+4.2%', icon: <TrendingUp className="w-5 h-5 text-success-400" />, glow: 'shadow-[0_0_15px_rgba(0,255,136,0.1)]' },
            { label: 'AI PROBLEMS', val: '45,900', icon: <Cpu className="w-5 h-5 text-yellow-400" />, glow: 'shadow-[0_0_15px_rgba(250,204,21,0.1)]' },
          ].map((stat, i) => (
             <div key={i} className={`bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 hover:bg-[#1a2235] transition-colors cursor-default ${stat.glow}`}>
               <div className="w-12 h-12 bg-black border border-gray-800 rounded-xl flex items-center justify-center shrink-0">
                 {stat.icon}
               </div>
               <div>
                 <div className="text-[10px] text-gray-500 font-black tracking-widest uppercase mb-1">{stat.label}</div>
                 <div className="text-3xl font-black italic tracking-tighter text-white">{stat.val}</div>
               </div>
             </div>
          ))}
        </motion.div>

        {/* --- LEADERBOARD TABLE --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden mb-20 shadow-2xl">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-800 bg-black/40 text-[10px] text-gray-500 font-black tracking-widest uppercase shadow-inner">
            <div className="col-span-1 text-center">RANK</div>
            <div className="col-span-5 md:col-span-4 pl-4">PLAYER</div>
            <div className="col-span-3 hidden md:block text-center">TIER DISTINCTION</div>
            <div className="col-span-3 md:col-span-2 text-center">WIN RATE MEASURE</div>
            <div className="col-span-3 md:col-span-2 text-right pr-6">TROPHY COUNT</div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-gray-800/50">
            {tablePlayers.map((p, i) => (
              <motion.div 
                key={p._id || i} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.6 + (i * 0.05) }}
                className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/[0.02] transition-colors group"
                >
                <div className="col-span-1 text-center font-black italic text-gray-500 text-lg group-hover:text-primary-500 transition-colors">
                    {i + 4}
                </div>
                
                <div className="col-span-5 md:col-span-4 flex items-center gap-4 pl-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center text-sm font-black border border-gray-700 shadow-inner overflow-hidden">
                    {p.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-black italic uppercase tracking-tight text-sm text-gray-200 group-hover:text-white transition-colors">{p.username}</div>
                    <div className="text-[9px] font-mono text-gray-600 mt-1 uppercase tracking-wider">ID: {p._id ? p._id.substring(0,6) : `1020${i}`}</div>
                  </div>
                </div>
                
                <div className="col-span-3 hidden md:flex justify-center">
                  <span className={`bg-black/60 border text-[9px] font-black px-3 py-1.5 rounded-md uppercase tracking-[0.2em] shadow-inner ${
                      p.trophies > 9500 ? 'border-primary-500/20 text-primary-400' : 'border-gray-700 text-gray-400'
                  }`}>
                    {p.trophies > 9500 ? 'Master' : 'Elite'}
                  </span>
                </div>
                
                <div className="col-span-3 md:col-span-2 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-black border border-gray-800 rounded-full overflow-hidden shadow-inner hidden sm:block">
                     <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full" style={{ width: `${p.winrate || (68-i)}%` }} />
                  </div>
                  <span className="text-xs font-black italic text-gray-400 w-10 text-right">{p.winrate || (68 - i)}%</span>
                </div>
                
                <div className="col-span-3 md:col-span-2 text-right pr-6 flex items-center justify-end gap-2 font-black italic text-lg text-gray-300">
                  <Trophy className="w-4 h-4 text-gray-600 group-hover:text-yellow-500 transition-colors" />
                  {p.trophies.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* --- FOOTER CTA CARD --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-[#111827] to-[#080b14] border border-primary-500/30 rounded-3xl p-10 md:p-12 shadow-[0_0_40px_rgba(0,242,255,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
          
          <div className="mb-8 md:mb-0 relative z-10">
            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-4 text-white">
              Climb to the top of the <br /><span className="text-primary-500 drop-shadow-[0_0_10px_rgba(0,242,255,0.4)]">Code Battle</span> Arena.
            </h2>
            <p className="text-gray-400 text-sm max-w-xl font-medium leading-relaxed">
              Join daily tournaments, complete AI challenges, and outcode your rivals to earn massive trophy rewards. The season ends in <strong className="text-secondary-400 bg-secondary-900/30 px-2 py-0.5 rounded border border-secondary-500/20">{currentSeasonEnds}</strong>. Are you ready?
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10 shrink-0">
            <Link href="/game" className="bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-500 hover:to-primary-300 text-white font-black px-8 py-4 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] flex items-center justify-center gap-2 uppercase tracking-[0.2em]">
               <Play size={16} className="fill-current" /> Enter Arena
            </Link>
            <Link href="/dashboard" className="bg-[#111827] border border-gray-700 hover:border-gray-500 text-white font-black px-8 py-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em]">
               View Stats
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

const MOCK_LEADERBOARD = [
  { _id: '1', username: 'CodeReaper', trophies: 15800, winrate: 84 },
  { _id: '2', username: 'SyntaxError_01', trophies: 12450, winrate: 78 },
  { _id: '3', username: 'ByteNinja', trophies: 11200, winrate: 72 },
  { _id: '4', username: 'NullPointer', trophies: 9800, winrate: 68 },
  { _id: '5', username: 'KernelPanic', trophies: 9450, winrate: 65 },
  { _id: '6', username: 'MainFrame', trophies: 8900, winrate: 62 },
  { _id: '7', username: 'GhostInTheShell', trophies: 8750, winrate: 61 },
  { _id: '8', username: 'VectorSpace', trophies: 8200, winrate: 59 },
  { _id: '9', username: 'DevOps_God', trophies: 7900, winrate: 58 },
  { _id: '10', username: 'RubyOnRage', trophies: 7600, winrate: 55 },
];
