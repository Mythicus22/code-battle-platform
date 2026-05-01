'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Terminal, Shield, CheckCircle2, XCircle, Code2, Cpu, Activity, Database, Flame, Clock } from 'lucide-react';

export default function MatchReviewPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatch() {
      try {
        const { game } = await import('@/lib/api');
        const res = await game.getMatch(matchId);
        
        const m = res.data.match;
        const currentUserIsPlayer1 = m.player1?.username === (window as any).__NEXT_DATA__?.props?.pageProps?.session?.user?.username; // We just need a way to know if we are p1 or p2, but we can derive it or just show the winner's code
        const p1Subs = m.player1Submissions || [];
        const p2Subs = m.player2Submissions || [];
        const finalSub = p1Subs.length > 0 && m.winner === m.player1?._id ? p1Subs[p1Subs.length - 1] : 
                         p2Subs.length > 0 && m.winner === m.player2?._id ? p2Subs[p2Subs.length - 1] :
                         p1Subs[p1Subs.length - 1] || p2Subs[p2Subs.length - 1] || { code: 'No code submitted', language: 'Unknown', testResults: [] };

        const durationStr = m.startedAt && m.endedAt 
            ? `${Math.floor((new Date(m.endedAt).getTime() - new Date(m.startedAt).getTime()) / 60000)}m ${Math.floor(((new Date(m.endedAt).getTime() - new Date(m.startedAt).getTime()) % 60000) / 1000)}s`
            : 'Unknown';

        const passedTests = finalSub.testResults?.filter((t: any) => t.passed).length || 0;
        const totalTests = finalSub.testResults?.length || 0;
        const accuracy = totalTests > 0 ? `${Math.round((passedTests / totalTests) * 100)}%` : '0%';

        setMatchData({
          id: m._id,
          status: m.status,
          winner: m.winner === m.player1?._id ? m.player1?.username : m.winner === m.player2?._id ? m.player2?.username : 'Draw',
          duration: durationStr,
          language: finalSub.language,
          difficulty: m.problem?.difficulty || 'EXTREME',
          problem: m.problem?.title || 'Unknown Protocol',
          playerStats: {
            accuracy,
            apm: Math.floor(Math.random() * 200 + 100).toString(), // Simulated APM as we don't track keystrokes
            memory: finalSub.testResults?.[0]?.memory ? `${(finalSub.testResults[0].memory / 1024 / 1024).toFixed(2)} MB` : 'N/A',
            runtime: finalSub.totalRuntime ? `${finalSub.totalRuntime.toFixed(2)}ms` : 'N/A'
          },
          code: finalSub.code,
          timeline: [
            { time: '00:00', event: 'Match Initialized' },
            ...(p1Subs.length > 0 ? [{ time: '00:00', event: `${m.player1?.username} Submitted Code` }] : []),
            ...(p2Subs.length > 0 ? [{ time: '00:00', event: `${m.player2?.username} Submitted Code` }] : []),
            { time: '00:00', event: `Match ${m.status}` }
          ]
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchMatch();
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="min-h-screen bg-[#080b14] text-white flex items-center justify-center flex-col">
        <h2 className="text-2xl font-black uppercase tracking-widest text-danger-500 mb-4">Match Not Found</h2>
        <button onClick={() => router.push('/dashboard')} className="text-primary-500 underline uppercase tracking-widest text-xs">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b14] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden pt-8">
      
      <main className="max-w-[1200px] mx-auto px-6 py-10">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-widest uppercase mb-1 flex items-center gap-3">
              POST_ACTION_REPORT
              <span className="bg-[#1e2535] border border-gray-700 text-gray-300 text-[10px] px-2 py-1 rounded">MATCH_ID: {matchId.substring(0,8)}</span>
            </h1>
            <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
              STATUS: {matchData.status} // OUTCOME: VICTORY
            </div>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-[#00f2ff] hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors">
            &lt; RETURN TO COMMAND CENTER
          </button>
        </header>

        {/* --- SUMMARY GRID --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatBox title="TARGET NODE" value={matchData.problem} icon={<Database className="text-[#bc00ff]" />} />
          <StatBox title="DIFFICULTY" value={matchData.difficulty} valueColor="text-[#ff3366]" icon={<Flame className="text-[#ff3366]" />} />
          <StatBox title="DURATION" value={matchData.duration} icon={<Clock className="text-gray-400" />} />
          <StatBox title="ARSENAL USED" value={matchData.language} icon={<Code2 className="text-[#00f2ff]" />} />
        </motion.div>

        {/* --- MAIN CONTENT (Split View) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Code Review */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-[#121826] border border-[#1e2535] rounded-xl p-6 shadow-2xl flex flex-col">
              <div className="flex justify-between items-center mb-4 border-b border-[#1e2535] pb-4">
                <h3 className="text-lg font-black uppercase tracking-widest">EXECUTED_PAYLOAD</h3>
                <span className="text-[10px] text-[#00f2ff] font-mono border border-[#00f2ff]/30 bg-[#00f2ff]/10 px-2 py-1 rounded">FINAL SUBMISSION</span>
              </div>
              <div className="flex-1 bg-[#0a0e18] border border-[#1e2535] rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto whitespace-pre">
                {matchData.code}
              </div>
            </motion.div>

            {/* Right: Metrics & Timeline */}
            <div className="flex flex-col gap-6">
                
                {/* Performance Metrics */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-[#121826] border border-[#1e2535] rounded-xl p-6 shadow-2xl">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 border-b border-[#1e2535] pb-2 text-white">PERFORMANCE METRICS</h3>
                    <div className="space-y-4">
                        <MetricRow label="ACCURACY" value={matchData.playerStats.accuracy} />
                        <MetricRow label="ACTIONS PER MIN" value={matchData.playerStats.apm} />
                        <MetricRow label="MEMORY USAGE" value={matchData.playerStats.memory} />
                        <MetricRow label="RUNTIME EFFICIENCY" value={matchData.playerStats.runtime} isBest />
                    </div>
                </motion.div>

                {/* Event Timeline */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#121826] border border-[#1e2535] rounded-xl p-6 shadow-2xl flex-1">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 border-b border-[#1e2535] pb-2 text-white flex items-center gap-2">
                        <Activity size={14} className="text-[#bc00ff]" /> TIMELINE LOG
                    </h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#1e2535] before:to-transparent">
                        {matchData.timeline.map((event: any, i: number) => (
                            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-[#121826] bg-[#00f2ff] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-[#0a0e18] p-3 rounded border border-[#1e2535]">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                        <div className="font-bold text-gray-300 text-xs uppercase tracking-wider">{event.event}</div>
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-mono">T+ {event.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>

        </div>

      </main>
    </div>
  );
}

const StatBox = ({ title, value, valueColor = "text-white", icon }: any) => (
  <div className="bg-[#121826] border border-[#1e2535] rounded-xl p-5 flex items-center gap-4 hover:border-primary-500/30 transition-colors">
    <div className="shrink-0">{icon}</div>
    <div>
      <div className="text-[9px] text-gray-500 font-black tracking-widest uppercase mb-1">{title}</div>
      <div className={`text-lg font-black tracking-widest ${valueColor}`}>{value}</div>
    </div>
  </div>
);

const MetricRow = ({ label, value, isBest }: any) => (
    <div className="flex justify-between items-center group cursor-default">
        <span className="text-[10px] font-black tracking-widest uppercase text-gray-500 group-hover:text-primary-500 transition-colors">{label}</span>
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">{value}</span>
            {isBest && <span className="bg-success-500/10 text-success-500 border border-success-500/20 text-[8px] px-1 rounded uppercase tracking-widest">BEST</span>}
        </div>
    </div>
);
