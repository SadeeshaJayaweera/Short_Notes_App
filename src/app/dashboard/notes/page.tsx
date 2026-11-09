'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Trash2,
  Share2,
  Download,
  Star,
  Pin,
  FileText,
  Folder as FolderIcon,
  LayoutGrid,
  List as ListIcon,
  Loader2,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/helpers';

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface NoteTag {
  tag: Tag;
}

interface Note {
  id: string;
  title: string;
  summary: string;
  bulletPoints: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isFavorite: boolean;
  sourceType: string;
  folderId?: string;
  folder?: { id: string; name: string; color?: string };
  tags?: NoteTag[];
  sentiment?: string;
}

interface Folder {
  id: string;
  name: string;
  color?: string;
  _count?: { notes: number };
}

export default function NotesPage() {
  const { data: session } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'pinned' | 'favorite'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFolders = async () => {
    try {
      const res = await axios.get('/api/folders');
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data)) {
        setFolders(data);
      }
    } catch (err) {
      console.error('Error fetching folders:', err);
    }
  };

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '24',
      });
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedFolder) params.append('folderId', selectedFolder);
      if (filterType === 'pinned') params.append('pinned', 'true');
      if (filterType === 'favorite') params.append('favorite', 'true');

      const response = await axios.get(`/api/notes?${params.toString()}`);
      const payload = response.data?.data || response.data;
      const fetchedNotes = payload?.notes || (Array.isArray(payload) ? payload : []);
      setNotes(fetchedNotes);
      setTotalPages(payload?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, selectedFolder, filterType]);

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const deleteNote = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Move this note to trash?')) return;

    try {
      await axios.delete(`/api/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success('Note moved to trash');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, id: string, current: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: !current } : n))
    );

    try {
      await axios.put(`/api/notes/${id}`, { isFavorite: !current });
      toast.success(!current ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isFavorite: current } : n))
      );
      toast.error('Failed to update favorite');
    }
  };

  const togglePin = async (e: React.MouseEvent, id: string, current: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !current } : n))
    );

    try {
      await axios.put(`/api/notes/${id}`, { isPinned: !current });
      toast.success(!current ? 'Note pinned to top' : 'Note unpinned');
    } catch (error) {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isPinned: current } : n))
      );
      toast.error('Failed to update pin status');
    }
  };

  const handleShare = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await axios.post(`/api/notes/${id}/share`, { isPublic: true });
      const shareUrl = res.data?.shareUrl;
      if (shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!');
      } else {
        toast.success('Note shared successfully');
      }
    } catch (err) {
      toast.error('Failed to generate share link');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Notes</h1>
          <p className="text-muted-foreground mt-1">
            {notes.length} note{notes.length === 1 ? '' : 's'} displayed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/new">
            <Button className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, content, or summary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Folders</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                📁 {f.name} {f._count?.notes ? `(${f._count.notes})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          {/* Quick Filter Tabs */}
          <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-background shadow-xs text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('pinned')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'pinned'
                  ? 'bg-background shadow-xs text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pinned
            </button>
            <button
              onClick={() => setFilterType('favorite')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'favorite'
                  ? 'bg-background shadow-xs text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Favorites
            </button>
          </div>

          {/* Grid/List View Toggle */}
          <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
              }`}
              title="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notes Display */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
          <p className="text-sm font-medium">Loading your notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border p-8">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No notes found</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            {searchQuery
              ? `No notes matching "${searchQuery}". Try a different search term or clear the filter.`
              : 'Capture your first note, extract a PDF, or organize ideas into folders.'}
          </p>
          <Link href="/dashboard/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create First Note
            </Button>
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/dashboard/notes/${note.id}`}
              className="group block"
            >
              <div className="h-full bg-card hover:bg-accent/40 rounded-xl border border-border hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between relative">
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {note.isPinned && (
                        <span className="inline-flex items-center text-[11px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          <Pin className="w-3 h-3 mr-1 fill-amber-500" /> Pinned
                        </span>
                      )}
                      {note.folder && (
                        <span className="inline-flex items-center text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          <FolderIcon className="w-3 h-3 mr-1" /> {note.folder.name}
                        </span>
                      )}
                      {note.sourceType && note.sourceType !== 'manual' && (
                        <span className="inline-flex items-center text-[10px] uppercase font-bold text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                          {note.sourceType}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => toggleFavorite(e, note.id, note.isFavorite)}
                        className={`p-1 rounded-md hover:bg-muted transition-colors ${
                          note.isFavorite ? 'text-amber-500' : 'text-muted-foreground'
                        }`}
                        title={note.isFavorite ? 'Favorited' : 'Favorite'}
                      >
                        <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-amber-500' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => togglePin(e, note.id, note.isPinned)}
                        className={`p-1 rounded-md hover:bg-muted transition-colors ${
                          note.isPinned ? 'text-primary' : 'text-muted-foreground'
                        }`}
                        title={note.isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-primary' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors mb-2">
                    {note.title}
                  </h3>

                  {/* Summary / Preview */}
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
                    {note.summary || note.content || 'No preview available'}
                  </p>
                </div>

                <div>
                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {note.tags.slice(0, 3).map((nt) => (
                        <span
                          key={nt.tag.id}
                          className="text-[11px] bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-md font-medium"
                        >
                          #{nt.tag.name}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-[10px] text-muted-foreground self-center">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(new Date(note.updatedAt || note.createdAt))}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleShare(e, note.id)}
                        className="p-1 hover:text-foreground hover:bg-muted rounded transition-colors"
                        title="Share Note"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => deleteNote(e, note.id)}
                        className="p-1 hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden shadow-xs">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/dashboard/notes/${note.id}`}
              className="group flex items-center justify-between p-4 hover:bg-accent/40 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                <button
                  onClick={(e) => togglePin(e, note.id, note.isPinned)}
                  className={`p-1 rounded hover:bg-muted ${
                    note.isPinned ? 'text-primary' : 'text-muted-foreground/50'
                  }`}
                >
                  <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-primary' : ''}`} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-base truncate group-hover:text-primary transition-colors">
                      {note.title}
                    </h3>
                    {note.folder && (
                      <span className="text-[11px] bg-muted px-2 py-0.5 rounded text-muted-foreground shrink-0">
                        📁 {note.folder.name}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs truncate mt-0.5">
                    {note.summary || note.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                <span className="hidden sm:inline">
                  {formatDate(new Date(note.updatedAt || note.createdAt))}
                </span>
                <button
                  onClick={(e) => toggleFavorite(e, note.id, note.isFavorite)}
                  className={`p-1.5 rounded hover:bg-muted ${
                    note.isFavorite ? 'text-amber-500' : 'text-muted-foreground/60'
                  }`}
                >
                  <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-amber-500' : ''}`} />
                </button>
                <button
                  onClick={(e) => handleShare(e, note.id)}
                  className="p-1.5 rounded hover:bg-muted hover:text-foreground"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => deleteNote(e, note.id)}
                  className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
