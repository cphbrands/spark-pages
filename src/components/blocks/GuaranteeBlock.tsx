import { Theme } from '@/lib/schemas';
import { Shield, Award, ThumbsUp, CheckCircle } from 'lucide-react';

interface GuaranteeBlockProps {
  heading?: string;
  text: string;
  icon?: string;
  theme: Theme;
}

const iconMap: Record<string, React.ReactNode> = {
  shield: <Shield className="w-12 h-12" />,
  award: <Award className="w-12 h-12" />,
  thumbsUp: <ThumbsUp className="w-12 h-12" />,
  check: <CheckCircle className="w-12 h-12" />,
};

export function GuaranteeBlock({ heading, text, icon = 'shield', theme }: GuaranteeBlockProps) {
  return (
    <section 
      className="px-4 py-16"
      style={{
        backgroundColor: theme.mode === 'dark' ? '#1e293b' : '#f8fafc',
        color: theme.mode === 'dark' ? '#f8fafc' : '#0f172a',
      }}
    >
      <div 
        className="max-w-2xl mx-auto p-8 rounded-2xl text-center"
        style={{
          backgroundColor: theme.mode === 'dark' ? '#0f172a' : '#ffffff',
          border: `2px dashed ${theme.primaryColor}40`,
        }}
      >
        <div 
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
          style={{ 
            backgroundColor: `${theme.primaryColor}20`,
            color: theme.primaryColor,
          }}
        >
          {iconMap[icon] || iconMap.shield}
        </div>
        
        {heading && (
          <h3 
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ fontFamily: theme.font === 'outfit' ? 'Outfit, sans-serif' : theme.font === 'inter' ? 'Inter, sans-serif' : 'system-ui' }}
          >
            {heading}
          </h3>
        )}
        
        <p className="text-lg opacity-80 leading-relaxed">{text}</p>
      </div>
    </section>
  );
}
