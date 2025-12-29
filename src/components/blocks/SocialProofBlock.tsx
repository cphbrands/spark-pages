import { Theme } from '@/lib/schemas';
import { Quote, Star } from 'lucide-react';

interface Logo {
  name: string;
  imageUrl?: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
  rating?: number;
  result?: string;
}

interface SocialProofBlockProps {
  heading?: string;
  subheading?: string;
  logos?: Logo[];
  testimonials?: Testimonial[];
  stats?: { value: string; label: string }[];
  title?: string;
  layout?: 'grid' | 'carousel';
  metadata?: {
    aiGenerated: boolean;
    disclosureText?: string;
  };
  theme: Theme;
}

export function SocialProofBlock({ heading, subheading, logos, testimonials, stats, title, layout = 'grid', metadata, theme }: SocialProofBlockProps) {
  const renderStars = (rating: number = 5) => (
    <div className="flex gap-0.5 mb-3">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className="w-4 h-4"
          fill={i < rating ? '#FBBF24' : 'transparent'}
          stroke={i < rating ? '#FBBF24' : '#9CA3AF'}
        />
      ))}
    </div>
  );

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
          <div className="text-center mb-12">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: theme.font === 'outfit' ? 'Outfit, sans-serif' : theme.font === 'inter' ? 'Inter, sans-serif' : 'system-ui' }}
            >
              {heading}
            </h2>
            {subheading && (
              <p className="text-lg opacity-70 max-w-2xl mx-auto">{subheading}</p>
            )}
          </div>
        )}

        {title && !heading && (
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: theme.font === 'outfit' ? 'Outfit, sans-serif' : theme.font === 'inter' ? 'Inter, sans-serif' : 'system-ui' }}>
              {title}
            </h2>
          </div>
        )}

        {metadata?.aiGenerated && (
          <div className="p-3 mb-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <div>
              <strong>Disclosure:</strong>{' '}
              {metadata.disclosureText || 'These testimonials are AI-generated examples to demonstrate potential customer feedback.'}
            </div>
          </div>
        )}

        {/* Stats row */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div 
                  className="text-4xl md:text-5xl font-bold mb-1"
                  style={{ color: theme.primaryColor }}
                >
                  {stat.value}
                </div>
                <div className="text-sm opacity-60 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Logo strip */}
        {logos && logos.length > 0 && (
          <div className="mb-16">
            <p className="text-center text-sm uppercase tracking-wider opacity-50 mb-6">Trusted by industry leaders</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {logos.map((logo, index) => (
                <div 
                  key={index}
                  className="opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                >
                  {logo.imageUrl ? (
                    <img 
                      src={logo.imageUrl} 
                      alt={logo.name}
                      className="h-8 md:h-10 object-contain"
                    />
                  ) : (
                    <span className="font-bold text-xl tracking-tight">{logo.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Testimonials */}
        {testimonials && testimonials.length > 0 && (
          <div className={
            layout === 'carousel'
              ? 'flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          }>
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={
                  layout === 'carousel'
                    ? 'p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 min-w-[280px] snap-center'
                    : 'p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1'
                }
                style={{
                  backgroundColor: theme.mode === 'dark' ? '#334155' : '#ffffff',
                  boxShadow: theme.mode === 'dark' 
                    ? '0 4px 30px rgba(0,0,0,0.4)' 
                    : '0 4px 30px rgba(0,0,0,0.08)',
                }}
              >
                {/* Accent bar */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                
                {renderStars(testimonial.rating)}
                
                <Quote 
                  className="absolute top-4 right-4 w-10 h-10 opacity-10"
                  style={{ color: theme.primaryColor }}
                />
                
                <p className="text-base md:text-lg mb-4 leading-relaxed opacity-90">
                  "{testimonial.quote}"
                </p>
                
                {/* Result highlight */}
                {testimonial.result && (
                  <div 
                    className="mb-4 px-3 py-2 rounded-lg text-sm font-medium inline-block"
                    style={{ 
                      backgroundColor: `${theme.primaryColor}15`,
                      color: theme.primaryColor
                    }}
                  >
                    📈 {testimonial.result}
                  </div>
                )}
                
                <div className="flex items-center gap-3 pt-4 border-t border-current/10">
                  {testimonial.avatarUrl ? (
                    <img 
                      src={testimonial.avatarUrl}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover border-2"
                      style={{ borderColor: theme.primaryColor }}
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      {testimonial.author.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold">{testimonial.author}</div>
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
