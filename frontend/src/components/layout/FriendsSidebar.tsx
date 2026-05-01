'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, Swords, MessageSquare, Plus, Send, X, Search } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { users } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function FriendsSidebar() {
  const { emit, on, off } = useSocket();
  const { user } = useAuth();
  const router = useRouter();

  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [addUsername, setAddUsername] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [activeChatFriend, setActiveChatFriend] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = () => {
    setLoading(true);
    users.getFriends()
      .then(res => setFriends(res.data.friends || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const handleMsg = (msg: any) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };
    on('friend_message', handleMsg);
    return () => off('friend_message', handleMsg);
  }, [on, off]);

  const sendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeChatFriend) return;
    emit('send_friend_message', { friendId: activeChatFriend._id, text: msgInput.trim() });
    setMessages(prev => [...prev, { fromId: user?.id, text: msgInput.trim(), timestamp: new Date().toISOString() }]);
    setMsgInput('');
    setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  useEffect(() => {
    if (!addUsername.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      users.searchUsers(addUsername)
        .then(res => setSearchResults(res.data.users))
        .catch(() => {})
        .finally(() => setIsSearching(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [addUsername]);

  const sendFriendRequest = (targetUsername: string) => {
    emit('send_friend_request', { targetUsername });
    toast.success(`Friend request sent to ${targetUsername}`);
    setAddUsername('');
    setSearchResults([]);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-[#1e2535] rounded-xl overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2535]">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-[#00f2ff]" />
          <span className="text-xs font-black text-[#00f2ff] uppercase tracking-widest">Friends</span>
        </div>
        <span className="text-[10px] text-gray-500 font-bold">{friends.length} online</span>
      </div>

      {activeChatFriend ? (
        /* Chat View */
        <div className="flex flex-col flex-1 overflow-hidden z-20 bg-[#0d1117] absolute inset-0">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e2535]">
            <button onClick={() => setActiveChatFriend(null)} className="text-gray-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
            <div className="w-8 h-8 rounded-full border border-[#2a3040] flex items-center justify-center overflow-hidden">
              <img src={activeChatFriend.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChatFriend.username}&backgroundColor=121826`} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-bold text-white uppercase tracking-widest">{activeChatFriend.username}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.filter(m => m.fromId === activeChatFriend._id || m.toId === activeChatFriend._id || m.fromId === user?.id).length === 0 ? (
              <div className="text-center text-gray-600 text-[10px] uppercase font-bold tracking-widest py-8">Start a conversation...</div>
            ) : (
              messages
                .filter(m => m.fromId === activeChatFriend._id || m.toId === activeChatFriend._id || m.fromId === user?.id)
                .map((m, i) => {
                  const isMe = m.fromId === user?.id;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-4 py-2 rounded-xl text-xs max-w-[85%] break-words shadow-md ${isMe ? 'bg-[#00f2ff]/10 text-cyan-100 border border-[#00f2ff]/30 rounded-tr-none' : 'bg-[#1a1f2e] text-gray-300 border border-[#2a3040] rounded-tl-none'}`}>
                        {m.text}
                      </div>
                    </div>
                  );
                })
            )}
            <div ref={msgEndRef} />
          </div>
          <form onSubmit={sendMsg} className="p-3 border-t border-[#1e2535] relative bg-[#0a0e18]">
            <input
              type="text"
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
              placeholder="Send message..."
              className="w-full bg-[#111827] border border-[#2a3040] rounded-xl pl-4 pr-10 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00f2ff] transition-colors"
            />
            <button type="submit" disabled={!msgInput.trim()} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#00f2ff] transition-colors disabled:opacity-50">
              <Send size={14} />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Add friend */}
          <div className="p-3 border-b border-[#1e2535] flex flex-col gap-2 relative">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={addUsername}
                onChange={e => setAddUsername(e.target.value)}
                placeholder="Search global players..."
                className="w-full bg-[#1a1f2e] border border-[#2a3040] rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00f2ff] transition-colors"
              />
            </div>
            
            <AnimatePresence>
              {addUsername.trim() && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 right-0 mx-3 mt-1 bg-[#121826] border border-[#2a3040] rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-3 text-center text-xs text-gray-500">Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-3 text-center text-xs text-gray-500">No players found.</div>
                  ) : (
                    searchResults.map(res => (
                      <div key={res._id} className="flex items-center justify-between p-2 border-b border-[#2a3040] last:border-0 hover:bg-[#1a2235] transition-colors">
                        <div className="flex items-center gap-2">
                           <img src={res.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.username}&backgroundColor=121826`} className="w-6 h-6 rounded-full object-cover" />
                           <span className="text-xs font-bold text-white">{res.username}</span>
                        </div>
                        <button 
                          onClick={() => sendFriendRequest(res.username)}
                          className="bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-[#00f2ff]/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-[#00f2ff] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-600 gap-2">
                <Users size={24} className="opacity-30" />
                <p className="text-[10px] font-bold tracking-widest uppercase text-center">No friends online</p>
              </div>
            ) : (
              friends.map((f, i) => (
                <motion.div
                  key={f._id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-2.5 bg-[#080b14] border border-[#1e2535] hover:border-[#2a3040] hover:bg-white/5 rounded-xl group transition-all cursor-pointer"
                  onClick={() => setActiveChatFriend(f)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2a3040] flex items-center justify-center">
                         <img src={f.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.username}&backgroundColor=121826`} alt={f.username} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#080b14]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-wider leading-none">{f.username}</div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1 font-mono">
                        <Trophy size={10} className="text-yellow-500" /> {f.trophies ?? 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/game?challenge=${f._id}&username=${f.username}`); }}
                      className="w-7 h-7 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:shadow-[0_0_10px_rgba(255,0,0,0.5)] rounded-lg flex items-center justify-center transition-all"
                      title="Challenge"
                    >
                      <Swords size={12} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
