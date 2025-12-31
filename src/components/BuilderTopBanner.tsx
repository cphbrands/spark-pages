import { Layout, Sparkles, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const links = [
  {
    label: 'UGC only',
    to: '/builder/ugc',
    icon: Users,
    isActive: (pathname: string) => pathname.startsWith('/builder/ugc'),
  },
  {
    label: 'Landing page',
    to: '/builder',
    icon: Layout,
    isActive: (pathname: string) =>
      pathname === '/builder' ||
      pathname.startsWith('/builder/pages') ||
      pathname.startsWith('/builder/leads'),
  },
  {
    label: 'Flow Wizard',
    to: '/builder/wizard',
    icon: Sparkles,
    isActive: (pathname: string) => pathname.startsWith('/builder/wizard'),
  },
];

export function BuilderTopBanner({ className }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className={cn('border-b border-builder-border bg-builder-surface/70 backdrop-blur-xl', className)}>
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-2 flex-wrap">
        {links.map((link) => {
          const active = link.isActive(pathname);
          const Icon = link.icon;
          return (
            <Button
              key={link.label}
              variant={active ? 'secondary' : 'ghost'}
              className={cn(
                'h-9 gap-2 px-3 text-sm',
                active ? 'text-builder-text' : 'text-builder-text/80 hover:text-builder-text'
              )}
              onClick={() => navigate(link.to)}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
