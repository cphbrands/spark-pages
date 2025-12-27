import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Layout, Zap, Shield } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-builder-bg">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Landing Page Builder</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-builder-text mb-6 leading-tight">
            Build Landing Pages
            <br />
            <span className="text-gradient">In Minutes</span>
          </h1>
          
          <p className="text-xl text-builder-text-muted max-w-2xl mx-auto mb-10">
            Create fast, mobile-friendly landing pages using templates and reusable blocks. 
            No coding required.
          </p>
          
          <Button 
            size="lg"
            onClick={() => navigate('/builder')}
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto"
          >
            Open Builder
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {[
            { icon: Layout, title: '5 Templates', desc: 'Start with pre-built templates for any use case' },
            { icon: Zap, title: '12 Block Types', desc: 'Hero, Features, Pricing, Forms, and more' },
            { icon: Shield, title: 'Lead Capture', desc: 'Built-in forms with honeypot protection' },
          ].map((feature, i) => (
            <div key={i} className="builder-panel p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-builder-text mb-2">{feature.title}</h3>
              <p className="text-sm text-builder-text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
