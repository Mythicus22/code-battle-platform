'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Swords, Crown, Zap, Users, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useMetaMask } from '@/hooks/useMetaMask';
import { useBetting } from '@/hooks/useBetting';
import { ARENAS, getArenaByTrophies } from '@/constants/arenas';
import Leaderboard from '@/components/game/Leaderboard';
import BettingPanel from '@/components/game/BettingPanel';
import toast from 'react-hot-toast';

type GameState = 'lobby' | 'matchmaking' | 'in_game';

export default function GamePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { emit, on, off, connected } = useSocket();
  const { connected: metaMaskConnected, connect } = useMetaMask();
  const { bettingState, settleBet, resetBetting } = useBetting();

  const [gameState, setGameState] = useState<GameState>('lobby');
  const [betAmount, setBetAmount] = useState(0);
  const [cryptoBetting, setCryptoBetting] = useState(false);
  const [cryptoBetAmount, setCryptoBetAmount] = useState('0.01');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [problem, setProblem] = useState<any>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const matchIdRef = useRef<string | null>(null);
  const cryptoBettingRef = useRef(false);
  const opponentRef = useRef<any>(null);

  // Keep refs in sync
  useEffect(() => { matchIdRef.current = matchId; }, [matchId]);
  useEffect(() => { cryptoBettingRef.current = cryptoBetting; }, [cryptoBetting]);
  useEffect(() => { opponentRef.current = opponent; }, [opponent]);

  // Fullscreen lock when in_game
  useEffect(() => {
    if (gameState !== 'in_game') return;

    const el = document.documentElement;

    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await el.requestFullscreen();
        }
      } catch {
        // Fullscreen not supported or denied - continue anyway
      }
    };

    enterFullscreen();

    // Block back navigation
    window.history.pushState(null, '', window.location.href);
    const blockBack = () => {
      window.history.pushState(null, '', window.location.href);
      toast.error('⚠️ You cannot leave during a battle!');
    };
    window.addEventListener('popstate', blockBack);

    // Block keyboard shortcuts to exit (Escape handled by fullscreen API itself)
    const blockKeys = (e: KeyboardEvent) => {
      // Block Alt+F4, Alt+Tab hints, F11
      if (e.key === 'F11') e.preventDefault();
    };
    window.addEventListener('keydown', blockKeys);

    // Detect fullscreen exit and re-enter
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && gameState === 'in_game') {
        toast.error('⚠️ Stay in fullscreen during the battle!');
        setTimeout(() => enterFullscreen(), 500);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      window.removeEventListener('popstate', blockBack);
      window.removeEventListener('keydown', blockKeys);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [gameState]);

  // Socket event handlers (stable refs via useCallback)
  const handleMatchFound = useCallback((data: any) => {
    setOpponent(data.opponent);
    setProblem(data.problem);
    setMatchId(data.matchId);
    setTimeLeft(data.problem.timeLimitSeconds || 1200);
    setGameState('in_game');
    toast.success('Opponent found! Get ready...');
  }, []);

  const handleGameStart = useCallback((_data: any) => {
    toast.success('⚔️ Battle started! Code fast!');
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          toast.error('⏰ Time\'s up!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSubmissionResult = useCallback((data: any) => {
    setSubmitting(false);
    setTestResults(data.testResults);
    if (data.allPassed) {
      toast.success('✅ All tests passed!');
    } else {
      const failed = data.testResults.filter((r: any) => !r.passed).length;
      toast.error(`❌ ${failed} test(s) failed`);
    }
  }, []);

  const handleOpponentSubmitted = useCallback((data: any) => {
    if (data.allPassed) toast('⚠️ Opponent passed all tests!', { icon: '🏃' });
  }, []);

  const handleGameEnd = useCallback((data: any) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setTimeLeft(0);

    const won = data.winner?.toString() === (user as any)?.id?.toString();

    if (cryptoBettingRef.current && matchIdRef.current && bettingState.matchId === matchIdRef.current) {
      const winnerAddress = won ? (user as any)?.walletAddress : opponentRef.current?.walletAddress;
      const loserAddress = won ? opponentRef.current?.walletAddress : (user as any)?.walletAddress;
      if (winnerAddress && loserAddress) {
        settleBet(matchIdRef.current, winnerAddress, loserAddress).catch(() => {
          toast.error('Failed to settle crypto bet automatically');
        });
      }
    }

    if (won) toast.success('🏆 Victory! +100 trophies');
    else toast.error('💀 Defeat! -100 trophies');

    setTimeout(() => {
      setGameState('lobby');
      setMatchId(null);
      setProblem(null);
      setOpponent(null);
      setCode('');
      setTestResults([]);
      setSubmitting(false);
      setCryptoBetting(false);
      resetBetting();
    }, 3000);
  }, [user, bettingState.matchId, settleBet, resetBetting]);

  const handleTabSwitchWarning = useCallback((_data: any) => {
    toast.error('⚠️ WARNING: Switching tabs again will disqualify you!', { duration: 5000 });
  }, []);

  const handleHint = useCallback((data: any) => {
    toast.success(`💡 Hint: ${data.hint}`, { duration: 8000 });
  }, []);

  const handleError = useCallback((data: any) => {
    setSubmitting(false);
    toast.error(data.message || 'An error occurred');
  }, []);

  // Register/unregister socket listeners
  useEffect(() => {
    if (!user) return;
    on('match_found', handleMatchFound);
    on('game_start', handleGameStart);
    on('submission_result', handleSubmissionResult);
    on('opponent_submitted', handleOpponentSubmitted);
    on('game_end', handleGameEnd);
    on('tab_switch_warning', handleTabSwitchWarning);
    on('hint', handleHint);
    on('error', handleError);
    return () => {
      off('match_found', handleMatchFound);
      off('game_start', handleGameStart);
      off('submission_result', handleSubmissionResult);
      off('opponent_submitted', handleOpponentSubmitted);
      off('game_end', handleGameEnd);
      off('tab_switch_warning', handleTabSwitchWarning);
      off('hint', handleHint);
      off('error', handleError);
    };
  }, [user, on, off, handleMatchFound, handleGameStart, handleSubmissionResult, handleOpponentSubmitted, handleGameEnd, handleTabSwitchWarning, handleHint, handleError]);

  // Visibility change (tab switch) detection during game
  useEffect(() => {
    if (gameState !== 'in_game') return;
    const onVisibility = () => {
      if (document.hidden && matchIdRef.current) {
        emit('tab_switch', { matchId: matchIdRef.current });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [gameState, emit]);

  // Auth redirect
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // Timer cleanup on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  async function startMatchmaking() {
    if (!connected) { toast.error('Not connected to server'); return; }
    if (cryptoBetting && !metaMaskConnected) {
      try { await connect(); } catch { toast.error('MetaMask required for crypto betting'); return; }
    }
    setGameState('matchmaking');
    emit('join_matchmaking', { betAmount: cryptoBetting ? 0 : betAmount, language: selectedLanguage, cryptoBetting });
  }

  function cancelMatchmaking() {
    emit('leave_matchmaking');
    setGameState('lobby');
    toast('Matchmaking cancelled');
  }

  function submitCode() {
    if (!code.trim()) { toast.error('Please write some code first'); return; }
    if (submitting) return;
    setSubmitting(true);
    emit('submit_code', { matchId, code, language: selectedLanguage });
    toast('⏳ Submitting...');
  }

  function requestHint() {
    emit('request_hint', { matchId });
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentArena = getArenaByTrophies(user.trophies);

  // ── LOBBY ──────────────────────────────────────────────────────────────────
  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-red-400 via-yellow-400 to-purple-400 bg-clip-text text-transparent">
              ⚔️ BATTLE ARENA ⚔️
            </h1>
            <p className="text-xl text-gray-400">Prove your coding skills in epic 1v1 battles</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-8">
              {/* Arena Card */}
              <div className="card bg-gradient-to-br from-gray-800 via-gray-900 to-black border-2 shadow-2xl"
                style={{ borderColor: currentArena.color, boxShadow: `0 0 30px ${currentArena.color}40` }}>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-6xl">{currentArena.icon}</span>
                    <div>
                      <h2 className="text-3xl font-bold" style={{ color: currentArena.color }}>{currentArena.name} Arena</h2>
                      <p className="text-gray-400">{currentArena.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-yellow-400">{user.trophies} 🏆</div>
                    <div className="text-sm text-gray-400">{Math.max(0, currentArena.maxTrophies - user.trophies)} to next arena</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((user.trophies - currentArena.minTrophies) / (currentArena.maxTrophies - currentArena.minTrophies)) * 100)}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-3 rounded-full bg-gradient-to-r from-primary-500 via-yellow-500 to-purple-500"
                    />
                  </div>
                </div>

                {/* Language Selection */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3 flex items-center"><Zap className="w-5 h-5 mr-2" /> Language</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {['javascript', 'python', 'java', 'cpp'].map((lang) => (
                      <button key={lang} onClick={() => setSelectedLanguage(lang)}
                        className={`p-3 rounded-xl font-bold transition-all ${selectedLanguage === lang
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                        {lang === 'javascript' ? 'JS' : lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Betting */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3 flex items-center"><Target className="w-5 h-5 mr-2" /> Betting</h3>
                  <div className="flex mb-4 bg-gray-800 rounded-xl p-1">
                    <button onClick={() => setCryptoBetting(false)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${!cryptoBetting ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                      💵 Traditional
                    </button>
                    <button onClick={() => setCryptoBetting(true)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${cryptoBetting ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                      🦊 Crypto (ETH)
                    </button>
                  </div>

                  {!cryptoBetting ? (
                    <div className="grid grid-cols-5 gap-2">
                      {[0, 1, 5, 10, 20].map((amount) => (
                        <button key={amount} onClick={() => setBetAmount(amount)}
                          className={`p-3 rounded-xl font-bold transition-all ${betAmount === amount
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                          {amount === 0 ? 'Free' : `$${amount}`}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {['0.01', '0.05', '0.1', '0.2'].map((amount) => (
                        <button key={amount} onClick={() => setCryptoBetAmount(amount)}
                          className={`p-3 rounded-xl font-bold transition-all ${cryptoBetAmount === amount
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                          {amount} ETH
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Start Battle */}
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={startMatchmaking} disabled={!connected}
                  className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-600 text-white font-bold py-6 rounded-2xl text-2xl flex items-center justify-center space-x-4 shadow-2xl border-2 border-red-400 disabled:opacity-50">
                  <Swords className="w-8 h-8" />
                  <span>{connected ? 'START BATTLE' : 'CONNECTING...'}</span>
                  <Swords className="w-8 h-8" />
                </motion.button>
              </div>

              {/* Arena Progression */}
              <div className="card bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <Crown className="w-6 h-6 mr-3 text-yellow-400" /> Arena Progression
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {ARENAS.map((arena) => {
                    const isUnlocked = user.trophies >= arena.minTrophies;
                    const isCurrent = currentArena.id === arena.id;
                    return (
                      <div key={arena.id}
                        className={`p-4 rounded-xl text-center transition-all ${isCurrent
                          ? 'bg-yellow-500/20 border-2 border-yellow-400'
                          : isUnlocked ? 'bg-gray-700/50 border border-gray-600'
                          : 'bg-gray-800/30 opacity-50 border border-gray-700'}`}>
                        <div className="text-4xl mb-2">{arena.icon}</div>
                        <div className="font-bold text-sm" style={{ color: isUnlocked ? arena.color : '#666' }}>{arena.name}</div>
                        <div className="text-xs text-gray-400">{arena.minTrophies}+ 🏆</div>
                        {isCurrent && <div className="text-xs text-yellow-400 font-bold mt-1">CURRENT</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Leaderboard />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ── MATCHMAKING ────────────────────────────────────────────────────────────
  if (gameState === 'matchmaking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="card text-center max-w-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-primary-500/50 shadow-2xl">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            Finding Opponent...
          </h2>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300">{currentArena.name} Arena · {selectedLanguage}</span>
          </div>
          <p className="text-gray-400 mb-6">Matching around {user.trophies} trophies</p>
          <button onClick={cancelMatchmaking} className="btn btn-secondary w-full">Cancel</button>
        </motion.div>
      </div>
    );
  }

  // ── IN GAME ────────────────────────────────────────────────────────────────
  if (gameState === 'in_game' && problem) {
    const mins = Math.floor(timeLeft / 60);
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    const timerColor = timeLeft <= 60 ? 'text-red-400' : timeLeft <= 300 ? 'text-yellow-400' : 'text-green-400';

    return (
      <div ref={gameContainerRef} className="h-screen w-screen bg-gray-900 flex flex-col overflow-hidden select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
          {/* Player */}
          <div className="flex items-center space-x-3">
            <div className="text-center px-4 py-2 bg-blue-500/20 rounded-xl border border-blue-400">
              <div className="text-xs text-gray-400">You</div>
              <div className="font-bold text-blue-400">{user.username}</div>
              <div className="text-xs text-gray-400">{user.trophies} 🏆</div>
            </div>
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}
              className="text-4xl">⚔️</motion.div>
            <div className="text-center px-4 py-2 bg-red-500/20 rounded-xl border border-red-400">
              <div className="text-xs text-gray-400">Opponent</div>
              <div className="font-bold text-red-400">{opponent?.username}</div>
              <div className="text-xs text-gray-400">{opponent?.trophies} 🏆</div>
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            <div className={`text-4xl font-bold font-mono ${timerColor}`}>{mins}:{secs}</div>
            <div className="text-xs text-gray-400">Time Left</div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <span className="px-3 py-1 bg-gray-700 rounded-lg text-sm text-gray-300 font-mono">
              {selectedLanguage === 'javascript' ? 'JS' : selectedLanguage === 'cpp' ? 'C++' : selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
            </span>
            <button onClick={requestHint}
              className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-lg text-yellow-400 font-medium transition-all">
              💡 Hint
            </button>
            <button onClick={submitCode} disabled={submitting}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-lg text-white font-bold transition-all">
              {submitting ? '⏳ Running...' : '🚀 Submit'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Problem Panel */}
          <div className="w-1/2 flex flex-col border-r border-gray-700 overflow-y-auto p-6 bg-gray-900">
            <div className="flex items-center space-x-3 mb-4">
              <h2 className="text-2xl font-bold text-primary-400">{problem.title}</h2>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'}`}>
                {problem.difficulty}
              </span>
            </div>

            {problem.constraints && (
              <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-xs text-gray-400 mb-1 font-bold uppercase">Constraints</div>
                <div className="text-sm text-gray-300 font-mono">{problem.constraints}</div>
              </div>
            )}

            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap flex-1">
              {problem.description}
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold mb-3 text-lg">Test Results</h3>
                <div className="space-y-2">
                  {testResults.map((r: any, i: number) => (
                    <div key={i} className={`p-3 rounded-lg flex items-center justify-between ${r.passed ? 'bg-green-900/30 border border-green-500/50' : 'bg-red-900/30 border border-red-500/50'}`}>
                      <span className="text-sm">Test Case {i + 1}</span>
                      <div className="flex items-center space-x-3">
                        {r.runtime && <span className="text-xs text-gray-400">{r.runtime.toFixed(3)}s</span>}
                        {r.error && <span className="text-xs text-red-400 truncate max-w-xs">{r.error}</span>}
                        <span className={`font-bold ${r.passed ? 'text-green-400' : 'text-red-400'}`}>
                          {r.passed ? '✅ PASSED' : '❌ FAILED'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="w-1/2 flex flex-col bg-gray-950">
            <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 text-sm text-gray-400 font-mono shrink-0">
              solution.{selectedLanguage === 'javascript' ? 'js' : selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : selectedLanguage}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full bg-gray-950 text-gray-100 p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
              placeholder={`// Write your ${selectedLanguage} solution here...\n// Read from stdin, write to stdout`}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>

        {/* Crypto Betting Panel */}
        {cryptoBetting && matchId && (
          <div className="shrink-0 border-t border-gray-700 p-4 bg-gray-800">
            <BettingPanel matchId={matchId} onBetPlaced={(amount) => toast.success(`Bet placed: ${amount} ETH`)} disabled={false} />
          </div>
        )}
      </div>
    );
  }

  return null;
}
