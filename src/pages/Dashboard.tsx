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
import { TemplatePicker } from '@/components/TemplatePicker';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { pages, createBlankPage, deletePage, duplicatePage } = useBuilderStore();
  const [showTemplates, setShowTemplates] = useState(false);

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
        {/* Header */}
        <header className="app-header">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">PageCraft</h1>
            </div>
            
            <nav className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/builder')}
              >
                <Layout className="w-4 h-4 mr-2" />
                Pages
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/builder/leads')}
              >
                <Users className="w-4 h-4 mr-2" />
                Leads
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/builder/wizard')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Flow Wizard
              </Button>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* AI Generator */}
          <PromptGenerator />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Your Pages</h2>
              <p className="text-muted-foreground text-sm mt-1">Create and manage your landing pages</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCreateBlank}
              >
                <Plus className="w-4 h-4 mr-2" />
                Blank Page
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowTemplates(true)}
              >
                <Layout className="w-4 h-4 mr-2" />
                From Template
              </Button>
            </div>
          </div>

          {pages.length === 0 ? (
            <div className="builder-panel p-12 text-center">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No pages yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Create your first landing page to get started</p>
              <Button onClick={() => setShowTemplates(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Page
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages.map(page => (
                <div 
                  key={page.id}
                  className="card-interactive overflow-hidden group cursor-pointer"
                  onClick={() => navigate(`/builder/pages/${page.id}`)}
                >
                  <div 
                    className="h-32 relative overflow-hidden bg-muted"
                    style={{ 
                      backgroundColor: page.theme.mode === 'dark' ? 'hsl(224 14% 11%)' : 'hsl(220 14% 96%)',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="text-xl font-semibold opacity-30 text-center px-4"
                        style={{ color: page.theme.primaryColor }}
                      >
                        {page.meta.title}
                      </div>
                    </div>
                    
                    <div className="absolute top-2.5 right-2.5">
                      <span 
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full",
                          page.status === 'published' 
                            ? "bg-success/15 text-success" 
                            : "bg-warning/15 text-warning"
                        )}
                      >
                        {page.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate text-sm">{page.meta.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">/{page.meta.slug}</p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                            className="text-destructive focus:text-destructive"
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
        </main>

        {/* Template Selection Dialog */}
        <TemplatePicker open={showTemplates} onOpenChange={setShowTemplates} />
      </div>
    </div>
  );
}
