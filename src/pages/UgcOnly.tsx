import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar } from '@/components/Sidebar';
import { toast } from '@/hooks/use-toast';
import { FileVideo } from 'lucide-react';

export default function UgcOnly() {
  const [productName, setProductName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [style, setStyle] = useState<'ugc' | 'cinematic'>('ugc');
  const [promptResult, setPromptResult] = useState('');
  const [taskId, setTaskId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'ready' | 'error'>('idle');
  const [error, setError] = useState('');
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const handlePrompt = async () => {
    if (!productName.trim()) {
      toast({ title: 'Product name required', variant: 'destructive' });
      return;
    }
    setLoadingPrompt(true);
    setPromptResult('');
    try {
      const res = await fetch('/api/generate-ugc-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, imageUrl: imageUrl || undefined, style }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Prompt failed');
      setPromptResult(json.prompt || '');
      toast({ title: 'Prompt generated' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Prompt failed');
      toast({ title: 'Prompt failed', description: error, variant: 'destructive' });
    } finally {
      setLoadingPrompt(false);
    }
  };

  const pollVideo = async (id: string) => {
    try {
      const res = await fetch(`/api/generate-ugc-video?id=${encodeURIComponent(id)}`);
      const json = await res.json();
      if (json.status === 'ready') {
        setVideoUrl(json.videoUrl || '');
        setThumbnailUrl(json.thumbnailUrl || '');
        setStatus('ready');
        toast({ title: 'Video ready' });
      } else if (json.status === 'error') {
        setStatus('error');
        setError(json.error || 'Generation failed');
        toast({ title: 'Video failed', description: json.error, variant: 'destructive' });
      } else {
        setTimeout(() => pollVideo(id), 3000);
      }
    } catch (err: unknown) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Polling failed');
    }
  };

  const handleVideo = async () => {
    if (!productName.trim() || !imageUrl.trim()) {
      toast({ title: 'Product name and image URL required', variant: 'destructive' });
      return;
    }
    setLoadingVideo(true);
    setStatus('processing');
    setError('');
    try {
      const res = await fetch('/api/generate-ugc-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, imageUrl, style }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to start video');
      setTaskId(json.taskId);
      pollVideo(json.taskId);
    } catch (err: unknown) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Video start failed');
    } finally {
      setLoadingVideo(false);
    }
  };

  return (
    <div className="min-h-screen bg-builder-bg flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <header className="border-b border-builder-border bg-builder-surface/70 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FileVideo className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-builder-text">UGC Generator</h1>
                <p className="text-sm text-builder-text-muted">Generate prompt or video without a landing page.</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="builder-panel p-4 space-y-3">
              <h2 className="font-semibold text-builder-text">Inputs</h2>
              <div className="space-y-2">
                <label className="text-sm text-builder-text-muted">Product name</label>
                <Input value={productName} onChange={(e) => setProductName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-builder-text-muted">Image URL</label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-builder-text-muted">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as 'ugc' | 'cinematic')}
                  className="bg-builder-bg border border-builder-border rounded px-2 py-1 text-builder-text"
                >
                  <option value="ugc">UGC / handheld</option>
                  <option value="cinematic">Cinematic ad</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handlePrompt} disabled={loadingPrompt} className="flex-1 min-w-[180px]">
                  {loadingPrompt ? 'Generating...' : 'Generate prompt only'}
                </Button>
                <Button variant="secondary" onClick={handleVideo} disabled={loadingVideo} className="flex-1 min-w-[180px]">
                  {loadingVideo ? 'Starting...' : 'Start video job'}
                </Button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="builder-panel p-4 space-y-3">
              <h2 className="font-semibold text-builder-text">Prompt</h2>
              <Textarea value={promptResult} onChange={(e) => setPromptResult(e.target.value)} className="min-h-[200px]" placeholder="Generated prompt will appear here" />
            </div>
          </div>

          <div className="builder-panel p-4 space-y-3">
            <h2 className="font-semibold text-builder-text">Video status</h2>
            <p className="text-sm text-builder-text-muted">{status === 'processing' ? 'Generating...' : status === 'ready' ? 'Ready' : status === 'error' ? `Error: ${error}` : 'Idle'}</p>
            {videoUrl && (
              <video src={videoUrl} controls poster={thumbnailUrl} className="w-full max-w-xl rounded" />
            )}
            {taskId && <p className="text-xs text-builder-text-muted">Task ID: {taskId}</p>}
          </div>
        </main>
      </div>
    </div>
  );
}
