import { useBuilderStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  MoreVertical, 
  Copy, 
  Trash2, 
  ExternalLink,
  Sparkles,
  Import,
  Wand2,
  Globe,
  ChevronLeft,
  ChevronRight,
  Play,
  ArrowRight,
} from 'lucide-react';
import { TemplatePicker } from '@/components/TemplatePicker';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

// Quick action cards data
const quickActions = [
  {
    id: 'create',
    icon: Plus,
    title: 'Create a page',
    description: 'From template or blank',
    color: 'from-blue-500/20 to-blue-600/20',
    iconColor: 'text-blue-500',
  },
  {
    id: 'ai',
    icon: Sparkles,
    title: 'Create with AI',
    description: 'From any prompt',
    color: 'from-purple-500/20 to-purple-600/20',
    iconColor: 'text-purple-500',
  },
  {
    id: 'translate',
    icon: Globe,
    title: 'Translate page',
    description: 'Into any language',
    color: 'from-emerald-500/20 to-emerald-600/20',
    iconColor: 'text-emerald-500',
  },
  {
    id: 'import',
    icon: Import,
    title: 'Import design',
    description: 'From Figma or URL',
    color: 'from-orange-500/20 to-orange-600/20',
    iconColor: 'text-orange-500',
  },
];

// Mock templates data
const templates = [
  { id: '1', title: 'Product Launch', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', category: 'Marketing' },
  { id: '2', title: 'SaaS Landing', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', category: 'SaaS' },
  { id: '3', title: 'Event Page', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop', category: 'Events' },
  { id: '4', title: 'Portfolio', image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop', category: 'Portfolio' },
  { id: '5', title: 'E-commerce', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop', category: 'E-commerce' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { pages, createBlankPage, deletePage, duplicatePage } = useBuilderStore();
  const [showTemplates, setShowTemplates] = useState(false);
  const templatesRef = useRef<HTMLDivElement>(null);

  const handleQuickAction = (id: string) => {
    switch (id) {
      case 'create':
        setShowTemplates(true);
        break;
      case 'ai':
        navigate('/builder/wizard');
        break;
      default:
        // Other actions coming soon
        break;
    }
  };

  const handleCreateBlank = () => {
    const newPage = createBlankPage();
    navigate(`/builder/pages/${newPage.id}`);
  };

  const handleDuplicate = (pageId: string) => {
    const newPage = duplicatePage(pageId);
    navigate(`/builder/pages/${newPage.id}`);
  };

  const scrollTemplates = (direction: 'left' | 'right') => {
    if (templatesRef.current) {
      const scrollAmount = 300;
      templatesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Quick Actions */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className={cn(
                  "group relative flex items-center gap-4 p-4 rounded-xl border border-border bg-card",
                  "hover:border-primary/50 hover:shadow-lg transition-all duration-200",
                  "text-left"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                  action.color
                )}>
                  <Icon className={cn("w-5 h-5", action.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{action.title}</div>
                  <div className="text-sm text-muted-foreground truncate">{action.description}</div>
                </div>
              </button>
            );
          })}
        </section>

        {/* Welcome Hero Card */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border">
          <div className="flex flex-col lg:flex-row items-center gap-6 p-8">
            {/* Left: Illustration placeholder */}
            <div className="relative w-full lg:w-1/2 aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-blue-400/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white/80 text-sm">Watch tutorial</p>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Welcome to PageCraft!
              </h1>
              <p className="text-muted-foreground mb-6 max-w-md">
                See a quick tour to get started and create your first landing page. 
                Plus, join our community for tips and tricks!
              </p>
              <Button className="gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Templates Carousel */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Explore templates</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowTemplates(true)}>
                View all
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => scrollTemplates('left')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => scrollTemplates('right')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div 
            ref={templatesRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex-none w-64 group cursor-pointer"
                onClick={() => setShowTemplates(true)}
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                  <img
                    src={template.image}
                    alt={template.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs font-medium bg-black/50 text-white rounded-md">
                      {template.category}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {template.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Your Pages */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Your Pages</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {pages.length} page{pages.length !== 1 ? 's' : ''} created
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCreateBlank}>
                <Plus className="w-4 h-4 mr-2" />
                Blank
              </Button>
              <Button onClick={() => setShowTemplates(true)}>
                <Wand2 className="w-4 h-4 mr-2" />
                Template
              </Button>
            </div>
          </div>

          {pages.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No pages yet</h3>
              <p className="text-muted-foreground mb-6">Create your first landing page to get started</p>
              <Button onClick={() => setShowTemplates(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Page
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/builder/pages/${page.id}`)}
                >
                  {/* Thumbnail */}
                  <div
                    className="h-36 relative"
                    style={{
                      backgroundColor: page.theme.mode === 'dark' ? '#1e293b' : '#f8fafc',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="text-xl font-bold opacity-20 text-center px-4"
                        style={{ color: page.theme.primaryColor }}
                      >
                        {page.meta.title}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full",
                          page.status === 'published'
                            ? "bg-success/20 text-success"
                            : "bg-warning/20 text-warning"
                        )}
                      >
                        {page.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-foreground truncate">{page.meta.title}</h3>
                        <p className="text-sm text-muted-foreground">/{page.meta.slug}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border z-50">
                          {page.status === 'published' && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/p/${page.meta.slug}`); }}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Live
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(page.id); }}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Updated {formatDate(page.updatedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <TemplatePicker open={showTemplates} onOpenChange={setShowTemplates} />
    </AppShell>
  );
}
