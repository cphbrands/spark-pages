import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  FileText,
  Trash2,
  Sparkles,
  Users,
  Library,
  Palette,
  Image,
  Settings,
  ChevronDown,
  Zap,
  Crown,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const workspaces = [
  { id: 'default', name: 'Workspace', icon: 'W', plan: 'FREE' },
  { id: 'team', name: 'Team Workspace', icon: 'T', plan: 'PRO' },
];

const mainNavItems = [
  { title: 'Home', url: '/builder', icon: Home },
];

const pagesNavItems = [
  { title: 'Pages', url: '/builder', icon: FileText },
  { title: 'Trash', url: '/builder/trash', icon: Trash2 },
];

const toolsNavItems = [
  { title: 'AI Generator', url: '/builder/wizard', icon: Sparkles, badge: 'AI' },
  { title: 'UGC Videos', url: '/builder/ugc', icon: Users },
  { title: 'Personalization', url: '/builder/personalization', icon: Zap },
];

const assetsNavItems = [
  { title: 'Library', url: '/builder/library', icon: Library },
  { title: 'Brand Kits', url: '/builder/brand', icon: Palette, upgrade: true },
  { title: 'Images', url: '/builder/images', icon: Image },
];

interface NavSectionProps {
  label: string;
  items: typeof mainNavItems;
  currentPath: string;
  onNavigate: (url: string) => void;
}

function NavSection({ label, items, currentPath, onNavigate }: NavSectionProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-1">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = currentPath === item.url || 
              (item.url !== '/builder' && currentPath.startsWith(item.url));
            const Icon = item.icon;
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  onClick={() => onNavigate(item.url)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate flex-1">{item.title}</span>
                  {('badge' in item && item.badge) && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary/20 text-primary rounded">
                      {String(item.badge)}
                    </span>
                  )}
                  {('upgrade' in item && item.upgrade) && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-warning/20 text-warning rounded">
                      <Crown className="w-3 h-3" />
                      UPGRADE
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);

  return (
    <Sidebar className="border-r border-border bg-sidebar-background">
      {/* Workspace Switcher */}
      <SidebarHeader className="p-3 border-b border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-2 py-6 hover:bg-accent"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold text-sm">
                {activeWorkspace.icon}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-semibold text-foreground truncate">
                  {activeWorkspace.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {activeWorkspace.plan}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[220px] bg-popover border-border z-50">
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => setActiveWorkspace(ws)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 cursor-pointer",
                  ws.id === activeWorkspace.id && "bg-accent"
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold text-sm">
                  {ws.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{ws.name}</div>
                  <div className="text-xs text-muted-foreground">{ws.plan}</div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-muted-foreground">
              Create workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Power up button */}
        <Button
          variant="outline"
          className="w-full mt-2 justify-center gap-2 border-primary/30 text-primary hover:bg-primary/10"
        >
          <Zap className="w-4 h-4" />
          Power up your pages
        </Button>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-4 space-y-6">
        <NavSection 
          label="" 
          items={mainNavItems} 
          currentPath={location.pathname} 
          onNavigate={navigate} 
        />
        <NavSection 
          label="Pages" 
          items={pagesNavItems} 
          currentPath={location.pathname} 
          onNavigate={navigate} 
        />
        <NavSection 
          label="Tools" 
          items={toolsNavItems} 
          currentPath={location.pathname} 
          onNavigate={navigate} 
        />
        <NavSection 
          label="Assets" 
          items={assetsNavItems} 
          currentPath={location.pathname} 
          onNavigate={navigate} 
        />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/builder/settings')}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
