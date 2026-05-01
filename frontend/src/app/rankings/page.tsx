'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { game } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RankingsPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    game.getLeaderboard(1)
      .then((res) => {
        setLeaderboard(res.data.leaderboard || []);
        setLoading(false);
      })
      .catch(() => {
        setLeaderboard([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
     return (
        <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
     );
  }

  const topPlayers = leaderboard;
  const podium = [topPlayers[1], topPlayers[0], topPlayers[2]]; 
  const tablePlayers = topPlayers.slice(3, 10);

  return (
    <div className="min-h-screen bg-[#080b14] text-white font-sans overflow-x-hidden p-6 md:p-10 relative z-10">
      <div className="absolute top-0 right-0 w-full h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4"
          >
            Global Rankings
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            The elite contenders of the Code Battle arena. Only the best developers make it to the top.
          </motion.p>
        </header>

        {/* Podium */}
        {podium.some(p => p) && (
          <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-8 mb-16 pt-10">
            {podium.map((p, i) => {
              if (!p) return null;
              const isFirst = i === 1;
              const rank = isFirst ? 1 : i === 0 ? 2 : 3;
              
              const heightClass = isFirst ? 'h-[360px]' : 'h-[300px]';
              const scaleClass = isFirst ? 'scale-105 z-20 md:-translate-y-8' : 'z-10 opacity-90';
              const colors = isFirst 
                ? 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50' 
                : rank === 2 
                  ? 'from-gray-300/20 to-gray-400/20 border-gray-400/50'
                  : 'from-orange-700/20 to-orange-800/20 border-orange-700/50';

              return (
                <motion.div 
                  key={p.username}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rank * 0.1, type: "spring" }}
                  onClick={() => router.push(`/profile/${p.username}`)}
                  className={`relative w-full md:w-72 bg-[#121826]/80 backdrop-blur-xl rounded-t-3xl rounded-b-xl flex flex-col items-center justify-start pt-16 pb-8 border-t-4 shadow-2xl cursor-pointer hover:brightness-110 transition-all ${heightClass} ${scaleClass} ${colors}`}
                >
                  <div className={`absolute -top-10 w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl ${isFirst ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' : 'bg-gradient-to-br from-orange-600 to-orange-800 text-white'}`}>
                    {rank === 1 ? <Trophy className="w-8 h-8" /> : rank}
                  </div>
                  
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#080b14] mb-4">
                    <img src={p.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}&backgroundColor=121826`} alt={p.username} className="w-full h-full object-cover" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{p.username}</h3>
                  <div className="text-sm font-medium text-gray-400 mb-6">{p.arena} Arena</div>
                  
                  <div className="mt-auto w-full px-6 flex justify-between items-center bg-[#080b14]/50 py-3 rounded-xl">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase">Rating</div>
                      <div className="text-lg font-bold text-white">{p.trophies.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase">Win Rate</div>
                      <div className="text-lg font-bold text-cyan-400">{p.winrate}%</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Leaderboard Table */}
        {tablePlayers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#121826]/80 backdrop-blur-xl border border-[#1e2535] rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#080b14]/50">
                  <tr>
                    <th className="px-6 py-5 text-sm font-semibold text-gray-400 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-5 text-sm font-semibold text-gray-400 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-5 text-sm font-semibold text-gray-400 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-5 text-sm font-semibold text-gray-400 uppercase tracking-wider">Win Rate</th>
                    <th className="px-6 py-5 text-sm font-semibold text-gray-400 uppercase tracking-wider text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2535]">
                  {tablePlayers.map((p, index) => (
                    <tr 
                      key={p.username} 
                      onClick={() => router.push(`/profile/${p.username}`)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="text-gray-400 font-bold group-hover:text-white transition-colors">
                          #{index + 4}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden border border-[#1e2535]">
                            <img src={p.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}&backgroundColor=121826`} alt={p.username} className="h-full w-full object-cover" />
                          </div>
                          <div className="ml-4">
                            <div className="font-bold text-white">{p.username}</div>
                            <div className="text-xs text-gray-400">Arena {p.arena}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-white font-bold">
                          <Star className="w-4 h-4 text-yellow-400 mr-2" />
                          {p.trophies.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-cyan-400 font-medium">{p.winrate}%</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {index % 3 === 0 ? (
                          <ArrowDownRight className="w-5 h-5 text-red-400 inline-block" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-green-400 inline-block" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
