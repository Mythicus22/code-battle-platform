'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { Send, Globe, Users, Command, TerminalSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { chat } from '@/lib/api';

export default function GlobalChatPage() {
  const { user, loading } = useAuth();
  const { emit, on, off, connected } = useSocket();
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      // Fetch history
      chat.getHistory().then((res) => {
        if (res.data.messages) {
          // Format historical messages to match real-time
          const formatted = res.data.messages.map((m: any) => ({
             ...m,
             username: m.senderName,
             profilePicture: m.senderAvatar,
             text: m.message
          }));
          setMessages(formatted);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      }).catch(err => console.error("History fetch failed", err));
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handleChat = (data: any) => {
      setMessages(prev => [...prev, data]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    on('chat_message', handleChat);
    return () => { off('chat_message', handleChat); };
  }, [on, off]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    emit('send_chat', {
      username: user.username,
      avatar: (user as any).profilePicture,
      text: input.trim(),
      timestamp: new Date().toISOString()
    });
    
    setInput('');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col p-4 md:p-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white flex items-center gap-3">
            <Globe className="text-primary-500 shrink-0" /> Global Comm_Link
          </h1>
          <p className="text-gray-500 text-[10px] md:text-xs mt-1 uppercase tracking-widest font-mono flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${connected ? 'bg-success-500' : 'bg-red-500'}`} />
            {connected ? 'Connection Established // Relay Active' : 'Attempting Reconnection...'}
          </p>
        </div>
        <div className="hidden md:flex bg-[#080b14]/50 backdrop-blur-md px-4 py-2 border border-primary-500/20 rounded-lg items-center gap-3 shadow-[0_0_15px_rgba(0,242,255,0.1)]">
           <Users className="text-primary-400 w-5 h-5" />
           <span className="text-xs font-black uppercase tracking-widest text-gray-300">Public Channel</span>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-[#0d1117]/80 backdrop-blur-xl border border-[#1e2535] rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
        
        {/* Messages View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar relative z-10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50">
              <Command className="w-16 h-16 text-primary-600/50 mb-4 animate-pulse" />
              <p className="text-primary-500/50 uppercase tracking-widest font-bold text-sm">Awaiting transmissions...</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.username === user.username;
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  key={i} 
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div 
                      onClick={() => router.push(`/profile/${msg.username}`)}
                      className="w-10 h-10 rounded-full border-2 border-[#1e2535] overflow-hidden shrink-0 cursor-pointer hover:border-primary-400 transition-colors shadow-lg"
                    >
                       <img src={msg.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.username}&backgroundColor=121826`} className="w-full h-full object-cover" />
                    </div>
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-baseline gap-2 mb-1`}>
                        <span 
                          className={`font-black text-[10px] tracking-widest uppercase cursor-pointer hover:underline ${isMe ? 'text-primary-400' : 'text-purple-400'}`}
                          onClick={() => router.push(`/profile/${msg.username}`)}
                        >
                          {msg.username}
                        </span>
                        <span className="text-[9px] text-gray-500 font-mono tracking-wider">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className={`px-5 py-3 text-sm leading-relaxed shadow-md backdrop-blur-sm break-words ${isMe ? 'bg-primary-900/20 text-primary-100 border border-primary-500/30 rounded-2xl rounded-tr-sm' : 'bg-[#151b2b] text-gray-200 border border-[#2a3548] rounded-2xl rounded-tl-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 md:p-6 bg-[#080b14]/90 backdrop-blur-md border-t border-[#1e2535] relative z-10">
          <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
            <TerminalSquare className="absolute left-4 md:left-5 text-gray-500 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Broadcast to global channel..."
              className="w-full bg-[#111827] border border-[#2a3548] focus:border-primary-500 rounded-2xl py-3 md:py-4 pl-12 md:pl-14 pr-16 md:pr-20 text-white text-sm transition-all outline-none shadow-inner focus:shadow-[0_0_20px_rgba(0,242,255,0.1)]"
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="absolute right-1.5 md:right-2 bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-500 hover:to-primary-300 text-[#080b14] w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5 ml-1" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
