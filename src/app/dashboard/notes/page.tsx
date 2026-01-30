'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash2, Share2, Download, Star, Pin } from 'lucide-react';
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
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchNotes();
  }, [searchQuery, page]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(searchQuery && { search: searchQuery }),
      });
      const response = await axios.get(`/api/notes?${params}`);
      setNotes(response.data.notes);
    } catch (error) {
      toast.error('Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await axios.delete(`/api/notes/${id}`);
      setNotes(notes.filter((n) => n.id !== id));
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      await axios.put(`/api/notes/${id}`, { isFavorite: !isFavorite });
      setNotes(
        notes.map((n) =>
          n.id === id ? { ...n, isFavorite: !isFavorite } : n
        )
      );
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    try {
      await axios.put(`/api/notes/${id}`, { isPinned: !isPinned });
      setNotes(
        notes.map((n) =>
          n.id === id ? { ...n, isPinned: !isPinned } : n
        )
      );
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Notes</h1>
          <p className="text-muted-foreground mt-1">
            {notes.length} notes total
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="pl-10"
        />
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">No notes found</p>
          <Link href="/dashboard/new">
            <Button variant="outline">Create your first note</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition group cursor-pointer"
            >
              <Link href={`/dashboard/notes/${note.id}`}>
                <div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition">
                    {note.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {note.summary || note.bulletPoints[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(note.createdAt)}
                  </p>
                </div>
              </Link>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(note.id, note.isFavorite);
                  }}
                  className={`p-2 rounded hover:bg-accent ${
                    note.isFavorite ? 'text-yellow-500' : ''
                  }`}
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    togglePin(note.id, note.isPinned);
                  }}
                  className={`p-2 rounded hover:bg-accent ${
                    note.isPinned ? 'text-primary' : ''
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <Link href={`/dashboard/notes/${note.id}/share`} onClick={(e) => e.stopPropagation()}>
                  <button className="p-2 rounded hover:bg-accent">
                    <Share2 className="w-4 h-4" />
                  </button>
                </Link>
                <a href={`/api/notes/${note.id}/export/pdf`} onClick={(e) => e.stopPropagation()}>
                  <button className="p-2 rounded hover:bg-accent">
                    <Download className="w-4 h-4" />
                  </button>
                </a>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    deleteNote(note.id);
                  }}
                  className="p-2 rounded hover:bg-destructive/10 text-destructive ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
