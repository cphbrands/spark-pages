// Minimal request/response types (to avoid depending on @vercel/node in this setup)
type VercelRequest = { method?: string; body?: any; query?: Record<string, string | string[] | undefined> };
type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

import { generateVideoTestimonial } from './videoGenerationService.js';
import { createJob, getJob, hasJob, updateJob } from './jobStore.js';
import { logError, logInfo } from './logger.js';
import { isRateLimited, remainingRequests } from './rateLimiter.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requester =
    (req as any)?.headers?.['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
    (req as any)?.headers?.['cf-connecting-ip'] ||
    'anonymous';

  if (isRateLimited(requester)) {
    return res
      .status(429)
      .json({ error: 'Too many requests. Please wait before trying again.', remaining: remainingRequests(requester) });
  }

  if (req.method === 'POST') {
    try {
      const { prompt, imageUrl, style, productName } = (req.body || {}) as Record<string, any>;

      if (!imageUrl || !productName) {
        return res.status(400).json({ error: 'Missing required fields: imageUrl, productName' });
      }

      const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      await createJob(taskId, { status: 'processing', createdAt: new Date().toISOString() });
      logInfo('ugc-video:start', { taskId, productName, style });

      // Fire-and-forget async job
      (async () => {
        try {
          const result = await generateVideoTestimonial({ productName, imageUrl, style: style || 'ugc' });
          await updateJob(taskId, {
            status: 'ready',
            videoUrl: result.videoUrl,
            thumbnailUrl: result.thumbnailUrl,
            prompt: result.prompt,
            metadata: { aiGenerated: true },
          });
          logInfo('ugc-video:ready', { taskId, videoUrl: result.videoUrl });
        } catch (error: any) {
          await updateJob(taskId, {
            status: 'error',
            error: error?.message || 'Video generation failed',
          });
          logError('ugc-video:error', { taskId, message: error?.message });
        }
      })();

      return res.status(202).json({ taskId });
    } catch (err: any) {
      logError('ugc-video:post-failed', { message: err?.message });
      return res.status(500).json({ error: 'Failed to start video generation' });
    }
  }

  if (req.method === 'GET') {
    const idParam = (req.query?.id || req.query?.taskId) as string | string[] | undefined;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id || !(await hasJob(id))) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const job = await getJob(id);
    if (!job) return res.status(404).json({ error: 'Task not found' });
    return res.json({
      status: job.status,
      videoUrl: job.videoUrl,
      thumbnailUrl: job.thumbnailUrl,
      error: job.error,
      prompt: job.prompt,
      metadata: job.metadata,
    });
  }

  res.setHeader('Allow', 'POST, GET');
  res.status(405).end();
}
