'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, Github, Chrome, Fingerprint, ArrowLeft, Cpu, Eye, EyeOff, X, Shield, Swords } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import OTPVerification from '@/components/auth/OTPVerification';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';

const PROTOCOL_TERMS = [
  { title: 'Fair Play Mandate', body: 'All participants must compete using only their own code. External tools, AI assistants, or pre-written solutions are strictly prohibited during active matches.' },
  { title: 'Account Integrity', body: 'One account per person. Sharing, selling, or transferring accounts results in permanent ban. Your identity is your rank.' },
  { title: 'Crypto Wagers', body: 'All ETH bets are final once placed on-chain. The platform takes a 2% commission. Disputes are resolved by smart contract logic, not human arbitration.' },
  { title: 'Data & Privacy', body: 'We store your email, username, and match history. No personal data is sold. Wallet addresses are stored only if you connect MetaMask.' },
];

const ARENA_ETHICS = [
  { title: 'No Exploitation', body: 'Exploiting platform bugs, judge vulnerabilities, or network timing to gain advantage is grounds for immediate disqualification and ban.' },
  { title: 'Tab Switch Policy', body: 'Switching browser tabs during a match triggers a warning on first offence. A second offence results in automatic disqualification.' },
  { title: 'Respect the Arena', body: 'Harassment, hate speech, or toxic behaviour in any platform communication channel will result in suspension.' },
  { title: 'Trophy Integrity', body: 'Trophy manipulation via match collusion is detected automatically. Both parties face permanent trophy reset and ban.' },
];

function TermsDialog({ type, onClose }: { type: 'protocol' | 'ethics'; onClose: () => void }) {
  const isProtocol = type === 'protocol';
  const items = isProtocol ? PROTOCOL_TERMS : ARENA_ETHICS;
  const color = isProtocol ? 'primary' : 'secondary';
  const colorClass = isProtocol ? 'text-primary-400 border-primary-500/30' : 'text-secondary-400 border-secondary-500/30';
  const bgGlow = isProtocol ? 'bg-primary-900/20' : 'bg-secondary-900/20';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        className={`relative w-full max-w-md bg-[#0d1117] border ${colorClass} rounded-2xl p-6 shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`absolute inset-0 ${bgGlow} rounded-2xl blur-xl pointer-events-none`} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {isProtocol ? <Shield className="w-5 h-5 text-primary-400" /> : <Swords className="w-5 h-5 text-secondary-400" />}
              <h3 className={`text-lg font-black uppercase tracking-widest ${isProtocol ? 'text-primary-400' : 'text-secondary-400'}`}>
                {isProtocol ? 'Protocol Terms' : 'Arena Ethics'}
              </h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {items.map((item, i) => (
              <div key={i} className={`border-l-2 ${isProtocol ? 'border-primary-500/50' : 'border-secondary-500/50'} pl-3`}>
                <p className="text-xs font-black uppercase tracking-wider text-white mb-1">{item.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          <button
            onClick={onClose}
            className={`mt-5 w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isProtocol ? 'bg-primary-600/20 border border-primary-500/30 text-primary-400 hover:bg-primary-600/30' : 'bg-secondary-600/20 border border-secondary-500/30 text-secondary-400 hover:bg-secondary-600/30'}`}
          >
            Acknowledged
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const { login, signup } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [signupData, setSignupData] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const [dialog, setDialog] = useState<'protocol' | 'ethics' | null>(null);
  const [activeSide, setActiveSide] = useState<'login' | 'signup' | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await signIn('credentials', { email: loginEmail, password: loginPassword, redirect: false });
      if (res?.error) {
         toast.error(res.error);
      } else {
         toast.success('Welcome back!');
         
         // In NextAuth credentials we still manually hit `login` hook to map context sockets
         await login(loginEmail, loginPassword);
         router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirm) { toast.error('Passwords do not match'); return; }
    if (signupData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSignupLoading(true);
    try {
      await signup(signupData.username, signupData.email, signupData.password);
      toast.success('Account created! Check your email for OTP.');
      setStep('otp');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Signup failed');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleOAuth = (provider: 'github' | 'google') => {
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-[#080b14] flex flex-col items-center justify-center p-8 text-white relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="w-full max-w-md bg-[#121625]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl">
          <h2 className="text-3xl font-bold text-purple-500 mb-2">Verify Neural Link</h2>
          <p className="text-gray-400 text-sm mb-6">Enter the access sequence sent to {signupData.email}</p>
          <OTPVerification email={signupData.email} onSuccess={() => router.push('/dashboard')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b14] text-white font-sans flex flex-col p-6 md:p-8 relative overflow-x-hidden overflow-y-auto">
      <AnimatePresence>
        {dialog && <TermsDialog type={dialog} onClose={() => setDialog(null)} />}
      </AnimatePresence>

      <div className={`absolute top-0 left-0 w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] transition-opacity duration-700 pointer-events-none ${activeSide === 'signup' ? 'opacity-30' : 'opacity-100'}`} />
      <div className={`absolute bottom-0 right-0 w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] transition-opacity duration-700 pointer-events-none ${activeSide === 'login' ? 'opacity-30' : 'opacity-100'}`} />



      <main className="flex-1 flex flex-col xl:flex-row justify-center items-stretch gap-8 xl:gap-16 relative z-10 max-w-7xl mx-auto w-full pt-16 pb-12">

        {/* LOGIN CARD */}
        <motion.div
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          className={`flex-1 w-full max-w-[500px] mx-auto bg-[#0d1117]/80 backdrop-blur-xl border rounded-3xl p-8 md:p-10 flex flex-col shadow-2xl relative transition-all duration-500 ${activeSide === 'login' || activeSide === null ? 'border-primary-500/30 shadow-[0_0_30px_rgba(0,242,255,0.1)]' : 'border-[#1e2535] opacity-80 scale-[0.98]'}`}
          onMouseEnter={() => setActiveSide('login')}
        >
          <div className={`absolute inset-0 bg-primary-500/5 rounded-3xl transition-opacity pointer-events-none ${activeSide === 'login' ? 'opacity-100' : 'opacity-0'}`} />
          <h2 className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">Ready to defend your rank? Authorization required to enter the arena.</p>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="relative">
              <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${activeSide === 'login' ? 'text-primary-500' : 'text-gray-500'}`} />
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="Battle Tag / Email"
                className="w-full bg-[#080b14] border border-[#2a3040] rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all text-white placeholder-gray-600"
              />
            </div>
            <div className="relative">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${activeSide === 'login' ? 'text-primary-500' : 'text-gray-500'}`} />
              <input
                type={showLoginPw ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Access Code"
                className="w-full bg-[#080b14] border border-[#2a3040] rounded-xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all text-white placeholder-gray-600"
              />
              <button type="button" onClick={() => setShowLoginPw(!showLoginPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-400 transition-colors">
                {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 bg-[#080b14] border border-[#2a3040] rounded-sm text-primary-600 focus:ring-0 focus:ring-offset-0" />
                <span className="text-gray-400 hover:text-gray-300 transition-colors">Persist Session</span>
              </label>
              <Link href="/forgot-password" className="text-primary-500 hover:text-primary-400 hover:underline transition-colors">Recover Code?</Link>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-400 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-6 uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? 'Authenticating...' : 'Initialize Session'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1e2535]" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
              <span className="bg-[#0d1117] px-4 text-gray-500">Or Connect via Neural Link</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => handleOAuth('github')} className="flex-1 bg-[#080b14] border border-[#2a3040] py-3 rounded-xl flex items-center justify-center space-x-2 hover:border-[#3a4050] hover:bg-[#121625] transition-all">
              <Github className="w-5 h-5 text-gray-300" />
              <span className="text-sm font-medium text-gray-300">Github</span>
            </button>
            <button onClick={() => handleOAuth('google')} className="flex-1 bg-[#080b14] border border-[#2a3040] py-3 rounded-xl flex items-center justify-center space-x-2 hover:border-[#3a4050] hover:bg-[#121625] transition-all">
              <Chrome className="w-5 h-5 text-gray-300" />
              <span className="text-sm font-medium text-gray-300">Google</span>
            </button>
          </div>
        </motion.div>

        {/* VERTICAL DIVIDER */}
        <div className="hidden xl:flex w-[60px] flex-col items-center justify-center relative">
          <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#1e2535] to-transparent" />
          <div className="bg-[#080b14] py-6 text-[10px] uppercase tracking-[0.6em] text-gray-600 [writing-mode:vertical-lr] transform rotate-180 z-10 font-bold border border-[#1e2535] rounded-full shadow-inner">Operations</div>
        </div>
        <div className="xl:hidden flex items-center justify-center relative py-4">
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1e2535] to-transparent" />
          <div className="bg-[#080b14] px-4 text-[10px] uppercase tracking-[0.6em] text-gray-600 z-10 font-bold border border-[#1e2535] rounded-full shadow-inner">Operations</div>
        </div>

        {/* SIGNUP CARD */}
        <motion.div
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1, type: 'spring', bounce: 0.4 }}
          className={`flex-1 w-full max-w-[500px] mx-auto bg-[#0d1117]/80 backdrop-blur-xl border rounded-3xl p-8 md:p-10 flex flex-col shadow-2xl relative transition-all duration-500 ${activeSide === 'signup' ? 'border-secondary-500/30 shadow-[0_0_30px_rgba(188,0,255,0.1)]' : 'border-[#1e2535] opacity-80 scale-[0.98]'}`}
          onMouseEnter={() => setActiveSide('signup')}
        >
          <div className={`absolute inset-0 bg-secondary-500/5 rounded-3xl transition-opacity pointer-events-none ${activeSide === 'signup' ? 'opacity-100' : 'opacity-0'}`} />
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-500 mb-2">New Recruit</h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">Join the next generation of competitive coders. High-speed battles await.</p>

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="relative">
              <Fingerprint className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${activeSide === 'signup' ? 'text-secondary-500' : 'text-gray-500'}`} />
              <input
                type="text"
                required
                minLength={3}
                maxLength={20}
                value={signupData.username}
                onChange={e => setSignupData({ ...signupData, username: e.target.value })}
                placeholder="Combatant Tag"
                className="w-full bg-[#080b14] border border-[#2a3040] rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/50 transition-all text-white placeholder-gray-600"
              />
            </div>
            <div className="relative">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${activeSide === 'signup' ? 'text-secondary-500' : 'text-gray-500'}`} />
              <input
                type="email"
                required
                value={signupData.email}
                onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                placeholder="Neural Link (Email)"
                className="w-full bg-[#080b14] border border-[#2a3040] rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/50 transition-all text-white placeholder-gray-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${activeSide === 'signup' ? 'text-secondary-500' : 'text-gray-500'}`} />
                <input
                  type={showSignupPw ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={signupData.password}
                  onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                  placeholder="Access Code"
                  className="w-full bg-[#080b14] border border-[#2a3040] rounded-xl py-3 pl-10 pr-9 text-sm focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/50 transition-all text-white placeholder-gray-600"
                />
                <button type="button" onClick={() => setShowSignupPw(!showSignupPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-secondary-400 transition-colors">
                  {showSignupPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${activeSide === 'signup' ? 'text-secondary-500' : 'text-gray-500'}`} />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={signupData.confirm}
                  onChange={e => setSignupData({ ...signupData, confirm: e.target.value })}
                  placeholder="Confirm Code"
                  className="w-full bg-[#080b14] border border-[#2a3040] rounded-xl py-3 pl-10 pr-9 text-sm focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/50 transition-all text-white placeholder-gray-600"
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-secondary-400 transition-colors">
                  {showConfirmPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2 text-xs pt-2">
              <input type="checkbox" required className="w-3.5 h-3.5 mt-0.5 bg-[#080b14] border border-[#2a3040] rounded-sm text-secondary-600 focus:ring-0 focus:ring-offset-0 shrink-0" />
              <span className="text-gray-400 leading-relaxed">
                I agree to the{' '}
                <button type="button" onClick={() => setDialog('protocol')} className="text-secondary-500 hover:underline">Protocol Terms</button>
                {' '}and{' '}
                <button type="button" onClick={() => setDialog('ethics')} className="text-secondary-500 hover:underline">Arena Ethics</button>.
              </span>
            </div>

            <button
              type="submit"
              disabled={signupLoading}
              className="w-full bg-gradient-to-r from-secondary-600 to-secondary-400 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(188,0,255,0.3)] hover:shadow-[0_0_30px_rgba(188,0,255,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4 uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signupLoading ? 'Recruiting...' : 'Start Recruitment'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1e2535]" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
              <span className="bg-[#0d1117] px-4 text-gray-500">Direct Access</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={handleOAuth} className="flex-1 bg-[#080b14] border border-[#2a3040] py-3 rounded-xl flex items-center justify-center space-x-2 hover:border-[#3a4050] hover:bg-[#121625] transition-all">
              <Github className="w-5 h-5 text-gray-300" />
              <span className="text-sm font-medium text-gray-300">Github</span>
            </button>
            <button onClick={handleOAuth} className="flex-1 bg-[#080b14] border border-[#2a3040] py-3 rounded-xl flex items-center justify-center space-x-2 hover:border-[#3a4050] hover:bg-[#121625] transition-all">
              <Chrome className="w-5 h-5 text-gray-300" />
              <span className="text-sm font-medium text-gray-300">Google</span>
            </button>
          </div>
        </motion.div>
      </main>

      <footer className="mt-8 flex justify-between items-center text-[10px] uppercase tracking-[0.25em] text-gray-500 relative z-10 border-t border-[#1e2535] pt-6 pb-2 px-2">
        <span className="flex items-center text-green-500 font-bold drop-shadow-[0_0_5px_rgba(0,255,136,0.6)]">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 animate-pulse" />
          System: Online // Latency: 12ms
        </span>
        <div className="hidden md:flex space-x-12">
          <button className="hover:text-white transition-colors tracking-[0.4em]">Help</button>
          <button onClick={() => setDialog('protocol')} className="hover:text-white transition-colors tracking-[0.4em]">Protocol</button>
          <Link href="/about" className="hover:text-white transition-colors tracking-[0.4em]">About</Link>
        </div>
        <span className="text-primary-600/50 font-mono font-bold">Build: V4.0.2-Neon</span>
      </footer>
    </div>
  );
}
