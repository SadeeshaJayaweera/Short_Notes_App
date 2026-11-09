'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User,
  Moon,
  Sun,
  Key,
  Shield,
  Download,
  Database,
  Trash2,
  Check,
  Sparkles,
  ExternalLink,
  Code2,
  Copy,
  Plus,
  AlertTriangle,
  Terminal,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  permissions: string[];
  lastUsedAt?: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const [openAiKey, setOpenAiKey] = useState('');
  const [openAiModel, setOpenAiModel] = useState('gpt-4-turbo-preview');
  const [savedKey, setSavedKey] = useState(false);

  // Developer API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [generatedRawKey, setGeneratedRawKey] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const res = await axios.get('/api/keys');
      setApiKeys(res.data.data?.keys || []);
    } catch {
      // ignore on initial load
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setIsCreatingKey(true);
      const res = await axios.post('/api/keys', {
        name: newKeyName.trim(),
      });
      setGeneratedRawKey(res.data.data.rawKey);
      setNewKeyName('');
      toast.success('API Key generated!');
      await fetchApiKeys();
    } catch {
      toast.error('Failed to create API key');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Applications using it will lose access immediately.')) return;
    try {
      await axios.delete(`/api/keys?id=${id}`);
      toast.success('API key revoked');
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      toast.error('Failed to revoke API key');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSaveAiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to local client storage or user preferences
    if (openAiKey) {
      localStorage.setItem('user_custom_openai_key', openAiKey);
    }
    localStorage.setItem('user_custom_openai_model', openAiModel);
    setSavedKey(true);
    toast.success('AI configuration preferences updated!');
    setTimeout(() => setSavedKey(false), 2000);
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/notes?limit=1000');
      const data = await res.json();
      const notes = data.data?.notes || [];

      const blob = new Blob([JSON.stringify({ user: session?.user, notes, exportedAt: new Date().toISOString() }, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `short-notes-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Complete knowledge base exported!');
    } catch {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, appearance, AI settings, and data exports.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> Profile Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Full Name</label>
            <p className="font-medium text-sm mt-1">{session?.user?.name || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email Address</label>
            <p className="font-medium text-sm mt-1">{session?.user?.email || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Appearance Card */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />} Appearance & Theme
        </h2>
        <p className="text-xs text-muted-foreground">
          Select your preferred interface theme.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('light')}
            className="gap-2"
          >
            <Sun className="w-4 h-4" /> Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('dark')}
            className="gap-2"
          >
            <Moon className="w-4 h-4" /> Dark
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('system')}
          >
            System
          </Button>
        </div>
      </div>

      {/* AI Configuration (BYOK) */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> AI Engine Configuration
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Configure Bring-Your-Own-Key (BYOK) for private direct model calls.
            </p>
          </div>
          <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
            BYOK Supported
          </span>
        </div>

        <form onSubmit={handleSaveAiSettings} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Personal OpenAI API Key (Optional)
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="sk-proj-..."
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
                className="pl-9 font-mono text-xs bg-background"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Leave blank to use system-configured default environment credentials.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Preferred Model
            </label>
            <select
              value={openAiModel}
              onChange={(e) => setOpenAiModel(e.target.value)}
              className="w-full sm:w-72 px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="gpt-4-turbo-preview">GPT-4 Turbo (Recommended)</option>
              <option value="gpt-4o">GPT-4o (Multimodal & Fast)</option>
              <option value="gpt-4o-mini">GPT-4o Mini (Cost-efficient)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>

          <Button type="submit" size="sm" className="gap-1.5">
            {savedKey ? <Check className="w-4 h-4" /> : null}
            {savedKey ? 'Saved' : 'Save AI Settings'}
          </Button>
        </form>
      </div>

      {/* Developer API & MCP Keys */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" /> Developer API & MCP Integration
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Generate secret tokens for the Short Notes Model Context Protocol (MCP) server, external scripts, and automation tools.
            </p>
          </div>
          <span className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-medium">
            v1 REST & MCP
          </span>
        </div>

        {/* Newly Generated Key Alert */}
        {generatedRawKey && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              Copy your API Key now!
            </div>
            <p className="text-muted-foreground">
              This secret key will not be shown again. Store it in a password manager or environment variable.
            </p>
            <div className="flex items-center gap-2 bg-background p-2 rounded-lg border border-border">
              <code className="font-mono text-primary text-xs flex-1 break-all select-all">
                {generatedRawKey}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(generatedRawKey)}
                className="gap-1 h-7 text-xs"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </Button>
            </div>
          </div>
        )}

        {/* Create API Key Form */}
        <form onSubmit={handleCreateApiKey} className="flex gap-2 pt-1">
          <Input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key label (e.g. Claude Desktop MCP, Raycast, Python script)"
            className="text-xs"
            required
          />
          <Button type="submit" size="sm" disabled={isCreatingKey} className="shrink-0 gap-1.5">
            <Plus className="w-4 h-4" /> Generate Key
          </Button>
        </form>

        {/* Existing Keys List */}
        <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
          {apiKeys.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No developer keys generated yet. Create one to connect MCP or external clients.
            </div>
          ) : (
            apiKeys.map((k) => (
              <div key={k.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-medium text-foreground flex items-center gap-2">
                    {k.name}
                    <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                      {k.prefix}...
                    </code>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Created {new Date(k.createdAt).toLocaleDateString()}
                    {k.lastUsedAt && ` • Last used ${new Date(k.lastUsedAt).toLocaleDateString()}`}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevokeApiKey(k.id)}
                  className="text-destructive hover:bg-destructive/10 h-7 text-xs"
                >
                  Revoke
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Integration Example Snippet */}
        <div className="pt-2 space-y-1.5">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> Example cURL Usage:
          </div>
          <pre className="p-3 rounded-lg bg-muted text-[11px] font-mono text-foreground overflow-x-auto">
{`curl -X GET "https://your-domain/api/v1/notes" \\
  -H "Authorization: Bearer sn_live_your_token_here"`}
          </pre>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" /> Data Portability & Backup
        </h2>
        <p className="text-xs text-muted-foreground">
          Export your complete knowledge library, note histories, and summaries in portable JSON format.
        </p>
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={handleExportData} className="gap-2">
            <Download className="w-4 h-4" />
            Download Full Knowledge Base (.json)
          </Button>
        </div>
      </div>
    </div>
  );
}

