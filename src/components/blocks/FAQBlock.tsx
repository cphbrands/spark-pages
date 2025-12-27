import { Theme } from '@/lib/schemas';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQBlockProps {
  heading?: string;
  items: FAQItem[];
  theme: Theme;
}

export function FAQBlock({ heading, items, theme }: FAQBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div 
              key={index}
              className="rounded-xl overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: theme.mode === 'dark' ? '#1e293b' : '#f8fafc',
                border: openIndex === index ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-lg pr-4">{item.question}</span>
                <ChevronDown 
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-transform duration-300",
                    openIndex === index && "rotate-180"
                  )}
                  style={{ color: theme.primaryColor }}
                />
              </button>
              
              <div 
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openIndex === index ? "max-h-96" : "max-h-0"
                )}
              >
                <p className="px-5 pb-5 opacity-80 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
