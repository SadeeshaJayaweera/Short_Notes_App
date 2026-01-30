'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { NoteGridSkeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation } from '@/hooks';
import { Search, Plus, Trash2, Share2, Download, Star, Pin, AlertCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/helpers';

interface Note {
  id: string;
  title: string;
  summary: string;
  bulletPoints: string[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isFavorite: boolean;
  sourceType: string;
}

export default function NotesPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Note[]>([]);

  // Fetch notes
  const {
    data: notesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<any>(
    `/api/notes?page=${page}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`,
    {
      enabled: !!session,
      onSuccess: (data) => {
        setNotes(data.notes || []);
      },
      onError: () => {
        toast.error('Failed to load notes');
      },
    }
  );

  // Delete mutation
  const { mutate: deleteNote, isLoading: isDeleting } = useMutation(
    'DELETE',
    '',
    {
      onSuccess: () => {
        toast.success('Note deleted');
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete note');
      },
    }
  );

  // Toggle favorite mutation
  const { mutate: toggleFavorite } = useMutation('PUT', '', {
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      toast.error('Failed to update note');
    },
  });

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNote(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const getSourceBadge = (sourceType: string) => {
    const badges: Record<string, { variant: any; label: string }> = {
      pdf: { variant: 'info', label: 'PDF' },
      word: { variant: 'info', label: 'Word' },
      text: { variant: 'info', label: 'Text' },
      manual: { variant: 'secondary', label: 'Manual' },
    };
    const badge = badges[sourceType] || badges.manual;
    return <Badge variant={badge.variant as any}>{badge.label}</Badge>;
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Notes</AlertTitle>
          <AlertDescription>
            {(error as any)?.message || 'Failed to load your notes. Please try again.'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Notes</h1>
          <p className="text-muted-foreground mt-1">
            {notesData?.total || 0} notes total
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      {notesData && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Notes</p>
                <p className="text-2xl font-bold">{notesData.total}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pages</p>
                <p className="text-2xl font-bold">{notesData.pages}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">On This Page</p>
                <p className="text-2xl font-bold">{notes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={handleSearch}
          className="pl-10"
        />
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <NoteGridSkeleton />
      ) : notes.length === 0 ? (
        <Card className="p-12 text-center">
          <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground mb-4">No notes found</p>
          <Link href="/dashboard/new">
            <Button variant="outline">Create your first note</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group"
            >
              <CardContent className="p-4 h-full flex flex-col">
                <Link href={`/dashboard/notes/${note.id}`} className="flex-1">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition">
                        {note.title}
                      </h3>
                      {note.isPinned && <Pin className="w-4 h-4 text-primary flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {note.summary || note.bulletPoints[0]}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getSourceBadge(note.sourceType)}
                      {note.isFavorite && <Badge variant="warning">⭐ Favorite</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-auto">
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(null);
                    }}
                    className={`p-2 rounded hover:bg-accent transition ${
                      note.isFavorite ? 'text-yellow-500' : 'text-muted-foreground'
                    }`}
                    title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <Link href={`/dashboard/notes/${note.id}/share`} onClick={(e) => e.stopPropagation()}>
                    <button className="p-2 rounded hover:bg-accent text-muted-foreground transition">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </Link>
                  <a href={`/api/notes/${note.id}/export/pdf`} onClick={(e) => e.stopPropagation()}>
                    <button className="p-2 rounded hover:bg-accent text-muted-foreground transition">
                      <Download className="w-4 h-4" />
                    </button>
                  </a>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteNote(note.id);
                    }}
                    disabled={isDeleting}
                    className="p-2 rounded hover:bg-destructive/10 text-destructive ml-auto transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {notesData && notesData.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: notesData.pages }).map((_, i) => (
              <Button
                key={i + 1}
                variant={page === i + 1 ? 'default' : 'outline'}
                onClick={() => setPage(i + 1)}
                className="w-10"
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(Math.min(notesData.pages, page + 1))}
            disabled={page === notesData.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
