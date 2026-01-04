import { Page } from '@/lib/schemas';
import { BlockRenderer } from './BlockRenderer';
import { useBuilderStore, PreviewMode } from '@/lib/store';

interface PageRendererProps {
  page: Page;
  isPreview?: boolean;
  previewMode?: PreviewMode;
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

  const containerStyle = isPreview
    ? previewMode === 'mobile'
      ? { maxWidth: '375px', margin: '0 auto' }
      : previewMode === 'tablet'
        ? { maxWidth: '768px', margin: '0 auto' }
        : { maxWidth: '1280px', margin: '0 auto' }
    : {};

  const blocks = Array.isArray(page.blocks) ? page.blocks : [];

  if (blocks.length === 0) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center text-center text-gray-400"
        style={{ backgroundColor: page.theme.mode === 'dark' ? '#0f172a' : '#ffffff', ...containerStyle }}
      >
        No blocks to render.
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: page.theme.mode === 'dark' ? '#0f172a' : '#ffffff',
        ...containerStyle,
      }}
    >
      {blocks.map(block => (
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
