import { useBuilderStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  MoreVertical,
  Copy,
  Trash2,
  ExternalLink,
  Layout,
  Sparkles,
  Wand2,
  Video,
  Upload,
  Play,
  Eye,
  Star,
  Layers,
} from 'lucide-react';
import { TemplatePicker } from '@/components/TemplatePicker';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { pages, createBlankPage, deletePage, duplicatePage } = useBuilderStore();
  const [showTemplates, setShowTemplates] = useState(false);

  const pageStats = useMemo(() => {
    const published = pages.filter((p) => p.status === 'published').length;
    const drafts = pages.filter((p) => p.status !== 'published').length;
    return { total: pages.length, published, drafts };
  }, [pages]);

  const handleCreateBlank = () => {
    const newPage = createBlankPage();
    navigate(`/builder/pages/${newPage.id}`);
  };

  const handleDuplicate = (pageId: string) => {
    const newPage = duplicatePage(pageId);
    navigate(`/builder/pages/${newPage.id}`);
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
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-builder-text">Dashboard</h1>
              <p className="text-sm text-builder-text-muted">Access flows, UGC, and your landing pages.</p>
            </div>
          </div>

          {/* Hero CTA tiles */}
          <div className="space-y-4">
            <div
              className="rounded-2xl border border-builder-border bg-builder-surface/80 shadow-sm overflow-hidden relative"
            >
              <div className="absolute inset-0" aria-hidden>
                <div className="absolute inset-0 opacity-25 blur-3xl bg-gradient-to-br from-purple-500/70 via-indigo-500/60 to-blue-500/70" />
                <div className="absolute -top-20 -right-16 w-72 h-72 bg-primary/25 blur-3xl rounded-full" />
                <div className="absolute -bottom-24 -left-10 w-80 h-80 bg-indigo-500/20 blur-3xl rounded-full" />
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.14),transparent_32%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_30%,rgba(255,255,255,0.04)_60%,rgba(255,255,255,0)_100%)]" />
              </div>
              <div className="relative p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:min-h-[240px]">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-3">
                    <div className="text-xs px-2 py-1 inline-flex rounded-full bg-builder-bg/80 border border-builder-border text-builder-text-muted">Guided</div>
                    <h3 className="text-3xl font-semibold text-builder-text leading-tight">Wizard Flow</h3>
                    <p className="text-base text-builder-text-muted max-w-3xl">Step-by-step guided creation with AI—collect product info, generate the page, and spin up UGC in one flow.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <Button size="lg" onClick={() => navigate('/builder/wizard')} className="bg-builder-text text-builder-bg hover:bg-builder-text/90 px-6 py-3 text-base">
                    Start wizard
                    <Play className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="ghost" size="lg" onClick={() => navigate('/builder/wizard')} className="text-builder-text-muted hover:text-builder-text px-6 py-3 text-base">
                    Learn more
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[{
                title: 'UGC Only',
                desc: 'Generate prompts and videos for testimonials.',
                icon: Video,
                accent: 'from-emerald-500/80 to-teal-500/80',
                action: () => navigate('/builder/ugc'),
                badge: 'UGC',
              }, {
                title: 'Landing Page Builder',
                desc: 'Full control with blocks, themes, and publishing.',
                icon: Layout,
                accent: 'from-orange-500/80 to-amber-500/80',
                action: () => navigate('/builder/page-builder'),
                badge: `${pageStats.published} live • ${pageStats.drafts} drafts`,
              }].map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-builder-border bg-builder-surface/80 shadow-sm overflow-hidden relative"
                >
                  <div className={cn('absolute inset-0 opacity-20 blur-3xl', `bg-gradient-to-br ${card.accent}`)} aria-hidden />
                  <div className="relative p-6 md:p-7 flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-4">
                      <div className={cn('w-12 h-12 rounded-xl text-white flex items-center justify-center bg-gradient-to-br', card.accent)}>
                        <card.icon className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-builder-bg/80 border border-builder-border text-builder-text-muted">
                        {card.badge}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-builder-text leading-tight">{card.title}</h3>
                      <p className="text-sm md:text-base text-builder-text-muted mt-1">{card.desc}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <Button size="default" onClick={card.action} className="bg-builder-text text-builder-bg hover:bg-builder-text/90 px-4">
                        Start
                        <Play className="w-4 h-4 ml-2" />
                      </Button>
                      <Button variant="ghost" size="default" onClick={card.action} className="text-builder-text-muted hover:text-builder-text">
                        Learn more
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My UGC preview section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-builder-text">My UGC</h2>
                <p className="text-builder-text-muted text-sm">Manage testimonial videos and ads.</p>
              </div>
              <Button onClick={() => navigate('/builder/ugc')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Upload className="w-4 h-4 mr-2" />
                Upload / Generate
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[{
                title: 'Product Demo Video',
                status: 'Ready',
                thumb: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=600&q=80',
                ago: '2 hours ago',
              }, {
                title: 'Customer Testimonial',
                status: 'Processing',
                thumb: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
                ago: '5 hours ago',
              }, {
                title: 'Feature Walkthrough',
                status: 'Draft',
                thumb: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=600&q=80',
                ago: '1 day ago',
              }].map((item) => (
                <div key={item.title} className="rounded-xl border border-builder-border bg-builder-surface/80 overflow-hidden shadow-sm">
                  <div className="relative h-40 bg-builder-bg">
                    <img src={item.thumb} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white">
                        <Play className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={cn('px-2 py-1 text-xs font-medium rounded-full shadow-sm',
                        item.status === 'Ready' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'Processing' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                      )}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-builder-text leading-tight">{item.title}</h3>
                        <p className="text-xs text-builder-text-muted">Updated {item.ago}</p>
                      </div>
                      <div className="flex items-center gap-2 text-builder-text-muted">
                        <Eye className="w-4 h-4 cursor-pointer" />
                        <Upload className="w-4 h-4 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pages section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-builder-text mb-1">Your Pages</h2>
              <p className="text-builder-text-muted">Create and manage your landing pages</p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleCreateBlank}
                className="border-builder-border text-builder-text bg-builder-surface/80 hover:bg-builder-surface-hover shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Blank Page
              </Button>
              <Button 
                onClick={() => setShowTemplates(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Layout className="w-4 h-4 mr-2" />
                From Template
              </Button>
            </div>
          </div>

          {pages.length === 0 ? (
            <div className="border border-builder-border rounded-2xl bg-builder-surface/60 p-10 relative overflow-hidden">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.35) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              <div className="relative flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold text-builder-text">No pages yet</h3>
                  <p className="text-builder-text-muted">Start from scratch, pick a template, or open the wizard.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {[{
                    title: 'Start from scratch',
                    icon: Plus,
                    action: handleCreateBlank,
                    tone: 'from-slate-100 to-slate-50',
                  }, {
                    title: 'Use a template',
                    icon: Layers,
                    action: () => setShowTemplates(true),
                    tone: 'from-purple-100 to-white',
                    badge: 'Popular',
                  }, {
                    title: 'Open Wizard',
                    icon: Wand2,
                    action: () => navigate('/builder/wizard'),
                    tone: 'from-amber-100 to-white',
                  }].map((tile) => (
                    <button
                      key={tile.title}
                      onClick={tile.action}
                      className="rounded-xl border border-builder-border bg-gradient-to-br text-left p-4 shadow-sm hover:-translate-y-0.5 transition"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-white/70 flex items-center justify-center border border-builder-border">
                          <tile.icon className="w-5 h-5 text-builder-text" />
                        </div>
                        {tile.badge && (
                          <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{tile.badge}</span>
                        )}
                      </div>
                      <div className="font-semibold text-builder-text leading-tight">{tile.title}</div>
                      <div className="text-sm text-builder-text-muted mt-1">Quick start option</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map(page => (
                <div 
                  key={page.id}
                  className="rounded-2xl border border-builder-border bg-builder-surface/80 overflow-hidden hover:-translate-y-1 hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/builder/pages/${page.id}`)}
                >
                  <div 
                    className="h-40 relative overflow-hidden"
                    style={{ 
                      backgroundColor: page.theme.mode === 'dark' ? '#111827' : '#f8fafc',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="text-2xl font-bold opacity-25 text-center px-4"
                        style={{ color: page.theme.primaryColor }}
                      >
                        {page.meta.title}
                      </div>
                    </div>
                    
                    <div className="absolute top-3 left-3">
                      <span 
                        className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full shadow-sm",
                          page.status === 'published' 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {page.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 text-[11px] rounded-full bg-white/80 text-builder-text shadow">/{page.meta.slug}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-builder-text truncate">{page.meta.title}</h3>
                        <p className="text-sm text-builder-text-muted mt-1 truncate">Updated {formatDate(page.updatedAt)}</p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-builder-text-muted hover:text-builder-text hover:bg-builder-surface-hover"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-builder-surface border-builder-border">
                          {page.status === 'published' && (
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); navigate(`/p/${page.meta.slug}`); }}
                              className="text-builder-text hover:bg-builder-surface-hover"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Live
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); handleDuplicate(page.id); }}
                            className="text-builder-text hover:bg-builder-surface-hover"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                            className="text-destructive hover:bg-builder-surface-hover"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-builder-text-muted">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span>Score 92</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        {/* Template Selection Dialog */}
        <TemplatePicker open={showTemplates} onOpenChange={setShowTemplates} />
      </div>
    </div>
  );
}
