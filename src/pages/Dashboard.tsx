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
  Users,
  Sparkles
} from 'lucide-react';
import { PromptGenerator } from '@/components/PromptGenerator';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { pages, templates, createPageFromTemplate, createBlankPage, deletePage, duplicatePage } = useBuilderStore();
  const [showTemplates, setShowTemplates] = useState(false);

  const handleCreateFromTemplate = (templateId: string) => {
    const newPage = createPageFromTemplate(templateId);
    setShowTemplates(false);
    navigate(`/builder/pages/${newPage.id}`);
  };

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
    <div className="min-h-screen bg-builder-bg">
      {/* Header */}
      <header className="border-b border-builder-border bg-builder-surface/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-builder-text">PageCraft</h1>
          </div>
          
          <nav className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="text-builder-text-muted hover:text-builder-text hover:bg-builder-surface-hover"
              onClick={() => navigate('/builder')}
            >
              <Layout className="w-4 h-4 mr-2" />
              Pages
            </Button>
            <Button 
              variant="ghost" 
              className="text-builder-text-muted hover:text-builder-text hover:bg-builder-surface-hover"
              onClick={() => navigate('/builder/leads')}
            >
              <Users className="w-4 h-4 mr-2" />
              Leads
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* AI Generator */}
        <PromptGenerator />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-builder-text mb-2">Your Pages</h2>
            <p className="text-builder-text-muted">Create and manage your landing pages</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleCreateBlank}
              className="border-builder-border text-builder-text hover:bg-builder-surface-hover"
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
          <div className="builder-panel p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-builder-surface-hover flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-builder-text-muted" />
            </div>
            <h3 className="text-xl font-semibold text-builder-text mb-2">No pages yet</h3>
            <p className="text-builder-text-muted mb-6">Create your first landing page to get started</p>
            <Button 
              onClick={() => setShowTemplates(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Page
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map(page => (
              <div 
                key={page.id}
                className="builder-panel overflow-hidden hover:border-builder-accent transition-all duration-300 group cursor-pointer"
                onClick={() => navigate(`/builder/pages/${page.id}`)}
              >
                <div 
                  className="h-40 relative overflow-hidden"
                  style={{ 
                    backgroundColor: page.theme.mode === 'dark' ? '#1e293b' : '#f8fafc',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="text-2xl font-bold opacity-20 text-center px-4"
                      style={{ color: page.theme.primaryColor }}
                    >
                      {page.meta.title}
                    </div>
                  </div>
                  
                  <div className="absolute top-3 right-3">
                    <span 
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        page.status === 'published' 
                          ? "bg-success/20 text-success" 
                          : "bg-warning/20 text-warning"
                      )}
                    >
                      {page.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-builder-text truncate">{page.meta.title}</h3>
                      <p className="text-sm text-builder-text-muted mt-1">/{page.meta.slug}</p>
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
                  
                  <p className="text-xs text-builder-text-muted mt-3">
                    Updated {formatDate(page.updatedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl bg-builder-surface border-builder-border text-builder-text">
          <DialogHeader>
            <DialogTitle className="text-2xl">Choose a Template</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[60vh] overflow-y-auto">
            {templates.map(template => (
              <div
                key={template.id}
                onClick={() => handleCreateFromTemplate(template.id)}
                className="p-4 rounded-xl border border-builder-border bg-builder-bg hover:border-builder-accent cursor-pointer transition-all duration-300 group"
              >
                <div 
                  className="h-32 rounded-lg mb-4 flex items-center justify-center"
                  style={{ 
                    backgroundColor: template.theme.mode === 'dark' ? '#1e293b' : '#f8fafc',
                  }}
                >
                  <span 
                    className="text-lg font-bold opacity-40"
                    style={{ color: template.theme.primaryColor }}
                  >
                    {template.templateName}
                  </span>
                </div>
                
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                  {template.templateName}
                </h3>
                <p className="text-sm text-builder-text-muted">
                  {template.templateDescription}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
