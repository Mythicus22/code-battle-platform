'use client';

import { motion } from 'framer-motion';
import { Lock, CheckCircle, Zap } from 'lucide-react';
import { ARENAS } from '@/constants/arenas';

interface ArenaMapViewProps {
  userTrophies: number;
  currentArenaId: number;
  onArenaSelect?: (arenaId: number) => void;
}

export default function ArenaMapView({
  userTrophies,
  currentArenaId,
  onArenaSelect,
}: ArenaMapViewProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-3 text-yellow-400" />
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Arena Map
          </span>
        </h3>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {ARENAS.map((arena) => {
            const isUnlocked = userTrophies >= arena.minTrophies;
            const isCurrent = currentArenaId === arena.id;
            const trophiesNeeded = Math.max(0, arena.minTrophies - userTrophies);

            return (
              <motion.div
                key={arena.id}
                variants={item}
                onClick={() => isUnlocked && onArenaSelect?.(arena.id)}
                className={`relative rounded-xl p-4 border-2 transition-all cursor-pointer overflow-hidden group ${
                  isCurrent
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400 shadow-lg shadow-yellow-400/20'
                    : isUnlocked
                      ? 'bg-gradient-to-br from-gray-700/30 to-gray-800/30 border-gray-600 hover:border-gray-500'
                      : 'bg-gradient-to-br from-gray-800/20 to-gray-900/20 border-gray-700 opacity-60'
                }`}
              >
                {/* Background glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                  style={{
                    background: `radial-gradient(circle, ${arena.color}20 0%, transparent 70%)`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-[#080b14] border-2 flex-shrink-0" style={{ borderColor: arena.color }}>
                        <img src={arena.icon} alt={arena.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg leading-none" style={{ color: arena.color }}>
                          {arena.name}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{arena.description}</p>
                      </div>
                    </div>

                    {/* Status badge */}
                    {isCurrent && (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/30 rounded-lg border border-yellow-400/50"
                      >
                        <CheckCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-bold text-yellow-400">CURRENT</span>
                      </motion.div>
                    )}
                    {!isUnlocked && (
                      <Lock className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {/* Trophy requirement */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {arena.minTrophies}+ 🏆
                    </span>
                    {!isUnlocked && (
                      <span className="text-xs font-bold text-red-400">
                        {trophiesNeeded} 🏆 needed
                      </span>
                    )}
                    {isUnlocked && !isCurrent && (
                      <span className="text-xs text-green-400 font-bold">Unlocked</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Trophy Progress */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-sm">Progression to Next Arena</h4>
          <span className="text-sm font-bold text-cyan-400">{userTrophies} 🏆</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, ((userTrophies - (ARENAS[0]?.minTrophies || 0)) / (ARENAS[ARENAS.length - 1]?.maxTrophies || 1)) * 100)}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-2 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
          />
        </div>
      </div>
    </div>
  );
}
