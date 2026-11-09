'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  ExternalLink,
  Loader2,
  Clock,
  CheckCircle2,
  Circle,
  LayoutGrid,
  List as ListIcon,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/helpers';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  noteId?: string;
  note?: { id: string; title: string };
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // New task form state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/tasks');
      const data = res.data?.data || [];
      setTasks(data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      const res = await axios.post('/api/tasks', {
        title: newTitle.trim(),
        priority: newPriority,
        dueDate: newDueDate || null,
        status: 'todo',
      });
      const created = res.data?.data;
      if (created) {
        setTasks((prev) => [created, ...prev]);
        setNewTitle('');
        setNewDueDate('');
        setIsCreating(false);
        toast.success('Task created successfully');
      }
    } catch {
      toast.error('Failed to create task');
    }
  };

  const updateTaskStatus = async (id: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      await axios.put(`/api/tasks/${id}`, { status: newStatus });
      toast.success(newStatus === 'done' ? 'Task completed! 🎉' : 'Task status updated');
    } catch {
      fetchTasks();
      toast.error('Failed to update task status');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleExtractTasks = async () => {
    setIsExtracting(true);
    try {
      const res = await axios.post('/api/tasks/extract', {});
      const extracted = res.data?.data || [];
      if (extracted.length > 0) {
        setTasks((prev) => [...extracted, ...prev]);
        toast.success(`Successfully extracted ${extracted.length} action item(s)!`);
      } else {
        toast('No new action items found in your recent notes', { icon: 'ℹ️' });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Task extraction failed');
    } finally {
      setIsExtracting(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return <span className="text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">Urgent</span>;
      case 'high':
        return <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">High</span>;
      case 'medium':
        return <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">Medium</span>;
      default:
        return <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">Low</span>;
    }
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks & Action Items</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Turn your notes into actionable tasks, track deliverables, and manage to-dos.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExtractTasks}
            disabled={isExtracting}
            className="gap-2 text-xs"
          >
            {isExtracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
            AI Extract from Notes
          </Button>

          <Button size="sm" onClick={() => setIsCreating(!isCreating)} className="gap-1.5 text-xs shadow-xs">
            <Plus className="w-4 h-4" /> {isCreating ? 'Cancel' : 'New Task'}
          </Button>
        </div>
      </div>

      {/* Quick Task Creation Form */}
      {isCreating && (
        <form onSubmit={handleCreateTask} className="bg-card p-5 rounded-xl border border-primary/30 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold">Create New Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              placeholder="e.g. Implement Dockerfile for deployment..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:col-span-2 text-xs bg-background"
              autoFocus
            />

            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-md border border-input bg-background"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>

            <Input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="text-xs bg-background"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreating(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs">
              Add Task
            </Button>
          </div>
        </form>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {tasks.length} total task{tasks.length === 1 ? '' : 's'} • {doneTasks.length} completed
        </div>

        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'kanban' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
            }`}
            title="Kanban Board"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
            }`}
            title="List View"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Views */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
          <p className="text-sm">Loading tasks...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column: To Do */}
          <div className="bg-card/50 rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="font-semibold text-xs flex items-center gap-2">
                <Circle className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" /> To Do
              </span>
              <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full font-bold text-muted-foreground">
                {todoTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-card p-4 rounded-xl border border-border shadow-xs hover:border-primary/40 transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-xs text-foreground leading-snug">{task.title}</h4>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {getPriorityBadge(task.priority)}
                    <button
                      onClick={() => updateTaskStatus(task.id, 'in_progress')}
                      className="text-[10px] text-primary hover:underline font-medium flex items-center gap-1"
                    >
                      Start &rarr;
                    </button>
                  </div>

                  {task.note && (
                    <Link
                      href={`/dashboard/notes/${task.note.id}`}
                      className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 pt-1 border-t border-border/50 truncate"
                    >
                      📄 {task.note.title}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Column: In Progress */}
          <div className="bg-card/50 rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="font-semibold text-xs flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> In Progress
              </span>
              <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full font-bold text-muted-foreground">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-card p-4 rounded-xl border border-border shadow-xs hover:border-amber-500/40 transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-xs text-foreground leading-snug">{task.title}</h4>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {getPriorityBadge(task.priority)}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateTaskStatus(task.id, 'todo')}
                        className="text-[10px] text-muted-foreground hover:underline"
                      >
                        &larr; Back
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id, 'done')}
                        className="text-[10px] text-emerald-500 hover:underline font-medium"
                      >
                        Complete ✓
                      </button>
                    </div>
                  </div>

                  {task.note && (
                    <Link
                      href={`/dashboard/notes/${task.note.id}`}
                      className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 pt-1 border-t border-border/50 truncate"
                    >
                      📄 {task.note.title}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Column: Completed */}
          <div className="bg-card/50 rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="font-semibold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Done
              </span>
              <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full font-bold text-muted-foreground">
                {doneTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-card/70 p-4 rounded-xl border border-border opacity-70 hover:opacity-100 transition-opacity space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-xs text-muted-foreground line-through leading-snug">
                      {task.title}
                    </h4>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {getPriorityBadge(task.priority)}
                    <button
                      onClick={() => updateTaskStatus(task.id, 'in_progress')}
                      className="text-[10px] text-muted-foreground hover:underline"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() =>
                    updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')
                  }
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div className="min-w-0">
                  <h4
                    className={`text-xs font-medium truncate ${
                      task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.note && (
                    <span className="text-[10px] text-muted-foreground block truncate">
                      Linked: {task.note.title}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {getPriorityBadge(task.priority)}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
