import { Page } from '@/lib/schemas';
import { BlockRenderer } from './BlockRenderer';
import { useBuilderStore } from '@/lib/store';

interface PageRendererProps {
  page: Page;
  isPreview?: boolean;
  previewMode?: 'desktop' | 'mobile';
}

export function PageRenderer({ page, isPreview = false, previewMode = 'desktop' }: PageRendererProps) {
  const addLead = useBuilderStore(state => state.addLead);

  const handleLeadSubmit = async (data: { name: string; email: string; phone?: string }) => {
    addLead({
      pageId: page.id,
      pageSlug: page.meta.slug,
      name: data.name,
      email: data.email,
      phone: data.phone,
    });
  };

  const containerStyle = isPreview && previewMode === 'mobile' 
    ? { maxWidth: '375px', margin: '0 auto' }
    : {};

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: page.theme.mode === 'dark' ? '#0f172a' : '#ffffff',
        ...containerStyle,
      }}
    >
      {page.blocks.map(block => (
        <BlockRenderer 
          key={block.id} 
          block={block} 
          theme={page.theme}
          pageId={page.id}
          pageSlug={page.meta.slug}
          onLeadSubmit={handleLeadSubmit}
        />
      ))}
    </div>
  );
}
