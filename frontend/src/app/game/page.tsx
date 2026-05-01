'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Trophy, Settings, RefreshCcw, Terminal, Play, Send, CheckCircle2, Clock, XCircle, Lightbulb, BarChart2, Cpu, ChevronRight, Code2, Target,
  Volume2, Swords
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useAptos } from '@/hooks/useAptos';
import { useBetting } from '@/hooks/useBetting';
import { ARENAS, getArenaByTrophies } from '@/constants/arenas';
import RightSidebar from '@/components/game/RightSidebar';
import BettingPanel from '@/components/game/BettingPanel';
import CodeEditor from '@/components/game/CodeEditor';
import WeaponSelectionModal from '@/components/game/WeaponSelectionModal';
import ArenaMapView from '@/components/game/ArenaMapView';
import MatchmakingStatus from '@/components/game/MatchmakingStatus';
import toast from 'react-hot-toast';

type GameState = 'lobby' | 'matchmaking' | 'in_game';

import { useUI } from '@/components/layout/LayoutWrapper';

export default function GamePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { emit, on, off, connected } = useSocket();
  const { connected: aptosConnected, connect } = useAptos();
  const { bettingState, settleBet, resetBetting } = useBetting();
  const { setHideSidebar } = useUI();

  const [gameState, setGameState] = useState<GameState>('lobby');
  const [showWeaponModal, setShowWeaponModal] = useState(false);
  const [challengingFriendId, setChallengingFriendId] = useState<{id: string, username: string} | null>(null);
  const [matchMode, setMatchMode] = useState<'normal' | 'betting'>('normal');
  const [betAmount, setBetAmount] = useState(1);
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
  const [aptPrice, setAptPrice] = useState(8.50); // Default fallback

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd')
      .then(res => res.json())
      .then(data => {
        if (data?.aptos?.usd) setAptPrice(data.aptos.usd);
      })
      .catch(err => console.error('Failed to fetch APT price:', err));
  }, []);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [playerProgress, setPlayerProgress] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const matchIdRef = useRef<string | null>(null);
  const cryptoBettingRef = useRef(false);
  const opponentRef = useRef<any>(null);

  // Keep refs in sync
  useEffect(() => { matchIdRef.current = matchId; }, [matchId]);
  useEffect(() => { cryptoBettingRef.current = cryptoBetting; }, [cryptoBetting]);
  useEffect(() => { opponentRef.current = opponent; }, [opponent]);

  // Handle sidebar visibility
  useEffect(() => {
    if (gameState === 'in_game') setHideSidebar(true);
    else setHideSidebar(false);
  }, [gameState, setHideSidebar]);

  const fullscreenExitsRef = useRef(0);

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

    let fullscreenTimeout: NodeJS.Timeout | null = null;

    // Detect fullscreen exit and re-enter
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && gameState === 'in_game') {
        toast.error('⚠️ WARNING: You exited fullscreen! Return within 10 seconds or you will be disqualified!', { duration: 10000 });
        fullscreenTimeout = setTimeout(() => {
            if (!document.fullscreenElement && gameState === 'in_game') {
               toast.error('❌ Disqualified! You failed to return to fullscreen.');
               if (matchIdRef.current) {
                 emit('forfeit_match', { matchId: matchIdRef.current });
               }
               setGameState('lobby');
            }
        }, 10000);
      } else if (document.fullscreenElement && gameState === 'in_game') {
        if (fullscreenTimeout) {
           clearTimeout(fullscreenTimeout);
           toast.success('Returned to fullscreen. Resume battle!');
        }
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
  }, [gameState, emit]);

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
    
    // Calculate passing percentage
    const passedTests = data.testResults.filter((r: any) => r.passed).length;
    const totalTests = data.testResults.length;
    setPlayerProgress(totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0);

    if (data.allPassed) {
      toast.success('✅ All tests passed!');
    } else {
      const failed = data.testResults.filter((r: any) => !r.passed).length;
      toast.error(`❌ ${failed} test(s) failed`);
    }
  }, []);

  const handleOpponentSubmitted = useCallback((data: any) => {
      if (data.allPassed) {
          setOpponentProgress(100);
          toast('⚠️ Opponent passed all tests!', { icon: '🏃' });
      } else {
           // Fallback progress if not all passed but they submitted
           setOpponentProgress(prev => Math.min(prev + 10, 90));
      }
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
      setOpponentProgress(0);
      setPlayerProgress(0);
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

  const handleFriendRequestAccepted = useCallback((data: any) => {
    toast.success(data.message || 'Friend request accepted!');
  }, []);

  // Register/unregister socket listeners
  // Note: challenge_sent, friend_challenged, friend_request_received are handled by GlobalDialogs
  useEffect(() => {
    if (!user) return;
    on('match_found', handleMatchFound);
    on('game_start', handleGameStart);
    on('submission_result', handleSubmissionResult);
    on('opponent_submitted', handleOpponentSubmitted);
    on('game_end', handleGameEnd);
    on('tab_switch_warning', handleTabSwitchWarning);
    on('hint', handleHint);
    on('friend_request_accepted', handleFriendRequestAccepted);
    on('error', handleError);
    return () => {
      off('match_found', handleMatchFound);
      off('game_start', handleGameStart);
      off('submission_result', handleSubmissionResult);
      off('opponent_submitted', handleOpponentSubmitted);
      off('game_end', handleGameEnd);
      off('tab_switch_warning', handleTabSwitchWarning);
      off('hint', handleHint);
      off('friend_request_accepted', handleFriendRequestAccepted);
      off('error', handleError);
    };
  }, [user, on, off, handleMatchFound, handleGameStart, handleSubmissionResult, handleOpponentSubmitted, handleGameEnd, handleTabSwitchWarning, handleHint, handleError, handleFriendRequestAccepted]);

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
    setShowWeaponModal(true);
  }

  async function proceedToMatchmaking() {
    if (!connected) { toast.error('Not connected to server'); return; }
    if (matchMode === 'betting') {
      if (!('aptos' in window)) {
        toast.error('Petra Wallet required for betting mode. Please install it.');
        return;
      }
      try {
        await (window as any).aptos.connect();
      } catch {
        toast.error('Failed to connect Petra Wallet.');
        return;
      }
    }
    
    if (challengingFriendId) {
      emit('challenge_friend', { 
        friendId: challengingFriendId.id, 
        betAmount: matchMode === 'betting' ? betAmount : 0, 
        language: selectedLanguage, 
        cryptoBetting: matchMode === 'betting',
      });
      setChallengingFriendId(null);
    } else {
      setGameState('matchmaking');
      emit('join_matchmaking', { 
        betAmount: matchMode === 'betting' ? betAmount : 0, 
        language: selectedLanguage, 
        cryptoBetting: matchMode === 'betting' 
      });
    }
  }

  function cancelWeaponModal() {
    setShowWeaponModal(false);
    setChallengingFriendId(null);
  }

  function cancelMatchmaking() {
    emit('leave_matchmaking');
    setGameState('lobby');
    toast.error('Matchmaking cancelled');
  }

  function forfeitMatch() {
    if (confirm('Are you heavily damaged? Forfeiting will result in a loss of trophies. Proceed?')) {
       emit('forfeit_match', { matchId });
       setGameState('lobby');
       if (document.fullscreenElement) {
         document.exitFullscreen().catch(() => {});
       }
       toast.error('You have forfeited the match.');
    }
  }

  function submitCode() {
    if (!code.trim()) { toast.error('Please write some code first'); return; }
    if (submitting) return;
    setSubmitting(true);
    emit('submit_code', { matchId, code, language: selectedLanguage });
    toast('⏳ Submitting...');
  }
  
  function runTests() {
    if (!code.trim()) { toast.error('Please write some code first'); return; }
    if (submitting) return;
    setSubmitting(true);
    // Mimics taking an action, uses submit logic for now
    emit('submit_code', { matchId, code, language: selectedLanguage });
    toast('⏳ Running Tests...');
  }

  function requestHint() {
    emit('request_hint', { matchId });
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
      </div>
    );
  }

  const currentArena = getArenaByTrophies(user.trophies);

  // ── LOBBY ──────────────────────────────────────────────────────────────────
  if (gameState === 'lobby') {
      const aptosConversionRate = 1 / aptPrice;

      return (
        <div className="min-h-screen bg-[#080b14] text-white font-sans flex flex-col p-8 overflow-x-hidden relative">
          
          <header className="flex justify-between items-start mb-8 z-10 pl-[300px]">
            <div>
              <h1 className="text-3xl font-black tracking-widest uppercase mb-1">ARENA_LOBBY</h1>
              <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-pulse" />
                ESTABLISHING SECURE CONNECTION...
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-1">CURRENT ARENA</div>
              <div className="text-sm font-black tracking-widest uppercase text-cyan-400">
                SECTOR {currentArena.id} // {currentArena.name}
              </div>
            </div>
          </header>

          <div className="flex flex-1 relative gap-8 max-w-[1400px] mx-auto w-full">
            {/* Arena Trajectory Left Sidebar */}
            <div className="w-[280px] shrink-0 border-r border-[#1e2535] pr-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar h-[calc(100vh-140px)]">
               <h3 className="text-xs font-black tracking-widest uppercase text-gray-500 mb-2">Arena Trajectory</h3>
               {ARENAS.map((arena, i) => {
                 const isUnlocked = user.trophies >= arena.minTrophies;
                 const isCurrent = currentArena.id === arena.id;
                 return (
                   <div key={arena.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isCurrent ? 'bg-cyan-900/20 border-cyan-500 shadow-[0_0_15px_rgba(0,242,255,0.2)]' : isUnlocked ? 'bg-[#121826] border-[#1e2535]' : 'bg-[#080b14] border-[#1e2535] opacity-50 grayscale'}`}>
                     <div className="w-12 h-12 rounded overflow-hidden shrink-0 border border-[#2a3040]">
                        <img src={arena.icon} className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <div className={`text-xs font-black uppercase ${isCurrent ? 'text-cyan-400' : isUnlocked ? 'text-white' : 'text-gray-600'}`}>{arena.name}</div>
                       <div className="text-[9px] text-gray-500 font-mono mt-1">{arena.minTrophies} TR</div>
                     </div>
                   </div>
                 );
               })}
            </div>

            {/* Main Center */}
            <div className="flex-1 flex flex-col max-w-[800px]">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                 className="w-full bg-[#121826] border border-[#1e2535] rounded-xl p-2 shadow-2xl relative overflow-hidden mb-6"
              >
                {/* Map background */}
                <div 
                  className="w-full h-[300px] bg-[#0a0e18] rounded-lg border border-[#1e2535] relative overflow-hidden flex flex-col items-center justify-center bg-cover bg-center"
                  style={{ backgroundImage: `url('/arenas/arena_${currentArena.id}.png')` }}
                >
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-transparent to-transparent pointer-events-none" />
                  
                  <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10 mb-2">
                    {currentArena.name}
                  </h2>
                  <div className="bg-[#080b14]/80 backdrop-blur-md border border-[#1e2535] px-6 py-2 rounded text-[10px] font-black tracking-widest uppercase z-10 shadow-lg">
                    REWARD: <span className="text-[#00f2ff]">+25 TR</span> // <span className="text-[#ff3366]">-25 TR</span>
                  </div>
                </div>
              </motion.div>

              {/* Mode Selection */}
              <div className="bg-[#121826] border border-[#1e2535] rounded-xl p-6 mb-6">
                 <h3 className="text-xs font-black tracking-widest uppercase text-white mb-4">Combat Protocol</h3>
                 <div className="flex gap-4 mb-6">
                    <button 
                      onClick={() => setMatchMode('normal')}
                      className={`flex-1 py-4 rounded-xl border transition-all text-sm font-black uppercase tracking-widest ${matchMode === 'normal' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-[#080b14] border-[#2a3040] text-gray-500 hover:border-gray-500'}`}
                    >
                      Normal (Trophies Only)
                    </button>
                    <button 
                      onClick={() => setMatchMode('betting')}
                      className={`flex-1 py-4 rounded-xl border transition-all text-sm font-black uppercase tracking-widest ${matchMode === 'betting' ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(188,0,255,0.2)]' : 'bg-[#080b14] border-[#2a3040] text-gray-500 hover:border-gray-500'}`}
                    >
                      Betting (High Stakes)
                    </button>
                 </div>

                 {matchMode === 'betting' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-xs text-gray-400 uppercase tracking-widest">Select Wager Amount</span>
                         <span className="text-lg font-black text-purple-400">${betAmount} <span className="text-xs text-gray-500">({(betAmount * aptosConversionRate).toFixed(4)} APT)</span></span>
                      </div>
                      <input 
                        type="range" min="1" max="10" step="1" 
                        value={betAmount} 
                        onChange={(e) => setBetAmount(parseInt(e.target.value))}
                        className="w-full accent-purple-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-600 mt-2 font-mono">
                        <span>$1 (Min)</span><span>$10 (Max)</span>
                      </div>
                    </motion.div>
                 )}

                 <motion.button
                   whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                   onClick={proceedToMatchmaking} disabled={!connected}
                   className="w-full bg-[#729cff] hover:bg-[#86abff] text-[#080b14] py-4 rounded-xl text-sm font-black tracking-widest uppercase shadow-[0_0_20px_rgba(114,156,255,0.3)] hover:shadow-[0_0_30px_rgba(114,156,255,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   <Play size={18} className="fill-current" /> {connected ? 'COMMENCE INFILTRATION' : 'CONNECTING...'}
                 </motion.button>
              </div>

              {/* Arsenal Selection */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4 border-b border-[#1e2535] pb-2">
                  <h3 className="text-xs font-black tracking-widest uppercase text-gray-400">ARSENAL SELECTION</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: 'javascript', name: 'JavaScript', sub: 'ES2022' },
                    { id: 'python', name: 'Python', sub: '3.10' },
                    { id: 'rust', name: 'Rust', sub: '1.68' },
                    { id: 'cpp', name: 'C++', sub: '11.2' },
                  ].map(lang => (
                    <button 
                      key={lang.id} onClick={() => setSelectedLanguage(lang.id)}
                      className={`flex flex-col items-start p-3 border rounded-xl transition-all ${
                        selectedLanguage === lang.id ? 'bg-blue-900/20 border-[#729cff] shadow-[0_0_15px_rgba(114,156,255,0.2)]' : 'bg-[#121826] border-[#1e2535] hover:border-gray-600'
                      }`}
                    >
                      <span className={`text-xs font-black tracking-widest uppercase ${selectedLanguage === lang.id ? 'text-[#729cff]' : 'text-gray-400'}`}>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  }

  // ── MATCHMAKING ────────────────────────────────────────────────────────────
  if (gameState === 'matchmaking') {
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-4">
           {/* Decorative background grid/lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,242,255,0.05),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10"
        >
          {/* Top Info Header */}
          <div className="flex justify-between items-center border-b border-gray-800 pb-6 mb-8">
             <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Protocol Status</div>
             <div className="text-[10px] font-black uppercase tracking-widest text-primary-400 bg-primary-500/10 px-3 py-1 rounded border border-primary-500/20 shadow-[0_0_10px_rgba(0,242,255,0.2)]">Syncing Global Datacenter</div>
             <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">WSS/TLS 1.3</div>
          </div>

          {/* Central Matchmaking Display */}
          <div className="flex flex-col items-center justify-center py-12 relative">

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <span className="text-[300px] font-black italic tracking-tighter text-white select-none">VS</span>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-12 sm:gap-24 relative z-10 w-full">
               
               {/* Player Side */}
               <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center space-y-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 p-1 shadow-[0_0_30px_rgba(0,242,255,0.4)]">
                      <div className="w-full h-full bg-[#080b14] rounded-[14px] flex items-center justify-center text-3xl font-bold uppercase overflow-hidden relative">
                         <img src="/api/placeholder/100/100" className="absolute inset-0 opacity-50" />
                         <span className="relative z-10 drop-shadow-md">{user.username.charAt(0)}</span>
                      </div>
                  </div>
                  <div className="text-center">
                     <div className="text-xl font-black italic uppercase tracking-tighter">{user.username}</div>
                     <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Rank {Math.floor(user.trophies/100)}</div>
                  </div>
               </motion.div>

               {/* Center Spinner */}
               <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="relative w-32 h-32"
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse-glow">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,242,255,0.2)" strokeWidth="2" strokeDasharray="10 5" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(188,0,255,0.4)" strokeWidth="4" strokeDasharray="20 10 5 10" className="origin-center animate-[spin_3s_linear_reverse_infinite]" />
                      <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(0,255,136,0.6)" strokeWidth="1" strokeDasharray="5 5" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Swords className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    </div>
                  </motion.div>
               </div>

               {/* Opponent Side (Searching) */}
               <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center space-y-4">
                   <div className="w-24 h-24 rounded-2xl bg-gray-800 p-1 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-secondary-600/50 to-transparent animate-pulse" />
                      <div className="w-full h-full bg-[#111827] rounded-[14px] flex items-center justify-center text-3xl font-bold text-gray-600">
                         ?
                      </div>
                  </div>
                  <div className="text-center">
                     <div className="text-xl font-black italic uppercase tracking-tighter text-gray-500 animate-pulse">Scanning...</div>
                     <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mt-1">Est. Wait: 0:15</div>
                  </div>
               </motion.div>
            </div>
            
            <div className="text-center mt-12 bg-black/40 px-6 py-3 rounded-xl border border-gray-800">
              <span className="text-primary-400 font-mono text-sm mr-2">&gt;</span>
              <span className="text-sm font-bold tracking-widest uppercase text-gray-300">Targeting Sector: <span className="text-white">{currentArena.name}</span> | Weapon: <span className="text-secondary-400">{selectedLanguage}</span></span>
            </div>
            
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelMatchmaking}
                className="mt-8 px-8 py-3 bg-transparent border border-danger-500/50 text-danger-500 font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-danger-500/10 hover:border-danger-500 transition-all shadow-[0_0_15px_rgba(255,51,102,0)] hover:shadow-[0_0_15px_rgba(255,51,102,0.3)]"
              >
                Abort Protocol
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── IN GAME ────────────────────────────────────────────────────────────────
  if (gameState === 'in_game' && problem) {
    const mins = Math.floor(timeLeft / 60);
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    // Ensure accurate sizing of elements by using flex layouts based directly on wireframe proportions.

    return (
      <div ref={gameContainerRef} className="flex flex-col h-screen bg-[#080b14] text-white font-sans overflow-hidden">
        
        {/* --- HEADER --- */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/40 backdrop-blur-md relative z-10 shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center shadow-[0_0_10px_rgba(0,242,255,0.3)]">
                <Code2 size={20} className="text-white" />
            </div>
            <span className="font-black italic tracking-tighter text-xl text-primary-400 uppercase hidden sm:block">Code Battle</span>
            </div>

            {/* Middle Container (Player vs CPU/Timer vs Opponent) */}
            <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2 w-[700px] max-w-full">
                
                {/* Player 1 Stats */}
                <div className="flex items-center justify-end gap-3 bg-white/5 rounded-xl px-3 py-1.5 border border-white/5 flex-1 w-full relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary-500/5 group-hover:to-primary-500/10 pointer-events-none transition-colors" />
                    <div className="text-right flex-1 z-10">
                        <div className="flex items-center gap-2 justify-end">
                            <span className="text-sm font-black italic tracking-tighter uppercase">{user.username}</span>
                            <span className="text-[10px] bg-primary-500/20 text-primary-400 px-1.5 rounded uppercase tracking-widest font-bold border border-primary-500/30">CODING</span>
                        </div>
                        <div className="w-full max-w-[140px] h-1.5 bg-gray-900 rounded-full mt-1.5 overflow-hidden ml-auto border border-gray-800 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${playerProgress}%` }}
                                className="h-full bg-gradient-to-l from-primary-400 to-primary-600 shadow-[0_0_10px_rgba(0,242,255,0.8)] relative" 
                            />
                        </div>
                        <div className="flex justify-between text-[8px] mt-1 text-gray-500 uppercase font-black tracking-widest">
                            <span>{playerProgress}%</span>
                            <span>Progress</span>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-bl from-primary-500 to-blue-800 p-[2px] shadow-[0_0_10px_rgba(0,242,255,0.3)]">
                            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden text-xs font-bold text-white uppercase">
                                {user.username.charAt(0)}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-success-500 rounded-full border-2 border-[#080b14]" />
                    </div>
                </div>

                {/* Timer */}
                <div className="flex flex-col items-center mx-6 min-w-[100px] z-20">
                    <motion.span 
                        animate={{ scale: timeLeft <= 60 ? [1, 1.05, 1] : 1, color: timeLeft <= 60 ? '#ff3366' : '#ffffff' }}
                        transition={{ duration: 1, repeat: timeLeft <= 60 ? Infinity : 0 }}
                        className="text-3xl font-mono font-bold tracking-[0.1em] leading-none drop-shadow-md"
                    >
                        {mins}:{secs}
                    </motion.span>
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1 text-center">Time Left</span>
                </div>

                {/* Player 2 Stats */}
                <div className="flex items-center justify-start gap-3 bg-white/5 rounded-xl px-3 py-1.5 border border-white/5 flex-1 w-full relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-secondary-500/5 group-hover:to-secondary-500/10 pointer-events-none transition-colors" />
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-500 to-purple-800 p-[2px] shadow-[0_0_10px_rgba(188,0,255,0.3)]">
                            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden text-xs font-bold text-white uppercase">
                                {opponent?.username?.charAt(0) || '?'}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-yellow-500 rounded-full border-2 border-[#080b14]" />
                    </div>
                    <div className="text-left flex-1 z-10">
                        <div className="flex items-center gap-2 justify-start">
                            <span className={`text-[10px] px-1.5 rounded uppercase tracking-widest font-bold border ${opponentProgress === 100 ? 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30 animate-pulse' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'}`}>
                                {opponentProgress === 100 ? 'SUBMITTED' : 'CODING'}
                            </span>
                            <span className="text-sm font-black italic tracking-tighter uppercase truncate max-w-[100px]">{opponent?.username || 'Opponent'}</span>
                        </div>
                        <div className="w-full max-w-[140px] h-1.5 bg-gray-900 rounded-full mt-1.5 overflow-hidden border border-gray-800 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${opponentProgress}%` }}
                                className="h-full bg-gradient-to-r from-secondary-400 to-secondary-600 shadow-[0_0_10px_rgba(188,0,255,0.8)] relative" 
                            />
                        </div>
                        <div className="flex justify-between text-[8px] mt-1 text-gray-500 uppercase font-black tracking-widest">
                            <span>Progress</span>
                            <span>{opponentProgress}%</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Status */}
            <div className="hidden lg:flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                        <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-danger-500"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-danger-500 bg-danger-500/10 px-2 py-0.5 rounded border border-danger-500/20">Live Match</span>
                    </div>
                </div>
            </div>
        </header>

        {/* --- MAIN CONTENT (Triple Pane Split) --- */}
        <main className="flex flex-1 overflow-hidden min-h-0 bg-[#0a0e18]">   
            {/* Left Column: Problem description */}
            <section className="w-full max-w-[40%] flex flex-col border-r border-[#1e2535] bg-[#080b14] z-10 shrink-0">
                <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight pr-4">{problem.title}</h1>
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shrink-0 ${
                            problem.difficulty === 'Easy' ? 'bg-success-500/10 text-success-500 border-success-500/20' : 
                            problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                            'bg-danger-500/10 text-danger-500 border-danger-500/20'
                        }`}>
                            {problem.difficulty}
                        </span>
                    </div>

                    <div className="text-gray-300 text-sm leading-relaxed mb-8 font-medium">
                        {problem.description}
                    </div>

                    {problem.constraints && (
                        <div className="mb-8">
                            <h3 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-[#1e2535] pb-2">
                                <Settings size={14} className="text-primary-500" /> System Constraints
                            </h3>
                            <div className="text-xs font-mono text-gray-400 bg-black border border-[#1e2535] rounded-xl p-4 leading-loose shadow-inner whitespace-pre-wrap">
                                {problem.constraints}
                            </div>
                        </div>
                    )}

                    {/* Test Cases Output View */}
                    {testResults.length > 0 && (
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4 border-b border-[#1e2535] pb-2">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Terminal size={14} /> Execution Matrix
                                </h3>
                                <span className="text-[10px] font-bold font-mono bg-white/5 px-2 py-1 rounded">
                                    {testResults.filter((r:any) => r.passed).length} / {testResults.length} PASSED
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {testResults.map((r: any, i: number) => (
                                    <div key={i} className={`border rounded-lg p-3 flex flex-col group transition-all ${
                                        r.passed ? 'bg-success-900/10 border-success-500/20' : 'bg-danger-900/10 border-danger-500/30'
                                    }`}>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2.5">
                                                {r.passed ? <CheckCircle2 size={16} className="text-success-500 drop-shadow-[0_0_5px_rgba(0,255,136,0.5)]" /> : <XCircle size={16} className="text-danger-500 drop-shadow-[0_0_5px_rgba(255,51,102,0.5)]" />}
                                                <span className={`text-xs font-bold tracking-wide ${r.passed ? 'text-gray-300' : 'text-danger-100'}`}>Test #{i+1}</span>
                                            </div>
                                            <span className="text-[10px] font-mono text-gray-500">
                                                {r.runtime ? `${r.runtime.toFixed(3)}s` : '-'}
                                            </span>
                                        </div>
                                        {!r.passed && (
                                            <div className="mt-3 pt-3 border-t border-danger-500/20 text-xs font-mono text-gray-400 space-y-1 bg-black/40 p-2 rounded">
                                                <div className="flex items-start gap-2"><span className="text-danger-400 font-bold w-16">Input:</span><span className="flex-1 break-all">{problem?.testCases?.[i]?.input || 'Hidden'}</span></div>
                                                <div className="flex items-start gap-2"><span className="text-success-400 font-bold w-16">Expected:</span><span className="flex-1 break-all">{problem?.testCases?.[i]?.expectedOutput || 'Hidden'}</span></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Middle Column: Code Editor Space bg-black/40 */}
            <section className="flex-1 flex flex-col bg-[#0a0e18] relative shadow-inner overflow-hidden min-w-0">
                {/* Tab Bar */}
                <div className="flex items-center justify-between border-b border-[#1e2535] bg-[#080b14] px-2 shrink-0">
                    <div className="flex">
                        <div className="px-6 py-3 border-b-2 border-primary-500 bg-[#111827] flex items-center gap-2 cursor-pointer shadow-[inset_0_-10px_20px_rgba(0,242,255,0.03)] transition-colors">
                            <div className="w-3 h-3 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/50">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_5px_rgba(0,242,255,0.8)]" />
                            </div>
                            <span className="text-xs font-mono font-bold tracking-tight text-white">{selectedLanguage === 'python' ? 'main.py' : selectedLanguage === 'javascript' ? 'solution.js' : 'Solution.java'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pr-2">
                        <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-gray-500 tracking-widest bg-white/5 px-2 py-1 rounded">
                            <Volume2 size={12} className="text-gray-400" />
                            <span>VIM</span>
                        </div>
                        <div className="text-gray-500 cursor-pointer p-1.5 hover:bg-white/10 hover:text-white rounded-md transition-colors"><Settings size={14} /></div>
                    </div>
                </div>

                {/* Monaco / Editor Container */}
                <div className="flex-1 overflow-hidden relative">
                    <CodeEditor
                        value={code}
                        onChange={setCode}
                        language={selectedLanguage}
                        readOnly={false}
                        height="100%"
                    />

                    {/* Overlays */}
                    {opponentProgress === 100 && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, x: 20 }} 
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            className="absolute top-4 right-4 z-20 pointer-events-none"
                        >
                            <div className="flex bg-[#11081a]/90 backdrop-blur-xl px-4 py-3 rounded-xl border border-secondary-500/40 items-center gap-3 animate-pulse-glow shadow-2xl">
                                <div className="w-8 h-8 rounded-full border-2 border-secondary-500 bg-secondary-900 flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                                     {opponent?.username?.charAt(0) || '?'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-secondary-400 tracking-[0.2em] uppercase">Alert</span>
                                    <span className="text-xs font-bold text-white">Opponent Submitted!</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>
        </main>

        {/* --- FOOTER --- */}
        <footer className="h-14 bg-[#080b14] border-t border-[#1e2535] px-6 flex items-center justify-between z-10 shrink-0">
            {/* Left Tools */}
            <div className="flex items-center gap-6 hidden sm:flex">
                <button 
                  onClick={requestHint}
                  className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-primary-400 transition-colors uppercase tracking-[0.1em] group"
                >
                    <Lightbulb size={16} className="text-gray-600 group-hover:text-primary-400 group-hover:drop-shadow-[0_0_8px_rgba(0,242,255,0.8)] transition-all" />
                    <span>Request Hint</span>
                </button>
                <button 
                  onClick={forfeitMatch}
                  className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-red-500 transition-colors uppercase tracking-[0.1em] group"
                >
                    <XCircle size={16} className="text-gray-600 group-hover:text-red-500 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-all" />
                    <span>Forfeit</span>
                </button>
            </div>

            {/* Center Actions */}
            <div className="flex items-center gap-4 justify-center flex-1">
                <button 
                    onClick={runTests}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-[#111827] hover:bg-[#1a2333] transition-colors rounded-lg flex items-center gap-2 text-xs font-black uppercase tracking-widest border border-[#1e2535] hover:border-gray-600 text-gray-300 disabled:opacity-50"
                >
                    <Play size={14} className={submitting ? "animate-pulse" : ""} /> {submitting ? 'TESTING...' : 'RUN TESTS'}
                </button>
                <button 
                    onClick={submitCode}
                    disabled={submitting}
                    className="px-8 py-2.5 bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-500 hover:to-primary-300 transition-all rounded-lg flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-white shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] disabled:opacity-50 border border-primary-400/50"
                >
                    <Send size={14} /> SUBMIT SOLUTION
                </button>
            </div>

            {/* Right Meta */}
            <div className="flex items-center gap-8 hidden md:flex">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Environment</span>
                    <span className="text-[10px] text-gray-400 font-mono font-bold">{selectedLanguage}</span>
                </div>
                <div className="flex flex-col items-end min-w-[60px]">
                    <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Connection</span>
                    <span className="text-[10px] text-success-400 font-mono font-bold drop-shadow-[0_0_5px_rgba(0,255,136,0.3)]">SECURE</span>
                </div>
            </div>
        </footer>
      </div>
    );
  }

  return null;
}
