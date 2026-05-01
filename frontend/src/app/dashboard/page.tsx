'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target as TargetIcon, 
  Globe,
  Award,
  Crown,
  Calendar,
  Flame,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { users } from '@/lib/api';
import { ARENAS, getArenaByTrophies } from '@/constants/arenas';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [recentMatches, setRecentMatches] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      users.getProfile()
        .then((profileRes) => {
          setRecentMatches(profileRes.data.recentMatches || []);
        })
        .catch(() => toast.error('Failed to load dashboard data'));
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
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
  const badges = user.badges || [];

  return (
    <div className="min-h-screen bg-[#080b14] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden p-6 md:p-10 w-full relative z-10">
      
      {/* Background Blurs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2"
            >
              Welcome back, {user.username}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-lg"
            >
              Ready for your next challenge?
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mt-6 md:mt-0 bg-[#121826]/80 backdrop-blur-xl border border-[#1e2535] px-6 py-3 rounded-2xl relative"
          >
            <div 
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-400 p-0.5 cursor-pointer hover:border-primary-300 transition-colors relative group"
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
               <img src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}&backgroundColor=121826`} alt="Avatar" className="w-full h-full rounded-full object-cover group-hover:opacity-50 transition-opacity" />
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                 <span className="text-[8px] font-bold text-white bg-black/50 px-1 rounded">EDIT</span>
               </div>
            </div>
            <input 
              type="file" 
              id="avatar-upload" 
              className="hidden" 
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                   const toastId = toast.loading('Uploading avatar...');
                   try {
                     const { default: api } = await import('@/lib/api');
                     const formData = new FormData();
                     formData.append('profilePicture', file);
                     await api.post('/users/avatar', formData, {
                       headers: { 'Content-Type': 'multipart/form-data' }
                     });
                     toast.success('Profile picture updated! Reloading...', { id: toastId });
                     setTimeout(() => window.location.reload(), 1000);
                   } catch (err) {
                     toast.error('Failed to update avatar', { id: toastId });
                   }
                }
              }}
            />
            <div>
              <div className="font-bold text-white text-lg tracking-widest uppercase">{user.username}</div>
              <div className="text-primary-400 text-xs font-black uppercase tracking-widest">{currentArena.name}</div>
            </div>
          </motion.div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<TargetIcon className="w-8 h-8" />}
            label="Total Matches"
            value={user.totalGames.toString()}
            subtitle="+0 this week"
            gradient="from-cyan-900/40 to-blue-900/40"
            glowColor="blue"
            delay={0.1}
          />
          <StatCard 
            icon={<Award className="w-8 h-8" />}
            label="Win Rate"
            value={`${winrate}%`}
            subtitle="Last 50 matches"
            gradient="from-purple-900/40 to-pink-900/40"
            glowColor="purple"
            delay={0.2}
          />
          <StatCard 
            icon={<Globe className="w-8 h-8" />}
            label="Global Rank"
            value={`#${globalRank.toLocaleString()}`}
            subtitle="Top 5%"
            gradient="from-blue-900/40 to-indigo-900/40"
            glowColor="blue"
            delay={0.3}
          />
          <StatCard 
            icon={<Flame className="w-8 h-8" />}
            label="Current Win Streak"
            value="0"
            subtitle="Best: 3"
            gradient="from-orange-900/40 to-red-900/40"
            glowColor="orange"
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Big Button & Arena Progress */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="bg-[#121826]/80 backdrop-blur-xl border border-[#1e2535] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Current Arena</h2>
                  <p className="text-gray-400 text-lg">{currentArena.name}</p>
                </div>
                <div className="w-20 h-20 bg-[#080b14] border border-[#1e2535] rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
                   <img src={`/arenas/arena_${currentArena.id}.png`} className="w-full h-full object-cover opacity-80" />
                </div>
              </div>

              {nextArena && (
                <div className="mb-10 relative z-10">
                  <div className="flex justify-between text-sm font-medium mb-3">
                    <span className="text-gray-300">Progress to {nextArena.name}</span>
                    <span className="text-lg font-bold text-cyan-400">{trophiesNeeded} more needed</span>
                  </div>
                  <div className="bg-[#080b14] border border-[#1e2535] rounded-full h-6 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="h-6 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-lg"
                      style={{ boxShadow: '0 0 20px rgba(0, 242, 255, 0.5)' }}
                    />
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/game')}
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black py-6 px-10 rounded-2xl text-2xl flex items-center justify-center space-x-4 transition-all duration-300 shadow-2xl shadow-cyan-500/20"
              >
                <Flame className="w-8 h-8" />
                <span>ENTER BATTLE</span>
                <Zap className="w-8 h-8" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column: Battle Stats & Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-8"
          >
            <div className="bg-[#121826]/80 backdrop-blur-xl border border-[#1e2535] rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center text-cyan-400">
                <Crown className="w-6 h-6 mr-3" />
                Battle Stats
              </h3>
              <div className="space-y-4">
                <StatRow label="Victories" value={user.wins} color="text-green-400" />
                <StatRow label="Defeats" value={user.losses} color="text-red-400" />
                <StatRow label="Win Streak" value="0" color="text-orange-400" />
                <StatRow label="Best Rank" value={`#${Math.max(1, 100 - Math.floor(user.trophies / 50))}`} color="text-purple-400" />
              </div>
            </div>

            <div className="bg-[#121826]/80 backdrop-blur-xl border border-[#1e2535] rounded-3xl p-8 shadow-2xl mt-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center text-purple-400">
                <Calendar className="w-6 h-6 mr-3" />
                Match History
              </h3>
              <div className="space-y-4">
                {recentMatches.length > 0 ? (
                  recentMatches.map((match, i) => (
                    <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#080b14] border border-[#1e2535] rounded-xl gap-4">
                      <div>
                         <div className="text-sm font-bold text-gray-300">
                           {match.players?.[0]?.user?.username === user.username ? (match.winner === user.id ? 'Victory' : match.winner ? 'Defeat' : 'Draw') : 'Match'}
                         </div>
                         <div className="text-xs text-gray-500">
                           vs {match.players?.find((p: any) => p.user?.id !== user.id)?.user?.username || 'Opponent'}
                         </div>
                      </div>
                      <button 
                        onClick={() => router.push(`/dashboard/match/${match._id || match.id}`)}
                        className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        Review Match
                      </button>
                    </div>
                  ))
                ) : (
                  <ActivityItem icon={<Globe className="w-4 h-4" />} text="Account created" />
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievement Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#121826]/80 backdrop-blur-xl border border-[#1e2535] rounded-3xl p-10 shadow-2xl"
        >
          <h2 className="text-3xl font-bold mb-8 flex items-center text-yellow-400">
            <Award className="w-8 h-8 mr-4" />
            Achievement Gallery 🏆
          </h2>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {badges.map((badge, index) => (
                <motion.div 
                  key={badge}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center p-4 bg-[#080b14] rounded-2xl border border-[#1e2535] shadow-lg flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#2a3040]">
                    <img src={`/badges/${badge}.png`} alt={badge} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-xs font-black uppercase tracking-widest text-cyan-400">{formatBadgeName(badge)}</div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">No achievements unlocked yet. Win battles to earn badges!</div>
          )}
        </motion.div>
        
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, gradient, glowColor, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className={`bg-gradient-to-br ${gradient} p-6 rounded-3xl shadow-xl border border-white/5 backdrop-blur-md relative overflow-hidden`}
    >
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="text-sm text-gray-300 mb-1 font-medium">{label}</div>
          <div className="text-3xl font-black text-white mb-1">{value}</div>
          <div className="text-xs text-gray-400 font-medium">{subtitle}</div>
        </div>
        <div className="text-white/80 p-3 bg-white/10 rounded-2xl">{icon}</div>
      </div>
    </motion.div>
  );
}

function StatRow({ label, value, color }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#1e2535] last:border-0">
      <span className="text-gray-400 font-medium">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}

function ActivityItem({ icon, text, matchId }: any) {
  const router = useRouter();
  return (
    <div 
      className={`flex items-center text-gray-300 text-sm py-2 ${matchId ? 'cursor-pointer hover:text-cyan-400' : ''}`}
      onClick={() => matchId && router.push(`/match/${matchId}`)}
    >
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#080b14] border border-[#1e2535] mr-4 text-purple-400">
         {icon}
      </div>
      <span>{text}</span>
    </div>
  );
}

function getBadgeEmoji(badge: string): string {
  const emojis: Record<string, string> = {
    FIRST_BLOOD: '🩸',
    SPEEDSTER: '⚡',
    FLAWLESS: '✨',
    WIN_STREAK: '🔥',
    ARENA_CHAMPION: '👑',
    BUG_HUNTER: '🐛',
    COMEBACK_KID: '🔄',
    BET_MASTER: '💰',
  };
  return emojis[badge] || '🏆';
}

function formatBadgeName(badge: string): string {
  return badge.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}
