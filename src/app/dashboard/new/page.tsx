'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUp, Wand2, Copy, Sparkles, Folder as FolderIcon, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Folder {
  id: string;
  name: string;
}

export default function NewNotePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'text'>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [folderId, setFolderId] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [template, setTemplate] = useState('Standard');
  const [generateAi, setGenerateAi] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchFolders() {
      try {
        const res = await axios.get('/api/folders');
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data)) setFolders(data);
      } catch (err) {
        console.error('Failed to load folders:', err);
      }
    }
    fetchFolders();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      toast.error('Please upload a PDF, Word document (.docx), or text file');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size cannot exceed 15MB');
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'text' && !text.trim() && !title.trim()) {
      toast.error('Please enter a note title or content');
      return;
    }

    if (mode === 'upload' && !selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsLoading(true);

    try {
      let res;

      if (mode === 'text') {
        res = await axios.post('/api/notes', {
          title: title.trim() || 'Untitled Note',
          originalText: text,
          content: text,
          sourceType: 'manual',
          folderId: folderId || null,
          generateAI: generateAi,
          template,
        });
      } else {
        const formData = new FormData();
        formData.append('file', selectedFile!);
        if (folderId) formData.append('folderId', folderId);
        if (template) formData.append('template', template);

        res = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      const createdNote = res.data?.data || res.data;
      const noteId = createdNote?.id;

      toast.success('Note created successfully!');
      if (noteId) {
        router.push(`/dashboard/notes/${noteId}`);
      } else {
        router.push('/dashboard/notes');
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Failed to create note. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/notes" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Note</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Capture thoughts directly or extract structured knowledge from uploaded documents.
          </p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center ${
            mode === 'text'
              ? 'border-primary bg-primary/5 text-primary shadow-xs'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
          }`}
        >
          <Wand2 className="w-6 h-6 mb-2" />
          <p className="font-semibold text-sm">Write Note</p>
          <p className="text-xs text-muted-foreground mt-0.5">Markdown or plain text</p>
        </button>

        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center ${
            mode === 'upload'
              ? 'border-primary bg-primary/5 text-primary shadow-xs'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
          }`}
        >
          <FileUp className="w-6 h-6 mb-2" />
          <p className="font-semibold text-sm">Upload Document</p>
          <p className="text-xs text-muted-foreground mt-0.5">PDF, Word, or TXT</p>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleCreateNote} className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Note Title
          </label>
          <Input
            placeholder="e.g. System Architecture Notes, Docker Fundamentals..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
            className="text-sm bg-background font-medium"
          />
        </div>

        {/* Folder Select */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Target Folder
          </label>
          <select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">No Folder (Root Knowledge Base)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                📁 {f.name}
              </option>
            ))}
          </select>
        </div>

        {mode === 'upload' ? (
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Document File
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-all bg-background/50 group"
            >
              <FileUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="font-medium text-sm text-foreground">
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop document'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, Word (.docx), or text files up to 15MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md"
              onChange={handleFileSelect}
              hidden
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Content (Markdown supported)
            </label>
            <Textarea
              placeholder="Start typing your thoughts or paste research content..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
              rows={12}
              className="font-mono text-sm bg-background leading-relaxed"
            />
          </div>
        )}

        {/* AI Options */}
        <div className="pt-2 border-t border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="generateAi"
              checked={generateAi}
              onChange={(e) => setGenerateAi(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-input"
            />
            <label htmlFor="generateAi" className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Auto-generate summary & bullet points with AI
            </label>
          </div>

          {generateAi && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground">Style:</span>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-md border border-input bg-background"
              >
                <option value="Standard">Standard</option>
                <option value="Academic">Academic</option>
                <option value="Business">Business</option>
                <option value="Technical">Technical</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3">
          <Link href="/dashboard/notes" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading} className="flex-1 gap-2 shadow-xs">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Save Note
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
