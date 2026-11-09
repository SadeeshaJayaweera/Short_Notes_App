'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Search, FileText, Folder as FolderIcon, X, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  notes: Array<{
    id: string;
    title: string;
    summary: string;
    folder?: { name: string };
    tags?: { tag: { name: string } }[];
  }>;
  folders: Array<{
    id: string;
    name: string;
    _count?: { notes: number };
  }>;
}

export function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ notes: [], folders: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ notes: [], folders: [] });
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ notes: [], folders: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/api/search?q=${encodeURIComponent(query.trim())}`);
        setResults(res.data?.data || { notes: [], folders: [] });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Search notes, folders, and tags (type or press Esc)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-14 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground/60 text-foreground"
            autoFocus
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-muted text-muted-foreground border border-border rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Searching second brain...
            </div>
          ) : !query.trim() ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Type keywords to search across your notes, summaries, and folders.
            </div>
          ) : results.notes.length === 0 && results.folders.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No results found for &quot;{query}&quot;.
            </div>
          ) : (
            <>
              {/* Folders matches */}
              {results.folders.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 tracking-wider">
                    Folders
                  </span>
                  {results.folders.map((f) => (
                    <Link
                      key={f.id}
                      href={`/dashboard/notes?folderId=${f.id}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FolderIcon className="w-4 h-4 text-primary" />
                        <span className="font-semibold">{f.name}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {f._count?.notes || 0} notes
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Notes matches */}
              {results.notes.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 tracking-wider">
                    Notes
                  </span>
                  {results.notes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/dashboard/notes/${note.id}`}
                      onClick={onClose}
                      className="flex items-start justify-between p-3 rounded-xl hover:bg-accent text-xs transition-colors group"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                            {note.title}
                          </h4>
                          {note.folder && (
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
                              📁 {note.folder.name}
                            </span>
                          )}
                        </div>
                        {note.summary && (
                          <p className="text-muted-foreground text-xs line-clamp-1 mt-1">
                            {note.summary}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all self-center" />
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-muted/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Press <kbd className="px-1 py-0.5 bg-card rounded border">Esc</kbd> to close
          </span>
          <span>Instant Unified Search</span>
        </div>
      </div>
    </div>
  );
}

