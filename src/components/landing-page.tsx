'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Animated counter hook ───────────────────────────────────────────────────
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

// ─── Feature data ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '🧠',
    title: 'Grounded AI Chat',
    subtitle: 'RAG with Zero Hallucinations',
    description:
      'Ask anything about your personal library. Every answer cites the exact note it came from—never fabricated, always verifiable.',
    colorLight: 'from-indigo-50 to-purple-50 border-indigo-200',
    colorDark: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30',
    glow: 'shadow-indigo-500/20',
    badge: 'RAG Grounded',
    badgeLight: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    badgeDark: 'bg-indigo-500/10 text-slate-300 border-indigo-500/30',
  },
  {
    icon: '🕸️',
    title: 'Knowledge Graph',
    subtitle: 'Interactive Semantic Network',
    description:
      'Visualize hidden connections between ideas via [[Wikilinks]], shared tags, and backlinks in an interactive SVG canvas.',
    colorLight: 'from-emerald-50 to-teal-50 border-emerald-200',
    colorDark: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    badge: 'Visual Discovery',
    badgeLight: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    badgeDark: 'bg-emerald-500/10 text-slate-300 border-emerald-500/30',
  },
  {
    icon: '🎓',
    title: 'Active Recall (SM-2)',
    subtitle: 'Spaced Repetition Study Mode',
    description:
      'Turn any note into AI-generated flashcards and quizzes. The SuperMemo SM-2 algorithm schedules exactly when to review each card.',
    colorLight: 'from-pink-50 to-rose-50 border-pink-200',
    colorDark: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
    glow: 'shadow-pink-500/20',
    badge: 'SuperMemo SM-2',
    badgeLight: 'bg-pink-100 text-pink-700 border-pink-200',
    badgeDark: 'bg-pink-500/10 text-slate-300 border-pink-500/30',
  },
  {
    icon: '⚡',
    title: 'Task Extraction',
    subtitle: 'AI-Powered Action Engine',
    description:
      'One click turns meeting notes into prioritized Kanban tasks. Never lose an action item buried in a document again.',
    colorLight: 'from-amber-50 to-orange-50 border-amber-200',
    colorDark: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    glow: 'shadow-amber-500/20',
    badge: 'Kanban Board',
    badgeLight: 'bg-amber-100 text-amber-700 border-amber-200',
    badgeDark: 'bg-amber-500/10 text-slate-300 border-amber-500/30',
  },
  {
    icon: '🔌',
    title: 'MCP & Developer API',
    subtitle: 'Integrate with Any Agent',
    description:
      'Connect Short Notes to Claude Desktop, Cursor, or your own scripts via our authenticated MCP server and REST API.',
    colorLight: 'from-blue-50 to-cyan-50 border-blue-200',
    colorDark: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    glow: 'shadow-blue-500/20',
    badge: 'Open Standards',
    badgeLight: 'bg-blue-100 text-blue-700 border-blue-200',
    badgeDark: 'bg-blue-500/10 text-slate-300 border-blue-500/30',
  },
  {
    icon: '🔒',
    title: 'Full Data Ownership',
    subtitle: 'BYOK + JSON Export',
    description:
      'Bring your own OpenAI key. Export every note as PDF, Markdown, Word, or download your entire library as portable JSON.',
    colorLight: 'from-violet-50 to-purple-50 border-violet-200',
    colorDark: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
    glow: 'shadow-violet-500/20',
    badge: 'Zero Lock-In',
    badgeLight: 'bg-violet-100 text-violet-700 border-violet-200',
    badgeDark: 'bg-violet-500/10 text-slate-300 border-violet-500/30',
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

// ─── Theme-toggle button ──────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`relative h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200 border ${
        isDark
          ? 'bg-white/5 border-white/10 hover:bg-white/10 text-amber-300'
          : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
      }`}
    >
      {isDark ? (
        // Sun icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.166 17.834a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06l-1.59-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 6.166a.75.75 0 001.06-1.06L5.636 3.516a.75.75 0 00-1.06 1.06l1.59 1.59z" />
        </svg>
      ) : (
        // Moon icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const [isDark, setIsDark] = useState(false); // ← light theme is default
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

  // Persist theme in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sn-theme');
    if (stored === 'dark') setIsDark(true);
  }, []);

  const toggleTheme = () => {
    setIsDark((d) => {
      const next = !d;
      localStorage.setItem('sn-theme', next ? 'dark' : 'light');
      return next;
    });
  };

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

  // ── Semantic theme tokens ──────────────────────────────────────────────────
  const t = {
    // Page
    pageBg:        isDark ? 'bg-[#060810]'          : 'bg-white',
    pageText:      isDark ? 'text-slate-100'        : 'text-slate-900',
    // Navbar
    navBg:         isDark ? 'bg-[#060810]/90 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/20'
                          : 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm',
    navLink:       isDark ? 'text-slate-400 hover:text-white'  : 'text-slate-500 hover:text-slate-900',
    navSignIn:     isDark ? 'text-slate-300 hover:text-white hover:bg-white/5'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    mobileDrawer:  isDark ? 'bg-[#0a0c16] border-t border-white/5' : 'bg-white border-t border-slate-200',
    mobileLink:    isDark ? 'text-slate-300 hover:text-white'  : 'text-slate-600 hover:text-slate-900',
    mobileDivider: isDark ? 'border-white/5'   : 'border-slate-200',
    mobileBtn:     isDark ? 'text-white border border-white/10 hover:bg-white/5' : 'text-slate-700 border border-slate-200 hover:bg-slate-50',
    hamburger:     isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100',
    // Hero
    eyebrow:       isDark ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700',
    eyebrowDot:    isDark ? 'bg-indigo-400' : 'bg-indigo-500',
    heroSub:       isDark ? 'text-slate-400'        : 'text-slate-500',
    stepPill:      isDark ? 'bg-white/5 border-white/10 text-slate-200 hover:border-indigo-500/40 hover:bg-indigo-500/5'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50',
    stepArrow:     isDark ? 'text-slate-600'        : 'text-slate-300',
    heroBtnSecondary: isDark ? 'text-slate-300 border-white/10 hover:border-white/20 hover:bg-white/5'
                             : 'text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
    trustText:     isDark ? 'text-slate-400'        : 'text-slate-500',
    trustIcon:     isDark ? 'text-indigo-400'       : 'text-indigo-500',
    // Stats
    statsBorder:   isDark ? 'border-white/5 bg-white/[0.02]'  : 'border-slate-200 bg-slate-50',
    statsNum:      isDark ? 'text-white'            : 'text-slate-900',
    statsLabel:    isDark ? 'text-slate-400'        : 'text-slate-500',
    // Section dividers
    sectionBorder: isDark ? 'border-white/5'        : 'border-slate-200',
    // Subsection labels
    sectionLabel:  isDark ? 'text-indigo-400'       : 'text-indigo-600',
    sectionTitle:  isDark ? 'text-white'            : 'text-slate-900',
    sectionDesc:   isDark ? 'text-slate-400'        : 'text-slate-500',
    // Demo panel
    demoPanelBg:   isDark ? 'bg-[#0b0d16] border-white/10' : 'bg-white border-slate-200',
    demoTabActive: isDark ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                          : 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-200',
    demoTabInactive: isDark ? 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-white',
    demoHeaderBorder: isDark ? 'border-white/5'    : 'border-slate-100',
    demoLabel:     isDark ? 'text-slate-300'        : 'text-slate-700',
    demoFooterText: isDark ? 'text-slate-500'       : 'text-slate-400',
    // AI Chat demo
    aiRespBg:      isDark ? 'bg-white/[0.04] border-white/10 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700',
    citationBorder: isDark ? 'border-white/10'      : 'border-slate-100',
    citationLabel: isDark ? 'text-slate-500'        : 'text-slate-400',
    citationPillDef: isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:border-indigo-400/40'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-indigo-300',
    citationPillActive: isDark ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200'
                               : 'bg-indigo-50 border-indigo-300 text-indigo-700',
    citationExcerptBg: isDark ? 'bg-indigo-950/50 border-indigo-500/25 text-slate-300'
                              : 'bg-indigo-50 border-indigo-200 text-indigo-800',
    // Flashcard demo
    cardFront:     isDark ? 'bg-white/[0.03] border-white/10 hover:border-pink-500/30'
                          : 'bg-slate-50 border-slate-200 hover:border-pink-300',
    cardBack:      isDark ? 'bg-gradient-to-br from-pink-950/40 to-[#0b0d16] border-pink-500/40'
                          : 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-300',
    cardMeta:      isDark ? 'text-slate-500'        : 'text-slate-400',
    cardText:      isDark ? 'text-white'            : 'text-slate-900',
    cardHint:      isDark ? 'text-slate-500'        : 'text-slate-400',
    cardSuccess:   isDark ? 'bg-emerald-950/40 border-emerald-500/25 text-emerald-300'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700',
    cardFooter:    isDark ? 'text-slate-500'        : 'text-slate-400',
    // Markdown editor demo
    editorRaw:     isDark ? 'bg-[#07090e] border-white/[0.07] text-slate-300'
                          : 'bg-slate-900 border-slate-700 text-slate-200',
    editorPreview: isDark ? 'bg-white/[0.025] border-white/[0.07] text-slate-200'
                          : 'bg-white border-slate-200 text-slate-700',
    editorTitle:   isDark ? 'text-white'            : 'text-slate-900',
    editorMeta:    isDark ? 'text-slate-500'        : 'text-slate-400',
    editorBorder:  isDark ? 'border-white/5'        : 'border-slate-100',
    backlinkBg:    isDark ? 'bg-indigo-500/15 text-indigo-300' : 'bg-indigo-50 text-indigo-600',
    // Features grid
    featureTitle:  isDark ? 'text-white'            : 'text-slate-900',
    featureDesc:   isDark ? 'text-slate-400'        : 'text-slate-500',
    // Philosophy
    philoMuted:    isDark ? 'text-slate-500'        : 'text-slate-400',
    philoBody:     isDark ? 'text-slate-400'        : 'text-slate-500',
    stepIcon:      isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200',
    stepTitle:     isDark ? 'text-white'            : 'text-slate-900',
    stepDesc:      isDark ? 'text-slate-400'        : 'text-slate-500',
    // MCP card
    mcpCard:       isDark ? 'bg-[#0b0d16] border-white/10' : 'bg-slate-900 border-slate-700',
    mcpChrome:     isDark ? 'bg-[#0e1120] border-white/5' : 'bg-slate-800 border-slate-700',
    mcpLabel:      isDark ? 'text-slate-500'        : 'text-slate-400',
    // Comparison table
    tableBg:       isDark ? 'bg-[#0b0d16] border-white/10' : 'bg-white border-slate-200',
    tableHead:     isDark ? 'border-white/10'       : 'border-slate-200',
    tableHeadText: isDark ? 'text-slate-400'        : 'text-slate-500',
    tableRow:      isDark ? 'border-white/5'        : 'border-slate-100',
    tableAlt:      isDark ? 'bg-white/[0.015]'      : 'bg-slate-50',
    tableCell:     isDark ? 'text-slate-300'        : 'text-slate-600',
    // FAQ
    faqBg:         isDark ? 'bg-[#0b0d16] border-white/10' : 'bg-white border-slate-200',
    faqQ:          isDark ? 'text-white hover:bg-white/[0.02]' : 'text-slate-900 hover:bg-slate-50',
    faqA:          isDark ? 'text-slate-400 border-white/5' : 'text-slate-500 border-slate-100',
    // CTA
    ctaBg:         isDark ? 'bg-gradient-to-br from-indigo-950 via-[#0e1020] to-violet-950 border-indigo-500/30'
                          : 'bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 border-indigo-400/30',
    ctaText:       isDark ? 'text-white'            : 'text-white',
    ctaSub:        isDark ? 'text-slate-300'        : 'text-indigo-100',
    ctaBtnSec:     isDark ? 'text-slate-300 border-white/15 hover:border-white/25 hover:bg-white/5'
                          : 'text-white border-white/30 hover:border-white/50 hover:bg-white/10',
    ctaFine:       isDark ? 'text-slate-500'        : 'text-indigo-200',
    // Footer
    footerBg:      isDark ? 'border-white/5 bg-[#040608]' : 'border-slate-200 bg-slate-50',
    footerText:    isDark ? 'text-slate-500'        : 'text-slate-400',
    footerBrand:   isDark ? 'text-white'            : 'text-slate-900',
    footerLink:    isDark ? 'hover:text-slate-300'  : 'hover:text-slate-700',
    footerCta:     isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700',
  };

  return (
    <div className={`min-h-screen ${t.pageBg} ${t.pageText} overflow-x-hidden transition-colors duration-300 selection:bg-indigo-500/30`}>

      {/* ═══════════════════ STICKY NAVBAR ═══════════════════ */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? t.navBg : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <span className="text-white text-lg">📝</span>
            </div>
            <div className="leading-none">
              <div className={`font-extrabold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Short Notes</div>
              <div className="text-[10px] text-indigo-500 font-semibold uppercase tracking-widest">AI Second Brain</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className={`hidden md:flex items-center gap-7 text-sm font-medium ${t.navLink}`}>
            {['Features', 'Demo', 'Compare', 'Philosophy', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="transition-colors">
                {item}
              </a>
            ))}
          </nav>

          {/* CTA + Theme toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <Link href="/login">
              <button className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${t.navSignIn}`}>
                Sign In
              </button>
            </Link>
            <Link href="/register">
              <button className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all">
                Start Free →
              </button>
            </Link>
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <button onClick={() => setMobileOpen(!mobileOpen)} className={`p-2 rounded-lg ${t.hamburger}`}>
              <span className="text-xl">{mobileOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className={`md:hidden ${t.mobileDrawer} p-5 space-y-4`}>
            <nav className={`flex flex-col gap-3 text-sm font-medium ${t.mobileLink}`}>
              {['Features', 'Demo', 'Compare', 'Philosophy', 'FAQ'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)} className="py-1">
                  {item}
                </a>
              ))}
            </nav>
            <div className={`pt-3 border-t ${t.mobileDivider} flex flex-col gap-2`}>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className={`w-full text-sm font-medium py-2.5 rounded-xl transition-all ${t.mobileBtn}`}>
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
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-3xl ${isDark ? 'bg-gradient-radial from-indigo-600/25 via-purple-600/10 to-transparent' : 'bg-gradient-radial from-indigo-100/80 via-purple-100/40 to-transparent'}`} />
          <div className={`absolute top-40 -left-32 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-blue-600/10' : 'bg-blue-100/60'}`} />
          <div className={`absolute top-60 -right-32 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-violet-600/15' : 'bg-violet-100/60'}`} />
          {/* Grid */}
          <div
            className="absolute inset-0"
            style={{
              opacity: isDark ? 0.03 : 0.04,
              backgroundImage:
                `linear-gradient(${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)'} 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Eyebrow badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wide mb-8 shadow-sm ${t.eyebrow}`}>
            <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${t.eyebrowDot}`} />
            Version 2.0 — Now with Spaced Repetition, Knowledge Graph & Developer API
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] mb-6">
            <span className={isDark ? 'text-white' : 'text-slate-900'}>Your Personal</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              AI Second Brain.
            </span>
          </h1>

          <p className={`text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-4 ${t.heroSub}`}>
            Capture, understand, connect, recall, and act on every piece of knowledge — with grounded AI that never hallucinates.
          </p>

          {/* Philosophy flow */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 mt-6">
            {STEPS.map((step, i) => (
              <span key={step.label} className="flex items-center gap-2 text-xs font-medium">
                <span className={`px-3 py-1.5 rounded-full border transition-colors cursor-default ${t.stepPill}`}>
                  {step.emoji} {step.label}
                </span>
                {i < STEPS.length - 1 && <span className={t.stepArrow}>→</span>}
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
              <button className={`text-base font-medium border px-8 py-4 rounded-2xl transition-all ${t.heroBtnSecondary}`}>
                See Interactive Demo ↓
              </button>
            </a>
          </div>

          {/* Trust badges */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-xs ${t.trustText}`}>
            {[
              { icon: '✦', text: 'Traceable Citations — No Hallucinations' },
              { icon: '✦', text: 'SuperMemo SM-2 Active Recall' },
              { icon: '✦', text: 'MCP + REST Developer API' },
              { icon: '✦', text: 'Full Data Portability (JSON/PDF/MD)' },
            ].map((b) => (
              <div key={b.text} className="flex items-start gap-1.5">
                <span className={`mt-0.5 shrink-0 ${t.trustIcon}`}>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <div ref={statsRef} className={`border-y py-12 px-5 ${t.statsBorder}`}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className={`text-4xl font-black tabular-nums ${t.statsNum}`}>{notesCount.toLocaleString()}+</div>
            <div className={`text-sm mt-1 ${t.statsLabel}`}>Notes Captured & Processed</div>
          </div>
          <div>
            <div className={`text-4xl font-black tabular-nums ${t.statsNum}`}>{usersCount.toLocaleString()}+</div>
            <div className={`text-sm mt-1 ${t.statsLabel}`}>Knowledge Workers Trust Us</div>
          </div>
          <div>
            <div className={`text-4xl font-black tabular-nums ${t.statsNum}`}>{cardsCount.toLocaleString()}+</div>
            <div className={`text-sm mt-1 ${t.statsLabel}`}>Flashcards Reviewed with SM-2</div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ INTERACTIVE DEMO ═══════════════════ */}
      <section id="demo" className="max-w-6xl mx-auto px-5 py-28">
        <div className="text-center mb-14">
          <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${t.sectionLabel}`}>Live Playground</div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${t.sectionTitle}`}>
            Experience Short Notes 2.0 Right Now
          </h2>
          <p className={`mt-3 text-sm max-w-xl mx-auto ${t.sectionDesc}`}>
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
                activeFeature === tab.key ? t.demoTabActive : t.demoTabInactive
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Demo panel */}
        <div className={`border rounded-3xl p-6 md:p-8 shadow-xl min-h-[420px] ${t.demoPanelBg}`}>

          {/* ── DEMO 0: AI Chat ── */}
          {activeFeature === 0 && (
            <div className="space-y-5">
              <div className={`flex items-center justify-between pb-4 border-b ${t.demoHeaderBorder}`}>
                <div>
                  <div className={`text-xs font-bold uppercase tracking-widest ${t.sectionLabel}`}>RAG Chat Demo</div>
                  <div className={`text-sm font-medium mt-0.5 ${t.demoLabel}`}>Ask anything — click citations to inspect sources</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-semibold">
                  ● Grounded Mode
                </span>
              </div>

              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-indigo-600 text-white text-sm px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-md shadow-md">
                  Summarize everything I know about PostgreSQL and when to use pgvector.
                </div>
              </div>

              {/* AI response */}
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-md text-base">
                  🧠
                </div>
                <div className={`border rounded-2xl rounded-tl-sm p-5 text-sm leading-relaxed max-w-2xl ${t.aiRespBg}`}>
                  <p>
                    Based on your <strong className={isDark ? 'text-white' : 'text-slate-900'}>Database Architecture</strong> notes, PostgreSQL is your production standard for multi-tenant relational workloads with ACID compliance and row-level locking [^1].
                    For semantic similarity search and embedding-based retrieval, your notes recommend <strong className={isDark ? 'text-white' : 'text-slate-900'}>pgvector</strong> with HNSW indexing — avoiding the latency and cost of external vector databases [^2].
                  </p>

                  {/* Citations */}
                  <div className={`mt-4 pt-3 border-t space-y-2 ${t.citationBorder}`}>
                    <div className={`text-[11px] font-bold uppercase tracking-widest ${t.citationLabel}`}>Source Citations</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 1, title: 'PostgreSQL Deep Dive', excerpt: 'PostgreSQL provides robust row-level concurrency, ACID compliance, and native JSON support — ideal for multi-tenant SaaS.' },
                        { id: 2, title: 'pgvector Notes', excerpt: 'HNSW indexes in pgvector deliver sub-millisecond approximate nearest-neighbor queries directly inside your existing Postgres cluster.' },
                      ].map((src) => (
                        <div key={src.id}>
                          <button
                            onClick={() => setActiveCitation(activeCitation === src.id ? null : src.id)}
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                              activeCitation === src.id ? t.citationPillActive : t.citationPillDef
                            }`}
                          >
                            <span className="text-indigo-500 font-mono">[{src.id}]</span>
                            {src.title}
                          </button>
                          {activeCitation === src.id && (
                            <div className={`mt-2 p-3 rounded-xl border text-xs italic ${t.citationExcerptBg}`}>
                              &ldquo;{src.excerpt}&rdquo;
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`text-xs text-center ${t.demoFooterText}`}>
                ↑ Click citation pills to inspect the exact note excerpt — answers are always traceable.
              </div>
            </div>
          )}

          {/* ── DEMO 1: SM-2 Flashcard ── */}
          {activeFeature === 1 && (
            <div className="space-y-5">
              <div className={`flex items-center justify-between pb-4 border-b ${t.demoHeaderBorder}`}>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-pink-500">SM-2 Flashcard Demo</div>
                  <div className={`text-sm font-medium mt-0.5 ${t.demoLabel}`}>Click the card to reveal — then rate your recall</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-600 font-semibold">
                  SuperMemo SM-2
                </span>
              </div>

              <div className="max-w-lg mx-auto">
                {/* Card */}
                <div
                  onClick={() => !cardRated && setCardFlipped(!cardFlipped)}
                  className={`cursor-pointer select-none min-h-[200px] rounded-2xl border p-7 flex flex-col justify-between transition-all duration-300 shadow-lg ${
                    cardFlipped ? t.cardBack : t.cardFront
                  }`}
                >
                  <div className={`flex items-center justify-between text-xs ${t.cardMeta}`}>
                    <span className={`font-bold uppercase tracking-widest ${cardFlipped ? 'text-pink-500' : ''}`}>
                      {cardFlipped ? '← Answer' : 'Question →'}
                    </span>
                    <span>Deck: Computer Science</span>
                  </div>

                  <div className="py-5 text-center">
                    <div className={`text-lg md:text-xl font-semibold leading-relaxed ${t.cardText}`}>
                      {cardFlipped
                        ? 'The CAP Theorem states you can guarantee at most two of: Consistency (all nodes see the same data), Availability (every request gets a response), and Partition Tolerance (system works despite dropped messages).'
                        : 'What does the CAP Theorem state about distributed database systems?'}
                    </div>
                  </div>

                  <div className={`text-center text-xs ${t.cardHint}`}>
                    {cardFlipped ? 'Rate your recall below' : 'Click to reveal answer'}
                  </div>
                </div>

                {/* Rating buttons */}
                {cardFlipped && !cardRated && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {[
                      { label: 'Again', sub: '<1 day', cls: 'border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-600' },
                      { label: 'Hard', sub: '2 days', cls: 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-600' },
                      { label: 'Good', sub: '5 days', cls: 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-600' },
                      { label: 'Easy', sub: '12 days', cls: 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-600' },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={(e) => { e.stopPropagation(); handleCardRate(btn.label); }}
                        className={`py-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-0.5 transition-all ${
                          isDark
                            ? btn.label === 'Again' ? 'border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300'
                              : btn.label === 'Hard' ? 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300'
                              : btn.label === 'Good' ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
                              : 'border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300'
                            : btn.cls
                        }`}
                      >
                        <span>{btn.label}</span>
                        <span className="opacity-70 text-[10px]">{btn.sub}</span>
                      </button>
                    ))}
                  </div>
                )}

                {cardRated && (
                  <div className={`mt-4 p-3 rounded-xl border text-sm text-center ${t.cardSuccess}`}>
                    ✓ {cardRated}
                  </div>
                )}

                {!cardFlipped && !cardRated && (
                  <div className={`text-center mt-4 text-xs ${t.cardFooter}`}>
                    AI generated this card from your note with 1 click. SM-2 auto-schedules next review.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DEMO 2: Markdown Editor ── */}
          {activeFeature === 2 && (
            <div className="space-y-4">
              <div className={`flex items-center justify-between pb-4 border-b ${t.demoHeaderBorder}`}>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-500">Live Markdown Editor</div>
                  <div className={`text-sm font-medium mt-0.5 ${t.demoLabel}`}>Dual-pane editing with live preview and backlinks</div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Autosaved
                  </span>
                  <span className={t.demoFooterText}>218 words · 1 min read</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Raw markdown pane */}
                <div className={`border rounded-xl p-4 font-mono text-xs leading-6 h-64 overflow-y-auto ${t.editorRaw}`}>
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
                <div className={`border rounded-xl p-4 text-xs leading-6 h-64 overflow-y-auto ${t.editorPreview}`}>
                  <h3 className={`text-base font-black mb-1 ${t.editorTitle}`}>CAP Theorem — Distributed Systems</h3>
                  <p className={`italic mb-3 ${t.editorMeta}`}>Last edited: 2 mins ago</p>
                  <p className={`mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>The <strong className={t.editorTitle}>CAP Theorem</strong> states that a distributed system can guarantee at most <strong className={t.editorTitle}>two</strong> of three properties:</p>
                  <ul className={`space-y-1 ml-4 list-disc mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <li><strong>C</strong>onsistency — All nodes see identical data simultaneously</li>
                    <li><strong>A</strong>vailability — Every request gets a valid response</li>
                    <li><strong>P</strong>artition Tolerance — Works despite network failures</li>
                  </ul>
                  <div className={`border-t pt-2 mb-2 ${t.editorBorder}`}>
                    <div className={`text-xs font-bold mb-1 ${t.editorMeta}`}>🔗 Backlinks</div>
                    <div className="flex gap-2 flex-wrap">
                      {['PostgreSQL pgvector', 'Eventual Consistency'].map((link) => (
                        <span key={link} className={`px-2 py-0.5 rounded text-[11px] font-medium ${t.backlinkBg}`}>
                          {link}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-400/30 text-amber-700">
                    <strong>⚡ Action Item:</strong> Revisit after reading distributed-systems.pdf
                  </div>
                </div>
              </div>
              <div className={`text-xs text-center ${t.demoFooterText}`}>
                [[Wikilinks]] auto-generate backlinks across your entire knowledge base.
              </div>
            </div>
          )}

          {/* Panel footer */}
          <div className={`mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${t.demoHeaderBorder}`}>
            <p className={`text-xs ${t.demoFooterText}`}>All features included in the free tier. No credit card required.</p>
            <Link href="/register">
              <button className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl transition-all">
                Create Free Account →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES GRID ═══════════════════ */}
      <section id="features" className={`max-w-7xl mx-auto px-5 py-20 border-t ${t.sectionBorder}`}>
        <div className="text-center mb-16">
          <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${t.sectionLabel}`}>Core Capabilities</div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${t.sectionTitle}`}>
            Everything a Second Brain Should Be
          </h2>
          <p className={`mt-3 text-sm max-w-xl mx-auto ${t.sectionDesc}`}>
            Six interconnected subsystems designed to work together — not six separate tools bolted together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`group relative bg-gradient-to-b border rounded-3xl p-7 hover:shadow-xl ${f.glow} hover:-translate-y-1 transition-all duration-300 cursor-default ${
                isDark ? f.colorDark : f.colorLight
              }`}
            >
              <div className="text-4xl mb-5">{f.icon}</div>
              <div className="flex items-start justify-between mb-2">
                <h3 className={`text-base font-extrabold ${t.featureTitle}`}>{f.title}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ml-2 ${
                  isDark ? f.badgeDark : f.badgeLight
                }`}>
                  {f.badge}
                </span>
              </div>
              <div className={`text-xs font-semibold mb-3 ${t.sectionDesc}`}>{f.subtitle}</div>
              <p className={`text-sm leading-relaxed ${t.featureDesc}`}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ PHILOSOPHY SECTION ═══════════════════ */}
      <section id="philosophy" className={`max-w-6xl mx-auto px-5 py-20 border-t ${t.sectionBorder}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${t.sectionLabel}`}>Our Philosophy</div>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-5 ${t.sectionTitle}`}>
              Knowledge Without Recall<br />
              <span className={t.philoMuted}>is Knowledge Wasted.</span>
            </h2>
            <p className={`leading-relaxed mb-5 text-sm ${t.philoBody}`}>
              The human brain doesn&apos;t work like a file system. Information decays exponentially — Ebbinghaus showed we forget 50% within a day. Short Notes 2.0 is designed around <strong className={isDark ? 'text-white' : 'text-slate-900'}>cognitive science</strong>, not just file storage.
            </p>
            <p className={`leading-relaxed mb-8 text-sm ${t.philoBody}`}>
              The <strong className={isDark ? 'text-white' : 'text-slate-900'}>Capture → Understand → Connect → Recall → Act</strong> loop is not a marketing tagline — it&apos;s the operational model of every feature we built.
            </p>

            {/* Flow steps */}
            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <div key={step.label} className="flex items-start gap-4">
                  <div className={`h-8 w-8 rounded-xl border flex items-center justify-center text-base shrink-0 ${t.stepIcon}`}>
                    {step.emoji}
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${t.stepTitle}`}>{i + 1}. {step.label}</div>
                    <div className={`text-xs mt-0.5 ${t.stepDesc}`}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: MCP / Developer card */}
          <div id="ecosystem">
            <div className={`border rounded-3xl overflow-hidden shadow-2xl ${t.mcpCard}`}>
              {/* Window chrome */}
              <div className={`h-10 border-b px-4 flex items-center justify-between ${t.mcpChrome}`}>
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/70" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/70" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
                </div>
                <span className={`text-[11px] font-mono ${t.mcpLabel}`}>short-notes-mcp-client.sh</span>
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
              <div className={`px-6 pb-6 flex items-center gap-3 text-xs border-t pt-4 ${t.mcpLabel} ${isDark ? 'border-white/5' : 'border-slate-700'}`}>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Authenticated multi-tenant MCP + REST API · Generate keys in Settings
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ COMPARISON TABLE ═══════════════════ */}
      <section id="compare" className={`max-w-5xl mx-auto px-5 py-20 border-t ${t.sectionBorder}`}>
        <div className="text-center mb-14">
          <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${t.sectionLabel}`}>Competitive Landscape</div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${t.sectionTitle}`}>
            How Short Notes 2.0 Compares
          </h2>
        </div>

        <div className={`border rounded-3xl overflow-hidden shadow-xl ${t.tableBg}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${t.tableHead}`}>
                  <th className={`text-left text-xs font-bold uppercase tracking-widest py-4 px-6 w-1/2 ${t.tableHeadText}`}>Feature</th>
                  <th className="py-4 px-4 text-center">
                    <div className={`text-xs font-black ${t.sectionTitle}`}>Short Notes</div>
                    <div className="text-[10px] text-indigo-500 mt-0.5">2.0</div>
                  </th>
                  <th className={`py-4 px-4 text-center text-xs font-semibold ${t.tableHeadText}`}>Notion</th>
                  <th className={`py-4 px-4 text-center text-xs font-semibold ${t.tableHeadText}`}>Obsidian</th>
                  <th className={`py-4 px-4 text-center text-xs font-semibold ${t.tableHeadText}`}>NotebookLM</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={i} className={`border-b ${t.tableRow} ${i % 2 === 0 ? t.tableAlt : ''}`}>
                    <td className={`py-3 px-6 text-xs ${t.tableCell}`}>{row.label}</td>
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
      <section id="faq" className={`max-w-3xl mx-auto px-5 py-20 border-t ${t.sectionBorder}`}>
        <div className="text-center mb-14">
          <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${t.sectionLabel}`}>Frequently Asked Questions</div>
          <h2 className={`text-3xl font-extrabold tracking-tight ${t.sectionTitle}`}>Got Questions?</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className={`border rounded-2xl overflow-hidden transition-all ${t.faqBg}`}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className={`w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-semibold text-sm transition-colors ${t.faqQ}`}
              >
                <span>{faq.q}</span>
                <span className={`text-indigo-500 text-lg shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>
                  ↓
                </span>
              </button>
              {openFaq === i && (
                <div className={`px-6 pb-5 text-sm leading-relaxed border-t pt-4 ${t.faqA}`}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <div className={`relative overflow-hidden rounded-3xl border p-10 sm:p-16 text-center shadow-2xl ${t.ctaBg}`}>
          {/* Decorative glows */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="text-4xl mb-5">🚀</div>
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight mb-4 ${t.ctaText}`}>
              Stop Losing Your Best Ideas.
            </h2>
            <p className={`text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8 ${t.ctaSub}`}>
              Build a knowledge base that works for you — capture anything, understand everything, and remember it forever.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <button className="group flex items-center gap-2 font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 hover:border-white/50 px-10 py-4 rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all text-base backdrop-blur-sm">
                  Build Your Second Brain — Free
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </Link>
              <Link href="/login">
                <button className={`font-medium border px-8 py-4 rounded-2xl transition-all text-sm ${t.ctaBtnSec}`}>
                  Sign In to Existing Vault
                </button>
              </Link>
            </div>
            <p className={`text-xs mt-6 ${t.ctaFine}`}>No credit card required · Full data portability · BYOK supported</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className={`border-t py-10 px-5 ${t.footerBg}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm shadow-md">
              📝
            </div>
            <div>
              <span className={`font-bold text-sm ${t.footerBrand}`}>Short Notes 2.0</span>
              <span className={`ml-2 ${t.footerText}`}>— AI-Powered Personal Knowledge Management</span>
            </div>
          </div>
          <nav className={`flex items-center gap-6 ${t.footerText}`}>
            <a href="#features" className={`transition-colors ${t.footerLink}`}>Features</a>
            <a href="#demo" className={`transition-colors ${t.footerLink}`}>Demo</a>
            <a href="#compare" className={`transition-colors ${t.footerLink}`}>Compare</a>
            <a href="#faq" className={`transition-colors ${t.footerLink}`}>FAQ</a>
            <Link href="/login" className={`transition-colors ${t.footerLink}`}>Sign In</Link>
            <Link href="/register" className={`font-semibold transition-colors ${t.footerCta}`}>Start Free</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
