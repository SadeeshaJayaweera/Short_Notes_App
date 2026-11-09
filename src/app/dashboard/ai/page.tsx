'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  Send,
  Loader2,
  Plus,
  Trash2,
  Folder as FolderIcon,
  FileText,
  ExternalLink,
  Bot,
  User,
  HelpCircle,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { renderMarkdown, formatDate } from '@/lib/helpers';

interface Source {
  citationNumber: number;
  noteId: string;
  title: string;
  folder: string;
  snippet: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  sources?: {
    citationNumber: number;
    snippet: string;
    note: { id: string; title: string };
  }[];
}

interface Conversation {
  id: string;
  title: string;
  scope: string;
  updatedAt: string;
  _count?: { messages: number };
}

interface Folder {
  id: string;
  name: string;
}

export default function AiAssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scope, setScope] = useState<'all' | 'folder'>('all');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [sourcesList, setSourcesList] = useState<Source[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const [convRes, folderRes] = await Promise.all([
        axios.get('/api/ai/conversations'),
        axios.get('/api/folders'),
      ]);
      const convData = convRes.data?.data || [];
      setConversations(convData);

      const fData = folderRes.data?.data || [];
      if (Array.isArray(fData)) setFolders(fData);

      if (convData.length > 0 && !activeConvId) {
        // Load latest conversation messages
        loadConversation(convData[0].id);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || params.get('prompt');
      if (q) {
        setInputPrompt(q);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadConversation = async (convId: string) => {
    setActiveConvId(convId);
    try {
      const res = await axios.get('/api/ai/conversations');
      const convList = res.data?.data || [];
      const active = convList.find((c: any) => c.id === convId);
      if (active) {
        // Fetch full messages for this conversation if available or initialize
        setMessages([]);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  };

  const startNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
    setSourcesList([]);
  };

  const deleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
    try {
      await axios.delete(`/api/ai/conversations?id=${id}`);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) startNewConversation();
      toast.success('Conversation deleted');
    } catch {
      toast.error('Failed to delete conversation');
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || inputPrompt;
    if (!promptToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: promptToSend.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await axios.post('/api/ai/chat', {
        message: promptToSend.trim(),
        conversationId: activeConvId,
        scope,
        scopeId: scope === 'folder' ? selectedFolderId : null,
      });

      const data = res.data?.data;
      if (data) {
        if (!activeConvId && data.conversationId) {
          setActiveConvId(data.conversationId);
          fetchConversations();
        }

        const assistantMsg: Message = {
          id: data.message.id,
          role: 'assistant',
          content: data.message.content,
          createdAt: data.message.createdAt,
          sources: data.message.sources,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        if (data.sources) setSourcesList(data.sources);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const SUGGESTED_PROMPTS = [
    'Summarize the core takeaways from my notes',
    'What are the most important ideas in my recent research?',
    'List all action items mentioned across my notes',
    'Find any conflicting or contradictory statements in my notes',
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar: Conversation History */}
      <div className="w-72 bg-card rounded-2xl border border-border p-4 flex flex-col justify-between hidden md:flex shrink-0 shadow-xs">
        <div className="space-y-4">
          <Button onClick={startNewConversation} className="w-full gap-2 shadow-xs" size="sm">
            <Plus className="w-4 h-4" /> New Chat
          </Button>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2">
              Recent Chats
            </span>
            <div className="space-y-1 max-h-[calc(100vh-20rem)] overflow-y-auto pt-1">
              {conversations.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-3 italic">
                  No conversations yet.
                </p>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => loadConversation(c.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors group ${
                      activeConvId === c.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span className="truncate flex-1">{c.title}</span>
                    <button
                      onClick={(e) => deleteConversation(e, c.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Scope Configuration */}
        <div className="border-t border-border/80 pt-3 space-y-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Knowledge Context Scope
          </span>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as any)}
            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background"
          >
            <option value="all">Entire Second Brain</option>
            <option value="folder">Specific Folder</option>
          </select>

          {scope === 'folder' && (
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background mt-1"
            >
              <option value="">Select Folder...</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 bg-card rounded-2xl border border-border flex flex-col overflow-hidden shadow-xs">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">AI Knowledge Assistant</h2>
              <p className="text-xs text-muted-foreground">
                Grounded in your notes with verifiable source citations
              </p>
            </div>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-500 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            ● Grounded RAG
          </span>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Ask Your Second Brain</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Ask any question across your uploaded documents, research, and personal notes.
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="w-full space-y-2 pt-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block text-left">
                  Suggested Prompts:
                </span>
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(undefined, prompt)}
                    className="w-full text-left p-3 rounded-xl border border-border bg-background hover:bg-accent/40 text-xs font-medium transition-colors flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground font-medium rounded-tr-none'
                      : 'bg-background border border-border shadow-xs rounded-tl-none space-y-3'
                  }`}
                >
                  {m.role === 'assistant' ? (
                    <div>
                      <div
                        className="prose prose-neutral dark:prose-invert max-w-none text-xs leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(m.content),
                        }}
                      />

                      {/* Source Citations */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border/60 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                            Traceable Citations:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {m.sources.map((src, i) => (
                              <Link
                                key={i}
                                href={`/dashboard/notes/${src.note.id}`}
                                className="inline-flex items-center gap-1.5 text-[11px] bg-primary/10 text-primary hover:bg-primary/20 px-2.5 py-1 rounded-md font-medium transition-colors"
                              >
                                <span>[^{src.citationNumber}] {src.note.title}</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span>{m.content}</span>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-1 text-xs font-bold">
                    U
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 items-center text-muted-foreground text-xs py-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <p className="animate-pulse">Searching knowledge base and assembling cited answer...</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card flex items-center gap-2">
          <Input
            placeholder="Ask anything about your notes, documents, or concepts..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-background text-sm h-11 px-4"
          />
          <Button type="submit" disabled={isLoading || !inputPrompt.trim()} className="h-11 px-5 gap-2 shadow-xs">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Ask
          </Button>
        </form>
      </div>
    </div>
  );
}

