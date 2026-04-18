import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Swords, Plus, Shield } from 'lucide-react';
import Leaderboard from './Leaderboard';
import { users } from '@/lib/api';
import toast from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';

interface Props {
  onChallengeFriend: (friendId: string, username: string) => void;
}

export default function RightSidebar({ onChallengeFriend }: Props) {
  const { emit, on, off } = useSocket();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'friends'>('leaderboard');
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');
  
  // Chat state
  const [activeChatUser, setActiveChatUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'friends') {
      fetchFriends();
    }
  }, [activeTab]);

  const fetchFriends = () => {
    setLoading(true);
    users.getFriends()
      .then(res => setFriends(res.data.friends || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const handleFriendMessage = (msg: any) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    on('friend_message', handleFriendMessage);
    return () => { off('friend_message', handleFriendMessage); };
  }, [on, off]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatUser) return;
    emit('send_friend_message', { friendId: activeChatUser._id, text: messageInput });
    setMessageInput('');
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendUsername) return;
    emit('send_friend_request', { targetUsername: friendUsername });
    toast.success(`Friend request sent to ${friendUsername}!`);
    setFriendUsername('');
  };

  return (
    <div className="bg-[#0d1117] border border-[#1e2535] rounded-xl flex flex-col h-[600px] overflow-hidden shadow-2xl">
      {/* Tabs */}
      <div className="flex border-b border-[#1e2535]">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors ${
            activeTab === 'leaderboard' ? 'text-blue-400 border-b-2 border-blue-500 bg-[#1a1f2e]/50' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Trophy className="w-4 h-4" /> Top Ranked
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors ${
            activeTab === 'friends' ? 'text-purple-400 border-b-2 border-purple-500 bg-[#1a1f2e]/50' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Users className="w-4 h-4" /> Friends
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col relative w-full">
        {activeChatUser ? (
          <div className="absolute inset-0 flex flex-col bg-[#0a0e18] z-20">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-[#1e2535] flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                   {activeChatUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-gray-200 text-sm tracking-wide">{activeChatUser.username}</span>
              </div>
              <button onClick={() => setActiveChatUser(null)} className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1">
                <Shield className="w-4 h-4 rotate-45 opacity-0 pointer-events-none" /> {/* Just spacer block */}
                <span className="text-lg font-black leading-none -mt-1 block">×</span>
              </button>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.filter(m => m.fromId === activeChatUser._id || m.toId === activeChatUser._id).length === 0 ? (
                <div className="text-center text-gray-600 text-xs mt-10 font-medium italic">Begin encrypted transmission...</div>
              ) : (
                messages.filter(m => m.fromId === activeChatUser._id || m.toId === activeChatUser._id).map((m, i) => {
                  const isMe = m.fromId !== activeChatUser._id;
                  return (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3 py-2 rounded-xl text-xs max-w-[85%] break-words shadow-sm ${isMe ? 'bg-purple-600/20 text-purple-100 border border-purple-500/30 rounded-tr-none' : 'bg-[#1a1f2e] text-gray-300 border border-[#2a3040] rounded-tl-none'}`}>
                        {m.text}
                      </div>
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#1e2535] bg-[#0d1117] flex gap-2">
              <input type="text" value={messageInput} onChange={e => setMessageInput(e.target.value)} placeholder="Message..." className="flex-1 bg-[#1a1f2e] border border-[#2a3040] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors" />
              <button type="submit" disabled={!messageInput.trim()} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-md disabled:opacity-50 text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_10px_rgba(168,85,247,0.3)]">SEND</button>
            </form>
          </div>
        ) : activeTab === 'leaderboard' ? (
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-2">
            <Leaderboard />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col overflow-hidden">
            {/* Add friend form */}
            <form onSubmit={handleAddFriend} className="p-4 border-b border-[#1e2535] bg-[#0a0e18]">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Friend's username"
                  value={friendUsername}
                  onChange={(e) => setFriendUsername(e.target.value)}
                  className="w-full bg-[#1a1f2e] border border-[#2a3040] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Friend List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
               {loading ? (
                 <div className="text-center text-gray-500 py-8 text-sm">Loading friends...</div>
               ) : friends.length === 0 ? (
                 <div className="text-center py-10">
                   <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                   <p className="text-gray-400 text-sm font-bold">No friends yet</p>
                   <p className="text-gray-600 text-xs mt-1">Add friends to challenge them.</p>
                 </div>
               ) : (
                 friends.map((f, i) => (
                   <motion.div
                     key={f._id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="bg-[#1a1f2e]/50 border border-[#2a3040] hover:border-purple-500/50 p-3 rounded-xl flex items-center justify-between transition-colors group"
                   >
                     <div className="flex items-center gap-3">
                       <div className="relative">
                         <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center font-bold text-gray-300">
                           {f.username.charAt(0).toUpperCase()}
                         </div>
                         {/* Online indicator (mocked for now, assume always online or rely on socket presence) */}
                         <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1a1f2e] rounded-full" />
                       </div>
                       <div>
                         <div className="font-bold text-sm text-gray-200">{f.username}</div>
                         <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                           <Trophy className="w-3 h-3 text-yellow-500" /> {f.trophies || 1000} XP
                         </div>
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => setActiveChatUser(f)}
                         className="w-8 h-8 lg:w-9 lg:h-9 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-[0_0_8px_rgba(59,130,246,0)] hover:shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                         title="Direct Message"
                       >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                       </button>
                       <button
                         onClick={() => onChallengeFriend(f._id, f.username)}
                         className="w-8 h-8 lg:w-9 lg:h-9 bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-[0_0_8px_rgba(168,85,247,0)] hover:shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                         title="Challenge to Duel"
                       >
                         <Swords className="w-4 h-4 lg:w-5 lg:h-5" />
                       </button>
                     </div>
                   </motion.div>
                 ))
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
