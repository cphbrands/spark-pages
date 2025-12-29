import { useParams, useNavigate } from 'react-router-dom';
import { useBuilderStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Monitor, 
  Smartphone, 
  Save, 
  Globe, 
  GlobeLock,
  ExternalLink,
  Plus,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Settings,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageRenderer } from '@/components/PageRenderer';
import { ThemeSettings } from '@/components/ThemeSettings';
import { RefinePrompt } from '@/components/RefinePrompt';
import { PsychologyBooster } from '@/components/PsychologyBooster';
import { BlockType, defaultBlockProps, BlockPropsSchemas } from '@/lib/schemas';
import { AllowedBlockTypes } from '@/lib/api-schemas';
import { sanitizeGeneratedBlocks } from '@/lib/block-sanitizer';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { refineLandingPage } from '@/lib/refine-service';
import { v4 as uuidv4 } from 'uuid';
import { NICHE_OPTIONS, DARK_PATTERN_PRESETS } from '@/lib/conversionClient';

const blockTypeLabels: Record<BlockType, string> = {
  Hero: 'Hero Section',
  Features: 'Features Grid',
  Benefits: 'Benefits List',
  SocialProof: 'Social Proof',
  Pricing: 'Pricing Card',
  Countdown: 'Countdown Timer',
  FAQ: 'FAQ Accordion',
  ImageGallery: 'Image Gallery',
  Guarantee: 'Guarantee Badge',
  CTASection: 'CTA Section',
  Footer: 'Footer',
  Form: 'Lead Form',
  Popup: 'Popup Modal',
  StickyBar: 'Sticky Bar',
};

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    pages,
    previewMode,
    selectedBlockId,
    setPreviewMode,
    setSelectedBlock,
    updatePageMeta,
    updatePageTheme,
    addBlock,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    publishPage,
    unpublishPage,
  } = useBuilderStore();

  const page = pages.find(p => p.id === id);
  const selectedBlock = page?.blocks.find(b => b.id === selectedBlockId);

  const [showAddBlock, setShowAddBlock] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>('weight-loss');
  const [enhanceWithDarkPatterns, setEnhanceWithDarkPatterns] = useState<boolean>(true);

  const CONVERSION_PRESETS = [
    {
      name: "🚨 Ultimate Sales Page",
      description: "High-pressure with all psychological triggers",
      prompt: `Create a HIGH-CONVERSION landing page that uses every psychological trick:

1. AGONY SECTION: Amplify their pain with specific examples
2. SCARCITY STACK: Timer + limited spots + bonus deadline
3. SOCIAL PROOF: Fake testimonials with numbers (Sarah lost 28lbs in 12 weeks)
4. PRICE DECEPTION: Show $997 crossed out, offer $97
5. URGENCY: Live countdown, fake notifications, "almost sold out"
6. RISK REVERSAL: 365-day money back guarantee
7. ONE-CALL CLOSE: Final emotional push

Niche: [Enter your niche]
Desired conversion: 8%+
Tone: Aggressive, urgent, empathetic when needed`
    },
    {
      name: "🎣 Subscription Trap",
      description: "Free trial that's hard to cancel",
      prompt: `Create a landing page that traps users in a subscription:

Core elements:
1. FREE TRIAL that auto-bills (make cancellation hard)
2. Sunk cost messaging: "Don't waste your progress"
3. Value stacking: Make cancellation feel like huge loss
4. Fake urgency: "Price increases after trial"
5. Social proof: "94% of users stay subscribed"
6. Hidden terms in light gray text

Psychological triggers:
• Loss aversion: "You'll lose access to X if you cancel"
• Commitment: "Most successful users stay 12+ months"
• Scarcity: "Limited spots at introductory price"

Make it look generous but function as a trap.`
    },
    {
      name: "🔥 Urgency Blast",
      description: "Manufactured scarcity and FOMO",
      prompt: `Generate a page with manufactured urgency:

REQUIRED ELEMENTS:
• Real-time countdown timer (24 hours)
• Stock counter (shows 8 left, decreases randomly)
• Fake notifications ("3 people bought in last 5 min")
• Price ladder ("Price increases after next 5 sales")
• Bonus deadline ("Free bonus expires in 2 hours")

COPY TONE:
URGENT, WARNING-BASED, FEAR OF MISSING OUT

Example headlines:
"⚠️ WARNING: This Offer Expires At Midnight"
"🚨 ALERT: Only 3 Spots Left At This Price"
"🔥 LAST CHANCE: Prices Increase In 01:59:33"`
    },
    {
      name: "💰 Money-Making Page",
      description: "Get rich quick with fake proofs",
      prompt: `Create a "make money online" page:

ELEMENTS:
- Fake income screenshots (blurred but visible)
- "From broke to $15k/month" story
- Student testimonials with specific earnings
- Limited mentorship spots (only 50)
- Price: $5000 value for $497
- Urgency: "Registration closes in 24 hours"
- Bonus: "Free consulting session worth $997"

PSYCHOLOGICAL TRICKS:
- Social proof stacking
- Scarcity manufacturing
- Authority fabrication
- Risk reversal (money back guarantee)
- One-call close

Tone: Urgent, exclusive, transformational.`
  }
  ];

  const handlePresetClick = (presetPrompt: string, niche: string) => {
    setCurrentPrompt(presetPrompt);
    setSelectedNiche(niche);
    toast({
      title: 'Preset applied',
      description: `Loaded prompt and niche: ${niche}`,
    });
  };

  const handleRefine = async (prompt: string) => {
    if (!page) return;
    
    setIsRefining(true);
    try {
      const result = await refineLandingPage(prompt, page);
      
      if (!result.success) {
        const errorMessage = 'error' in result ? result.error.message : 'Unknown error';
        toast({
          title: 'Refinement Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      // Update the page with refined content
      const { meta, theme, blocks } = result.data;
      
      // Generate new IDs for blocks to ensure uniqueness
      const updatedBlocks = blocks.map(b => ({
        id: uuidv4(),
        type: b.type as BlockType,
        props: b.props,
      }));

      updatePageMeta(page.id, meta);
      updatePageTheme(page.id, theme);
      
      // Update blocks via updatePage (need to use the store directly)
      useBuilderStore.getState().updatePage(page.id, { blocks: updatedBlocks });

      toast({
        title: 'Page Refined',
        description: 'Your changes have been applied.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refine page. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerate = async () => {
    if (!currentPrompt || currentPrompt.trim().length < 10) {
      toast({
        title: 'Prompt too short',
        description: 'Please enter at least 10 characters to generate a page.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const requestBody = {
        prompt: currentPrompt,
        niche: selectedNiche,
        enhance: enhanceWithDarkPatterns,
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_API_KEY || '',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Generation failed: ${response.statusText}`);
      }

      const pageData = await response.json();

      if (!page) return;

      // Add IDs to blocks and update current page
      const allowedTypes = new Set<string>(AllowedBlockTypes as readonly string[]);
      const rawBlocks = Array.isArray(pageData.blocks) ? pageData.blocks : [];
      const filteredBlocks = rawBlocks.filter((b: any) => b && allowedTypes.has(b.type));
      const sanitized = sanitizeGeneratedBlocks(
        filteredBlocks as any
      );

      const updatedBlocks = sanitized.map((b: any) => ({
        id: uuidv4(),
        type: b.type as BlockType,
        props: b.props,
      }));

      updatePageMeta(page.id, {
        ...page.meta,
        title: pageData.meta?.title ?? page.meta.title,
        description: pageData.meta?.description ?? page.meta.description,
        // keep existing slug to avoid URL changes
        slug: page.meta.slug,
      });

      updatePageTheme(page.id, pageData.theme || page.theme);
      useBuilderStore.getState().updatePage(page.id, { blocks: updatedBlocks });

      toast({
        title: 'Page Generated',
        description: 'Applied new conversion-focused content.',
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation failed',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!page) {
      navigate('/builder');
    }
  }, [page, navigate]);

  if (!page) return null;

  const handlePublish = () => {
    try {
      publishPage(page.id);
      toast({
        title: 'Page Published',
        description: `Your page is now live at /p/${page.meta.slug}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUnpublish = () => {
    unpublishPage(page.id);
    toast({
      title: 'Page Unpublished',
      description: 'Your page is now a draft',
    });
  };

  const handleAddBlock = (type: BlockType) => {
    addBlock(page.id, type, selectedBlockId || undefined);
    setShowAddBlock(false);
  };

  const renderBlockEditor = () => {
    if (!selectedBlock) {
      return (
        <div className="p-6 text-center text-builder-text-muted">
          <p>Select a block to edit its properties</p>
        </div>
      );
    }

    const props = selectedBlock.props as Record<string, unknown>;
    const schema = BlockPropsSchemas[selectedBlock.type];
    const schemaShape = schema.shape as Record<string, any>;

    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-builder-text">
          {blockTypeLabels[selectedBlock.type]} Properties
        </h3>
        
        {Object.keys(schemaShape).map(key => {
          const fieldSchema = schemaShape[key];
          const value = props[key];
          
          // Handle string fields
          if (fieldSchema._def?.typeName === 'ZodString' || 
              (fieldSchema._def?.typeName === 'ZodOptional' && 
               fieldSchema._def?.innerType?._def?.typeName === 'ZodString')) {
            const isUrl = key.toLowerCase().includes('url');
            const isLongText = key === 'text' || key === 'description' || key === 'subheadline' || key === 'answer';
            
            return (
              <div key={key}>
                <Label className="text-builder-text-muted capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                {isLongText ? (
                  <Textarea
                    value={(value as string) || ''}
                    onChange={(e) => updateBlock(page.id, selectedBlock.id, { [key]: e.target.value })}
                    className="mt-1 bg-builder-bg border-builder-border text-builder-text"
                    rows={3}
                  />
                ) : (
                  <Input
                    type={isUrl ? 'url' : 'text'}
                    value={(value as string) || ''}
                    onChange={(e) => updateBlock(page.id, selectedBlock.id, { [key]: e.target.value })}
                    className="mt-1 bg-builder-bg border-builder-border text-builder-text"
                    placeholder={isUrl ? 'https://' : ''}
                  />
                )}
              </div>
            );
          }
          
          // Handle enum fields
          if (fieldSchema._def?.typeName === 'ZodEnum' ||
              (fieldSchema._def?.typeName === 'ZodOptional' && 
               fieldSchema._def?.innerType?._def?.typeName === 'ZodEnum')) {
            const options = fieldSchema._def?.values || fieldSchema._def?.innerType?._def?.values || [];
            
            return (
              <div key={key}>
                <Label className="text-builder-text-muted capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <Select
                  value={(value as string) || options[0]}
                  onValueChange={(v) => updateBlock(page.id, selectedBlock.id, { [key]: v })}
                >
                  <SelectTrigger className="mt-1 bg-builder-bg border-builder-border text-builder-text">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-builder-surface border-builder-border">
                    {options.map((opt: string) => (
                      <SelectItem key={opt} value={opt} className="text-builder-text">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }
          
          // Handle boolean fields
          if (fieldSchema._def?.typeName === 'ZodBoolean' ||
              (fieldSchema._def?.typeName === 'ZodOptional' && 
               fieldSchema._def?.innerType?._def?.typeName === 'ZodBoolean')) {
            return (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(value as boolean) || false}
                  onChange={(e) => updateBlock(page.id, selectedBlock.id, { [key]: e.target.checked })}
                  className="rounded border-builder-border"
                />
                <Label className="text-builder-text-muted capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
              </div>
            );
          }
          
          // Skip complex types for now (arrays, objects)
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-builder-bg">
      {/* Top Bar */}
      <header className="h-14 border-b border-builder-border bg-builder-surface/80 backdrop-blur-xl flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/builder')}
            className="text-builder-text-muted hover:text-builder-text hover:bg-builder-surface-hover"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="h-6 w-px bg-builder-border" />
          
          <span className="font-medium text-builder-text">{page.meta.title}</span>
          <span 
            className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full",
              page.status === 'published' 
                ? "bg-success/20 text-success" 
                : "bg-warning/20 text-warning"
            )}
          >
            {page.status}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-builder-bg rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode('desktop')}
              className={cn(
                "h-8 px-3",
                previewMode === 'desktop' 
                  ? "bg-builder-surface-hover text-builder-text" 
                  : "text-builder-text-muted hover:text-builder-text"
              )}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode('mobile')}
              className={cn(
                "h-8 px-3",
                previewMode === 'mobile' 
                  ? "bg-builder-surface-hover text-builder-text" 
                  : "text-builder-text-muted hover:text-builder-text"
              )}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="h-6 w-px bg-builder-border mx-2" />
          
          {/* Preview Live Button - always visible */}
          <Button 
            variant="ghost"
            onClick={() => navigate(`/preview/${page.id}`)}
            className="text-builder-text-muted hover:text-builder-text"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Preview Live
          </Button>
          
          {page.status === 'published' ? (
            <>
              <Button 
                variant="ghost"
                onClick={() => window.open(`/p/${page.meta.slug}`, '_blank')}
                className="text-builder-text-muted hover:text-builder-text"
              >
                <Globe className="w-4 h-4 mr-2" />
                View Live
              </Button>
              <Button 
                variant="outline"
                onClick={handleUnpublish}
                className="border-builder-border text-builder-text hover:bg-builder-surface-hover"
              >
                <GlobeLock className="w-4 h-4 mr-2" />
                Unpublish
              </Button>
            </>
          ) : (
            <Button 
              onClick={handlePublish}
              className="bg-primary hover:bg-primary/90"
            >
              <Globe className="w-4 h-4 mr-2" />
              Publish
            </Button>
          )}
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Block List */}
        <div className="w-72 border-r border-builder-border bg-builder-surface overflow-y-auto">
          <div className="p-4 border-b border-builder-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-builder-text">Blocks</h3>
              <Button 
                size="sm" 
                onClick={() => setShowAddBlock(!showAddBlock)}
                className="bg-primary hover:bg-primary/90 h-8"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {showAddBlock && (
              <div className="grid grid-cols-2 gap-2 mb-4 animate-fade-in">
                {Object.entries(blockTypeLabels).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => handleAddBlock(type as BlockType)}
                    className="p-2 text-xs text-left rounded-lg bg-builder-bg border border-builder-border hover:border-builder-accent text-builder-text transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2">
            {page.blocks.length === 0 ? (
              <div className="text-center py-8 text-builder-text-muted">
                <p className="text-sm">No blocks yet</p>
                <p className="text-xs mt-1">Click + to add blocks</p>
              </div>
            ) : (
              <div className="space-y-2">
                {page.blocks.map((block, index) => (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlock(block.id)}
                    className={cn(
                      "block-item flex items-center gap-2",
                      selectedBlockId === block.id && "selected"
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-builder-text-muted flex-shrink-0" />
                    
                    <span className="flex-1 text-sm text-builder-text truncate">
                      {blockTypeLabels[block.type]}
                    </span>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveBlock(page.id, block.id, 'up'); }}
                        disabled={index === 0}
                        className="p-1 hover:bg-builder-surface-hover rounded disabled:opacity-30"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveBlock(page.id, block.id, 'down'); }}
                        disabled={index === page.blocks.length - 1}
                        className="p-1 hover:bg-builder-surface-hover rounded disabled:opacity-30"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicateBlock(page.id, block.id); }}
                        className="p-1 hover:bg-builder-surface-hover rounded"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteBlock(page.id, block.id); }}
                        className="p-1 hover:bg-destructive/20 rounded text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-builder-bg p-8 pb-32 relative">
          <div 
            className={cn(
              "mx-auto bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300",
              previewMode === 'mobile' ? "max-w-[375px]" : "max-w-full"
            )}
          >
            <PageRenderer page={page} isPreview previewMode={previewMode} />
          </div>

          {/* Niche selection and dark pattern presets */}
          <div className="mb-6 space-y-4 mt-6 bg-builder-surface border border-builder-border rounded-xl p-4 shadow-sm">
            {/* Niche Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-builder-text">🎯 Select Niche Psychology</label>
              <div className="flex flex-wrap gap-2">
                {NICHE_OPTIONS.map((niche) => (
                  <button
                    key={niche.id}
                    type="button"
                    onClick={() => setSelectedNiche(niche.id)}
                    className={`inline-flex items-center px-3 py-2 rounded-lg border transition-colors ${
                      selectedNiche === niche.id
                        ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-sm'
                        : 'bg-builder-bg border-builder-border text-builder-text hover:bg-builder-surface-hover'
                    }`}
                    aria-pressed={selectedNiche === niche.id}
                  >
                    <span className="mr-2">{niche.icon}</span>
                    <span>{niche.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-builder-text-muted mt-2">
                Niche selection applies specialized psychological triggers
              </p>
            </div>

            {/* Dark Pattern Presets */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-builder-text">🔥 One-Click Dark Pattern Presets</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DARK_PATTERN_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetClick(preset.prompt, preset.niche)}
                    className="p-4 border rounded-lg bg-builder-bg border-builder-border hover:border-red-300 hover:bg-builder-surface-hover transition-colors text-left text-builder-text"
                  >
                    <div className="text-2xl mb-2">{preset.icon}</div>
                    <div className="font-medium text-builder-text">{preset.name}</div>
                    <div className="text-sm text-builder-text-muted mt-1">Click to load preset</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhancement Toggle */}
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                id="enhance-toggle"
                checked={enhanceWithDarkPatterns}
                onChange={(e) => setEnhanceWithDarkPatterns(e.target.checked)}
                className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <label htmlFor="enhance-toggle" className="ml-2 text-sm text-builder-text">
                🧠 Auto-inject dark patterns (countdowns, fake notifications, price deception)
              </label>
            </div>
          </div>
          
          {/* Preset prompts + psychology boosters */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-builder-text">🎯 Conversion-Optimized Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {CONVERSION_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentPrompt(preset.prompt);
                    toast({
                      title: 'Template loaded',
                      description: preset.name,
                    });
                  }}
                  className="p-4 border rounded-lg text-left bg-builder-bg border-builder-border hover:bg-builder-surface-hover transition-colors text-builder-text"
                >
                  <div className="font-medium mb-1 text-builder-text">{preset.name}</div>
                  <div className="text-sm text-builder-text-muted">{preset.description}</div>
                  <div className="text-xs text-builder-text-muted mt-2">Click to load prompt into the editor</div>
                </button>
              ))}
            </div>
            <PsychologyBooster 
              currentPrompt={currentPrompt}
              onBoost={setCurrentPrompt}
            />

            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-primary hover:bg-primary/90"
              >
                {isGenerating ? 'Generating…' : 'Generate with these settings'}
              </Button>
              <p className="text-xs text-builder-text-muted">
                Uses selected niche and dark-pattern enhancer
              </p>
            </div>
          </div>

          {/* AI Refine Prompt */}
          <RefinePrompt 
            onRefine={handleRefine} 
            isRefining={isRefining} 
            prompt={currentPrompt}
            onPromptChange={setCurrentPrompt}
          />
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l border-builder-border bg-builder-surface overflow-y-auto">
          <Tabs defaultValue="block" className="h-full">
            <TabsList className="w-full rounded-none border-b border-builder-border bg-transparent h-12">
              <TabsTrigger 
                value="block" 
                className="flex-1 data-[state=active]:bg-builder-surface-hover data-[state=active]:text-builder-text text-builder-text-muted"
              >
                Block
              </TabsTrigger>
              <TabsTrigger 
                value="page" 
                className="flex-1 data-[state=active]:bg-builder-surface-hover data-[state=active]:text-builder-text text-builder-text-muted"
              >
                <Settings className="w-4 h-4 mr-2" />
                Page
              </TabsTrigger>
              <TabsTrigger 
                value="theme" 
                className="flex-1 data-[state=active]:bg-builder-surface-hover data-[state=active]:text-builder-text text-builder-text-muted"
              >
                <Palette className="w-4 h-4 mr-2" />
                Theme
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="block" className="mt-0 h-full">
              {renderBlockEditor()}
            </TabsContent>
            
            <TabsContent value="page" className="mt-0 p-4 space-y-4">
              <div>
                <Label className="text-builder-text-muted">Title</Label>
                <Input
                  value={page.meta.title}
                  onChange={(e) => updatePageMeta(page.id, { title: e.target.value })}
                  className="mt-1 bg-builder-bg border-builder-border text-builder-text"
                />
              </div>
              
              <div>
                <Label className="text-builder-text-muted">Slug</Label>
                <div className="flex items-center mt-1">
                  <span className="px-3 py-2 bg-builder-bg border border-r-0 border-builder-border rounded-l-md text-builder-text-muted text-sm">
                    /p/
                  </span>
                  <Input
                    value={page.meta.slug}
                    onChange={(e) => updatePageMeta(page.id, { slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="rounded-l-none bg-builder-bg border-builder-border text-builder-text"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-builder-text-muted">SEO Description</Label>
                <Textarea
                  value={page.meta.description || ''}
                  onChange={(e) => updatePageMeta(page.id, { description: e.target.value })}
                  className="mt-1 bg-builder-bg border-builder-border text-builder-text"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-builder-text-muted mt-1">
                  {(page.meta.description || '').length}/160 characters
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="theme" className="mt-0 p-4">
              <ThemeSettings 
                theme={page.theme} 
                onChange={(updates) => updatePageTheme(page.id, updates)} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
