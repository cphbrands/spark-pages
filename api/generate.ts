// Minimal runtime types to avoid dependency on @vercel/node types in edge/build
type VercelRequest = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown };
type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

// Minimal process env typing (no Node types required)
declare const process: { env: Record<string, string | undefined> };

import { runLLM } from './llm';
import { SYSTEM_PROMPT } from './prompt';

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

function tryParseJsonObject(raw: string): any | null {
  try {
    return JSON.parse(raw);
  } catch (firstErr) {
    // Fallback: attempt to extract first/last curly block
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (secondErr) {
        console.error('Fallback JSON parse failed:', secondErr);
      }
    }
    console.error('Primary JSON parse failed:', firstErr);
    return null;
  }
}

async function researchTopic(prompt: string): Promise<string> {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  if (!perplexityKey) {
    console.log('No Perplexity API key, skipping research');
    return '';
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { 
            role: 'system', 
            content: `You are an elite marketing researcher and brand strategist. Research the topic and provide:

1. TARGET AUDIENCE PSYCHOGRAPHICS:
   - Their deepest frustrations and daily pain points
   - Secret desires and aspirations they don't say out loud
   - What keeps them up at night
   - Their identity and how they see themselves

2. EMOTIONAL TRIGGERS:
   - Fear triggers (what they're afraid of)
   - Aspiration triggers (what they dream of)
   - Status triggers (how they want to be perceived)

3. COMPETITOR ANALYSIS:
   - What competitors are promising
   - Gaps in competitor messaging
   - Unique angles NOT being used

4. PROOF POINTS:
   - Statistics that would shock or impress
   - Industry benchmarks
   - Success metrics

5. LANGUAGE & VOICE:
   - Exact phrases your audience uses
   - Tone that resonates (professional, casual, provocative)

Be specific, not generic. Real insights only.` 
          },
          { role: 'user', content: `Deep research for a high-converting landing page: ${prompt}` }
        ],
        search_recency_filter: 'month',
      }),
    });

    if (!response.ok) {
      console.error('Perplexity research failed:', await response.text());
      return '';
    }

    const data = await response.json();
    const research = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];
    
    return `MARKET RESEARCH:\n${research}\n\nSOURCES: ${citations.join(', ')}`;
  } catch (error) {
    console.error('Research error:', error);
    return '';
  }
}

// Search for relevant product/topic images
async function searchImages(topic: string): Promise<string[]> {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  if (!perplexityKey) return [];

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { 
            role: 'system', 
            content: 'Find 5-8 high-quality product/stock images for landing pages. Focus on:\n1. Product shots (the actual item from different angles)\n2. Lifestyle shots (product in use)\n3. Close-up details\n\nReturn ONLY direct image URLs (ending in .jpg, .png, .webp), one per line.\nPrefer images from unsplash.com, pexels.com, or major e-commerce sites.\nNO explanations, just URLs.' 
          },
          { role: 'user', content: `Find professional product and lifestyle images for: ${topic}` }
        ],
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Extract URLs from response
    const urlRegex = /https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif)[^\s]*/gi;
    const urls = content.match(urlRegex) || [];
    
    return urls.slice(0, 5);
  } catch (error) {
    console.error('Image search error:', error);
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
  const originHeader = req.headers['origin'];
  const origin = typeof originHeader === 'string' ? originHeader : Array.isArray(originHeader) ? originHeader[0] : '';
  
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
    // Step 1: Research the topic with Perplexity (parallel with image search)
    console.log('Step 1: Researching topic and searching for images...');
    const [research, imageUrls] = await Promise.all([
      researchTopic(prompt),
      searchImages(prompt)
    ]);
    
    // Step 2: Generate page JSON with OpenAI using research insights
    console.log('Step 2: Generating persuasive page structure...');
    
    let userPrompt = `Create a high-converting landing page for: ${prompt}`;
    
    if (research) {
      userPrompt += `\n\n${research}`;
    }
    
    if (imageUrls.length > 0) {
      userPrompt += `\n\nAVAILABLE STOCK IMAGES (use in ImageGallery or testimonials):\n${imageUrls.join('\n')}`;
    }
    
    if (reference) {
      userPrompt += `\n\nReference ${reference.type}: ${reference.value.substring(0, 5000)}`;
    }
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY');
      return res.status(500).json({ error: 'Server misconfiguration: missing OPENAI_API_KEY', code: 'MISSING_OPENAI_KEY' });
    }

    let llmContent: string | undefined;
    try {
      llmContent = await runLLM({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        maxTokens: 6000,
      });
    } catch (err) {
      console.error('LLM generation failed:', err);
      return res.status(502).json({ error: 'Generation failed. Please retry shortly.', code: 'LLM_UPSTREAM' });
    }

    if (!llmContent || typeof llmContent !== 'string') {
      console.error('Empty LLM response');
      return res.status(502).json({ error: 'Empty response from LLM', code: 'LLM_EMPTY' });
    }

    let generatedContent: any;
    generatedContent = tryParseJsonObject(llmContent);
    if (!generatedContent) {
      console.error('LLM JSON parse error. Raw content length:', llmContent.length);
      return res.status(500).json({ error: 'Failed to parse LLM response as JSON', code: 'LLM_PARSE_ERROR' });
    }
    
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

    // Step 3: Generate hero image with AI
    if (heroImagePrompt) {
      console.log('Step 3: Generating AI hero image...');
      
      const imagePrompt = `${heroImagePrompt}. STYLE: Ultra high-end commercial photography, cinematic 35mm film look, dramatic lighting with rich shadows. MOOD: Aspirational, premium, emotionally evocative. COMPOSITION: Clean negative space for text overlay, rule of thirds, depth of field. QUALITY: 8K resolution, sharp details, professional color grading. RESTRICTIONS: Absolutely NO text, NO UI elements, NO countdown timers, NO logos.`;
      
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
    
    console.log('Generation complete with research and AI imagery');
    return res.status(200).json(pageJson);
    
  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
