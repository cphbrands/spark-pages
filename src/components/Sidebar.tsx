import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Sparkles, Wand2, Settings, LogOut, FileVideo, Home, PanelLeftClose, PanelLeftOpen, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pages, currentPageId } = useBuilderStore();
  const [collapsed, setCollapsed] = useState(false);

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

  const items: Array<{ label: string; icon: React.ElementType; onClick: () => void; active?: boolean } > = [
    {
      label: 'Dashboard',
      icon: Home,
      onClick: () => navigate('/builder'),
      active: location.pathname === '/builder',
    },
    {
      label: 'My Pages',
      icon: LayoutGrid,
      onClick: () => navigate('/builder'),
      active: location.pathname === '/builder',
    },
    {
      label: 'My UGC',
      icon: FileVideo,
      onClick: () => navigate('/builder/ugc'),
      active: location.pathname.startsWith('/builder/ugc'),
    },
    {
      label: 'Wizard',
      icon: Route,
      onClick: () => navigate('/builder/wizard'),
      active: location.pathname.startsWith('/builder/wizard'),
    },
    {
      label: 'Editor',
      icon: Wand2,
      onClick: () => navigate(editorPath),
      active: location.pathname.startsWith('/builder/pages'),
    },
    {
      label: 'Settings',
      icon: Settings,
      onClick: () => toast({ title: 'Settings', description: 'Settings screen coming soon.' }),
      active: location.pathname.includes('/settings'),
    },
    {
      label: 'Sign out',
      icon: LogOut,
      onClick: () => {
        localStorage.clear();
        toast({ title: 'Signed out', description: 'Local data cleared.' });
        navigate('/');
      },
    },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-builder-surface/70 border-r border-builder-border backdrop-blur flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'} shrink-0`}
    >
      <div className="px-3 py-4 flex items-center gap-2 border-b border-builder-border justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-semibold text-builder-text">PageCraft</div>
              <div className="text-[11px] text-builder-text-muted">Builder</div>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-builder-text-muted hover:text-builder-text"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </Button>
      </div>
      <nav className="flex-1 overflow-auto py-4 space-y-1">
        {items.map((item) => (
          <Button
            key={item.label}
            variant={item.active ? 'secondary' : 'ghost'}
            className={`w-full justify-start gap-2 rounded-none ${collapsed ? 'px-2' : 'px-3'} text-sm`}
            onClick={item.onClick}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4" />
            {!collapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </nav>
    </aside>
  );
}
