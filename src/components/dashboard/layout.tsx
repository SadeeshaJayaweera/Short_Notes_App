'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  Plus,
  Home,
  FileText,
  Folder,
  Settings,
  LogOut,
  Moon,
  Sun,
  Search,
  BarChart,
  Trash2,
  Sparkles,
  Share2,
  CheckSquare,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';
import { SearchModal } from '@/components/search-modal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      router.push(`/dashboard/notes?search=${encodeURIComponent(headerSearch.trim())}`);
      setHeaderSearch('');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-xs">
              📝
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight leading-none">Short Notes</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                  Second Brain
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavItem
            href="/dashboard"
            label="Dashboard"
            icon={<Home className="w-4 h-4" />}
            active={isActive('/dashboard')}
            collapsed={!sidebarOpen}
          />
          <NavItem
            href="/dashboard/notes"
            label="All Notes"
            icon={<FileText className="w-4 h-4" />}
            active={isActive('/dashboard/notes')}
            collapsed={!sidebarOpen}
          />
          <NavItem
            href="/dashboard/ai"
            label="AI Assistant"
            icon={<Sparkles className="w-4 h-4 text-purple-400" />}
            active={isActive('/dashboard/ai')}
            collapsed={!sidebarOpen}
          />
          <NavItem
            href="/dashboard/graph"
            label="Knowledge Graph"
            icon={<Share2 className="w-4 h-4 text-blue-400" />}
            active={isActive('/dashboard/graph')}
            collapsed={!sidebarOpen}
          />
          <NavItem
            href="/dashboard/tasks"
            label="Tasks"
            icon={<CheckSquare className="w-4 h-4 text-emerald-400" />}
            active={isActive('/dashboard/tasks')}
            collapsed={!sidebarOpen}
          />
          <NavItem
            href="/dashboard/folders"
            label="Folders"
            icon={<Folder className="w-4 h-4" />}
            active={isActive('/dashboard/folders')}
            collapsed={!sidebarOpen}
          />
          <NavItem
            href="/dashboard/analytics"
            label="Analytics"
            icon={<BarChart className="w-4 h-4" />}
            active={isActive('/dashboard/analytics')}
            collapsed={!sidebarOpen}
          />
          <NavItem
            href="/dashboard/trash"
            label="Trash"
            icon={<Trash2 className="w-4 h-4" />}
            active={isActive('/dashboard/trash')}
            collapsed={!sidebarOpen}
          />
        </nav>

        {/* Create Button */}
        <div className="p-3 border-t border-border">
          <Link href="/dashboard/new" className="w-full block">
            <Button className="w-full shadow-xs" size="sm">
              {sidebarOpen ? (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </>
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </Link>
        </div>

        {/* User Menu */}
        <div className="p-3 border-t border-border space-y-1">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
              {sidebarOpen && <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>}
            </button>
          )}

          <Link href="/dashboard/settings" className="w-full block">
            <button
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive('/dashboard/settings')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Settings className="w-4 h-4" />
              {sidebarOpen && <span>Settings</span>}
            </button>
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? (
              <>
                <X className="w-4 h-4" />
                <span>Collapse Menu</span>
              </>
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-destructive/10 text-xs font-medium text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg border border-border"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Quick Search Button */}
            <div
              onClick={() => setSearchModalOpen(true)}
              className="flex-1 max-w-md relative cursor-pointer"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <div className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background flex items-center justify-between text-xs text-muted-foreground hover:border-primary/40 transition-colors">
                <span>Quick search across knowledge base...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-muted text-muted-foreground border border-border rounded">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session?.user?.name && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                  {session.user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-foreground hidden sm:inline">
                  {session.user.name}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          {children}
        </main>
      </div>

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link href={href}>
      <button
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
          active
            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        {icon}
        {!collapsed && <span>{label}</span>}
      </button>
    </Link>
  );
}
