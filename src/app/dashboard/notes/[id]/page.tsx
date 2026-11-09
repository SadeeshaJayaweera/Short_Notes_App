'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Save,
  Check,
  Clock,
  Sparkles,
  Download,
  Share2,
  Trash2,
  Star,
  Pin,
  Folder as FolderIcon,
  History,
  Eye,
  Edit3,
  Loader2,
  Plus,
  X,
  FileDown,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate, renderMarkdown } from '@/lib/helpers';

interface Tag {
  id: string;
  name: string;
}

interface NoteVersion {
  id: string;
  title: string;
  content: string;
  summary: string;
  createdAt: string;
}

interface Folder {
  id: string;
  name: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  originalText: string;
  summary: string;
  bulletPoints: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isFavorite: boolean;
  sourceType: string;
  fileName?: string;
  folderId?: string;
  folder?: Folder;
  tags?: { tag: Tag }[];
  versions?: NoteVersion[];
  sentiment?: string;
}

export default function NoteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [bulletPoints, setBulletPoints] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<string>('');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);

  // Load Note and Folders
  const fetchNote = useCallback(async () => {
    try {
      const [noteRes, folderRes] = await Promise.all([
        axios.get(`/api/notes/${params.id}`),
        axios.get('/api/folders'),
      ]);

      const noteData = noteRes.data?.data || noteRes.data;
      setNote(noteData);
      setTitle(noteData.title || '');
      setContent(noteData.content || noteData.originalText || '');
      setSummary(noteData.summary || '');
      setBulletPoints(noteData.bulletPoints || []);
      setFolderId(noteData.folderId || '');
      setIsPinned(noteData.isPinned || false);
      setIsFavorite(noteData.isFavorite || false);

      const fData = folderRes.data?.data || folderRes.data || [];
      if (Array.isArray(fData)) setFolders(fData);
    } catch (err: any) {
      toast.error('Failed to load note');
      router.push('/dashboard/notes');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        initialLoadRef.current = false;
      }, 500);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  // Debounced Autosave
  const triggerAutosave = useCallback(
    (newTitle: string, newContent: string, newSummary: string, newPoints: string[], newFolderId: string) => {
      if (initialLoadRef.current) return;
      setSaveStatus('unsaved');

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          await axios.put(`/api/notes/${params.id}`, {
            title: newTitle,
            content: newContent,
            summary: newSummary,
            bulletPoints: newPoints,
            folderId: newFolderId || null,
          });
          setSaveStatus('saved');
        } catch (err) {
          setSaveStatus('unsaved');
          console.error('Autosave failed:', err);
        }
      }, 800);
    },
    [params.id]
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    triggerAutosave(val, content, summary, bulletPoints, folderId);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    triggerAutosave(title, val, summary, bulletPoints, folderId);
  };

  const handleSummaryChange = (val: string) => {
    setSummary(val);
    triggerAutosave(title, content, val, bulletPoints, folderId);
  };

  const handleFolderChange = (newFId: string) => {
    setFolderId(newFId);
    triggerAutosave(title, content, summary, bulletPoints, newFId);
  };

  const handleAddBulletPoint = () => {
    const updated = [...bulletPoints, 'New key point'];
    setBulletPoints(updated);
    triggerAutosave(title, content, summary, updated, folderId);
  };

  const handleUpdateBulletPoint = (index: number, val: string) => {
    const updated = [...bulletPoints];
    updated[index] = val;
    setBulletPoints(updated);
    triggerAutosave(title, content, summary, updated, folderId);
  };

  const handleRemoveBulletPoint = (index: number) => {
    const updated = bulletPoints.filter((_, i) => i !== index);
    setBulletPoints(updated);
    triggerAutosave(title, content, summary, updated, folderId);
  };

  const togglePin = async () => {
    const next = !isPinned;
    setIsPinned(next);
    try {
      await axios.put(`/api/notes/${params.id}`, { isPinned: next });
      toast.success(next ? 'Note pinned' : 'Note unpinned');
    } catch {
      setIsPinned(!next);
      toast.error('Failed to update pin');
    }
  };

  const toggleFavorite = async () => {
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      await axios.put(`/api/notes/${params.id}`, { isFavorite: next });
      toast.success(next ? 'Added to favorites' : 'Removed from favorites');
    } catch {
      setIsFavorite(!next);
      toast.error('Failed to update favorite');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Move this note to trash?')) return;
    try {
      await axios.delete(`/api/notes/${params.id}`);
      toast.success('Note moved to trash');
      router.push('/dashboard/notes');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const handleShare = async () => {
    try {
      const res = await axios.post(`/api/notes/${params.id}/share`, { isPublic: true });
      const shareUrl = res.data?.shareUrl;
      if (shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Public share link copied to clipboard!');
      }
    } catch {
      toast.error('Failed to generate share link');
    }
  };

  // AI Assist Actions
  const runAiSummarize = async () => {
    setIsAiLoading(true);
    try {
      const res = await axios.post(`/api/notes/${params.id}/ai`, {
        action: 'summarize',
        text: content,
      });
      const data = res.data?.data;
      if (data?.summary) {
        setSummary(data.summary);
        if (data.bulletPoints?.length) setBulletPoints(data.bulletPoints);
        triggerAutosave(title, content, data.summary, data.bulletPoints || bulletPoints, folderId);
        toast.success('AI summary and bullet points generated!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI summarization failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  const runAiImprove = async () => {
    setIsAiLoading(true);
    try {
      const res = await axios.post(`/api/notes/${params.id}/ai`, {
        action: 'improve',
        text: content,
      });
      const improved = res.data?.data?.improvedText;
      if (improved) {
        setContent(improved);
        triggerAutosave(title, improved, summary, bulletPoints, folderId);
        toast.success('Content enhanced by AI!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI text improvement failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  const runAiTitle = async () => {
    setIsAiLoading(true);
    try {
      const res = await axios.post(`/api/notes/${params.id}/ai`, {
        action: 'title',
        text: content,
      });
      const newTitle = res.data?.data?.title;
      if (newTitle) {
        setTitle(newTitle);
        triggerAutosave(newTitle, content, summary, bulletPoints, folderId);
        toast.success('AI title generated!');
      }
    } catch (err: any) {
      toast.error('Failed to generate title');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Metrics
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
        <p className="text-sm">Loading note editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/notes">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              Notes
            </Button>
          </Link>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1 text-primary">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
                <Clock className="w-3.5 h-3.5" /> Unsaved changes
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          {/* Folder Selector */}
          <select
            value={folderId}
            onChange={(e) => handleFolderChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">No Folder</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                📁 {f.name}
              </option>
            ))}
          </select>

          {/* Pin */}
          <button
            onClick={togglePin}
            className={`p-2 rounded-md border border-border hover:bg-accent transition-colors ${
              isPinned ? 'text-primary bg-primary/10 border-primary/30' : 'text-muted-foreground'
            }`}
            title={isPinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'fill-primary' : ''}`} />
          </button>

          {/* Favorite */}
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-md border border-border hover:bg-accent transition-colors ${
              isFavorite ? 'text-amber-500 bg-amber-500/10 border-amber-500/30' : 'text-muted-foreground'
            }`}
            title={isFavorite ? 'Favorited' : 'Favorite'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Share */}
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>

          {/* Export Dropdown */}
          <div className="relative group">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
            <div className="absolute right-0 mt-1 w-44 bg-card border border-border rounded-lg shadow-lg py-1 hidden group-hover:block z-20">
              <a
                href={`/api/notes/${params.id}/export/pdf`}
                download
                className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent text-foreground"
              >
                <FileDown className="w-3.5 h-3.5 text-red-500" /> PDF Document (.pdf)
              </a>
              <a
                href={`/api/notes/${params.id}/export/docx`}
                download
                className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent text-foreground"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-500" /> Word Document (.docx)
              </a>
              <a
                href={`/api/notes/${params.id}/export/md`}
                download
                className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent text-foreground"
              >
                <FileDown className="w-3.5 h-3.5 text-purple-500" /> Markdown (.md)
              </a>
              <a
                href={`/api/notes/${params.id}/export/html`}
                download
                className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent text-foreground"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-500" /> HTML Web Page (.html)
              </a>
              <a
                href={`/api/notes/${params.id}/export/json`}
                download
                className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent text-foreground"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-500" /> JSON Data (.json)
              </a>
            </div>
          </div>

          {/* History */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="gap-1.5"
            title="Version History"
          >
            <History className="w-3.5 h-3.5" />
          </Button>

          {/* Delete */}
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent p-4 rounded-xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary/20 text-primary rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">AI Note Intelligence</h4>
            <p className="text-xs text-muted-foreground">Summarize, generate bullet points, or enhance clarity.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={runAiTitle}
            disabled={isAiLoading || !content.trim()}
            className="text-xs gap-1"
          >
            Auto Title
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={runAiImprove}
            disabled={isAiLoading || !content.trim()}
            className="text-xs gap-1"
          >
            Improve Text
          </Button>
          <Button
            size="sm"
            onClick={runAiSummarize}
            disabled={isAiLoading || !content.trim()}
            className="text-xs gap-1.5 shadow-xs"
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Generate Summary
          </Button>
        </div>
      </div>

      {/* Note Title Input */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note Title..."
          className="w-full text-3xl sm:text-4xl font-extrabold bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/40 text-foreground"
        />
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{readingTime} min read</span>
          {note?.sourceType && note.sourceType !== 'manual' && (
            <>
              <span>•</span>
              <span className="capitalize">Source: {note.sourceType} ({note.fileName || 'file'})</span>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area: Editor & Summary Side-by-Side or Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
              <button
                onClick={() => setActiveTab('write')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'write' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Write (Markdown)
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'preview' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            </div>
          </div>

          {activeTab === 'write' ? (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Write your note in Markdown or plain text here..."
              rows={22}
              className="w-full p-4 rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm leading-relaxed resize-y"
            />
          ) : (
            <div
              className="p-6 rounded-xl border border-border bg-card prose prose-neutral dark:prose-invert max-w-none min-h-[500px]"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(content || '*No content to preview*'),
              }}
            />
          )}

          {/* Bi-directional Backlinks & Connected Notes Panel */}
          <div className="bg-card p-5 rounded-xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-primary font-bold">⇄</span> Knowledge Connections & Backlinks
              </h3>
              <Link href="/dashboard/graph" className="text-xs text-primary hover:underline flex items-center gap-1">
                View in Graph &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Backlinks (incoming) */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Backlinks (Referenced By):
                </span>
                {(note as any)?.targetRelationships?.length > 0 ? (
                  <div className="space-y-1.5">
                    {(note as any).targetRelationships.map((rel: any) => (
                      <Link
                        key={rel.id}
                        href={`/dashboard/notes/${rel.sourceNote.id}`}
                        className="flex items-center justify-between p-2 rounded-lg bg-background hover:bg-accent border border-border text-xs transition-colors"
                      >
                        <span className="font-medium truncate">{rel.sourceNote.title}</span>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {rel.relationshipType}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No notes currently link to this note.
                  </p>
                )}
              </div>

              {/* Outgoing Links */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Outgoing Links (References):
                </span>
                {(note as any)?.sourceRelationships?.length > 0 ? (
                  <div className="space-y-1.5">
                    {(note as any).sourceRelationships.map((rel: any) => (
                      <Link
                        key={rel.id}
                        href={`/dashboard/notes/${rel.targetNote.id}`}
                        className="flex items-center justify-between p-2 rounded-lg bg-background hover:bg-accent border border-border text-xs transition-colors"
                      >
                        <span className="font-medium truncate">{rel.targetNote.title}</span>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {rel.relationshipType}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No outgoing note links recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: AI Summary & Key Takeaways (1 Column) */}
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="bg-card p-5 rounded-xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Summary
              </h3>
            </div>
            <textarea
              value={summary}
              onChange={(e) => handleSummaryChange(e.target.value)}
              placeholder="AI summary will appear here or write your own..."
              rows={5}
              className="w-full text-xs p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none"
            />
          </div>

          {/* Key Bullet Points */}
          <div className="bg-card p-5 rounded-xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Key Points</h3>
              <Button size="sm" variant="ghost" onClick={handleAddBulletPoint} className="h-7 text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>

            {bulletPoints.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No key points yet. Click &quot;Generate Summary&quot; or add manually.
              </p>
            ) : (
              <div className="space-y-2">
                {bulletPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2 group">
                    <span className="text-primary font-bold text-xs mt-2">•</span>
                    <textarea
                      value={point}
                      onChange={(e) => handleUpdateBulletPoint(idx, e.target.value)}
                      rows={2}
                      className="flex-1 text-xs p-2 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                    <button
                      onClick={() => handleRemoveBulletPoint(idx)}
                      className="text-muted-foreground hover:text-destructive opacity-40 group-hover:opacity-100 p-1 mt-1 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Version History Modal / Drawer */}
          {showHistory && (
            <div className="bg-card p-5 rounded-xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" /> Version History
                </h3>
                <button onClick={() => setShowHistory(false)} className="text-xs text-muted-foreground hover:text-foreground">
                  Close
                </button>
              </div>

              {(!note?.versions || note.versions.length === 0) ? (
                <p className="text-xs text-muted-foreground">No prior versions recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {note.versions.map((ver) => (
                    <div
                      key={ver.id}
                      className="p-2.5 rounded-lg border border-border/80 hover:bg-muted/40 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span className="truncate">{ver.title || 'Untitled'}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(new Date(ver.createdAt))}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] line-clamp-1">{ver.content}</p>
                      <button
                        onClick={() => {
                          if (confirm('Revert note to this previous version?')) {
                            setContent(ver.content);
                            setTitle(ver.title);
                            setSummary(ver.summary);
                            triggerAutosave(ver.title, ver.content, ver.summary, bulletPoints, folderId);
                            toast.success('Reverted to version');
                          }
                        }}
                        className="text-[10px] text-primary hover:underline font-medium"
                      >
                        Restore this version
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
