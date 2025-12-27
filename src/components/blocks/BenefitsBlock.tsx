import { Theme } from '@/lib/schemas';
import { Check } from 'lucide-react';

interface BenefitsBlockProps {
  heading?: string;
  items: string[];
  theme: Theme;
}

export function BenefitsBlock({ heading, items, theme }: BenefitsBlockProps) {
  return (
    <section 
      className="px-4 py-20"
      style={{
        backgroundColor: theme.mode === 'dark' ? '#0f172a' : '#ffffff',
        color: theme.mode === 'dark' ? '#f8fafc' : '#0f172a',
      }}
    >
      <div className="max-w-3xl mx-auto">
        {heading && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ fontFamily: theme.font === 'outfit' ? 'Outfit, sans-serif' : theme.font === 'inter' ? 'Inter, sans-serif' : 'system-ui' }}
          >
            {heading}
          </h2>
        )}
        
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li 
              key={index}
              className="flex items-start gap-4 p-4 rounded-lg transition-all duration-300"
              style={{
                backgroundColor: theme.mode === 'dark' ? '#1e293b' : '#f8fafc',
              }}
            >
              <div 
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
