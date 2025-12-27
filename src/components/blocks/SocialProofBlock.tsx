import { Theme } from '@/lib/schemas';
import { Quote } from 'lucide-react';

interface Logo {
  name: string;
  imageUrl?: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
}

interface SocialProofBlockProps {
  heading?: string;
  logos?: Logo[];
  testimonials?: Testimonial[];
  theme: Theme;
}

export function SocialProofBlock({ heading, logos, testimonials, theme }: SocialProofBlockProps) {
  return (
    <section 
      className="px-4 py-20"
      style={{
        backgroundColor: theme.mode === 'dark' ? '#1e293b' : '#f8fafc',
        color: theme.mode === 'dark' ? '#f8fafc' : '#0f172a',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {heading && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ fontFamily: theme.font === 'outfit' ? 'Outfit, sans-serif' : theme.font === 'inter' ? 'Inter, sans-serif' : 'system-ui' }}
          >
            {heading}
          </h2>
        )}
        
        {logos && logos.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-8 mb-16">
            {logos.map((logo, index) => (
              <div 
                key={index}
                className="px-6 py-3 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
                style={{
                  backgroundColor: theme.mode === 'dark' ? '#334155' : '#ffffff',
                }}
              >
                {logo.imageUrl ? (
                  <img 
                    src={logo.imageUrl} 
                    alt={logo.name}
                    className="h-8 object-contain"
                  />
                ) : (
                  <span className="font-semibold text-lg">{logo.name}</span>
                )}
              </div>
            ))}
          </div>
        )}
        
        {testimonials && testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl"
                style={{
                  backgroundColor: theme.mode === 'dark' ? '#334155' : '#ffffff',
                  boxShadow: theme.mode === 'dark' 
                    ? '0 4px 20px rgba(0,0,0,0.3)' 
                    : '0 4px 20px rgba(0,0,0,0.08)',
                }}
              >
                <Quote 
                  className="w-8 h-8 mb-4 opacity-30"
                  style={{ color: theme.primaryColor }}
                />
                
                <p className="text-lg mb-6 opacity-90">"{testimonial.quote}"</p>
                
                <div className="flex items-center gap-3">
                  {testimonial.avatarUrl ? (
                    <img 
                      src={testimonial.avatarUrl}
                      alt={testimonial.author}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      {testimonial.author.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    {testimonial.role && (
                      <div className="text-sm opacity-60">{testimonial.role}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
