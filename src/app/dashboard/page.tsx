'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Folder as FolderIcon,
  Pin,
  Star,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  Send,
  Loader2,
  Calendar,
  Tag,
  Search,
  LayoutGrid,
  List,
  GraduationCap,
  BrainCircuit,
  CheckCircle2,
  Share2,
  Layers,
  Flame,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/helpers';

interface Folder {
  id: string;
  name: string;
  color?: string;
}

interface Note {
  id: string;
  title: string;
  summary: string;
  content: string;
  isPinned: boolean;
  isFavorite: boolean;
  sourceType: string;
  folder?: { name: string; color?: string; id?: string };
  folderId?: string;
  createdAt: string;
  updatedAt: string;
}

type CaptureMode = 'note' | 'idea' | 'task' | 'resource';
type FilterMode = 'all' | 'pinned' | 'favorites';

const SUGGESTED_TAGS = ['#ai', '#architecture', '#meeting', '#research', '#todo', '#ideas', '#distributed-systems'];

const AI_SUGGESTED_PROMPTS = [
  'Summarize my notes on distributed systems & CAP theorem',
  'What are my highest priority action items?',
  'Explain pgvector HNSW indexing advantages from my notes',
  'Find connections between my architecture and roadmap notes',
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Dashboard Data State
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [totalFolders, setTotalFolders] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [pinnedCount, setPinnedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Capture State
  const [captureMode, setCaptureMode] = useState<CaptureMode>('note');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickText, setQuickText] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [quickPinned, setQuickPinned] = useState(false);
  const [quickFavorite, setQuickFavorite] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  // Explorer State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [notesRes, foldersRes, pinnedRes, favRes] = await Promise.all([
          axios.get('/api/notes?limit=12'),
          axios.get('/api/folders'),
          axios.get('/api/notes?pinned=true&limit=10'),
          axios.get('/api/notes?favorite=true&limit=10'),
        ]);

        const notesData = notesRes.data?.data || notesRes.data;
        const allNotesList = notesData?.notes || [];
        setRecentNotes(allNotesList);
        setTotalNotes(notesData?.total || allNotesList.length || 0);

        const foldersData = foldersRes.data?.data || foldersRes.data || [];
        if (Array.isArray(foldersData)) {
          setFolders(foldersData);
          setTotalFolders(foldersData.length);
        }

        const pinnedData = pinnedRes.data?.data || pinnedRes.data;
        const pinnedList = pinnedData?.notes || [];
        setPinnedCount(pinnedData?.total || pinnedList.length || 0);

        const favData = favRes.data?.data || favRes.data;
        const favList = favData?.notes || [];
        setFavoritesCount(favData?.total || favList.length || 0);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Quick capture submission
  const handleQuickCapture = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickText.trim()) {
      toast.error('Please enter note content');
      return;
    }

    setIsCapturing(true);
    try {
      // Append active tags if any
      const tagSuffix = activeTags.length > 0 ? `\n\n${activeTags.join(' ')}` : '';
      const fullText = `${quickText.trim()}${tagSuffix}`;

      let defaultTitle = 'Quick Note';
      if (captureMode === 'idea') defaultTitle = '💡 New Idea';
      if (captureMode === 'task') defaultTitle = '⚡ Action Item';
      if (captureMode === 'resource') defaultTitle = '🔗 Web Snippet';

      const res = await axios.post('/api/notes', {
        title: quickTitle.trim() || defaultTitle,
        originalText: fullText,
        sourceType: captureMode,
        folderId: selectedFolderId || undefined,
        isPinned: quickPinned,
        isFavorite: quickFavorite,
      });

      const newNote = res.data?.data;
      if (newNote) {
        setRecentNotes((prev) => [newNote, ...prev]);
        setTotalNotes((prev) => prev + 1);
        if (quickPinned) setPinnedCount((prev) => prev + 1);
        if (quickFavorite) setFavoritesCount((prev) => prev + 1);

        setQuickTitle('');
        setQuickText('');
        setActiveTags([]);
        setQuickPinned(false);
        setQuickFavorite(false);
        toast.success('Captured to your Second Brain!', { icon: '✨' });
      }
    } catch {
      toast.error('Failed to capture note');
    } finally {
      setIsCapturing(false);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to capture
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleQuickCapture();
    }
  };

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Toggle favorite with optimistic update
  const handleToggleFavorite = async (noteId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI update
    setRecentNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isFavorite: !currentStatus } : n))
    );
    setFavoritesCount((prev) => (currentStatus ? Math.max(0, prev - 1) : prev + 1));

    try {
      await axios.put(`/api/notes/${noteId}`, { isFavorite: !currentStatus });
      toast.success(currentStatus ? 'Removed from favorites' : 'Added to favorites', {
        icon: currentStatus ? '☆' : '★',
      });
    } catch {
      // Revert on error
      setRecentNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, isFavorite: currentStatus } : n))
      );
      setFavoritesCount((prev) => (currentStatus ? prev + 1 : Math.max(0, prev - 1)));
      toast.error('Failed to update favorite status');
    }
  };

  // Toggle pin with optimistic update
  const handleTogglePin = async (noteId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI update
    setRecentNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isPinned: !currentStatus } : n))
    );
    setPinnedCount((prev) => (currentStatus ? Math.max(0, prev - 1) : prev + 1));

    try {
      await axios.put(`/api/notes/${noteId}`, { isPinned: !currentStatus });
      toast.success(currentStatus ? 'Unpinned note' : 'Pinned note to top', {
        icon: '📌',
      });
    } catch {
      // Revert on error
      setRecentNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, isPinned: currentStatus } : n))
      );
      setPinnedCount((prev) => (currentStatus ? prev + 1 : Math.max(0, prev - 1)));
      toast.error('Failed to update pin status');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Filtered notes computed based on search and active tab
  const filteredNotes = useMemo(() => {
    return recentNotes.filter((note) => {
      // Search filter
      const matchesSearch =
        !searchQuery.trim() ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.summary && note.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Tab filter
      if (filterMode === 'pinned') return note.isPinned;
      if (filterMode === 'favorites') return note.isFavorite;
      return true;
    });
  }, [recentNotes, searchQuery, filterMode]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* ═══════════════════ HERO WELCOME & TELEMETRY ═══════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/40 via-card to-purple-950/20 p-6 sm:p-8 border border-border shadow-md">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Second Brain 2.0 Active
              </span>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              {getGreeting()}, {session?.user?.name || 'Explorer'}! 👋
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
              Your personal knowledge engine is running. Ask questions across all documents, review due flashcards with SM-2, or capture new insights below.
            </p>

            {/* Live telemetry pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> RAG Grounded: Ready
              </span>
              <span className="text-border">•</span>
              <span className="inline-flex items-center gap-1 text-indigo-400 font-medium">
                <GraduationCap className="w-3.5 h-3.5" /> SM-2 Active Recall: Scheduled
              </span>
              <span className="text-border">•</span>
              <span className="inline-flex items-center gap-1 text-purple-400 font-medium">
                <Share2 className="w-3.5 h-3.5" /> Knowledge Graph: Synced
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href="/dashboard/new">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/25 gap-2 h-9 px-4 rounded-xl">
                <Plus className="w-4 h-4" /> New Note
              </Button>
            </Link>
            <Link href="/dashboard/ai">
              <Button size="sm" variant="outline" className="border-border hover:bg-accent gap-2 h-9 px-3.5 rounded-xl">
                <BrainCircuit className="w-4 h-4 text-purple-400" /> Ask AI
              </Button>
            </Link>
            <Link href="/dashboard/study">
              <Button size="sm" variant="outline" className="border-border hover:bg-accent gap-2 h-9 px-3.5 rounded-xl">
                <GraduationCap className="w-4 h-4 text-indigo-400" /> Study Mode
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════ INTERACTIVE METRICS GRID ═══════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Notes */}
        <Link href="/dashboard/notes" className="group">
          <div className="bg-card hover:bg-accent/40 p-5 rounded-2xl border border-border group-hover:border-primary/40 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Notes
              </span>
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black mt-2 text-foreground tabular-nums">{totalNotes}</p>
            <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Indexed in second brain
            </span>
          </div>
        </Link>

        {/* Folders */}
        <Link href="/dashboard/folders" className="group">
          <div className="bg-card hover:bg-accent/40 p-5 rounded-2xl border border-border group-hover:border-primary/40 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Collections
              </span>
              <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl group-hover:scale-110 transition-transform">
                <FolderIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black mt-2 text-foreground tabular-nums">{totalFolders}</p>
            <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-purple-400" /> Organized namespaces
            </span>
          </div>
        </Link>

        {/* Pinned Notes */}
        <button
          type="button"
          onClick={() => setFilterMode(filterMode === 'pinned' ? 'all' : 'pinned')}
          className="group text-left"
        >
          <div className={`p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all ${
            filterMode === 'pinned'
              ? 'bg-amber-500/10 border-amber-500/40'
              : 'bg-card hover:bg-accent/40 border-border group-hover:border-amber-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pinned Notes
              </span>
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                <Pin className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black mt-2 text-foreground tabular-nums">{pinnedCount}</p>
            <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              {filterMode === 'pinned' ? '✓ Filter active' : 'Click to filter'}
            </span>
          </div>
        </button>

        {/* Favorites */}
        <button
          type="button"
          onClick={() => setFilterMode(filterMode === 'favorites' ? 'all' : 'favorites')}
          className="group text-left"
        >
          <div className={`p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all ${
            filterMode === 'favorites'
              ? 'bg-rose-500/10 border-rose-500/40'
              : 'bg-card hover:bg-accent/40 border-border group-hover:border-rose-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Favorites
              </span>
              <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl group-hover:scale-110 transition-transform">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black mt-2 text-foreground tabular-nums">{favoritesCount}</p>
            <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              {filterMode === 'favorites' ? '✓ Filter active' : 'Click to filter'}
            </span>
          </div>
        </button>
      </div>

      {/* ═══════════════════ SUPERCHARGED INSTANT CAPTURE ═══════════════════ */}
      <div className="bg-card p-6 sm:p-7 rounded-3xl border border-border shadow-sm space-y-4">
        {/* Capture Mode Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-foreground">Instant Knowledge Capture</h2>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs font-semibold">
            {[
              { key: 'note', label: '📝 Note' },
              { key: 'idea', label: '💡 Idea' },
              { key: 'task', label: '⚡ Action' },
              { key: 'resource', label: '🔗 Resource' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCaptureMode(tab.key as CaptureMode)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  captureMode === tab.key
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Capture Form */}
        <form onSubmit={handleQuickCapture} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Title */}
            <div className="md:col-span-8">
              <Input
                placeholder={
                  captureMode === 'idea'
                    ? 'Idea Title (e.g. Vector caching strategy)...'
                    : captureMode === 'task'
                    ? 'Task Title (e.g. Audit API authentication tokens)...'
                    : captureMode === 'resource'
                    ? 'Resource Title or Article URL...'
                    : 'Title (optional, e.g. Weekly Standup Notes)...'
                }
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="text-sm bg-background border-input rounded-xl h-10"
              />
            </div>

            {/* Folder selection dropdown */}
            <div className="md:col-span-4">
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full h-10 text-xs px-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">📁 No Folder (Inbox)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note content textarea */}
          <div className="relative">
            <textarea
              placeholder={
                captureMode === 'idea'
                  ? 'Describe your breakthrough idea, rationale, and next steps...'
                  : captureMode === 'task'
                  ? 'Define what needs to be done, deadlines, and prerequisites...'
                  : captureMode === 'resource'
                  ? 'Paste key excerpts, takeaways, or references...'
                  : 'Type your thoughts, paste research, or write notes here (press ⌘+Enter to save immediately)...'
              }
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              className="w-full text-sm p-3.5 rounded-2xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed resize-none transition-all placeholder:text-muted-foreground"
            />
          </div>

          {/* Quick Tag Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3" /> Quick Tags:
            </span>
            {SUGGESTED_TAGS.map((tag) => {
              const isSelected = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                      : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {/* Pin switch */}
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-foreground select-none">
                <input
                  type="checkbox"
                  checked={quickPinned}
                  onChange={(e) => setQuickPinned(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
                />
                <Pin className={`w-3.5 h-3.5 ${quickPinned ? 'text-amber-500 fill-amber-500' : ''}`} />
                <span>Pin note</span>
              </label>

              {/* Favorite switch */}
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-foreground select-none">
                <input
                  type="checkbox"
                  checked={quickFavorite}
                  onChange={(e) => setQuickFavorite(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
                />
                <Star className={`w-3.5 h-3.5 ${quickFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
                <span>Favorite</span>
              </label>

              <span className="hidden sm:inline-block">
                {quickText.trim() ? `${quickText.trim().split(/\s+/).length} words` : '0 words'}
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="hidden md:inline-block text-[11px] text-muted-foreground">
                <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px] font-mono">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px] font-mono">Enter</kbd>
              </span>
              <Button
                size="sm"
                type="submit"
                disabled={isCapturing || !quickText.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-5 h-9 shadow-md shadow-indigo-600/20 gap-2"
              >
                {isCapturing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Capture Note
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* ═══════════════════ "ASK YOUR SECOND BRAIN" PROMPT CLOUD ═══════════════════ */}
      <div className="bg-gradient-to-r from-purple-950/20 via-card to-indigo-950/20 p-5 sm:p-6 rounded-3xl border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-foreground">Ask Your Second Brain Anything</h3>
          </div>
          <Link href="/dashboard/ai" className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
            Open Full AI Chat <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          Click any prompt to launch a grounded RAG query across your personal knowledge base:
        </p>

        <div className="flex flex-wrap gap-2">
          {AI_SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => router.push(`/dashboard/ai?q=${encodeURIComponent(prompt)}`)}
              className="text-xs font-medium px-3.5 py-2 rounded-xl bg-background/80 hover:bg-background border border-border hover:border-purple-500/40 text-slate-300 hover:text-white transition-all text-left flex items-center gap-2 shadow-xs group"
            >
              <Sparkles className="w-3 h-3 text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════ RECENT KNOWLEDGE EXPLORER ═══════════════════ */}
      <div className="space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Recent Knowledge</h2>
            <span className="text-xs text-muted-foreground font-semibold px-2 py-0.5 rounded-full bg-muted">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
            </span>
          </div>

          {/* Search, Filter Pills & View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* In-place search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter recent notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-card border-input rounded-lg"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  filterMode === 'all'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('pinned')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  filterMode === 'pinned'
                    ? 'bg-background text-amber-500 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                📌 Pinned
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('favorites')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  filterMode === 'favorites'
                    ? 'bg-background text-rose-500 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ⭐ Starred
              </button>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1 rounded-md transition-all ${
                  viewMode === 'list' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                }`}
                aria-label="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Explorer */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
            <p className="text-xs font-medium">Loading your second brain...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-14 bg-card rounded-3xl border border-dashed border-border p-6 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-xl">
              📝
            </div>
            <h3 className="font-bold text-base text-foreground">
              {searchQuery ? 'No matching notes found' : 'Your knowledge base is ready'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? `No notes match "${searchQuery}". Try clearing your search or capture a new note.`
                : 'Capture your first note above or create a full document with markdown and wikilinks.'}
            </p>
            {searchQuery ? (
              <Button size="sm" variant="outline" onClick={() => setSearchQuery('')} className="text-xs">
                Clear Search Filter
              </Button>
            ) : (
              <Link href="/dashboard/new">
                <Button size="sm" className="bg-primary text-primary-foreground font-semibold rounded-xl">
                  Create First Note
                </Button>
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* ── GRID VIEW ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <Link
                key={note.id}
                href={`/dashboard/notes/${note.id}`}
                className="group relative bg-card hover:bg-accent/30 p-5 rounded-2xl border border-border hover:border-primary/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      {note.sourceType || 'note'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Pin button */}
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(note.id, note.isPinned, e)}
                        className={`p-1 rounded-md transition-colors ${
                          note.isPinned
                            ? 'text-amber-500 hover:bg-amber-500/10'
                            : 'text-muted-foreground hover:text-amber-500 hover:bg-accent'
                        }`}
                        title={note.isPinned ? 'Unpin note' : 'Pin note'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-500' : ''}`} />
                      </button>

                      {/* Favorite button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(note.id, note.isFavorite, e)}
                        className={`p-1 rounded-md transition-colors ${
                          note.isFavorite
                            ? 'text-rose-500 hover:bg-rose-500/10'
                            : 'text-muted-foreground hover:text-rose-500 hover:bg-accent'
                        }`}
                        title={note.isFavorite ? 'Remove from favorites' : 'Favorite note'}
                      >
                        <Star className={`w-3.5 h-3.5 ${note.isFavorite ? 'fill-rose-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-muted-foreground line-clamp-3 mt-2 leading-relaxed">
                    {note.summary || note.content}
                  </p>
                </div>

                {/* Footer metadata & quick actions */}
                <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                    {note.folder && (
                      <span className="truncate max-w-[120px] font-medium text-foreground flex items-center gap-1">
                        📁 {note.folder.name}
                      </span>
                    )}
                    <span>• {formatDate(new Date(note.updatedAt || note.createdAt))}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Open <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {filteredNotes.map((note) => (
              <Link
                key={note.id}
                href={`/dashboard/notes/${note.id}`}
                className="group p-4 flex items-center justify-between gap-4 hover:bg-accent/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2 rounded-xl bg-muted/60 text-muted-foreground shrink-0 group-hover:text-primary transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {note.title}
                      </h4>
                      {note.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                      {note.isFavorite && <Star className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-lg mt-0.5">
                      {note.summary || note.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                  {note.folder && (
                    <span className="hidden md:inline-block px-2 py-0.5 rounded bg-muted font-medium text-[11px]">
                      📁 {note.folder.name}
                    </span>
                  )}
                  <span className="hidden sm:inline-block text-[11px]">
                    {formatDate(new Date(note.updatedAt || note.createdAt))}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(note.id, note.isFavorite, e)}
                      className="p-1 hover:text-rose-500"
                    >
                      <Star className={`w-3.5 h-3.5 ${note.isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
                    </button>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
