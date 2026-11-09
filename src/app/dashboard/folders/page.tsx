'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Folder as FolderIcon,
  Plus,
  Edit2,
  Trash2,
  FolderOpen,
  FileText,
  Loader2,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Folder {
  id: string;
  name: string;
  color?: string;
  _count?: { notes: number };
  createdAt: string;
}

const COLOR_OPTIONS = [
  { name: 'blue', bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/30' },
  { name: 'purple', bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500/30' },
  { name: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/30' },
  { name: 'amber', bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/30' },
  { name: 'rose', bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500/30' },
  { name: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500/30' },
];

export default function FoldersPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('blue');

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/folders');
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data)) {
        setFolders(data);
      }
    } catch (err) {
      toast.error('Failed to load folders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }

    try {
      const res = await axios.post('/api/folders', {
        name: newFolderName.trim(),
        color: selectedColor,
      });
      const created = res.data?.data || res.data;
      setFolders((prev) => [...prev, created]);
      setNewFolderName('');
      setIsCreating(false);
      toast.success('Folder created successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create folder');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }

    try {
      const res = await axios.put('/api/folders', {
        id,
        name: editName.trim(),
        color: editColor,
      });
      const updated = res.data?.data || res.data;
      setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
      setEditingId(null);
      toast.success('Folder updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update folder');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete folder "${name}"? Notes inside will be kept and moved to unorganized.`)) {
      return;
    }

    try {
      await axios.delete(`/api/folders?id=${id}`);
      setFolders((prev) => prev.filter((f) => f.id !== id));
      toast.success('Folder deleted');
    } catch (err) {
      toast.error('Failed to delete folder');
    }
  };

  const getColorMeta = (colorName?: string) => {
    return COLOR_OPTIONS.find((c) => c.name === colorName) || COLOR_OPTIONS[0];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Folders</h1>
          <p className="text-muted-foreground mt-1">
            Organize your notes and research materials into focused collections.
          </p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="gap-2 shadow-xs">
          <Plus className="w-4 h-4" />
          {isCreating ? 'Cancel' : 'New Folder'}
        </Button>
      </div>

      {/* Create Folder Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="bg-card p-5 rounded-xl border border-primary/30 shadow-sm space-y-4 transition-all"
        >
          <h3 className="font-semibold text-sm">Create New Folder</h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Input
              placeholder="e.g. Computer Science, AI Research, Personal..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="flex-1 bg-background"
              autoFocus
            />
            {/* Color Selector */}
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center transition-transform ${
                    selectedColor === c.name ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'opacity-80'
                  }`}
                >
                  {selectedColor === c.name && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
            <Button type="submit" size="sm">Save Folder</Button>
          </div>
        </form>
      )}

      {/* Folders List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
          <p className="text-sm">Loading folders...</p>
        </div>
      ) : folders.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border p-8">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No folders yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Create folders to group related notes by project, subject, or interest.
          </p>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create First Folder
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {folders.map((folder) => {
            const color = getColorMeta(folder.color);
            const isEditing = editingId === folder.id;

            return (
              <div
                key={folder.id}
                className="bg-card hover:bg-accent/40 rounded-xl border border-border p-5 flex flex-col justify-between shadow-xs transition-all group"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-sm bg-background"
                      autoFocus
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {COLOR_OPTIONS.map((c) => (
                          <button
                            type="button"
                            key={c.name}
                            onClick={() => setEditColor(c.name)}
                            className={`w-5 h-5 rounded-full ${c.bg} flex items-center justify-center ${
                              editColor === c.name ? 'ring-2 ring-primary ring-offset-1' : 'opacity-80'
                            }`}
                          >
                            {editColor === c.name && <Check className="w-3 h-3 text-white" />}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                        <Button size="sm" onClick={() => handleUpdate(folder.id)} className="h-7 text-xs">
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <Link
                        href={`/dashboard/notes?folderId=${folder.id}`}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <div className={`p-2.5 rounded-xl ${color.bg}/10 ${color.text} shrink-0`}>
                          <FolderIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                            {folder.name}
                          </h3>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <FileText className="w-3 h-3" />
                            {folder._count?.notes || 0} note{(folder._count?.notes || 0) === 1 ? '' : 's'}
                          </span>
                        </div>
                      </Link>

                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(folder.id);
                            setEditName(folder.name);
                            setEditColor(folder.color || 'blue');
                          }}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Rename Folder"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(folder.id, folder.name)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          title="Delete Folder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/notes?folderId=${folder.id}`}
                      className="text-xs font-medium text-primary hover:underline flex items-center gap-1 pt-3 border-t border-border/60"
                    >
                      View notes in folder &rarr;
                    </Link>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

