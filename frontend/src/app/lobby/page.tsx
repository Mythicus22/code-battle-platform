'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Users, Activity, ShieldAlert } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function GlobalLobbyPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const { socket } = useSocket();
  const { user, loading } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!socket) return;
    socket.on('chat_message', (data: any) => {
      setMessages(prev => [...prev, data]);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    return () => { socket.off('chat_message'); };
  }, [socket]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket || !user) return;
    
    socket.emit('send_chat', {
      username: user.username,
      text: message.trim(),
      timestamp: new Date().toISOString()
    });
    
    setMessage('');
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#080b14] text-white font-sans selection:bg-cyan-500/30 flex flex-col pt-20">
      <main className="max-w-[1400px] mx-auto px-4 md:px-10 py-8 md:py-12 w-full flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-500" /> Lobby Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-bold">Active Coders</span>
                <span className="text-primary-400 font-black">1.2k</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-bold">Server Load</span>
                <span className="text-success-400 font-black">Optimal</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-secondary-500" /> Protocol Ethics
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Transmissions are heavily monitored. Do not drop API credentials, malicious scripts, or harassment into the global stream.
            </p>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="w-full lg:w-3/4 flex flex-col bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl overflow-hidden h-[75vh]">
          
          <div className="px-6 py-4 bg-black/40 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-success-500 animate-pulse-glow" />
              <span className="font-black italic text-lg tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                Global Stream
              </span>
            </div>
            <Users className="text-gray-500 w-5 h-5" />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-[#080b14]/50 to-transparent">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                <MessageSquare size={48} className="opacity-30" />
                <p className="text-sm font-bold tracking-[0.2em] uppercase text-center">Global channel established.<br />Awaiting transmissions...</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex flex-col ${msg.username === user.username ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-gray-500 font-bold tracking-[0.1em] mb-1.5 px-2">
                    {msg.username} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className={`px-5 py-3 rounded-2xl text-sm max-w-[70%] break-words shadow-lg font-medium leading-relaxed ${
                    msg.username === user.username 
                      ? 'bg-primary-600/20 text-primary-50 border border-primary-500/30 rounded-tr-none' 
                      : 'bg-gray-800/60 text-gray-200 border border-gray-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 bg-black/60 border-t border-gray-800 flex gap-3 backdrop-blur-md">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Transmit sequence to global network..."
              className="flex-1 bg-gray-900/50 border border-gray-700/50 rounded-xl px-5 py-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
            />
            <button 
              type="submit"
              disabled={!message.trim()}
              className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 text-white px-8 py-4 rounded-xl transition-all flex items-center justify-center font-black uppercase text-xs tracking-wider shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:shadow-[0_0_25px_rgba(0,242,255,0.5)]"
            >
              Send <Send size={16} className="ml-2" />
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}
