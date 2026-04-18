export const ARENAS = [
  { id: 1, name: 'Sewer Hackers', minTrophies: 0, maxTrophies: 499, color: '#39ff14', icon: '/arenas/arena_6.png', description: 'Low Tier Arena' },
  { id: 2, name: 'The Basement', minTrophies: 500, maxTrophies: 999, color: '#00ffcc', icon: '/arenas/arena_2.png', description: 'Underground Hacker Base' },
  { id: 3, name: 'Street Coders', minTrophies: 1000, maxTrophies: 1499, color: '#ff00ff', icon: '/arenas/arena_8.png', description: 'Neon Rain Corner' },
  { id: 4, name: 'Script District', minTrophies: 1500, maxTrophies: 1999, color: '#00ccff', icon: '/arenas/arena_1.png', description: 'Cyberpunk Fighting Arena' },
  { id: 5, name: 'Logic Fortress', minTrophies: 2000, maxTrophies: 2499, color: '#9933ff', icon: '/arenas/arena_3.png', description: 'Core Server Matrix' },
  { id: 6, name: 'Neon Kyoto', minTrophies: 2500, maxTrophies: 2999, color: '#ff66b2', icon: '/arenas/arena_9.png', description: 'Ancient Cybernetic Temple' },
  { id: 7, name: 'Corporate High-Rise', minTrophies: 3000, maxTrophies: 3499, color: '#ff3333', icon: '/arenas/arena_4.png', description: 'Advanced Holographic Rings' },
  { id: 8, name: 'Quantum Core', minTrophies: 3500, maxTrophies: 3999, color: '#ffffff', icon: '/arenas/arena_5.png', description: 'Ethereal Data Streams' },
  { id: 9, name: 'Orbital Station', minTrophies: 4000, maxTrophies: 4499, color: '#ff9933', icon: '/arenas/arena_7.png', description: 'Void Space Station' },
  { id: 10, name: 'Obsidian Tower', minTrophies: 4500, maxTrophies: 99999, color: '#ff0000', icon: '/arenas/arena_10.png', description: 'Grandmaster Digital Wasteland' },
] as const;

export type Arena = typeof ARENAS[number];

export function getArenaByTrophies(trophies: number): Arena {
  return (
    ARENAS.find(
      (arena) => trophies >= arena.minTrophies && trophies <= arena.maxTrophies
    ) || ARENAS[0]
  );
}