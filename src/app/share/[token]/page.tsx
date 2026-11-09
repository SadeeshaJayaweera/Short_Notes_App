'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Calendar, User, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDate, renderMarkdown } from '@/lib/helpers';

interface SharedNoteData {
  id: string;
  title: string;
  content: string;
  summary: string;
  bulletPoints: string[];
  createdAt: string;
  author: string;
  tags: string[];
}

export default function PublicSharedNotePage({ params }: { params: { token: string } }) {
  const [note, setNote] = useState<SharedNoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadSharedNote() {
      try {
        const res = await axios.get(`/api/share/${params.token}`);
        setNote(res.data?.data);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || 'Shared note is no longer available');
      } finally {
        setIsLoading(false);
      }
    }
    loadSharedNote();
  }, [params.token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
        <p className="text-sm">Loading shared note...</p>
      </div>
    );
  }

  if (errorMsg || !note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center bg-card p-8 rounded-2xl border border-border shadow-sm">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-2">Note Unavailable</h2>
          <p className="text-muted-foreground text-sm mb-6">{errorMsg || 'Note not found'}</p>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Go to Short Notes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Public Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <span className="font-bold text-lg">Short Notes</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button size="sm" variant="outline">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {note.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <User className="w-3.5 h-3.5 text-primary" /> {note.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(new Date(note.createdAt))}
            </span>
          </div>
        </div>

        {/* AI Summary Box if present */}
        {note.summary && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" /> Summary
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{note.summary}</p>
          </div>
        )}

        {/* Key Takeaways */}
        {note.bulletPoints && note.bulletPoints.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <h3 className="font-semibold text-sm">Key Points</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {note.bulletPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Note Body */}
        <div
          className="bg-card border border-border rounded-xl p-8 prose prose-neutral dark:prose-invert max-w-none shadow-xs"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(note.content || ''),
          }}
        />

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-4">
            {note.tags.map((tag) => (
              <span key={tag} className="text-xs bg-muted px-2.5 py-1 rounded-md text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
