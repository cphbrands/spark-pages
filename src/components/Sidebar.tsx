import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Sparkles,
  Wand2,
  Settings,
  FileVideo,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
  BookOpen,
  SunMedium,
  Moon,
  LifeBuoy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pages, currentPageId } = useBuilderStore();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Auto-collapse on smaller viewports
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setCollapsed(e.matches);
    };
    handler(mq);
    mq.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
  }, []);

  const editorPath = useMemo(() => {
    const pageId = currentPageId || pages[0]?.id;
    return pageId ? `/builder/pages/${pageId}` : '/builder';
  }, [currentPageId, pages]);

  const items: Array<{ label: string; icon: React.ElementType; onClick: () => void; active?: boolean }> = [
    {
      label: 'Dashboard',
      icon: Home,
      onClick: () => navigate('/builder'),
      active: location.pathname === '/builder',
    },
    {
      label: 'Flow Wizard',
      icon: Route,
      onClick: () => navigate('/builder/wizard'),
      active: location.pathname.startsWith('/builder/wizard'),
    },
    {
      label: 'UGC Only',
      icon: FileVideo,
      onClick: () => navigate('/builder/ugc'),
      active: location.pathname.startsWith('/builder/ugc'),
    },
    {
      label: 'Page Builder',
      icon: LayoutGrid,
      onClick: () => navigate('/builder/page-builder'),
      active: location.pathname.startsWith('/builder/page-builder'),
    },
    {
      label: 'Library',
      icon: BookOpen,
      onClick: () => navigate('/builder/library'),
      active: location.pathname.startsWith('/builder/library'),
    },
    {
      label: 'Editor',
      icon: Wand2,
      onClick: () => navigate(editorPath),
      active: location.pathname.startsWith('/builder/pages'),
    },
  ];

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo section */}
      <div className="px-3 py-4 flex items-center gap-2 border-b border-sidebar-border justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground text-sm">PageCraft</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto py-3 px-2 space-y-1">
        {items.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 h-9 px-3 font-normal text-sm',
              collapsed && 'justify-center px-0',
              item.active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
            onClick={item.onClick}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </nav>

      <div className={cn('border-t border-builder-border px-3 py-3 space-y-2', collapsed && 'px-2')}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2 rounded-none text-sm hover:text-builder-text',
            collapsed ? 'px-2' : 'px-3'
          )}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
        >
          {theme === 'dark' ? <SunMedium className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2 rounded-none text-sm hover:text-builder-text',
            collapsed ? 'px-2' : 'px-3'
          )}
          onClick={() => toast({ title: 'Settings', description: 'Settings coming soon.' })}
          title="Settings"
        >
          <Settings className="w-4 h-4" />
          {!collapsed && <span>Settings</span>}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2 rounded-none text-sm hover:text-builder-text',
            collapsed ? 'px-2' : 'px-3'
          )}
          onClick={() => toast({ title: 'Support', description: 'Support chat coming soon.' })}
          title="Support"
        >
          <LifeBuoy className="w-4 h-4" />
          {!collapsed && <span>Support</span>}
        </Button>
      </div>
    </aside>
  );
}
