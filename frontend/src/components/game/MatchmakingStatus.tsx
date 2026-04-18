'use client';

import { motion } from 'framer-motion';
import { Users, Clock, Zap } from 'lucide-react';

interface MatchmakingStatusProps {
  arenaName: string;
  selectedLanguage: string;
  userTrophies: number;
  poolSize?: number;
  averageWaitTime?: number;
}

// Mock live contenders - in real app, would come from socket events
const MOCK_CONTENDERS = [
  {
    id: 1,
    avatar: '👨‍💻',
    name: 'SyntaxNinja',
    trophies: 2450,
    winRate: '72%',
  },
  {
    id: 2,
    avatar: '👩‍💻',
    name: 'BugSmasher',
    trophies: 2380,
    winRate: '68%',
  },
  {
    id: 3,
    avatar: '🧑‍🚀',
    name: 'CodeRocket',
    trophies: 2520,
    winRate: '75%',
  },
  {
    id: 4,
    avatar: '👨‍🔬',
    name: 'DebugMaster',
    trophies: 2290,
    winRate: '71%',
  },
];

export default function MatchmakingStatus({
  arenaName,
  selectedLanguage,
  userTrophies,
  poolSize = 1248,
  averageWaitTime = 12,
}: MatchmakingStatusProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0 },
  };

  const languageLabel =
    selectedLanguage === 'javascript'
      ? 'JavaScript'
      : selectedLanguage === 'python'
        ? 'Python'
        : selectedLanguage === 'java'
          ? 'Java'
          : 'C++';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 w-full max-w-xs"
    >
      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{poolSize}</div>
          <div className="text-xs text-gray-400 flex items-center justify-center mt-1">
            <Users className="w-3 h-3 mr-1" /> Active
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{averageWaitTime}s</div>
          <div className="text-xs text-gray-400 flex items-center justify-center mt-1">
            <Clock className="w-3 h-3 mr-1" /> Avg Wait
          </div>
        </div>
      </div>

      {/* Match Info */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-2">
        <div className="text-xs text-gray-400">Arena</div>
        <div className="font-bold text-cyan-400">{arenaName}</div>
        <div className="text-xs text-gray-400 mt-2">Language</div>
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="font-bold text-gray-300">{languageLabel}</span>
        </div>
      </div>

      {/* Live Contenders */}
      <div>
        <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full mr-2"
          />
          Live Contenders
        </h4>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {MOCK_CONTENDERS.map((contender) => (
            <motion.div
              key={contender.id}
              variants={itemVariants}
              className="bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 rounded-lg p-3 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{contender.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-200 truncate">
                    {contender.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {contender.trophies} 🏆 · {contender.winRate}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Search Progress */}
      <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-lg p-3">
        <div className="text-xs text-gray-400 mb-2">Finding Perfect Match...</div>
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-1 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500"
          style={{ backgroundSize: '200% 100%' }}
        />
      </div>
    </motion.div>
  );
}
