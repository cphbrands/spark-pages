import { Theme } from '@/lib/schemas';

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
            <div className="text-xs opacity-70">Prompt: {props.prompt}</div>
          )}
        </div>
      ) : (
        <div className="space-y-2 text-sm opacity-80">
          <div>Attach an existing UGC video via the editor settings (upload or library).</div>
          {status === 'error' && <div className="text-red-600">{error || 'Video unavailable'}</div>}
        </div>
      )}
    </div>
  );
}
