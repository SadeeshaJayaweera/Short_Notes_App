'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUp, Wand2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewNotePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'text'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, Word document, or text file');
      return;
    }

    setSelectedFile(file);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'text' && !text.trim()) {
      toast.error('Please enter some text');
      return;
    }

    if (mode === 'upload' && !selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsLoading(true);

    try {
      let noteData;

      if (mode === 'text') {
        // Create note from text
        noteData = await axios.post('/api/notes', {
          title: 'Untitled Note',
          originalText: text,
          sourceType: 'text',
        });
      } else {
        // Upload file
        const formData = new FormData();
        formData.append('file', selectedFile!);

        noteData = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      toast.success('Note created successfully!');
      router.push(`/dashboard/notes/${noteData.data.id}`);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Create New Note</h1>
        <p className="text-muted-foreground mt-1">
          Upload a document or paste text to create a summarized note
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex gap-4">
        <button
          onClick={() => setMode('upload')}
          className={`flex-1 p-4 rounded-lg border-2 transition ${
            mode === 'upload'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <FileUp className="w-6 h-6 mx-auto mb-2" />
          <p className="font-semibold">Upload Document</p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, Word, or text files
          </p>
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex-1 p-4 rounded-lg border-2 transition ${
            mode === 'text'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <Wand2 className="w-6 h-6 mx-auto mb-2" />
          <p className="font-semibold">Paste Text</p>
          <p className="text-xs text-muted-foreground mt-1">
            Directly paste your content
          </p>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleCreateNote} className="space-y-6">
        {mode === 'upload' ? (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition group"
            >
              <FileUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition" />
              <p className="font-semibold mb-1">
                {selectedFile
                  ? selectedFile.name
                  : 'Click to select or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground">
                PDF, Word (.docx), or text files up to 50MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileSelect}
              hidden
            />
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-sm font-medium">Content</label>
            <Textarea
              placeholder="Paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
              className="min-h-96"
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <Link href="/dashboard" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Create Note
              </>
            )}
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
          <p className="font-semibold mb-2">✨ What happens next:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Your document is analyzed by AI</li>
            <li>• An automatic title is generated</li>
            <li>• A concise summary is created</li>
            <li>• Bullet points are extracted</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
