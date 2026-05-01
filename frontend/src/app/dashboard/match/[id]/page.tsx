'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { game } from '@/lib/api';
import CodeEditor from '@/components/game/CodeEditor';
import { ArrowLeft, CheckCircle2, XCircle, Code2, Terminal, User, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MatchReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  
  const [match, setMatch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user && params.id) {
      game.getMatch(params.id as string)
        .then(res => {
          setMatch(res.data.match);
          setIsLoading(false);
        })
        .catch(() => {
          toast.error('Failed to load match data');
          setIsLoading(false);
        });
    }
  }, [user, params.id]);

  if (loading || isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#080b14] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">Match Not Found</h1>
        <button onClick={() => router.push('/dashboard')} className="text-primary-500 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    );
  }

  const p1 = match.players[0];
  const p2 = match.players[1];

  return (
    <div className="min-h-screen bg-[#080b14] text-white flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Dashboard
        </button>
        <h1 className="text-xl font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
          <Trophy size={20} /> Match Review
        </h1>
      </div>

      <div className="bg-[#121826] border border-[#1e2535] rounded-3xl p-6 md:p-10 shadow-2xl mb-8">
        <h2 className="text-2xl font-bold mb-4">{match.problemId?.title || 'Unknown Problem'}</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">{match.problemId?.description}</p>
        <div className="bg-black/50 border border-[#1e2535] rounded-xl p-4 font-mono text-xs text-gray-500 whitespace-pre-wrap">
          {match.problemId?.constraints || 'No specific constraints'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {[p1, p2].map((player, idx) => {
          if (!player) return null;
          const isWinner = match.winner === player.user?._id;
          const isMe = player.user?._id === user.id;

          return (
            <div key={idx} className={`flex flex-col bg-[#0d1117] border ${isWinner ? 'border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-[#1e2535]'} rounded-3xl overflow-hidden`}>
              <div className="p-6 border-b border-[#1e2535] flex items-center justify-between bg-[#111827]">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full border-2 ${isMe ? 'border-primary-500' : 'border-gray-500'} overflow-hidden`}>
                    <img src={player.user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.user?.username}&backgroundColor=121826`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      {player.user?.username} {isMe && <span className="text-[10px] bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded uppercase tracking-wider">You</span>}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      {isWinner ? 'VICTORY' : 'DEFEAT'}
                    </p>
                  </div>
                </div>
                {isWinner && <Trophy className="text-yellow-500 w-8 h-8" />}
              </div>

              <div className="flex-1 min-h-[400px] border-b border-[#1e2535]">
                <CodeEditor
                  value={player.code || '// No code submitted'}
                  onChange={() => {}}
                  language="javascript"
                  readOnly={true}
                  height="100%"
                />
              </div>

              <div className="p-6 bg-[#080b14]">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Terminal size={14} /> Execution Results
                </h4>
                {player.testResults?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {player.testResults.map((r: any, i: number) => (
                      <div key={i} className={`p-3 rounded-lg border flex items-center justify-between ${r.passed ? 'bg-success-900/10 border-success-500/20' : 'bg-red-900/10 border-red-500/20'}`}>
                        <div className="flex items-center gap-2">
                          {r.passed ? <CheckCircle2 size={16} className="text-success-500" /> : <XCircle size={16} className="text-red-500" />}
                          <span className={`text-xs font-bold ${r.passed ? 'text-gray-300' : 'text-red-400'}`}>Test #{i+1}</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">{r.runtime ? r.runtime.toFixed(3) + 's' : '-'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 font-mono">No execution data available.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
