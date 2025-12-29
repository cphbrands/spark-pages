import { useParams, useNavigate } from 'react-router-dom';
import { useBuilderStore } from '@/lib/store';
import { PageRenderer } from '@/components/PageRenderer';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Globe } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function Preview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pages, publishPage } = useBuilderStore();
  const [showControls, setShowControls] = useState(true);
  
  const page = pages.find(p => p.id === id);

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/builder')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Builder
          </Button>
        </div>
      </div>
    );
  }

  const handlePublish = () => {
    try {
      publishPage(page.id);
      toast({
        title: 'Page Published!',
        description: `Your page is now live at /p/${page.meta.slug}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Preview: {page.meta.title}</title>
        {page.meta.description && (
          <meta name="description" content={page.meta.description} />
        )}
      </Helmet>
      
      {/* Floating Control Bar */}
      {showControls && (
        <div className="fixed top-16 right-8 z-50 animate-slide-up">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            <span className="text-white/60 text-sm mr-2">Preview Mode</span>
            
            <div className="h-4 w-px bg-white/20" />
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/builder/pages/${page.id}`)}
              className="text-white hover:bg-white/10"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            
            {page.status !== 'published' && (
              <Button 
                size="sm"
                onClick={handlePublish}
                className="bg-primary hover:bg-primary/90"
              >
                <Globe className="w-4 h-4 mr-1" />
                Publish
              </Button>
            )}
            
            {page.status === 'published' && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => window.open(`/p/${page.meta.slug}`, '_blank')}
                className="text-white hover:bg-white/10"
              >
                <Globe className="w-4 h-4 mr-1" />
                View Live
              </Button>
            )}
            
            <button 
              onClick={() => setShowControls(false)}
              className="ml-2 text-white/40 hover:text-white/80 text-xs"
            >
              Hide
            </button>
          </div>
        </div>
      )}
      
      {/* Show controls button when hidden */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed top-16 right-8 z-50 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur text-white text-sm hover:bg-black/80 transition-colors"
        >
          Show Controls
        </button>
      )}
      
      {/* Full Page Preview */}
      <PageRenderer page={page} />
    </>
  );
}
