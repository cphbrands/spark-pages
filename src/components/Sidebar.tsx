import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Sparkles, Wand2, Settings, LogOut, FileVideo, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pages, currentPageId } = useBuilderStore();

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
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-builder-surface/70 border-r border-builder-border backdrop-blur flex flex-col">
      <div className="px-4 py-5 flex items-center gap-2 border-b border-builder-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-semibold text-builder-text">PageCraft</div>
          <div className="text-xs text-builder-text-muted">Builder</div>
        </div>
      </div>
      <nav className="flex-1 overflow-auto py-4 space-y-2">
        {items.map((item) => (
          <Button
            key={item.label}
            variant={item.active ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2 rounded-none px-4"
            onClick={item.onClick}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Button>
        ))}
      </nav>
    </aside>
  );
}
