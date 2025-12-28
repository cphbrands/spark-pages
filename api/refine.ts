import type { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 20;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

interface RefineRequest {
  prompt: string;
  currentPage: {
    meta: { title: string; slug: string; description?: string };
    theme: { mode: string; primaryColor: string; font: string; buttonStyle: string };
    blocks: Array<{ type: string; props: Record<string, unknown> }>;
  };
}

function validateRequest(body: unknown): { success: true; data: RefineRequest } | { success: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Invalid request body' };
  }
  
  const { prompt, currentPage } = body as Record<string, unknown>;
  
  if (typeof prompt !== 'string' || prompt.length < 3 || prompt.length > 2000) {
    return { success: false, error: 'Prompt must be 3-2000 characters' };
  }
  
  if (!currentPage || typeof currentPage !== 'object') {
    return { success: false, error: 'currentPage is required' };
  }
  
  return { 
    success: true, 
    data: { 
      prompt: prompt.trim(), 
      currentPage: currentPage as RefineRequest['currentPage']
    } 
  };
}

const SYSTEM_PROMPT = `You are a landing page editor. The user has an existing landing page and wants to refine it based on their instructions.

CRITICAL RULES:
1. Output MUST be valid JSON with the same structure as the input.
2. Only modify what the user asks for. Keep everything else EXACTLY the same.
3. Use ONLY the block types: Hero, Features, Benefits, SocialProof, Pricing, Countdown, FAQ, ImageGallery, Guarantee, CTASection, Footer, Form, Popup, StickyBar
4. Every block MUST have: { "type": "...", "props": { ... } }
5. If the user asks to add a block, add it at a logical position.
6. If the user asks to remove a block, remove it.
7. If the user asks to change text, colors, or theme - update accordingly.
8. DO NOT regenerate hero images - keep existing imageUrl values unless user explicitly asks to remove them.

Return the complete updated page JSON with this structure:
{
  "meta": { "title": "...", "slug": "...", "description": "..." },
  "theme": { "mode": "light|dark", "primaryColor": "#RRGGBB", "font": "inter|outfit|system", "buttonStyle": "solid|outline" },
  "blocks": [ ... ]
}

Block prop rules (MUST follow):
- Hero.props: headline (required), subheadline (optional), ctaText (optional), ctaUrl (optional), imageUrl (optional), alignment (optional: left|center|right)
- Features.props: heading (optional), items (1-6) [{ title, description, icon (optional) }]
- Benefits.props: heading (optional), items (1-10) [string]
- SocialProof.props: heading (optional), testimonials (optional) [{ quote, author, role (optional), avatarUrl (optional) }], logos (optional) [{ name, imageUrl (optional) }]
- Pricing.props: price (required string), features (array), ctaText optional, ctaUrl optional
- Countdown.props: endAt (ISO string), label optional, scarcityText optional
- FAQ.props: items (array) [{ question, answer }]
- ImageGallery.props: images [{ url, alt (optional), caption (optional) }]
- Guarantee.props: text (required), heading/icon optional
- CTASection.props: heading (required), ctaText (required), ctaUrl optional, variant optional (default|gradient|dark)
- Footer.props: links must use https URLs
- Form.props: webhookUrl optional (empty string if not used)
- Popup.props: heading (required), trigger optional (delay|exit|scroll)
- StickyBar.props: text (required), position optional (top|bottom)
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
  const origin = req.headers.origin || '';
  
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // API Key check
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // Rate limiting
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  // Validate request
  const validation = validateRequest(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  
  const { prompt, currentPage } = validation.data;
  
  try {
    console.log('Refining page with prompt:', prompt.substring(0, 100));
    
    const userMessage = `Current page JSON:
${JSON.stringify(currentPage, null, 2)}

User's refinement request: ${prompt}

Return the complete updated page JSON.`;
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        response_format: { type: 'json_object' },
        max_completion_tokens: 4000,
      }),
    });
    
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI error:', errorText);
      return res.status(500).json({ error: 'Failed to refine page' });
    }
    
    const openaiData = await openaiResponse.json();
    const refinedPage = JSON.parse(openaiData.choices[0].message.content);
    
    // Normalize theme
    const t = refinedPage.theme ?? {};
    const fontFamily = typeof t.fontFamily === 'string' ? t.fontFamily.toLowerCase() : '';
    refinedPage.theme = {
      mode: t.mode === 'dark' ? 'dark' : 'light',
      primaryColor: typeof t.primaryColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(t.primaryColor) ? t.primaryColor : currentPage.theme.primaryColor,
      font: t.font === 'inter' || t.font === 'outfit' || t.font === 'system'
        ? t.font
        : (fontFamily.includes('outfit') ? 'outfit' : (fontFamily.includes('inter') ? 'inter' : currentPage.theme.font)),
      buttonStyle: t.buttonStyle === 'outline' ? 'outline' : 'solid',
    };
    
    console.log('Refinement complete');
    return res.status(200).json(refinedPage);
    
  } catch (error) {
    console.error('Refinement error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
