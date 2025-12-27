import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle, Link, Code, ImageIcon, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useBuilderStore } from '@/lib/store';
import { generateLandingPage, GeneratorError } from '@/lib/generator-service';
import { ReferenceInput } from '@/lib/api-schemas';
import { Block } from '@/lib/schemas';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

type ReferenceType = 'url' | 'html' | 'image' | null;

export function PromptGenerator() {
  const navigate = useNavigate();
  const { pages } = useBuilderStore();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reference inputs
  const [showReference, setShowReference] = useState(false);
  const [referenceType, setReferenceType] = useState<ReferenceType>(null);
  const [referenceUrl, setReferenceUrl] = useState('');
  const [referenceHtml, setReferenceHtml] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImage(reader.result as string);
      setReferenceType('image');
    };
    reader.readAsDataURL(file);
  };

  const clearReference = () => {
    setReferenceType(null);
    setReferenceUrl('');
    setReferenceHtml('');
    setReferenceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const buildReference = (): ReferenceInput => {
    if (referenceType === 'url' && referenceUrl.trim()) {
      return { type: 'url', value: referenceUrl.trim() };
    }
    if (referenceType === 'html' && referenceHtml.trim()) {
      return { type: 'html', value: referenceHtml.trim() };
    }
    if (referenceType === 'image' && referenceImage) {
      return { type: 'image', value: referenceImage };
    }
    return undefined;
  };

  const handleGenerate = async () => {
    if (prompt.trim().length < 10) {
      setError('Please enter at least 10 characters describing your landing page');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const reference = buildReference();
    const result = await generateLandingPage(prompt, undefined, reference);

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

      {/* Reference section toggle */}
      <button
        type="button"
        onClick={() => setShowReference(!showReference)}
        className="flex items-center gap-2 text-sm text-builder-text-muted hover:text-builder-text mb-4 transition-colors"
      >
        {showReference ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        <span>Reference landing page (optional)</span>
      </button>

      {/* Reference inputs */}
      {showReference && (
        <div className="p-4 rounded-lg bg-builder-bg border border-builder-border mb-4 space-y-4">
          <p className="text-xs text-builder-text-muted">
            Provide a reference to match structure and style. Output will still use our whitelisted blocks.
          </p>
          
          {/* Reference type buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={referenceType === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                clearReference();
                setReferenceType('url');
              }}
              className={cn(
                "flex-1",
                referenceType === 'url' && "bg-purple-500 hover:bg-purple-600"
              )}
            >
              <Link className="w-4 h-4 mr-2" />
              URL
            </Button>
            <Button
              type="button"
              variant={referenceType === 'html' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                clearReference();
                setReferenceType('html');
              }}
              className={cn(
                "flex-1",
                referenceType === 'html' && "bg-purple-500 hover:bg-purple-600"
              )}
            >
              <Code className="w-4 h-4 mr-2" />
              HTML
            </Button>
            <Button
              type="button"
              variant={referenceType === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (referenceType !== 'image') {
                  clearReference();
                  fileInputRef.current?.click();
                }
              }}
              className={cn(
                "flex-1",
                referenceType === 'image' && "bg-purple-500 hover:bg-purple-600"
              )}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Image
            </Button>
          </div>

          {/* URL input */}
          {referenceType === 'url' && (
            <div className="relative">
              <Input
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="https://example.com/landing-page"
                className="bg-builder-bg border-builder-border text-builder-text pr-10"
              />
              <button
                type="button"
                onClick={clearReference}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-builder-text-muted hover:text-builder-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* HTML input */}
          {referenceType === 'html' && (
            <div className="relative">
              <Textarea
                value={referenceHtml}
                onChange={(e) => setReferenceHtml(e.target.value)}
                placeholder="Paste the HTML source code here..."
                className="min-h-[100px] bg-builder-bg border-builder-border text-builder-text font-mono text-xs resize-none"
                maxLength={100000}
              />
              <button
                type="button"
                onClick={clearReference}
                className="absolute right-2 top-2 text-builder-text-muted hover:text-builder-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Image preview */}
          {referenceType === 'image' && referenceImage && (
            <div className="relative inline-block">
              <img
                src={referenceImage}
                alt="Reference screenshot"
                className="max-h-[150px] rounded-lg border border-builder-border"
              />
              <button
                type="button"
                onClick={clearReference}
                className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      )}

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
