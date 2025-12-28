import { Theme } from '@/lib/schemas';
import { cn } from '@/lib/utils';

interface HeroBlockProps {
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string;
  alignment?: 'left' | 'center' | 'right';
  theme: Theme;
}

export function HeroBlock({ 
  headline, 
  subheadline, 
  ctaText, 
  ctaUrl, 
  imageUrl,
  alignment = 'center',
  theme 
}: HeroBlockProps) {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <section 
      className="relative min-h-[80vh] flex items-center justify-center px-4 py-20 overflow-hidden"
      style={{
        backgroundColor: theme.mode === 'dark' ? '#0f172a' : '#ffffff',
        color: theme.mode === 'dark' ? '#f8fafc' : '#0f172a',
      }}
    >
      {imageUrl && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div 
            className="absolute inset-0"
            style={{
              background: theme.mode === 'dark' 
                ? 'linear-gradient(to bottom, rgba(15,23,42,0.7) 0%, rgba(15,23,42,0.85) 50%, rgba(15,23,42,0.95) 100%)'
                : 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.95) 100%)'
            }}
          />
        </>
      )}
      
      {!imageUrl && (
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at top, ${theme.primaryColor}20 0%, transparent 70%)`
          }}
        />
      )}
      
      <div className={cn(
        "relative z-10 max-w-4xl mx-auto flex flex-col gap-6",
        alignmentClasses[alignment]
      )}>
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
          style={{ fontFamily: theme.font === 'outfit' ? 'Outfit, sans-serif' : theme.font === 'inter' ? 'Inter, sans-serif' : 'system-ui' }}
        >
          {headline}
        </h1>
        
        {subheadline && (
          <p className="text-lg md:text-xl opacity-80 max-w-2xl">
            {subheadline}
          </p>
        )}
        
        {ctaText && (
          <a
            href={ctaUrl || '#'}
            className={cn(
              "inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg mt-4",
              theme.buttonStyle === 'solid' 
                ? "text-white shadow-md" 
                : "border-2 bg-transparent"
            )}
            style={{
              backgroundColor: theme.buttonStyle === 'solid' ? theme.primaryColor : 'transparent',
              borderColor: theme.primaryColor,
              color: theme.buttonStyle === 'solid' ? '#ffffff' : theme.primaryColor,
            }}
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
