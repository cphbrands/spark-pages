import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBuilderStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { deletePageRemote } from '@/lib/page-service';
import {
  fetchUgcItems,
  fetchWizardProjects,
  deleteUgcItem,
  deleteWizardProject,
  seedUgcItems,
  seedWizardProjects,
  type WizardProject,
  type UgcItem,
} from '@/lib/library-service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Layout,
  Video,
  Route,
  Plus,
  Play,
  Upload,
  Eye,
  Sparkles,
  CheckCircle2,
  Clock3,
  MoreVertical,
  Trash2,
  Copy,
} from 'lucide-react';

export default function Library() {
  const navigate = useNavigate();
  const { pages, createBlankPage, deletePage, duplicatePage } = useBuilderStore();
  const [ugcItems, setUgcItems] = useState<UgcItem[]>([]);
  const [wizardProjects, setWizardProjects] = useState<WizardProject[]>([]);
  const [loadingUgc, setLoadingUgc] = useState(true);
  const [loadingWizard, setLoadingWizard] = useState(true);

  const handleCreateBlank = () => {
    const newPage = createBlankPage();
    navigate(`/builder/pages/${newPage.id}`);
  };

  const handleDeletePage = (pageId: string) => {
    const confirmed = window.confirm('Delete this page? This cannot be undone.');
    if (!confirmed) return;
    deletePage(pageId);
    deletePageRemote(pageId).catch((err) => console.warn('Remote delete failed', err));
  };

  const handleDuplicatePage = (pageId: string) => {
    const newPage = duplicatePage(pageId);
    navigate(`/builder/pages/${newPage.id}`);
  };

  const handleDeleteUgc = async (id: string) => {
    const confirmed = window.confirm('Delete this UGC item?');
    if (!confirmed) return;
    setUgcItems((items) => items.filter((item) => item.id !== id));
    try {
      await deleteUgcItem(id);
    } catch (err) {
      console.warn('UGC delete failed', err);
    }
  };

  const handleDeleteWizard = async (id: string) => {
    const confirmed = window.confirm('Delete this wizard project?');
    if (!confirmed) return;
    setWizardProjects((items) => items.filter((item) => item.id !== id));
    try {
      await deleteWizardProject(id);
    } catch (err) {
      console.warn('Wizard delete failed', err);
    }
  };

  const fallbackUgc = useMemo(() => seedUgcItems, []);
  const fallbackWizard = useMemo(() => seedWizardProjects, []);

  useEffect(() => {
    (async () => {
      try {
        const [ugc, wizard] = await Promise.all([fetchUgcItems(), fetchWizardProjects()]);
        setUgcItems(ugc.length ? ugc : fallbackUgc);
        setWizardProjects(wizard.length ? wizard : fallbackWizard);
      } catch (err) {
        console.warn('Library fetch failed, using seed data', err);
        setUgcItems(fallbackUgc);
        setWizardProjects(fallbackWizard);
      } finally {
        setLoadingUgc(false);
        setLoadingWizard(false);
      }
    })();
  }, [fallbackUgc, fallbackWizard]);

  const pageStats = useMemo(() => {
    const published = pages.filter((p) => p.status === 'published').length;
    const drafts = pages.filter((p) => p.status !== 'published').length;
    return { total: pages.length, published, drafts };
  }, [pages]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-builder-bg flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-builder-text">Library</h1>
                <p className="text-sm text-builder-text-muted">Central hub for pages, UGC, and wizard outputs.</p>
              </div>
            </div>
            <div className="hidden md:flex gap-3">
              <Button variant="outline" onClick={() => navigate('/builder/ugc')} className="border-builder-border">
                <Upload className="w-4 h-4 mr-2" />
                Import UGC
              </Button>
              <Button onClick={() => navigate('/builder/wizard')} className="bg-primary text-primary-foreground">
                <Route className="w-4 h-4 mr-2" />
                Open Wizard
              </Button>
            </div>
          </div>

          <Tabs defaultValue="pages" className="space-y-6">
            <TabsList className="bg-builder-surface text-builder-text-muted border border-builder-border">
              <TabsTrigger value="pages" className="data-[state=active]:text-builder-text data-[state=active]:bg-builder-bg">
                Landing Pages ({pageStats.total})
              </TabsTrigger>
              <TabsTrigger value="ugc" className="data-[state=active]:text-builder-text data-[state=active]:bg-builder-bg">
                UGC Library
              </TabsTrigger>
              <TabsTrigger value="wizard" className="data-[state=active]:text-builder-text data-[state=active]:bg-builder-bg">
                Wizard Projects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pages" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-builder-text">Landing pages</h2>
                  <p className="text-sm text-builder-text-muted">
                    {pageStats.published} live • {pageStats.drafts} drafts
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-builder-border" onClick={handleCreateBlank}>
                    <Plus className="w-4 h-4 mr-2" />
                    Blank page
                  </Button>
                  <Button onClick={() => navigate('/builder')}
                    className="bg-builder-text text-builder-bg hover:bg-builder-text/90">
                    <Layout className="w-4 h-4 mr-2" />
                    Open builder
                  </Button>
                </div>
              </div>

              {pages.length === 0 ? (
                <div className="border border-dashed border-builder-border rounded-xl p-8 text-center bg-builder-surface/60">
                  <div className="mx-auto mb-3 w-12 h-12 rounded-lg bg-builder-bg flex items-center justify-center border border-builder-border">
                    <Layout className="w-6 h-6 text-builder-text" />
                  </div>
                  <h3 className="text-lg font-semibold text-builder-text">No landing pages yet</h3>
                  <p className="text-sm text-builder-text-muted mb-4">Start from a blank canvas or jump into the builder.</p>
                  <div className="flex justify-center gap-3">
                    <Button onClick={() => navigate('/builder/wizard')} variant="ghost" className="text-builder-text">
                      <Route className="w-4 h-4 mr-2" />
                      Try wizard
                    </Button>
                    <Button onClick={() => navigate('/builder')} className="bg-primary text-primary-foreground">
                      Go to builder
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="rounded-xl border border-builder-border bg-builder-surface/80 overflow-hidden hover:-translate-y-1 transition cursor-pointer shadow-sm"
                      onClick={() => navigate(`/builder/pages/${page.id}`)}
                    >
                      <div
                        className="h-36 relative"
                        style={{ backgroundColor: page.theme.mode === 'dark' ? '#0f172a' : '#f8fafc' }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xl font-bold opacity-25 text-center px-4" style={{ color: page.theme.primaryColor }}>
                            {page.meta.title}
                          </div>
                        </div>
                        <div className="absolute top-3 left-3">
                          <span
                            className={cn(
                              'px-2 py-1 text-[11px] font-medium rounded-full shadow-sm',
                              page.status === 'published'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            )}
                          >
                            {page.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 text-xs px-2 py-1 rounded-full bg-white/80 text-builder-text shadow">
                          /{page.meta.slug}
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-builder-text truncate">{page.meta.title}</h3>
                            <p className="text-xs text-builder-text-muted">Updated {formatDate(page.updatedAt)}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-builder-text-muted hover:text-builder-text hover:bg-builder-surface-hover"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-builder-surface border-builder-border">
                              <DropdownMenuItem onClick={() => navigate(`/builder/pages/${page.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Edit / View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicatePage(page.id)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500" onClick={() => handleDeletePage(page.id)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center justify-between text-xs text-builder-text-muted">
                          <span>Theme: {page.theme.mode}</span>
                          <span>Primary: {page.theme.primaryColor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ugc" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-builder-text">UGC Library</h2>
                  <p className="text-sm text-builder-text-muted">Recent testimonial cuts, demos, and ads.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-builder-border" onClick={() => navigate('/builder/ugc')}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload / Generate
                  </Button>
                  <Button onClick={() => navigate('/builder/ugc')} className="bg-builder-text text-builder-bg hover:bg-builder-text/90">
                    <Play className="w-4 h-4 mr-2" />
                    Manage UGC
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(loadingUgc ? fallbackUgc : ugcItems).map((item) => (
                  <div key={item.id} className="rounded-xl border border-builder-border bg-builder-surface/80 overflow-hidden shadow-sm">
                    <div className="relative h-40 bg-builder-bg">
                      <img src={item.thumb} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/55 backdrop-blur flex items-center justify-center text-white">
                          <Play className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full shadow-sm',
                            item.status === 'Ready'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.status === 'Processing'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                          )}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-builder-text leading-tight">{item.title}</h3>
                          <p className="text-xs text-builder-text-muted">Updated {item.updated}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-builder-text-muted hover:text-builder-text" onClick={() => navigate('/builder/ugc')}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDeleteUgc(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-builder-text-muted">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ready to drop into a page</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wizard" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-builder-text">Wizard Projects</h2>
                  <p className="text-sm text-builder-text-muted">Track flows created with the guided experience.</p>
                </div>
                <Button onClick={() => navigate('/builder/wizard')} className="bg-primary text-primary-foreground">
                  <Route className="w-4 h-4 mr-2" />
                  Open Wizard
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(loadingWizard ? fallbackWizard : wizardProjects).map((proj) => (
                  <div key={proj.id} className="rounded-xl border border-builder-border bg-builder-surface/80 p-4 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium inline-flex items-center gap-1">
                          <Clock3 className="w-3 h-3" />
                          {proj.stage}
                        </div>
                        <h3 className="mt-2 text-base font-semibold text-builder-text leading-tight">{proj.title}</h3>
                        <p className="text-xs text-builder-text-muted">Updated {proj.lastUpdated}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => navigate('/builder/wizard')} className="text-builder-text">
                          Edit
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDeleteWizard(proj.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-lg bg-builder-bg/60 border border-builder-border/80 p-3 text-sm text-builder-text-muted">
                      Next: {proj.next}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}