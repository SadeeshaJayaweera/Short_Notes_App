'use client';

import { useState, useMemo, useEffect } from 'react';
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
  CheckCircle2,
  XCircle,
  BrainCircuit,
  GraduationCap,
  Share2,
  ArrowLeft,
  Loader2,
  UserPlus,
  Sun,
  Moon,
} from 'lucide-react';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time password strength computation
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;

    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = [
      'bg-rose-500',
      'bg-amber-500',
      'bg-blue-600',
      'bg-emerald-600',
    ];

    return {
      score,
      label: labels[Math.max(0, score - 1)] || 'Too short',
      color: colors[Math.max(0, score - 1)] || 'bg-slate-300 dark:bg-slate-700',
      hasLength: password.length >= 8,
      hasCase: /[A-Z]/.test(password) && /[a-z]/.test(password),
      hasNumberOrSymbol: /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (response.status === 201) {
        toast.success('Second Brain created! Initializing vault...');

        // Auto sign in after registration
        const result = await signIn('credentials', {
          email: email.trim(),
          password,
          redirect: false,
        });

        if (result?.ok) {
          router.push('/dashboard');
          router.refresh();
        } else {
          router.push('/login');
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch {
      toast.error(`Failed to sign up with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center relative overflow-hidden transition-colors duration-300 selection:bg-indigo-500/25">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 w-96 h-96 bg-pink-500/10 dark:bg-pink-600/15 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
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
          {/* Left panel: Product value & benefits */}
          <div className="hidden lg:flex lg:col-span-5 p-10 flex-col justify-between border-r border-slate-200/70 dark:border-white/5 bg-gradient-to-br from-purple-50/70 via-slate-50/50 to-indigo-50/50 dark:from-purple-950/40 dark:via-slate-900/60 dark:to-indigo-950/30">
            <div>
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

              <div className="mt-10 space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Start Free in 30 Seconds
                </span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  Build a second brain that grows with you.
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Join researchers, engineers, and students who never lose a brilliant idea, meeting insight, or paper summary.
                </p>
              </div>

              {/* Feature list */}
              <div className="mt-8 space-y-4">
                {[
                  {
                    icon: BrainCircuit,
                    title: 'Grounded RAG Assistant',
                    desc: 'Chat with your entire library with traceable source citations.',
                  },
                  {
                    icon: GraduationCap,
                    title: 'SM-2 Active Recall',
                    desc: 'Auto-generated flashcards scheduled for maximum memory retention.',
                  },
                  {
                    icon: Share2,
                    title: 'Interactive Knowledge Graph',
                    desc: 'Discover unexpected connections across notes and concepts.',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 shadow-xs"
                    >
                      <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-200/70 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero credit card required • Full data portability</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Bring your own OpenAI key (BYOK) anytime</span>
              </div>
            </div>
          </div>

          {/* Right panel: Registration form */}
          <div className="col-span-1 lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create your account
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Enter your details to configure your private knowledge vault.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Ada Lovelace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                  className="bg-white dark:bg-slate-950/60 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-xl h-11 text-sm shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="ada@example.com"
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
                  {password && (
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Strength:{' '}
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{strength.label}</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
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

                {/* Password strength indicators */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {/* Visual strength bar */}
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`rounded-full transition-all duration-300 ${
                            strength.score >= step ? strength.color : 'bg-slate-200 dark:bg-white/10'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Requirements checklist */}
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className={`inline-flex items-center gap-1 font-medium ${strength.hasLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {strength.hasLength ? '✓' : '○'} 8+ characters
                      </span>
                      <span className={`inline-flex items-center gap-1 font-medium ${strength.hasCase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {strength.hasCase ? '✓' : '○'} Upper & lowercase
                      </span>
                      <span className={`inline-flex items-center gap-1 font-medium ${strength.hasNumberOrSymbol ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {strength.hasNumberOrSymbol ? '✓' : '○'} Number or symbol
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  {confirmPassword && (
                    <span className="text-[11px] font-semibold">
                      {passwordsMatch ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Does not match
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="bg-white dark:bg-slate-950/60 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-xl h-11 text-sm pr-10 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl h-11 shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Second Brain...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Free Second Brain</span>
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
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Sign in to your vault →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
