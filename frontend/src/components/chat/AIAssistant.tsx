'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{role: string, text: string}>>([
    { role: 'assistant', text: 'Hello! I am your Code Battle AI. I can help answer platform rules, debugging tips, or evaluate competitive coding performance.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    const userMessage = { role: 'user', text: message.trim() };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Temporary mock AI response. You would hook this up to backend `/api/ai/chat`
      // const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, { message: userMessage.text });
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', text: "I'm processing that parameter... (AI Route Not Fully Hooked Up Yet)"}]);
        setIsLoading(false);
      }, 1000);
    } catch(err) {
      toast.error('AI Link Failed');
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(0, 242, 255, 0.4)" }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-secondary-600 to-secondary-400 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(188,0,255,0.3)] z-40 border border-secondary-500/50"
      >
        <Bot size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 bg-[#0a0e18]/95 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(0,242,255,0.15)] flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-black/40 border-b border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse-glow" />
                <span className="font-black italic text-sm tracking-widest text-secondary-400">NEON LYZR AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 h-80 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
                  <Bot size={32} className="opacity-50" />
                  <p className="text-xs font-bold tracking-widest uppercase text-center">AI Offline</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-gray-500 font-bold tracking-wider mb-1 px-1 uppercase">
                      {msg.role === 'user' ? 'You' : 'Lyzr AI'}
                    </span>
                    <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] break-words shadow-md ${
                      msg.role === 'user' 
                        ? 'bg-primary-600/20 text-primary-100 border border-primary-500/30 rounded-tr-none' 
                        : 'bg-secondary-900/30 text-gray-300 border border-secondary-500/30 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))
              )}
              {isLoading && (
                 <div className="flex items-center gap-2 text-secondary-400 text-xs px-2">
                   <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full animate-bounce" />
                   <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                   <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-black/40 border-t border-gray-800 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Transmit message..."
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
              />
              <button 
                type="submit"
                disabled={!message.trim() || isLoading}
                className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
