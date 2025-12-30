import { useEffect, useRef, useState } from 'react';
import { useBuilderStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Theme } from '@/lib/schemas';
import { createCancellableFetch } from '@/lib/api-client';

interface UGCVideoBlockProps {
  blockId: string;
  pageId?: string;
  productName?: string;
  imageUrl?: string;
  style?: 'ugc' | 'cinematic';
  videoUrl?: string;
  thumbnailUrl?: string;
  prompt?: string;
  status?: 'idle' | 'processing' | 'ready' | 'error';
  error?: string;
  metadata?: {
    aiGenerated: boolean;
    disclosureText?: string;
  };
  theme: Theme;
}

type PollResponse = {
  status: 'processing' | 'ready' | 'error';
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  metadata?: { aiGenerated: boolean; disclosureText?: string };
};

export function UGCVideoBlock(props: UGCVideoBlockProps) {
  const {
    blockId,
    pageId,
    productName,
    imageUrl,
    style = 'ugc',
    videoUrl,
    thumbnailUrl,
    status = 'idle',
    error,
    metadata,
  } = props;

  const updateBlock = useBuilderStore((s) => s.updateBlock);
  const [isGenerating, setIsGenerating] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetcherRef = useRef(createCancellableFetch());

  const setProps = (updates: Record<string, unknown>) => {
    if (!pageId) return;
    updateBlock(pageId, blockId, updates);
  };

  useEffect(() => {
    const fetcher = fetcherRef.current;
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      fetcher.cancel();
    };
  }, []);

  const handleGenerate = async () => {
    if (isGenerating || status === 'processing') return;
    if (!imageUrl || !productName) {
      setProps({ status: 'error', error: 'Product name and image URL are required.' });
      return;
    }
    setIsGenerating(true);
    setProps({ status: 'processing', error: undefined });

    try {
      const response = await fetcherRef.current.run('/api/generate-ugc-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, imageUrl, style }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to start generation');
      }

      const { taskId } = await response.json();
      if (!taskId) throw new Error('No taskId returned');

      const interval = setInterval(async () => {
        try {
          const pollRes = await fetcherRef.current.run(`/api/generate-ugc-video?id=${encodeURIComponent(taskId)}`);
          const data: PollResponse = await pollRes.json();

          if (data.status === 'ready') {
            clearInterval(interval);
            pollRef.current = null;
            setIsGenerating(false);
            setProps({
              status: 'ready',
              videoUrl: data.videoUrl,
              thumbnailUrl: data.thumbnailUrl,
              metadata: {
                aiGenerated: true,
                disclosureText: data?.metadata?.disclosureText || 'AI-Generated Video Testimonial',
              },
            });
          } else if (data.status === 'error') {
            clearInterval(interval);
            pollRef.current = null;
            setIsGenerating(false);
            setProps({ status: 'error', error: data.error || 'Generation failed' });
          }
        } catch (err: unknown) {
          clearInterval(interval);
          pollRef.current = null;
          setIsGenerating(false);
          const message = err instanceof Error ? err.message : 'Generation failed';
          setProps({ status: 'error', error: message });
        }
      }, 3000);
      pollRef.current = interval;
    } catch (err: unknown) {
      setIsGenerating(false);
      const message = err instanceof Error ? err.message : 'Generation failed';
      setProps({ status: 'error', error: message });
    }
  };

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: props.theme.mode === 'dark' ? '#1e293b' : '#f8fafc',
        borderColor: props.theme.mode === 'dark' ? '#334155' : '#e2e8f0',
        color: props.theme.mode === 'dark' ? '#f8fafc' : '#0f172a',
      }}
    >
      {metadata?.aiGenerated && (
        <div className="mb-3 px-3 py-2 rounded bg-amber-50 text-amber-800 text-sm border border-amber-200">
          🔬 {metadata.disclosureText || 'AI-Generated Content'}
        </div>
      )}

      {videoUrl ? (
        <div className="space-y-2">
          <video
            src={videoUrl}
            controls
            poster={thumbnailUrl}
            className="w-full max-w-xl rounded border border-black/5"
          />
          {props.prompt && (
            <div className="text-xs opacity-70">Prompt used: {props.prompt}</div>
          )}
        </div>
      ) : isGenerating || status === 'processing' ? (
        <div className="flex items-center gap-2 text-sm opacity-80">
          <span className="animate-spin">⏳</span>
          <span>Generating your video... This may take up to a minute.</span>
        </div>
      ) : (
        <div className="space-y-2">
          <Button
            onClick={handleGenerate}
            disabled={!imageUrl || isGenerating || status === 'processing'}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            🎬 Generate AI Video Testimonial
          </Button>
          <div className="text-xs opacity-70">Requires a product image URL to start.</div>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 text-sm text-red-600">
          ❌ Generation failed: {error || 'Unknown error'}
        </div>
      )}
    </div>
  );
}
