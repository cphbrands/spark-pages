import { Theme } from '@/lib/schemas';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingBlockProps {
  heading?: string;
  price: string;
  compareAtPrice?: string;
  discountBadge?: string;
  features: string[];
  ctaText?: string;
  ctaUrl?: string;
  theme: Theme;
}

export function PricingBlock({ 
  heading, 
  price, 
  compareAtPrice, 
  discountBadge, 
  features, 
  ctaText, 
  ctaUrl,
  theme 
}: PricingBlockProps) {
  return (
    <section 
      className="px-4 py-20"
      style={{
        backgroundColor: theme.mode === 'dark' ? '#0f172a' : '#ffffff',
        color: theme.mode === 'dark' ? '#f8fafc' : '#0f172a',
      }}
    >
      <div className="max-w-lg mx-auto">
        {heading && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ fontFamily: theme.font === 'outfit' ? 'Outfit, sans-serif' : theme.font === 'inter' ? 'Inter, sans-serif' : 'system-ui' }}
          >
            {heading}
          </h2>
        )}
        
        <div 
          className="relative p-8 rounded-2xl text-center"
          style={{
            backgroundColor: theme.mode === 'dark' ? '#1e293b' : '#f8fafc',
            boxShadow: `0 0 60px ${theme.primaryColor}20`,
            border: `2px solid ${theme.primaryColor}`,
          }}
        >
          {discountBadge && (
            <div 
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {discountBadge}
            </div>
          )}
          
          <div className="mb-6">
            {compareAtPrice && (
              <span className="text-xl line-through opacity-50 mr-3">
                {compareAtPrice}
              </span>
            )}
            <span 
              className="text-5xl font-bold"
              style={{ color: theme.primaryColor }}
            >
              {price}
            </span>
          </div>
          
          <ul className="space-y-3 mb-8 text-left">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <Check 
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: theme.primaryColor }}
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          {ctaText && (
            <a
              href={ctaUrl || '#'}
              className={cn(
                "inline-flex items-center justify-center w-full px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105",
                theme.buttonStyle === 'solid' 
                  ? "text-white shadow-lg" 
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
      </div>
    </section>
  );
}
