'use client';

import { useEffect, useState } from 'react';
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
  FileUp,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Send,
  Loader2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/helpers';

interface Note {
  id: string;
  title: string;
  summary: string;
  content: string;
  isPinned: boolean;
  isFavorite: boolean;
  sourceType: string;
  folder?: { name: string; color?: string };
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [pinnedNotes, setPinnedNotes] = useState<Note[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [totalFolders, setTotalFolders] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Capture State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickText, setQuickText] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [notesRes, foldersRes, pinnedRes, favRes] = await Promise.all([
          axios.get('/api/notes?limit=6'),
          axios.get('/api/folders'),
          axios.get('/api/notes?pinned=true&limit=4'),
          axios.get('/api/notes?favorite=true&limit=1'),
        ]);

        const notesData = notesRes.data?.data || notesRes.data;
        setRecentNotes(notesData?.notes || []);
        setTotalNotes(notesData?.total || 0);

        const foldersData = foldersRes.data?.data || foldersRes.data || [];
        setTotalFolders(foldersData.length || 0);

        const pinnedData = pinnedRes.data?.data || pinnedRes.data;
        setPinnedNotes(pinnedData?.notes || []);

        const favData = favRes.data?.data || favRes.data;
        setFavoritesCount(favData?.total || 0);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleQuickCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim()) {
      toast.error('Please enter note content');
      return;
    }

    setIsCapturing(true);
    try {
      const res = await axios.post('/api/notes', {
        title: quickTitle.trim() || 'Quick Note',
        originalText: quickText,
        sourceType: 'manual',
      });
      const newNote = res.data?.data;
      if (newNote) {
        setRecentNotes((prev) => [newNote, ...prev.slice(0, 5)]);
        setTotalNotes((prev) => prev + 1);
        setQuickTitle('');
        setQuickText('');
        toast.success('Note captured successfully!');
      }
    } catch (err) {
      toast.error('Failed to capture note');
    } finally {
      setIsCapturing(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-card p-6 sm:p-8 rounded-2xl border border-primary/20 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-primary">
            Personal Knowledge Workspace
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
            {getGreeting()}, {session?.user?.name || 'Explorer'}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-xl">
            Your personal second brain is active. Capture ideas, review key insights, or let AI organize your thoughts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/new">
            <Button size="sm" className="shadow-xs gap-2">
              <Plus className="w-4 h-4" /> New Note
            </Button>
          </Link>
          <Link href="/dashboard/new">
            <Button size="sm" variant="outline" className="gap-2 bg-card">
              <FileUp className="w-4 h-4" /> Upload Document
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/notes" className="group">
          <div className="bg-card hover:bg-accent/40 p-5 rounded-xl border border-border group-hover:border-primary/40 shadow-xs transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Notes</span>
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{totalNotes}</p>
            <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              Active in your knowledge base
            </span>
          </div>
        </Link>

        <Link href="/dashboard/folders" className="group">
          <div className="bg-card hover:bg-accent/40 p-5 rounded-xl border border-border group-hover:border-primary/40 shadow-xs transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Folders</span>
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                <FolderIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{totalFolders}</p>
            <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              Organized collections
            </span>
          </div>
        </Link>

        <Link href="/dashboard/notes" className="group">
          <div className="bg-card hover:bg-accent/40 p-5 rounded-xl border border-border group-hover:border-primary/40 shadow-xs transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Pinned Notes</span>
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <Pin className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{pinnedNotes.length}</p>
            <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              High priority access
            </span>
          </div>
        </Link>

        <Link href="/dashboard/notes" className="group">
          <div className="bg-card hover:bg-accent/40 p-5 rounded-xl border border-border group-hover:border-primary/40 shadow-xs transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Favorites</span>
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{favoritesCount}</p>
            <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              Bookmarked highlights
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Capture Box */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Instant Capture
          </h2>
          <span className="text-xs text-muted-foreground">Saves directly to your inbox</span>
        </div>

        <form onSubmit={handleQuickCapture} className="space-y-3">
          <Input
            placeholder="Title (optional, e.g. Meeting Idea, Article Snippet)..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="text-sm bg-background"
          />
          <textarea
            placeholder="Type your thought, paste text, or drop quick notes here..."
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            rows={3}
            className="w-full text-sm p-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed resize-none"
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">
              {quickText.length} characters
            </span>
            <Button size="sm" type="submit" disabled={isCapturing || !quickText.trim()} className="gap-2">
              {isCapturing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Capture Note
            </Button>
          </div>
        </form>
      </div>

      {/* Pinned Notes Shelf */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Pin className="w-4 h-4 text-amber-500 fill-amber-500" /> Pinned Notes
            </h2>
            <Link href="/dashboard/notes" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pinnedNotes.map((note) => (
              <Link
                key={note.id}
                href={`/dashboard/notes/${note.id}`}
                className="group bg-card hover:bg-accent/40 p-4 rounded-xl border border-border hover:border-amber-500/40 shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                    {note.summary || note.content}
                  </p>
                </div>
                <div className="pt-3 mt-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center justify-between">
                  <span>{formatDate(new Date(note.updatedAt))}</span>
                  {note.folder && <span>📁 {note.folder.name}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Recent Knowledge
          </h2>
          <Link href="/dashboard/notes" className="text-xs text-primary hover:underline flex items-center gap-1">
            Browse all notes ({totalNotes}) <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
            <p className="text-xs">Loading recent notes...</p>
          </div>
        ) : recentNotes.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border p-6">
            <p className="text-sm text-muted-foreground mb-3">You don&apos;t have any notes yet.</p>
            <Link href="/dashboard/new">
              <Button size="sm">Create Your First Note</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.map((note) => (
              <Link
                key={note.id}
                href={`/dashboard/notes/${note.id}`}
                className="group bg-card hover:bg-accent/40 p-5 rounded-xl border border-border hover:border-primary/40 shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {note.sourceType}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(new Date(note.updatedAt || note.createdAt))}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 mt-2 leading-relaxed">
                    {note.summary || note.content}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-border/60 text-xs font-medium text-primary flex items-center justify-between">
                  <span>Open note</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
