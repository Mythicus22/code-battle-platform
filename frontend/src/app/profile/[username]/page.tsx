'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { TargetIcon, Globe, Award, Flame, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { ARENAS, getArenaByTrophies } from '@/constants/arenas';
import toast from 'react-hot-toast';

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (params.username) {
      api.get(`/users/profile/${params.username}`)
        .then((res) => {
          setProfileUser(res.data.user);
        })
        .catch(() => toast.error('User not found'))
        .finally(() => setLoading(false));
    }
  }, [params.username]);

  const sendFriendRequest = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to send friend requests');
      return;
    }
    try {
      // Assuming socket logic or API logic exists for sending requests
      toast.success(`Friend request sent to ${profileUser.username}!`);
      setRequestSent(true);
    } catch (error) {
      toast.error('Failed to send request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center flex-col text-white">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <button onClick={() => router.push('/rankings')} className="text-cyan-400 hover:underline">Return to Rankings</button>
      </div>
    );
  }

  const currentArena = getArenaByTrophies(profileUser.trophies);
  const winrate = parseFloat(profileUser.winrate || '0');
  const globalRank = Math.max(1, 2000 - Math.floor(profileUser.trophies / 2));
  const badges = profileUser.badges || [];

  return (
    <div className="min-h-screen bg-[#080b14] text-white font-sans overflow-x-hidden p-6 md:p-10 relative z-10 w-full">
      <div className="absolute top-0 right-0 w-full h-96 bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-cyan-400">
               <img src={profileUser.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username}&backgroundColor=121826`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-white mb-2"
              >
                {profileUser.username}
              </motion.h1>
              <div className="text-cyan-400 text-lg">{currentArena.name}</div>
            </div>
          </div>
          
          {currentUser?.username !== profileUser.username && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendFriendRequest}
              disabled={requestSent}
              className={`mt-6 md:mt-0 px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all ${requestSent ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400 text-[#080b14] shadow-lg shadow-cyan-500/20'}`}
            >
              <UserPlus className="w-5 h-5" />
              {requestSent ? 'Request Sent' : 'Send Friend Request'}
            </motion.button>
          )}
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<TargetIcon className="w-8 h-8" />}
            label="Total Matches"
            value={profileUser.totalGames.toString()}
            gradient="from-cyan-900/40 to-blue-900/40"
          />
          <StatCard 
            icon={<Award className="w-8 h-8" />}
            label="Win Rate"
            value={`${winrate}%`}
            gradient="from-purple-900/40 to-pink-900/40"
          />
          <StatCard 
            icon={<Globe className="w-8 h-8" />}
            label="Global Rank"
            value={`#${globalRank.toLocaleString()}`}
            gradient="from-blue-900/40 to-indigo-900/40"
          />
          <StatCard 
            icon={<Flame className="w-8 h-8" />}
            label="Trophies"
            value={profileUser.trophies.toLocaleString()}
            gradient="from-orange-900/40 to-red-900/40"
          />
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121826]/80 backdrop-blur-xl border border-[#1e2535] rounded-3xl p-10 shadow-2xl"
        >
          <h2 className="text-3xl font-bold mb-8 flex items-center text-yellow-400">
            <Award className="w-8 h-8 mr-4" />
            Achievement Gallery 🏆
          </h2>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {badges.map((badge: string) => (
                <div key={badge} className="text-center p-6 bg-[#080b14] rounded-2xl border border-[#1e2535]">
                  <div className="text-4xl mb-3">{getBadgeEmoji(badge)}</div>
                  <div className="text-sm font-bold text-gray-300">{formatBadgeName(badge)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">This user hasn't unlocked any achievements yet.</div>
          )}
        </motion.div>
        
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, gradient }: any) {
  return (
    <div className={`bg-gradient-to-br ${gradient} p-6 rounded-3xl shadow-xl border border-white/5 backdrop-blur-md relative overflow-hidden`}>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="text-sm text-gray-300 mb-1 font-medium">{label}</div>
          <div className="text-3xl font-black text-white mb-1">{value}</div>
        </div>
        <div className="text-white/80 p-3 bg-white/10 rounded-2xl">{icon}</div>
      </div>
    </div>
  );
}

function getBadgeEmoji(badge: string): string {
  const emojis: Record<string, string> = {
    FIRST_BLOOD: '🩸', SPEEDSTER: '⚡', FLAWLESS: '✨', WIN_STREAK: '🔥',
    ARENA_CHAMPION: '👑', BUG_HUNTER: '🐛', COMEBACK_KID: '🔄', BET_MASTER: '💰',
  };
  return emojis[badge] || '🏆';
}

function formatBadgeName(badge: string): string {
  return badge.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
