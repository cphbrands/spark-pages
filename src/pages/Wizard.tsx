import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2, Save, Sparkles, Wand2, Video } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageRenderer } from '@/components/PageRenderer';
import { UGCVideoBlock } from '@/components/blocks/UGCVideoBlock';
import { useBuilderStore } from '@/lib/store';
import { useWizardStore, WizardStep } from '@/lib/wizard-store';
import { generateLandingPage } from '@/lib/generator-service';
import { defaultBlockProps, type Block, type BlockType } from '@/lib/schemas';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const steps: { id: WizardStep; label: string; helper: string }[] = [
  { id: 'prompt', label: 'Prompt', helper: 'Describe your product & upload optional reference' },
  { id: 'generate', label: 'Generate', helper: 'Sanitize and create the AI page' },
  { id: 'edit-page', label: 'AI Page', helper: 'Review & edit using the same editors' },
  { id: 'ugc-prompt', label: 'UGC Prompt', helper: 'Generate the video prompt only' },
  { id: 'ugc-video', label: 'Video Task', helper: 'Start & monitor generation' },
  { id: 'finalize', label: 'Finalize', helper: 'Save draft & preview' },
];

const allowedImageHosts = ['https://images.unsplash.com', 'https://firebasestorage.googleapis.com', 'https://storage.googleapis.com'];

function isTrustedImage(url: string) {
  return allowedImageHosts.some((prefix) => url.startsWith(prefix));
}

export default function Wizard() {
  const navigate = useNavigate();
  const builder = useBuilderStore();
  const wizard = useWizardStore();

  const [localPrompt, setLocalPrompt] = useState(wizard.prompt);
  const [referenceImage, setReferenceImage] = useState(wizard.imageUrl || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [ugcResult, setUgcResult] = useState<string>(wizard.ugcPrompt || '');
  const [ugcLoading, setUgcLoading] = useState(false);

  const currentPage = useMemo(
    () => (wizard.pageId ? builder.pages.find((p) => p.id === wizard.pageId) : undefined),
    [builder.pages, wizard.pageId]
  );

  useEffect(() => {
    setLocalPrompt(wizard.prompt);
    setReferenceImage(wizard.imageUrl || '');
    setUgcResult(wizard.ugcPrompt || '');
  }, [wizard.prompt, wizard.imageUrl, wizard.ugcPrompt]);

  const currentStepIndex = steps.findIndex((s) => s.id === wizard.step);

  const handleGenerate = async () => {
    if (localPrompt.trim().length < 10) {
      toast({ title: 'Prompt too short', description: 'Please enter at least 10 characters.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    wizard.setPrompt(localPrompt.trim());
    wizard.setReference(referenceImage ? { type: 'image', value: referenceImage } : undefined, referenceImage || undefined);
    wizard.setStep('generate');

    const result = await generateLandingPage(localPrompt.trim(), undefined, referenceImage ? { type: 'image', value: referenceImage } : undefined);

    if (!result.success) {
      setIsGenerating(false);
      const errResult = result as { success: false; error: { message: string } };
      toast({
        title: 'Generation failed',
        description: errResult.error?.message ?? 'Unknown error',
        variant: 'destructive',
      });
      wizard.setStep('prompt');
      return;
    }

    const now = new Date().toISOString();
    const data = result.data;
    const newPageId = crypto.randomUUID();
    const blocks: Block[] = data.blocks.map((block) => ({
      id: crypto.randomUUID(),
      type: block.type as BlockType,
      props: block.props,
    }));

    const newPage = {
      id: newPageId,
      status: 'draft' as const,
      meta: { ...data.meta, slug: `${data.meta.slug}-${Date.now()}` },
      theme: data.theme,
      blocks,
      createdAt: now,
      updatedAt: now,
    };

    useBuilderStore.setState((state) => ({ pages: [...state.pages, newPage] }));
    wizard.setPageId(newPageId);
    wizard.setStep('edit-page');
    setIsGenerating(false);
    toast({ title: 'Page ready', description: 'AI page generated and sanitized.' });
  };

  const handleEnsureUgcBlock = () => {
    if (!currentPage) return;
    const hasUgc = currentPage.blocks.some((b) => b.type === 'UGCVideo');
    if (hasUgc) return;
    const hero = currentPage.blocks.find((b) => b.type === 'Hero');
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type: 'UGCVideo',
      props: {
        ...(defaultBlockProps.UGCVideo as Record<string, unknown>),
        productName: currentPage.meta.title,
        imageUrl: (hero?.props as Record<string, unknown>)?.imageUrl as string | undefined,
        style: wizard.ugcStyle,
      },
    };
    useBuilderStore.getState().updatePage(currentPage.id, { blocks: [...currentPage.blocks, newBlock] });
  };

  const handleGenerateUgcPrompt = async () => {
    if (!currentPage) {
      toast({ title: 'Generate a page first', variant: 'destructive' });
      return;
    }

    const hero = currentPage.blocks.find((b) => b.type === 'Hero');
    const productName = currentPage.meta.title || 'Product';
    const heroImage = (hero?.props as Record<string, unknown>)?.imageUrl as string | undefined;

    setUgcLoading(true);
    try {
      handleEnsureUgcBlock();
      const res = await fetch('/api/generate-ugc-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, imageUrl: heroImage, style: wizard.ugcStyle }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Prompt generation failed');
      setUgcResult(json.prompt);
      wizard.setUgcPrompt(json.prompt);
      wizard.setStep('ugc-video');
      toast({ title: 'UGC prompt ready', description: 'You can edit it before starting the video job.' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not generate prompt';
      toast({ title: 'UGC prompt failed', description: message, variant: 'destructive' });
    } finally {
      setUgcLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await wizard.saveDraftToCloud(currentPage);
      toast({ title: 'Draft saved', description: `Draft ${wizard.draftId} updated.` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not save draft';
      toast({ title: 'Save failed', description: message, variant: 'destructive' });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const goToEditor = () => {
    if (wizard.pageId) {
      navigate(`/builder/pages/${wizard.pageId}?wizard=1`);
    }
  };

  const canGoNext = currentStepIndex < steps.length - 1;
  const ugcBlock = currentPage?.blocks.find((b) => b.type === 'UGCVideo');

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <header className="app-header">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Flowchart Wizard</h1>
                <p className="text-xs text-muted-foreground">Prompt → AI page → UGC video</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSavingDraft}>
                {isSavingDraft ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Draft
              </Button>
              {wizard.lastSavedAt && (
                <span className="text-xs text-muted-foreground">
                  Last saved {new Date(wizard.lastSavedAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {/* Step indicators */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={cn(
                  'p-3 rounded-lg border transition-colors',
                  idx <= currentStepIndex
                    ? 'border-primary/40 bg-accent'
                    : 'border-border bg-card'
                )}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                  {idx < currentStepIndex ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  )}
                  {step.label}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{step.helper}</p>
              </div>
            ))}
          </div>

          {/* Step content */}
          {(wizard.step === 'prompt' || wizard.step === 'generate') && (
            <div className="builder-panel p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Wand2 className="w-4 h-4 text-primary" />
                <h2 className="font-medium text-foreground">Step 1: Prompt</h2>
              </div>
              <Textarea
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                placeholder="Describe your offer, audience, and promise"
                className="min-h-[120px]"
                maxLength={2000}
              />
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Optional reference image (URL)</label>
                <Input
                  value={referenceImage}
                  onChange={(e) => setReferenceImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
                {referenceImage && !isTrustedImage(referenceImage) && (
                  <p className="text-xs text-warning mt-1">Use a trusted HTTPS image source to pass validation.</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate AI Page
                </Button>
                {currentPage && (
                  <Button variant="secondary" size="sm" onClick={() => wizard.setStep('edit-page')}>
                    Skip to edit
                  </Button>
                )}
              </div>
            </div>
          )}

          {wizard.step === 'edit-page' && currentPage && (
            <div className="builder-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-foreground">Step 2: Review & Edit</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Uses the same block editors as the main builder.</p>
                </div>
                <Button size="sm" onClick={goToEditor}>
                  Open Editor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                <PageRenderer page={currentPage} />
              </div>
              <Button variant="secondary" size="sm" onClick={() => wizard.setStep('ugc-prompt')}>
                Continue to UGC prompt
              </Button>
            </div>
          )}

          {wizard.step === 'ugc-prompt' && currentPage && (
            <div className="builder-panel p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-4 h-4 text-primary" />
                <h2 className="font-medium text-foreground">Step 3: Generate UGC Prompt</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Calls the prompt-only helper so no video job starts yet. You can edit before running.
              </p>
              <Textarea
                value={ugcResult}
                onChange={(e) => {
                  setUgcResult(e.target.value);
                  wizard.setUgcPrompt(e.target.value);
                }}
                placeholder="The generated UGC prompt will appear here"
                className="min-h-[140px]"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleGenerateUgcPrompt} disabled={ugcLoading}>
                  {ugcLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate Prompt Only
                </Button>
                <Button variant="secondary" size="sm" onClick={() => wizard.setStep('ugc-video')}>
                  Skip to video
                </Button>
              </div>
            </div>
          )}

          {wizard.step === 'ugc-video' && currentPage && ugcBlock && (
            <div className="builder-panel p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-4 h-4 text-primary" />
                <h2 className="font-medium text-foreground">Step 4: Start Video Task</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Reuses the same polling logic from the UGC video block. When ready, the page preview updates automatically.
              </p>
              <UGCVideoBlock
                blockId={ugcBlock.id}
                pageId={currentPage.id}
                productName={(ugcBlock.props as Record<string, unknown>).productName as string || currentPage.meta.title}
                imageUrl={(ugcBlock.props as Record<string, unknown>).imageUrl as string || referenceImage}
                style={(ugcBlock.props as Record<string, unknown>).style as 'ugc' | 'cinematic' | undefined || wizard.ugcStyle}
                videoUrl={(ugcBlock.props as Record<string, unknown>).videoUrl as string | undefined}
                thumbnailUrl={(ugcBlock.props as Record<string, unknown>).thumbnailUrl as string | undefined}
                prompt={ugcResult || ((ugcBlock.props as Record<string, unknown>).prompt as string | undefined)}
                status={(ugcBlock.props as Record<string, unknown>).status as 'idle' | 'processing' | 'ready' | 'error' | undefined}
                error={(ugcBlock.props as Record<string, unknown>).error as string | undefined}
                metadata={(ugcBlock.props as Record<string, unknown>).metadata as { aiGenerated: boolean; disclosureText?: string } | undefined}
                theme={currentPage.theme}
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => wizard.setStep('finalize')}>Continue to finalize</Button>
                {canGoNext && (
                  <Button variant="secondary" size="sm" onClick={() => wizard.setStep('ugc-prompt')}>
                    Back to prompt
                  </Button>
                )}
              </div>
            </div>
          )}

          {wizard.step === 'finalize' && currentPage && (
            <div className="builder-panel p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <h2 className="font-medium text-foreground">Step 5: Finalize & Preview</h2>
              </div>
              <p className="text-xs text-muted-foreground">Save your draft to Firestore and open the live preview.</p>
              <div className="rounded-lg border border-border overflow-hidden">
                <PageRenderer page={currentPage} />
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveDraft} disabled={isSavingDraft}>
                  {isSavingDraft ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Draft
                </Button>
                <Button variant="secondary" size="sm" onClick={() => navigate(`/preview/${currentPage.id}`)}>
                  Preview Page
                </Button>
                <Button variant="ghost" size="sm" onClick={() => wizard.reset()}>
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
