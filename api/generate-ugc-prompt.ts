import { generateVideoPrompt } from '../api-lib/videoGenerationService.js';

// Minimal request/response typing to avoid @vercel/node dependency
 type VercelRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};
 type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function applyCors(req: VercelRequest, res: VercelResponse) {
  const originHeader = req.headers?.origin;
  const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader;
  if (origin && allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function isValidUrl(maybeUrl: unknown): boolean {
  if (typeof maybeUrl !== 'string') return false;
  try {
    const parsed = new URL(maybeUrl);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productName, imageUrl, style } = (req.body || {}) as {
    productName?: string;
    imageUrl?: string;
    style?: 'ugc' | 'cinematic';
  };

  if (!productName || productName.trim().length < 3) {
    return res.status(400).json({ error: 'productName is required' });
  }

  if (imageUrl && !isValidUrl(imageUrl)) {
    return res.status(400).json({ error: 'imageUrl must be a valid URL' });
  }

  try {
    const { prompt } = await generateVideoPrompt(productName.trim(), imageUrl, style || 'ugc');
    return res.status(200).json({ prompt });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate prompt';
    return res.status(500).json({ error: message });
  }
}
