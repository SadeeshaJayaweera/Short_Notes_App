'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Animated counter hook ──────────────────────────────────────────────────
function useCounter(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// ─── Feature data ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '🧠',
    title: 'Grounded AI Chat',
    subtitle: 'RAG with Zero Hallucinations',
    description:
      'Ask anything about your personal library. Every answer cites the exact note it came from—never fabricated, always verifiable.',
    color: 'indigo',
    gradient: 'from-indigo-500/20 to-purple-500/20',
    border: 'border-indigo-500/30',
    glow: 'shadow-indigo-500/20',
    badge: 'RAG Grounded',
  },
  {
    icon: '🕸️',
    title: 'Knowledge Graph',
    subtitle: 'Interactive Semantic Network',
    description:
      'Visualize hidden connections between ideas via [[Wikilinks]], shared tags, and backlinks in an interactive SVG canvas.',
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    badge: 'Visual Discovery',
  },
  {
    icon: '🎓',
    title: 'Active Recall (SM-2)',
    subtitle: 'Spaced Repetition Study Mode',
    description:
      'Turn any note into AI-generated flashcards and quizzes. The SuperMemo SM-2 algorithm schedules exactly when to review each card.',
    color: 'pink',
    gradient: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-500/30',
    glow: 'shadow-pink-500/20',
    badge: 'SuperMemo SM-2',
  },
  {
    icon: '⚡',
    title: 'Task Extraction',
    subtitle: 'AI-Powered Action Engine',
    description:
      'One click turns meeting notes into prioritized Kanban tasks. Never lose an action item buried in a document again.',
    color: 'amber',
    gradient: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
    badge: 'Kanban Board',
  },
  {
    icon: '🔌',
    title: 'MCP & Developer API',
    subtitle: 'Integrate with Any Agent',
    description:
      'Connect Short Notes to Claude Desktop, Cursor, or your own scripts via our authenticated MCP server and REST API.',
    color: 'blue',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
    badge: 'Open Standards',
  },
  {
    icon: '🔒',
    title: 'Full Data Ownership',
    subtitle: 'BYOK + JSON Export',
    description:
      'Bring your own OpenAI key. Export every note as PDF, Markdown, Word, or download your entire library as portable JSON.',
    color: 'violet',
    gradient: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/30',
    glow: 'shadow-violet-500/20',
    badge: 'Zero Lock-In',
  },
];

const STEPS = [
  { emoji: '📥', label: 'Capture', desc: 'Text, PDFs, Word docs, URLs, voice' },
  { emoji: '💡', label: 'Understand', desc: 'AI summarizes & extracts key ideas' },
  { emoji: '🔗', label: 'Connect', desc: 'Knowledge graph links related notes' },
  { emoji: '🔁', label: 'Recall', desc: 'SM-2 flashcards build lasting memory' },
  { emoji: '✅', label: 'Act', desc: 'Tasks & action items extracted instantly' },
];

const COMPARE = [
  { label: 'Grounded AI Chat (no hallucinations)', shortnotes: true, notion: false, obsidian: false, notebooklm: true },
  { label: 'Interactive Knowledge Graph', shortnotes: true, notion: false, obsidian: true, notebooklm: false },
  { label: 'Spaced Repetition (SM-2) Study Mode', shortnotes: true, notion: false, obsidian: false, notebooklm: false },
  { label: 'AI Task / Action Item Extraction', shortnotes: true, notion: false, obsidian: false, notebooklm: false },
  { label: 'Model Context Protocol (MCP) Server', shortnotes: true, notion: false, obsidian: false, notebooklm: false },
  { label: 'Bring Your Own Key (BYOK)', shortnotes: true, notion: false, obsidian: false, notebooklm: false },
  { label: 'Full JSON Knowledge Export', shortnotes: true, notion: true, obsidian: true, notebooklm: false },
  { label: 'Offline PWA Support', shortnotes: true, notion: false, obsidian: true, notebooklm: false },
];

const FAQS = [
  {
    q: 'How does Short Notes prevent AI hallucinations?',
    a: 'Every AI response is grounded using Retrieval-Augmented Generation (RAG). The system only synthesizes answers from excerpts it verifiably retrieved from your notes, and every claim is linked to a clickable [^1] citation footnote.',
  },
  {
    q: 'What is the Model Context Protocol (MCP) server?',
    a: 'Short Notes ships a production-grade Python MCP server (`notesmcp`). Configure it with your API key and use it from Claude Desktop, Cursor IDE, or any MCP-compatible agent to query, create, tag, and search your notes directly from your development workflow.',
  },
  {
    q: 'How does the Study Mode work?',
    a: 'Click "Generate Study Set" on any note. The AI produces 5–8 flashcards and a multiple-choice quiz. As you review each card, the SuperMemo SM-2 algorithm dynamically calculates the optimal next review date to maximize retention and eliminate forgetting curves.',
  },
  {
    q: 'Can I bring my own OpenAI API key?',
    a: 'Yes. In Settings → AI Engine, paste your personal OpenAI key and choose your preferred model (GPT-4o, GPT-4 Turbo, GPT-4o Mini). All inferences go directly from your browser to OpenAI without passing through any third party.',
  },
  {
    q: 'Is there any vendor lock-in?',
    a: 'Zero lock-in. Export individual notes as PDF, Word (.docx), Markdown (.md), or HTML from the editor. Download your entire knowledge library as a portable JSON archive with one click under Settings → Data Portability.',
  },
];

// ─── Main component ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cardRated, setCardRated] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState<number | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const notesCount = useCounter(12800, 2500, statsVisible);
  const usersCount = useCounter(4700, 2200, statsVisible);
  const cardsCount = useCounter(89000, 2800, statsVisible);

  // Scroll-based nav opacity
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // IntersectionObserver for stats counter
  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.4 }
    );
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const handleCardRate = (label: string) => {
    setCardRated(`Rated "${label}" — Next review scheduled by SM-2 ✓`);
    setTimeout(() => { setCardFlipped(false); setCardRated(null); }, 2600);
  };

  return (
    <div className="min-h-screen bg-[#060810] text-slate-100 overflow-x-hidden selection:bg-indigo-500/40">

      {/* ═══════════════════ STICKY NAVBAR ═══════════════════ */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#060810]/90 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/20' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <span className="text-white text-lg">📝</span>
            </div>
            <div className="leading-none">
              <div className="font-extrabold text-white text-base tracking-tight">Short Notes</div>
              <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">AI Second Brain</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
            {['Features', 'Demo', 'Compare', 'Philosophy', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <button className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all">
                Sign In
              </button>
            </Link>
            <Link href="/register">
              <button className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all">
                Start Free →
              </button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-300 p-2 rounded-lg hover:bg-white/5">
            <span className="text-xl">{mobileOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0a0c16] border-t border-white/5 p-5 space-y-4">
            <nav className="flex flex-col gap-3 text-sm font-medium text-slate-300">
              {['Features', 'Demo', 'Compare', 'Philosophy', 'FAQ'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)} className="hover:text-white py-1">
                  {item}
                </a>
              ))}
            </nav>
            <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full text-sm font-medium text-white border border-white/10 py-2.5 rounded-xl hover:bg-white/5 transition-all">
                  Sign In
                </button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <button className="w-full text-sm font-semibold text-white bg-indigo-600 py-2.5 rounded-xl shadow-md shadow-indigo-600/25">
                  Start Free →
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative pt-32 pb-24 px-5 text-center overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-radial from-indigo-600/25 via-purple-600/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-40 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute top-60 -right-32 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold tracking-wide mb-8 shadow-sm shadow-indigo-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Version 2.0 — Now with Spaced Repetition, Knowledge Graph & Developer API
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] mb-6">
            <span className="text-white">Your Personal</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-pink-400 bg-clip-text text-transparent">
              AI Second Brain.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-4">
            Capture, understand, connect, recall, and act on every piece of knowledge — with grounded AI that never hallucinates.
          </p>

          {/* Philosophy flow */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 mt-6">
            {STEPS.map((step, i) => (
              <span key={step.label} className="flex items-center gap-2 text-xs font-medium">
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-200 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-colors cursor-default">
                  {step.emoji} {step.label}
                </span>
                {i < STEPS.length - 1 && <span className="text-slate-600">→</span>}
              </span>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register">
              <button className="group flex items-center gap-2 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all">
                Launch Your Second Brain
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </Link>
            <a href="#demo">
              <button className="text-base font-medium text-slate-300 border border-white/10 hover:border-white/20 hover:bg-white/5 px-8 py-4 rounded-2xl transition-all">
                See Interactive Demo ↓
              </button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-xs text-slate-400">
            {[
              { icon: '✦', text: 'Traceable Citations — No Hallucinations' },
              { icon: '✦', text: 'SuperMemo SM-2 Active Recall' },
              { icon: '✦', text: 'MCP + REST Developer API' },
              { icon: '✦', text: 'Full Data Portability (JSON/PDF/MD)' },
            ].map((b) => (
              <div key={b.text} className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-0.5 shrink-0">{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <div ref={statsRef} className="border-y border-white/5 bg-white/[0.02] py-12 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-black text-white tabular-nums">{notesCount.toLocaleString()}+</div>
            <div className="text-sm text-slate-400 mt-1">Notes Captured & Processed</div>
          </div>
          <div>
            <div className="text-4xl font-black text-white tabular-nums">{usersCount.toLocaleString()}+</div>
            <div className="text-sm text-slate-400 mt-1">Knowledge Workers Trust Us</div>
          </div>
          <div>
            <div className="text-4xl font-black text-white tabular-nums">{cardsCount.toLocaleString()}+</div>
            <div className="text-sm text-slate-400 mt-1">Flashcards Reviewed with SM-2</div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ INTERACTIVE DEMO ═══════════════════ */}
      <section id="demo" className="max-w-6xl mx-auto px-5 py-28">
        <div className="text-center mb-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">Live Playground</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Experience Short Notes 2.0 Right Now
          </h2>
          <p className="text-slate-400 mt-3 text-sm max-w-xl mx-auto">
            Three fully interactive demos — no account required.
          </p>
        </div>

        {/* Demo tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: '🧠 Grounded AI Chat', key: 0 },
            { label: '🎓 SM-2 Flashcard', key: 1 },
            { label: '📝 Markdown Editor', key: 2 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFeature(tab.key)}
              className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all border ${
                activeFeature === tab.key
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Demo panel */}
        <div className="bg-[#0b0d16] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/30 min-h-[420px]">

          {/* ── DEMO 0: AI Chat ── */}
          {activeFeature === 0 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-indigo-400">RAG Chat Demo</div>
                  <div className="text-sm text-slate-300 font-medium mt-0.5">Ask anything — click citations to inspect sources</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  ● Grounded Mode
                </span>
              </div>

              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-indigo-600/90 text-white text-sm px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-md shadow-md">
                  Summarize everything I know about PostgreSQL and when to use pgvector.
                </div>
              </div>

              {/* AI response */}
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-md text-base">
                  🧠
                </div>
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl rounded-tl-sm p-5 text-sm text-slate-200 leading-relaxed max-w-2xl">
                  <p>
                    Based on your <strong className="text-white">Database Architecture</strong> notes, PostgreSQL is your production standard for multi-tenant relational workloads with ACID compliance and row-level locking [^1].
                    For semantic similarity search and embedding-based retrieval, your notes recommend <strong className="text-white">pgvector</strong> with HNSW indexing — avoiding the latency and cost of external vector databases [^2].
                  </p>

                  {/* Citations */}
                  <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Source Citations</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 1, title: 'PostgreSQL Deep Dive', excerpt: 'PostgreSQL provides robust row-level concurrency, ACID compliance, and native JSON support — ideal for multi-tenant SaaS.' },
                        { id: 2, title: 'pgvector Notes', excerpt: 'HNSW indexes in pgvector deliver sub-millisecond approximate nearest-neighbor queries directly inside your existing Postgres cluster.' },
                      ].map((src) => (
                        <div key={src.id}>
                          <button
                            onClick={() => setActiveCitation(activeCitation === src.id ? null : src.id)}
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                              activeCitation === src.id
                                ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:border-indigo-400/40'
                            }`}
                          >
                            <span className="text-indigo-400 font-mono">[{src.id}]</span>
                            {src.title}
                          </button>
                          {activeCitation === src.id && (
                            <div className="mt-2 p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/25 text-xs text-slate-300 italic">
                              "{src.excerpt}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 text-center">
                ↑ Click citation pills to inspect the exact note excerpt — answers are always traceable.
              </div>
            </div>
          )}

          {/* ── DEMO 1: SM-2 Flashcard ── */}
          {activeFeature === 1 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-pink-400">SM-2 Flashcard Demo</div>
                  <div className="text-sm text-slate-300 font-medium mt-0.5">Click the card to reveal — then rate your recall</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400">
                  SuperMemo SM-2
                </span>
              </div>

              <div className="max-w-lg mx-auto">
                {/* Card */}
                <div
                  onClick={() => !cardRated && setCardFlipped(!cardFlipped)}
                  className={`cursor-pointer select-none min-h-[200px] rounded-2xl border p-7 flex flex-col justify-between transition-all duration-300 shadow-xl ${
                    cardFlipped
                      ? 'bg-gradient-to-br from-pink-950/40 to-[#0b0d16] border-pink-500/40'
                      : 'bg-white/[0.03] border-white/10 hover:border-pink-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className={`font-bold uppercase tracking-widest ${cardFlipped ? 'text-pink-400' : 'text-slate-400'}`}>
                      {cardFlipped ? '← Answer' : 'Question →'}
                    </span>
                    <span>Deck: Computer Science</span>
                  </div>

                  <div className="py-5 text-center">
                    <div className="text-lg md:text-xl font-semibold text-white leading-relaxed">
                      {cardFlipped
                        ? 'The CAP Theorem states you can guarantee at most two of: Consistency (all nodes see the same data), Availability (every request gets a response), and Partition Tolerance (system works despite dropped messages).'
                        : 'What does the CAP Theorem state about distributed database systems?'}
                    </div>
                  </div>

                  <div className="text-center text-xs text-slate-500">
                    {cardFlipped ? 'Rate your recall below' : 'Click to reveal answer'}
                  </div>
                </div>

                {/* Rating buttons */}
                {cardFlipped && !cardRated && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {[
                      { label: 'Again', sub: '<1 day', cls: 'border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300' },
                      { label: 'Hard', sub: '2 days', cls: 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300' },
                      { label: 'Good', sub: '5 days', cls: 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300' },
                      { label: 'Easy', sub: '12 days', cls: 'border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300' },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={(e) => { e.stopPropagation(); handleCardRate(btn.label); }}
                        className={`py-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-0.5 transition-all ${btn.cls}`}
                      >
                        <span>{btn.label}</span>
                        <span className="opacity-70 text-[10px]">{btn.sub}</span>
                      </button>
                    ))}
                  </div>
                )}

                {cardRated && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/25 text-emerald-300 text-sm text-center">
                    ✓ {cardRated}
                  </div>
                )}

                {!cardFlipped && !cardRated && (
                  <div className="text-center mt-4 text-xs text-slate-500">
                    AI generated this card from your note with 1 click. SM-2 auto-schedules next review.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DEMO 2: Markdown Editor ── */}
          {activeFeature === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-400">Live Markdown Editor</div>
                  <div className="text-sm text-slate-300 font-medium mt-0.5">Dual-pane editing with live preview and backlinks</div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Autosaved
                  </span>
                  <span className="text-slate-500">218 words · 1 min read</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Raw markdown pane */}
                <div className="bg-[#07090e] border border-white/[0.07] rounded-xl p-4 font-mono text-xs text-slate-300 leading-6 h-64 overflow-y-auto">
                  <div className="text-indigo-400 font-bold"># CAP Theorem — Distributed Systems</div>
                  <div className="text-slate-500 mt-1">*Last edited: 2 mins ago*</div>
                  <div className="mt-3 text-slate-300">
                    The **CAP Theorem** states that a distributed system can guarantee<br/>
                    at most **two** of the following three properties:
                  </div>
                  <div className="mt-2 text-slate-400">
                    - **C**onsistency — All nodes see identical data simultaneously<br/>
                    - **A**vailability — Every request gets a valid response<br/>
                    - **P**artition Tolerance — Works despite network failures
                  </div>
                  <div className="mt-3 text-emerald-400">
                    ## Related Notes<br/>
                    [[PostgreSQL pgvector]] · [[Eventual Consistency]]
                  </div>
                  <div className="mt-3 text-amber-400">
                    &gt; **Action Item:** Revisit after reading `distributed-systems.pdf`
                  </div>
                </div>

                {/* Rendered preview pane */}
                <div className="bg-white/[0.025] border border-white/[0.07] rounded-xl p-4 text-xs text-slate-200 leading-6 h-64 overflow-y-auto">
                  <h3 className="text-base font-black text-white mb-1">CAP Theorem — Distributed Systems</h3>
                  <p className="text-slate-500 italic mb-3">Last edited: 2 mins ago</p>
                  <p className="text-slate-300 mb-2">The <strong className="text-white">CAP Theorem</strong> states that a distributed system can guarantee at most <strong className="text-white">two</strong> of three properties:</p>
                  <ul className="space-y-1 text-slate-300 ml-4 list-disc mb-3">
                    <li><strong>C</strong>onsistency — All nodes see identical data simultaneously</li>
                    <li><strong>A</strong>vailability — Every request gets a valid response</li>
                    <li><strong>P</strong>artition Tolerance — Works despite network failures</li>
                  </ul>
                  <div className="border-t border-white/5 pt-2 mb-2">
                    <div className="text-xs font-bold text-slate-400 mb-1">🔗 Backlinks</div>
                    <div className="flex gap-2 flex-wrap">
                      {['PostgreSQL pgvector', 'Eventual Consistency'].map((link) => (
                        <span key={link} className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[11px] font-medium">
                          {link}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    <strong>⚡ Action Item:</strong> Revisit after reading distributed-systems.pdf
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500 text-center">
                [[Wikilinks]] auto-generate backlinks across your entire knowledge base.
              </div>
            </div>
          )}

          {/* Panel footer */}
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">All features included in the free tier. No credit card required.</p>
            <Link href="/register">
              <button className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl transition-all">
                Create Free Account →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES GRID ═══════════════════ */}
      <section id="features" className="max-w-7xl mx-auto px-5 py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">Core Capabilities</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything a Second Brain Should Be
          </h2>
          <p className="text-slate-400 mt-3 text-sm max-w-xl mx-auto">
            Six interconnected subsystems designed to work together — not six separate tools bolted together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`group relative bg-gradient-to-b ${f.gradient} border ${f.border} rounded-3xl p-7 hover:shadow-xl ${f.glow} hover:-translate-y-1 transition-all duration-300 cursor-default`}
            >
              <div className="text-4xl mb-5">{f.icon}</div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-extrabold text-white">{f.title}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${f.border} text-slate-300 shrink-0 ml-2`}>
                  {f.badge}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-400 mb-3">{f.subtitle}</div>
              <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ PHILOSOPHY SECTION ═══════════════════ */}
      <section id="philosophy" className="max-w-6xl mx-auto px-5 py-20 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">Our Philosophy</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-5">
              Knowledge Without Recall<br />
              <span className="text-slate-500">is Knowledge Wasted.</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-5 text-sm">
              The human brain doesn't work like a file system. Information decays exponentially — Ebbinghaus showed we forget 50% within a day. Short Notes 2.0 is designed around <strong className="text-white">cognitive science</strong>, not just file storage.
            </p>
            <p className="text-slate-400 leading-relaxed mb-8 text-sm">
              The <strong className="text-white">Capture → Understand → Connect → Recall → Act</strong> loop is not a marketing tagline — it's the operational model of every feature we built.
            </p>

            {/* Flow steps */}
            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <div key={step.label} className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-base shrink-0">
                    {step.emoji}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{i + 1}. {step.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: MCP / Developer card */}
          <div id="ecosystem">
            <div className="bg-[#0b0d16] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Window chrome */}
              <div className="h-10 bg-[#0e1120] border-b border-white/5 px-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/70" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/70" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-[11px] font-mono text-slate-500">short-notes-mcp-client.sh</span>
                <span className="text-[10px] text-indigo-400 font-semibold">MCP + REST API</span>
              </div>
              <pre className="p-6 text-xs font-mono text-slate-300 leading-6 overflow-x-auto">
{`# 1. Configure MCP server in Claude Desktop
export SHORT_NOTES_API_KEY="sn_live_a1b2..."

# 2. Search your knowledge base from CLI
curl "localhost:3000/api/v1/search?q=docker" \\
  -H "Authorization: Bearer sn_live_a1b2..."

# 3. Auto-capture a new note via REST API
curl -X POST "localhost:3000/api/v1/notes" \\
  -H "Authorization: Bearer sn_live_a1b2..." \\
  -d '{
    "title": "Sprint Retrospective",
    "content": "Key actions: ...",
    "tags": ["meeting", "engineering"]
  }'

# → Returns: { "note": { "id": "...", "title": "..." } }`}
              </pre>
              <div className="px-6 pb-6 flex items-center gap-3 text-xs text-slate-400 border-t border-white/5 pt-4">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Authenticated multi-tenant MCP + REST API · Generate keys in Settings
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ COMPARISON TABLE ═══════════════════ */}
      <section id="compare" className="max-w-5xl mx-auto px-5 py-20 border-t border-white/5">
        <div className="text-center mb-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">Competitive Landscape</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Short Notes 2.0 Compares
          </h2>
        </div>

        <div className="bg-[#0b0d16] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest py-4 px-6 w-1/2">Feature</th>
                  <th className="py-4 px-4 text-center">
                    <div className="text-xs font-black text-white">Short Notes</div>
                    <div className="text-[10px] text-indigo-400 mt-0.5">2.0</div>
                  </th>
                  <th className="py-4 px-4 text-center">
                    <div className="text-xs font-semibold text-slate-400">Notion</div>
                  </th>
                  <th className="py-4 px-4 text-center">
                    <div className="text-xs font-semibold text-slate-400">Obsidian</div>
                  </th>
                  <th className="py-4 px-4 text-center">
                    <div className="text-xs font-semibold text-slate-400">NotebookLM</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.015]' : ''}`}>
                    <td className="py-3 px-6 text-xs text-slate-300">{row.label}</td>
                    <td className="py-3 px-4 text-center text-base">{row.shortnotes ? '✅' : '❌'}</td>
                    <td className="py-3 px-4 text-center text-base">{row.notion ? '✅' : '❌'}</td>
                    <td className="py-3 px-4 text-center text-base">{row.obsidian ? '✅' : '❌'}</td>
                    <td className="py-3 px-4 text-center text-base">{row.notebooklm ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section id="faq" className="max-w-3xl mx-auto px-5 py-20 border-t border-white/5">
        <div className="text-center mb-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">Frequently Asked Questions</div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Got Questions?</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-[#0b0d16] border border-white/10 rounded-2xl overflow-hidden transition-all">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-semibold text-sm text-white hover:bg-white/[0.02] transition-colors"
              >
                <span>{faq.q}</span>
                <span className={`text-indigo-400 text-lg shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>
                  ↓
                </span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-[#0e1020] to-violet-950 border border-indigo-500/30 p-10 sm:p-16 text-center shadow-2xl">
          {/* Decorative glows */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="text-4xl mb-5">🚀</div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Stop Losing Your Best Ideas.
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8">
              Build a knowledge base that works for you — capture anything, understand everything, and remember it forever.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <button className="group flex items-center gap-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-10 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all text-base">
                  Build Your Second Brain — Free
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </Link>
              <Link href="/login">
                <button className="font-medium text-slate-300 border border-white/15 hover:border-white/25 hover:bg-white/5 px-8 py-4 rounded-2xl transition-all text-sm">
                  Sign In to Existing Vault
                </button>
              </Link>
            </div>
            <p className="text-slate-500 text-xs mt-6">No credit card required · Full data portability · BYOK supported</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t border-white/5 bg-[#040608] py-10 px-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm shadow-md">
              📝
            </div>
            <div>
              <span className="font-bold text-white text-sm">Short Notes 2.0</span>
              <span className="ml-2">— AI-Powered Personal Knowledge Management</span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
            <a href="#demo" className="hover:text-slate-300 transition-colors">Demo</a>
            <a href="#compare" className="hover:text-slate-300 transition-colors">Compare</a>
            <a href="#faq" className="hover:text-slate-300 transition-colors">FAQ</a>
            <Link href="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Start Free</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
