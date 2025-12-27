import { Theme } from '@/lib/schemas';
import { cn } from '@/lib/utils';

interface CTASectionBlockProps {
  heading: string;
  subheading?: string;
  ctaText: string;
  ctaUrl?: string;
  variant?: 'default' | 'gradient' | 'dark';
  theme: Theme;
}

export function CTASectionBlock({ 
  heading, 
  subheading, 
  ctaText, 
  ctaUrl, 
  variant = 'default',
  theme 
}: CTASectionBlockProps) {
  const getBackgroundStyle = () => {
    switch (variant) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.primaryColor}dd 50%, ${theme.primaryColor}bb 100%)`,
          color: '#ffffff',
        };
      case 'dark':
        return {
          backgroundColor: '#0f172a',
          color: '#ffffff',
        };
      default:
        return {
          backgroundColor: theme.mode === 'dark' ? '#1e293b' : '#f8fafc',
          color: theme.mode === 'dark' ? '#f8fafc' : '#0f172a',
        };
    }
  };

  const bgStyle = getBackgroundStyle();

  return (
    <section 
      className="px-4 py-20"
      style={bgStyle}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          style={{ fontFamily: theme.font === 'outfit' ? 'Outfit, sans-serif' : theme.font === 'inter' ? 'Inter, sans-serif' : 'system-ui' }}
        >
          {heading}
        </h2>
        
        {subheading && (
          <p className="text-lg md:text-xl opacity-80 mb-8">{subheading}</p>
        )}
        
        <a
          href={ctaUrl || '#'}
          className={cn(
            "inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg",
            variant === 'gradient' || variant === 'dark'
              ? "bg-white text-gray-900 hover:bg-gray-100"
              : theme.buttonStyle === 'solid' 
                ? "text-white" 
                : "border-2 bg-transparent"
          )}
          style={
            variant === 'gradient' || variant === 'dark'
              ? {}
              : {
                  backgroundColor: theme.buttonStyle === 'solid' ? theme.primaryColor : 'transparent',
                  borderColor: theme.primaryColor,
                  color: theme.buttonStyle === 'solid' ? '#ffffff' : theme.primaryColor,
                }
          }
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}
