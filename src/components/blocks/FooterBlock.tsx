import { Theme } from '@/lib/schemas';

interface Link {
  label: string;
  url: string;
}

interface FooterBlockProps {
  companyName?: string;
  links?: Link[];
  copyright?: string;
  theme: Theme;
}

export function FooterBlock({ companyName, links, copyright, theme }: FooterBlockProps) {
  return (
    <footer 
      className="px-4 py-12 border-t"
      style={{
        backgroundColor: theme.mode === 'dark' ? '#0f172a' : '#ffffff',
        color: theme.mode === 'dark' ? '#f8fafc' : '#0f172a',
        borderColor: theme.mode === 'dark' ? '#1e293b' : '#e2e8f0',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {companyName && (
            <div 
              className="text-xl font-bold"
              style={{ 
                fontFamily: theme.font === 'outfit' ? 'Outfit, sans-serif' : theme.font === 'inter' ? 'Inter, sans-serif' : 'system-ui',
                color: theme.primaryColor,
              }}
            >
              {companyName}
            </div>
          )}
          
          {links && links.length > 0 && (
            <nav className="flex flex-wrap justify-center gap-6">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>
        
        {copyright && (
          <div className="mt-8 text-center opacity-60 text-sm">
            {copyright}
          </div>
        )}
      </div>
    </footer>
  );
}
