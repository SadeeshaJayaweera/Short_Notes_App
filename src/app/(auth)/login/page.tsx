'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';
import {
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  BrainCircuit,
  GraduationCap,
  Lock,
  ArrowLeft,
  Loader2,
  Sun,
  Moon,
} from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: BrainCircuit,
    tag: 'Grounded RAG',
    title: 'Zero-Hallucination AI',
    desc: 'Every AI answer is cross-referenced with your personal notes and hyperlinked to exact citations.',
  },
  {
    icon: GraduationCap,
    tag: 'Active Recall',
    title: 'SuperMemo SM-2 Study Mode',
    desc: 'Turn documents into flashcards and quizzes. Algorithm schedules reviews right before you forget.',
  },
  {
    icon: ShieldCheck,
    tag: 'Data Sovereignty',
    title: 'Private & Portable Vault',
    desc: 'Full JSON/PDF/Markdown export with BYOK (Bring Your Own Key) for OpenAI.',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState(0);
  const [demoFilled, setDemoFilled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.ok) {
        toast.success('Welcome back to your Second Brain!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@shortnotes.ai');
    setPassword('Password123!');
    setDemoFilled(true);
    toast.success('Demo credentials loaded! Click "Sign In" to proceed', {
      icon: '⚡',
    });
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch {
      toast.error(`Failed to sign in with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center relative overflow-hidden transition-colors duration-300 selection:bg-indigo-500/25">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        {/* Top bar with Back link & Theme toggle */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {mounted && (
            <button
              onClick={toggleTheme}
              type="button"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs"
              title="Toggle day/night theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Day Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Night Mode</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Split container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-xl dark:shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Left panel: Showcase & Interactive feature preview */}
          <div className="hidden lg:flex lg:col-span-6 p-10 flex-col justify-between border-r border-slate-200/70 dark:border-white/5 bg-gradient-to-br from-indigo-50/70 via-slate-50/50 to-purple-50/50 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-purple-950/30 relative">
            <div>
              {/* Brand */}
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                  <span className="text-white text-xl">📝</span>
                </div>
                <div>
                  <div className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                    Short Notes
                  </div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-widest">
                    AI Second Brain 2.0
                  </div>
                </div>
              </Link>

              {/* Tagline */}
              <div className="mt-10 space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Grounded Personal Knowledge
                </span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  Unlock your second brain. Recall anything instantly.
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sign in to access your notes, knowledge graph, AI research assistant, and SuperMemo SM-2 study decks.
                </p>
              </div>

              {/* Interactive feature selector */}
              <div className="mt-8 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select a feature to explore:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {HIGHLIGHTS.map((h, idx) => {
                    const Icon = h.icon;
                    const isActive = activeHighlight === idx;
                    return (
                      <button
                        key={h.tag}
                        type="button"
                        onClick={() => setActiveHighlight(idx)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'bg-indigo-600/10 dark:bg-indigo-600/20 border-indigo-500/50 shadow-sm text-indigo-700 dark:text-indigo-300'
                            : 'bg-white/80 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-2 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                        <div className={`text-xs font-bold truncate ${isActive ? 'text-indigo-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {h.tag}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Active feature spotlight card */}
                <div className="p-4 rounded-2xl bg-white/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 mt-3 transition-all shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {HIGHLIGHTS[activeHighlight].title}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {HIGHLIGHTS[activeHighlight].desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Social proof footnote */}
            <div className="pt-8 border-t border-slate-200/70 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Vault Status: Online & Encrypted</span>
              </div>
              <span>12,800+ notes indexed</span>
            </div>
          </div>

          {/* Right panel: Sign In form */}
          <div className="col-span-1 lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Enter your credentials to enter your private knowledge vault.
              </p>
            </div>

            {/* Quick Demo Fill Pill for evaluators and testers */}
            <div className="mb-6">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className={`w-full group p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  demoFilled
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/25 hover:border-indigo-400 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/15'
                }`}
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>
                    {demoFilled ? '✓ Demo credentials filled' : 'Click to test with Demo Account'}
                  </span>
                </div>
                <span className="font-mono text-[11px] opacity-80 group-hover:opacity-100 flex items-center gap-1 font-bold">
                  demo@shortnotes.ai <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </div>

            {/* Sign in form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="bg-white dark:bg-slate-950/60 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-xl h-11 text-sm shadow-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => toast('Password reset link is available in self-hosted recovery mode.', { icon: 'ℹ️' })}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="bg-white dark:bg-slate-950/60 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-xl h-11 text-sm pr-10 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl h-11 shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in to vault...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In to Second Brain</span>
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-3 bg-white dark:bg-slate-900 text-slate-500 font-semibold">
                  Or continue with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleOAuthSignIn('google')}
                className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] rounded-xl h-11 text-xs font-semibold gap-2 transition-all shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleOAuthSignIn('github')}
                className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] rounded-xl h-11 text-xs font-semibold gap-2 transition-all shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </Button>
            </div>

            {/* Bottom link */}
            <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-8">
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Create your Second Brain →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
