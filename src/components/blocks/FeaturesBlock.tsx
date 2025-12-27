import { Theme } from '@/lib/schemas';
import { Zap, Shield, Rocket, Star, Heart, Check } from 'lucide-react';

interface FeatureItem {
  icon?: string;
  title: string;
  description: string;
}

interface FeaturesBlockProps {
  heading?: string;
  items: FeatureItem[];
  theme: Theme;
}

const iconMap: Record<string, React.ReactNode> = {
  zap: <Zap className="w-6 h-6" />,
  shield: <Shield className="w-6 h-6" />,
  rocket: <Rocket className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
  heart: <Heart className="w-6 h-6" />,
  check: <Check className="w-6 h-6" />,
};

export function FeaturesBlock({ heading, items, theme }: FeaturesBlockProps) {
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
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            style={{ fontFamily: theme.font === 'outfit' ? 'Outfit, sans-serif' : theme.font === 'inter' ? 'Inter, sans-serif' : 'system-ui' }}
          >
            {heading}
          </h2>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div 
              key={index}
              className="p-6 rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: theme.mode === 'dark' ? '#334155' : '#ffffff',
                boxShadow: theme.mode === 'dark' 
                  ? '0 4px 20px rgba(0,0,0,0.3)' 
                  : '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ 
                  backgroundColor: `${theme.primaryColor}20`,
                  color: theme.primaryColor,
                }}
              >
                {item.icon && iconMap[item.icon] ? iconMap[item.icon] : <Zap className="w-6 h-6" />}
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="opacity-70">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
