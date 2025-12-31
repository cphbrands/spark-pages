import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { PromptGenerator } from '@/components/PromptGenerator';
import { Button } from '@/components/ui/button';

export default function PageBuilder() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-builder-bg flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-builder-text">Page Builder</h1>
                <p className="text-sm text-builder-text-muted">Generate landing pages with AI blocks and sections.</p>
              </div>
            </div>
            <Button variant="outline" className="border-builder-border text-builder-text" onClick={() => navigate('/builder/library')}>
              Open Library
            </Button>
          </div>

          <div className="rounded-2xl border border-builder-border bg-builder-surface/70 p-4 text-sm text-builder-text-muted">
            <p>Describe your product or service. The generator will create hero, benefits, social proof, pricing, and CTA blocks.</p>
          </div>

          <PromptGenerator />
        </main>
      </div>
    </div>
  );
}