import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useBuilderStore } from '@/lib/store';
import { generateLandingPage, GeneratorError } from '@/lib/generator-service';
import { Block } from '@/lib/schemas';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export function PromptGenerator() {
  const navigate = useNavigate();
  const { pages } = useBuilderStore();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (prompt.trim().length < 10) {
      setError('Please enter at least 10 characters describing your landing page');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const result = await generateLandingPage(prompt);

    if (!result.success) {
      setIsGenerating(false);
      const errorResult = result as GeneratorError;
      setError(errorResult.error.message);
      
      if (errorResult.error.details) {
        console.error('Validation errors:', errorResult.error.details);
      }
      
      toast.error('Failed to generate page', {
        description: errorResult.error.message,
      });
      return;
    }

    // Create page from generated data
    const now = new Date().toISOString();
    const generatedData = result.data;

    // Ensure unique slug
    let slug = generatedData.meta.slug;
    const existingSlugs = pages.map(p => p.meta.slug);
    if (existingSlugs.includes(slug)) {
      slug = `${slug}-${Date.now()}`;
    }

    // Add UUIDs to blocks
    const blocksWithIds: Block[] = generatedData.blocks.map(block => ({
      id: uuidv4(),
      type: block.type,
      props: block.props as Record<string, unknown>,
    }));

    const newPage = {
      id: uuidv4(),
      status: 'draft' as const,
      meta: {
        ...generatedData.meta,
        slug,
      },
      theme: generatedData.theme,
      blocks: blocksWithIds,
      createdAt: now,
      updatedAt: now,
    };

    // Add to store
    useBuilderStore.setState(state => ({
      pages: [...state.pages, newPage],
    }));

    setIsGenerating(false);
    toast.success('Landing page generated!');
    navigate(`/builder/pages/${newPage.id}`);
  };

  return (
    <div className="builder-panel p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-builder-text">AI Page Generator</h3>
          <p className="text-sm text-builder-text-muted">Describe your product or service</p>
        </div>
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value);
          setError(null);
        }}
        placeholder="E.g.: A fitness app for busy professionals. Features include personalized workout plans, progress tracking, and nutrition tips. Pricing at $19/month with a 7-day free trial..."
        className="min-h-[120px] bg-builder-bg border-builder-border text-builder-text placeholder:text-builder-text-muted resize-none mb-4"
        maxLength={2000}
        disabled={isGenerating}
      />

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-builder-text-muted">
          {prompt.length}/2000 characters
        </span>
        
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || prompt.trim().length < 10}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Page
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
