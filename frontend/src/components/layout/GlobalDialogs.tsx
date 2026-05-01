'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, UserPlus, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GlobalDialogs() {
  const { on, off, emit } = useSocket();
  const router = useRouter();
  
  const [challenge, setChallenge] = useState<any>(null);

  useEffect(() => {
    const handleFriendChallenged = (data: any) => {
      setChallenge(data);
    };

    const handleFriendRequest = (data: any) => {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#111827] shadow-2xl rounded-2xl border border-blue-500/30 flex overflow-hidden`}>
          <div className="flex-1 p-4 flex items-start gap-3">
             <UserPlus className="text-blue-400 mt-1" />
             <div>
               <p className="text-sm font-bold text-white uppercase tracking-widest">Friend Request</p>
               <p className="text-xs text-gray-400 mt-1">{data.fromUsername} wants to connect.</p>
             </div>
          </div>
          <button onClick={() => {
              emit('accept_friend_request', { requesterId: data.fromUserId });
              toast.dismiss(t.id);
            }} className="px-6 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold text-xs uppercase tracking-widest transition-colors border-l border-blue-500/30">
            Accept
          </button>
        </div>
      ), { duration: 10000 });
    };

    const handleChallengeSent = (data: any) => {
      toast.success(data.message || 'Challenge sent. Waiting for response...');
    };

    on('friend_challenged', handleFriendChallenged);
    on('friend_request_received', handleFriendRequest);
    on('challenge_sent', handleChallengeSent);

    return () => {
      off('friend_challenged', handleFriendChallenged);
      off('friend_request_received', handleFriendRequest);
      off('challenge_sent', handleChallengeSent);
    };
  }, [on, off, emit]);

  const acceptChallenge = () => {
    if (!challenge) return;
    emit('accept_challenge', { challengerId: challenge.challengerId, language: challenge.language });
    setChallenge(null);
    router.push('/game');
  };

  const declineChallenge = () => {
    setChallenge(null);
  };

  return (
    <AnimatePresence>
      {challenge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={declineChallenge} />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-[#0d1117] border border-red-500/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(255,0,0,0.15)] overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-purple-500" />
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_20px_rgba(255,0,0,0.2)]">
                <Swords className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">Combat Challenge</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                <strong className="text-white">{challenge.challengerUsername}</strong> has challenged you to a battle.
                <br/><br/>
                <span className="text-xs uppercase tracking-widest text-purple-400 font-bold bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  {challenge.cryptoBetting ? `Wager: ${challenge.cryptoBetAmount} APT` : 'Normal Mode'}
                </span>
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={declineChallenge}
                  className="flex-1 py-3 bg-transparent border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Decline
                </button>
                <button 
                  onClick={acceptChallenge}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,0,0,0.4)] hover:shadow-[0_0_30px_rgba(255,0,0,0.6)] transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Accept
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
