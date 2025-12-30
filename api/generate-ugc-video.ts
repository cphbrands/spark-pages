// Minimal request/response types (to avoid depending on @vercel/node in this setup)
type VercelRequest = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | string[] | undefined>;
};
type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

type GenerateVideoRequest = {
  prompt?: string;
  imageUrl?: string;
  productName?: string;
  style?: 'ugc' | 'cinematic';
};

type JobStatus = 'processing' | 'ready' | 'error';

import { generateVideoTestimonial } from '../api-lib/videoGenerationService.js';
import { createJob, getJob, hasJob, updateJob } from '../api-lib/jobStore.firestore.js';
import { logError, logInfo } from '../api-lib/logger.js';
import { isRateLimited, remainingRequests } from '../api-lib/rateLimiter.js';
import { URL } from 'url';
import { randomUUID } from 'crypto';

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);

function applyCors(req: VercelRequest, res: VercelResponse) {
  const originHeader = req.headers?.origin;
  const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader;
  if (origin && allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function validateAndSanitizeImageUrl(userInputUrl: string): string {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(userInputUrl);
  } catch {
    throw new Error('Invalid image URL format');
  }

  // Protocol allowlist
  const allowedProtocols = ['https:'];
  if (process.env.NODE_ENV !== 'production') {
    allowedProtocols.push('http:');
  }
  if (!allowedProtocols.includes(parsedUrl.protocol)) {
    throw new Error('Image URL must use HTTPS');
  }

  // Host allowlist (tighten as needed)
  const allowedHostnames = [
    'firebasestorage.googleapis.com',
    'storage.googleapis.com',
    'images.unsplash.com',
  ];
  if (!allowedHostnames.includes(parsedUrl.hostname)) {
    throw new Error('Image hostname is not from a trusted source');
  }

  // Basic private/internal host block
  const host = parsedUrl.hostname;
  if (
    host === 'localhost' ||
    host.startsWith('127.') ||
    host.startsWith('10.') ||
    host.startsWith('192.168.') ||
    host.startsWith('169.254.') ||
    host.endsWith('.internal')
  ) {
    throw new Error('Access to internal resources is not allowed');
  }

  return parsedUrl.toString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  const requester =
    (req.headers?.['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
    (req.headers?.['cf-connecting-ip'] as string | undefined) ||
    'anonymous';

  if (isRateLimited(requester)) {
    return res
      .status(429)
      .json({ error: 'Too many requests. Please wait before trying again.', remaining: remainingRequests(requester) });
  }

  if (req.method === 'POST') {
    try {
      const { prompt, imageUrl, style, productName } = (req.body || {}) as GenerateVideoRequest;

      if (!imageUrl || !productName) {
        return res.status(400).json({ error: 'Missing required fields: imageUrl, productName' });
      }

      const safeImageUrl = validateAndSanitizeImageUrl(imageUrl);

      const taskId = randomUUID();
      await createJob(taskId, { status: 'processing' as JobStatus, createdAt: new Date().toISOString() });
      logInfo('ugc-video:start', { taskId, productName, style });

      // Fire-and-forget async job
      (async () => {
        try {
          const result = await generateVideoTestimonial({ productName, imageUrl: safeImageUrl, style: style || 'ugc' });
          await updateJob(taskId, {
            status: 'ready',
            videoUrl: result.videoUrl,
            thumbnailUrl: result.thumbnailUrl,
            prompt: result.prompt,
            metadata: { aiGenerated: true },
          });
          logInfo('ugc-video:ready', { taskId, videoUrl: result.videoUrl });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Video generation failed';
          await updateJob(taskId, {
            status: 'error' as JobStatus,
            error: message,
          });
          logError('ugc-video:error', { taskId, message });
        }
      })();

      return res.status(202).json({ taskId });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start video generation';
      logError('ugc-video:post-failed', { message });
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
      status: job.status as JobStatus,
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
