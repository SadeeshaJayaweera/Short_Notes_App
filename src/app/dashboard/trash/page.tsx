'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/helpers';

interface Note {
  id: string;
  title: string;
  summary: string;
  content: string;
  deletedAt?: string;
  createdAt: string;
}

export default function TrashPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrash = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/notes?trash=true');
      const data = res.data?.data?.notes || [];
      setNotes(data);
    } catch (err) {
      toast.error('Failed to load trash');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      await axios.put(`/api/notes/${id}`, { restore: true });
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success('Note restored!');
    } catch {
      toast.error('Failed to restore note');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('Permanently delete this note? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/notes/${id}?permanent=true`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success('Note permanently deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm('Permanently purge all notes in trash?')) return;
    try {
      for (const n of notes) {
        await axios.delete(`/api/notes/${n.id}?permanent=true`);
      }
      setNotes([]);
      toast.success('Trash emptied');
    } catch {
      toast.error('Failed to empty trash');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/notes" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Trash</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Notes moved to trash can be restored or permanently removed.
          </p>
        </div>

        {notes.length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleEmptyTrash} className="gap-2">
            <Trash2 className="w-4 h-4" /> Empty Trash
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
          <p className="text-sm">Loading trash...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border p-8">
          <div className="w-14 h-14 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Trash is empty</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            When you delete notes, they will appear here before being permanently removed.
          </p>
          <Link href="/dashboard/notes">
            <Button variant="outline">Back to Notes</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
          {notes.map((note) => (
            <div key={note.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base truncate">{note.title}</h3>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {note.summary || note.content}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRestore(note.id)}
                  className="gap-1.5 h-8 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handlePermanentDelete(note.id)}
                  className="h-8 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Purge
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

