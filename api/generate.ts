import type { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limiting (in-memory - use Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 10;

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

// Zod-like validation (inline to avoid module issues)
function validateRequest(body: unknown): { success: true; data: RequestData } | { success: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Invalid request body' };
  }
  
  const { prompt, templateId, reference } = body as Record<string, unknown>;
  
  if (typeof prompt !== 'string' || prompt.length < 10 || prompt.length > 2000) {
    return { success: false, error: 'Prompt must be 10-2000 characters' };
  }
  
  if (templateId !== undefined && typeof templateId !== 'string') {
    return { success: false, error: 'templateId must be a string' };
  }
  
  if (reference !== undefined) {
    if (typeof reference !== 'object' || reference === null) {
      return { success: false, error: 'reference must be an object' };
    }
    const ref = reference as Record<string, unknown>;
    if (!['url', 'html'].includes(ref.type as string)) {
      return { success: false, error: 'reference.type must be "url" or "html"' };
    }
    if (typeof ref.value !== 'string' || ref.value.length > 100000) {
      return { success: false, error: 'reference.value must be a string under 100000 chars' };
    }
  }
  
  return { 
    success: true, 
    data: { 
      prompt: prompt.trim(), 
      templateId: templateId as string | undefined,
      reference: reference as { type: 'url' | 'html'; value: string } | undefined
    } 
  };
}

interface RequestData {
  prompt: string;
  templateId?: string;
  reference?: { type: 'url' | 'html'; value: string };
}

const SYSTEM_PROMPT = `You are a landing page generator. Given a user prompt, generate a complete landing page JSON structure that STRICTLY matches the schema below.

CRITICAL RULES:
1. Output MUST be valid JSON.
2. Use ONLY the block types listed under "Available block types".
3. Every block MUST be an object with: { "type": "...", "props": { ... } }.
4. Countdown is a LIVE UI component — never include timer UI inside heroImagePrompt.
5. heroImagePrompt must describe a background/scene only — NO text, NO UI elements.

Return a JSON object with this exact structure:
{
  "meta": {
    "title": "Page title (max 100 chars)",
    "slug": "url-slug-lowercase-with-hyphens",
    "description": "Optional description (max 300 chars)"
  },
  "theme": {
    "mode": "light" | "dark",
    "primaryColor": "#RRGGBB",
    "font": "inter" | "outfit" | "system",
    "buttonStyle": "solid" | "outline"
  },
  "blocks": [
    { "type": "Hero", "props": { "headline": "...", "subheadline": "...", "ctaText": "...", "ctaUrl": "#form", "imageUrl": "", "alignment": "center" } }
  ],
  "heroImagePrompt": "A description for image generation. Background only. No text/UI."
}

Available block types: Hero, Features, Benefits, SocialProof, Pricing, Countdown, FAQ, ImageGallery, Guarantee, CTASection, Footer, Form, Popup, StickyBar

Block prop rules (MUST follow):
- Hero.props: headline (required), subheadline (optional), ctaText (optional), ctaUrl (optional), imageUrl (optional), alignment (optional: left|center|right)
- Features.props: heading (optional), items (1-6) [{ title, description, icon (optional) }]
- Benefits.props: heading (optional), items (1-10) [string]
- SocialProof.props: heading (optional), testimonials (optional) [{ quote, author, role (optional), avatarUrl (optional) }], logos (optional) [{ name, imageUrl (optional) }]
- Pricing.props: price (required string), features (array), ctaText optional, ctaUrl optional
- Countdown.props: endAt (ISO string), label optional, scarcityText optional
- FAQ.props: items (array) [{ question, answer }]
- ImageGallery.props: images [{ url, alt (optional), caption (optional) }] (use https URLs)
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
  
  const { prompt, reference } = validation.data;
  
  try {
    // Step A: Generate page JSON with OpenAI
    console.log('Step A: Generating page structure...');
    
    let userPrompt = prompt;
    if (reference) {
      userPrompt += `\n\nReference ${reference.type}: ${reference.value.substring(0, 5000)}`;
    }
    
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
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        max_completion_tokens: 4000,
      }),
    });
    
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI error:', errorText);
      return res.status(500).json({ error: 'Failed to generate page structure' });
    }
    
    const openaiData = await openaiResponse.json();
    const generatedContent = JSON.parse(openaiData.choices[0].message.content);
    
    const { heroImagePrompt, ...pageJson } = generatedContent;

    // Normalize theme to match frontend schema (prevents "Invalid response from API")
    const t = (pageJson as any).theme ?? {};
    const fontFamily = typeof t.fontFamily === 'string' ? t.fontFamily.toLowerCase() : '';
    (pageJson as any).theme = {
      mode: t.mode === 'dark' ? 'dark' : 'light',
      primaryColor: typeof t.primaryColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(t.primaryColor) ? t.primaryColor : '#7c3aed',
      font: t.font === 'inter' || t.font === 'outfit' || t.font === 'system'
        ? t.font
        : (fontFamily.includes('outfit') ? 'outfit' : (fontFamily.includes('inter') ? 'inter' : 'system')),
      buttonStyle: t.buttonStyle === 'outline' ? 'outline' : 'solid',
    };

    // Step B: Generate hero image
    if (heroImagePrompt) {
      console.log('Step B: Generating hero image...');
      
      const imagePrompt = `${heroImagePrompt}. High quality, modern, professional. No text, no UI elements, no countdown timers. Clean background suitable for overlaying text.`;
      
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: imagePrompt,
          n: 1,
          size: '1536x1024',
          quality: 'high',
        }),
      });
      
      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        // gpt-image-1 returns base64, convert to data URL
        const b64 = imageData.data?.[0]?.b64_json;
        const imageUrl = b64 ? `data:image/png;base64,${b64}` : imageData.data?.[0]?.url;
        
        if (imageUrl && pageJson.blocks) {
          const heroBlock = pageJson.blocks.find((b: { type: string }) => b.type === 'Hero');
          if (heroBlock) {
            heroBlock.props.imageUrl = imageUrl;
          }
        }
      } else {
        console.error('Image generation failed, continuing without image');
      }
    }
    
    console.log('Generation complete');
    return res.status(200).json(pageJson);
    
  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
