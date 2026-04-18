'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';

interface WeaponSelectionModalProps {
  isOpen: boolean;
  selectedLanguage: string;
  onLanguageSelect: (language: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const WEAPONS = [
  { id: 'javascript', label: 'JavaScript', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  { id: 'python', label: 'Python', icon: '🐍', color: 'from-blue-500 to-cyan-500' },
  { id: 'java', label: 'Java', icon: '☕', color: 'from-orange-500 to-red-500' },
  { id: 'cpp', label: 'C++', icon: '⚙️', color: 'from-purple-500 to-pink-500' },
];

export default function WeaponSelectionModal({
  isOpen,
  selectedLanguage,
  onLanguageSelect,
  onConfirm,
  onCancel,
}: WeaponSelectionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-gradient-to-br from-gray-800 via-gray-900 to-black border-2 border-purple-500/50 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Choose Your Weapon
                </h2>
              </div>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Subtitle */}
            <p className="text-gray-400 mb-8">Select your programming language for this battle</p>

            {/* Weapon Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {WEAPONS.map((weapon) => (
                <motion.button
                  key={weapon.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onLanguageSelect(weapon.id)}
                  className={`relative p-6 rounded-xl transition-all duration-300 ${
                    selectedLanguage === weapon.id
                      ? `bg-gradient-to-br ${weapon.color} text-white shadow-lg border-2 border-white/30`
                      : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 border-2 border-gray-600/50'
                  }`}
                >
                  {/* Selection indicator */}
                  {selectedLanguage === weapon.id && (
                    <motion.div
                      layoutId="selectedIndicator"
                      className="absolute inset-0 border-2 border-white/50 rounded-xl"
                      initial={false}
                      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    />
                  )}

                  <div className="text-4xl mb-3">{weapon.icon}</div>
                  <div className="text-sm font-bold">{weapon.label}</div>

                  {/* Selection checkmark */}
                  {selectedLanguage === weapon.id && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                    >
                      <span className="text-lg">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:shadow-lg transition-all shadow-lg"
              >
                Enter Battle ⚔️
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
