'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
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
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const [openAiKey, setOpenAiKey] = useState('');
  const [openAiModel, setOpenAiModel] = useState('gpt-4-turbo-preview');
  const [savedKey, setSavedKey] = useState(false);

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

