import { useParams } from 'react-router-dom';
import { useBuilderStore } from '@/lib/store';
import { PageRenderer } from '@/components/PageRenderer';
import { Helmet } from 'react-helmet-async';

export default function PublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const getPageBySlug = useBuilderStore(state => state.getPageBySlug);
  
  const page = slug ? getPageBySlug(slug) : undefined;

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600">The page you're looking for doesn't exist or has been unpublished.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.meta.title}</title>
        {page.meta.description && (
          <meta name="description" content={page.meta.description} />
        )}
        <meta property="og:title" content={page.meta.title} />
        {page.meta.description && (
          <meta property="og:description" content={page.meta.description} />
        )}
      </Helmet>
      
      <PageRenderer page={page} />
    </>
  );
}
