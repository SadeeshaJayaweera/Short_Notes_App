'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

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
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="text-2xl">📝</div>
            {sidebarOpen && <span className="font-bold">Short Notes</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem
            href="/dashboard"
            label="Dashboard"
            icon={<Home className="w-5 h-5" />}
            active={isActive('/dashboard')}
            collapsed={!sidebarOpen}
          />
          <NavItem
            href="/dashboard/notes"
            label="All Notes"
            icon={<FileText className="w-5 h-5" />}
            active={isActive('/dashboard/notes')}
            collapsed={!sidebarOpen}
          />
          <NavItem
            href="/dashboard/folders"
            label="Folders"
            icon={<Folder className="w-5 h-5" />}
            active={isActive('/dashboard/folders')}
            collapsed={!sidebarOpen}
          />
        </nav>

        {/* Create Button */}
        <div className="p-4 border-t border-border">
          <Link href="/dashboard/new" className="w-full block">
            <Button className="w-full" size="sm">
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
        <div className="p-4 border-t border-border space-y-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              {sidebarOpen && <span className="text-sm">Theme</span>}
            </button>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent"
          >
            {sidebarOpen ? (
              <>
                <X className="w-5 h-5" />
                <span className="text-sm">Collapse</span>
              </>
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <Link href="/dashboard/settings" className="w-full block">
            <button className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent">
              <Settings className="w-5 h-5" />
              {sidebarOpen && <span className="text-sm">Settings</span>}
            </button>
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 p-2 rounded hover:bg-destructive/10 text-destructive"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {session?.user?.name && (
              <span className="text-sm text-muted-foreground">
                {session.user.name}
              </span>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
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
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          active
            ? 'bg-primary text-primary-foreground'
            : 'text-foreground hover:bg-accent'
        }`}
      >
        {icon}
        {!collapsed && <span className="text-sm">{label}</span>}
      </button>
    </Link>
  );
}
