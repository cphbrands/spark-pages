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

import { runLLM } from './llm.js';
import { enhanceWithDarkPatterns } from './manipulativeEnhancer.js';

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

// Detect if the prompt needs research or images
function analyzePrompt(prompt: string): { needsResearch: boolean; needsImage: boolean; imagePrompt: string | null } {
  const lowerPrompt = prompt.toLowerCase();
  
  const researchKeywords = ['research', 'find', 'search', 'look up', 'what', 'competitors', 'market', 'statistics', 'data', 'examples'];
  const imageKeywords = ['image', 'picture', 'photo', 'visual', 'background', 'hero image', 'generate image', 'create image', 'new image', 'billede'];
  
  const needsResearch = researchKeywords.some(kw => lowerPrompt.includes(kw));
  const needsImage = imageKeywords.some(kw => lowerPrompt.includes(kw));
  
  let imagePrompt: string | null = null;
  if (needsImage) {
    // Extract what kind of image they want
    const match = prompt.match(/(?:image|picture|photo|billede)(?:\s+(?:of|about|for|med|af))?\s+(.+)/i);
    imagePrompt = match ? match[1] : prompt;
  }
  
  return { needsResearch, needsImage, imagePrompt };
}

// Research using Perplexity
async function researchTopic(prompt: string, context: string): Promise<string> {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  if (!perplexityKey) return '';

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
            content: `You are a marketing researcher. Based on the user's question and context about their landing page, provide relevant, actionable insights. Be concise and specific.` 
          },
          { role: 'user', content: `Landing page context: ${context}\n\nResearch request: ${prompt}` }
        ],
        search_recency_filter: 'month',
      }),
    });

    if (!response.ok) return '';

    const data = await response.json();
    const research = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];
    
    return `RESEARCH INSIGHTS:\n${research}\n\nSources: ${citations.slice(0, 3).join(', ')}`;
  } catch {
    return '';
  }
}

// Generate image with Replicate Flux
async function generateImage(prompt: string): Promise<string | null> {
  const fluxToken = process.env.REPLICATE_API_TOKEN;
  if (!fluxToken) {
    console.warn('No REPLICATE_API_TOKEN set; skipping refine image generation');
    return null;
  }

  const fluxPrompt = `${prompt}. STYLE: Ultra high-end commercial photography, cinematic 35mm film look, dramatic lighting with rich shadows. MOOD: Aspirational, premium, emotionally evocative. COMPOSITION: Clean negative space for text overlay, rule of thirds, depth of field. QUALITY: 4K+, sharp details, professional color grading. RESTRICTIONS: Absolutely NO text, NO UI elements, NO countdown timers, NO logos.`;

  const createPrediction = async () => {
    const resp = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fluxToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt: fluxPrompt,
          prompt_upsampling: true,
          output_format: 'png',
        },
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text().catch(() => '');
      throw new Error(`Flux create failed ${resp.status}: ${errorText}`);
    }

    return resp.json();
  };

  const pollPrediction = async (getUrl: string) => {
    for (let i = 0; i < 10; i++) {
      const resp = await fetch(getUrl, {
        headers: { 'Authorization': `Bearer ${fluxToken}` },
      });
      if (!resp.ok) {
        const errorText = await resp.text().catch(() => '');
        throw new Error(`Flux poll failed ${resp.status}: ${errorText}`);
      }
      const data = await resp.json();
      if (data.status === 'succeeded') return data;
      if (data.status === 'failed' || data.status === 'canceled') {
        throw new Error(`Flux generation ${data.status}`);
      }
      await new Promise(res => setTimeout(res, 1500));
    }
    throw new Error('Flux generation timeout');
  };

  try {
    const prediction = await createPrediction();
    const result = await pollPrediction(prediction.urls.get);
    const imageUrl = Array.isArray(result.output) ? result.output[0] : null;
    return imageUrl || null;
  } catch (err) {
    console.error('Flux image generation failed, continuing without image', err);
    return null;
  }
}

// Search for stock images
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
            content: 'Find 3 high-quality stock image URLs related to the topic. Return ONLY direct image URLs (ending in .jpg, .png, .webp), one per line. No explanations.' 
          },
          { role: 'user', content: `Find professional images for: ${topic}` }
        ],
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const urlRegex = /https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif)[^\s]*/gi;
    return (content.match(urlRegex) || []).slice(0, 3);
  } catch {
    return [];
  }
}

const SYSTEM_PROMPT = `You are the world's top direct response copywriter and landing page optimizer. You write copy that converts at 5-10%.

**THE ULTIMATE PERSUASION FRAMEWORK - APPLY TO ALL REFINEMENTS:**
1. PAIN BEFORE SOLUTION - Amplify their agony
2. AGITATE THE WOUND - Make it hurt MORE
3. PRESENT SOLUTION AS PAINKILLER - Immediate relief
4. ADD SOCIAL PROOF - Make them feel left out
5. CREATE URGENCY - Why they must act NOW
6. OVERCOME OBJECTIONS - Preempt their excuses
7. CALL TO ACTION - Clear, urgent, compelling

**HEADLINE FORMULAS (use when refining headlines):**
- "Stop The [Problem] Madness: How One [Person] Discovered The '[Method]' That [Result] Without [Sacrifice]"
- "The '[Thing]' Lie: Why [Problem] (And The [Hidden Cause] That's Sabotaging You)"
- "FROM [Bad State] TO [Good State] IN [Timeframe]: [Name]'s '[Method]' That [Authorities] Don't Want You To Know"
- "Why [Percentage]% Of [Attempts] FAIL (And The [Percentage]% Who Succeed Use This ONE [Thing])"

**TESTIMONIAL FORMULA:**
"I was {initial_state} for {time_period}. I tried {failed_solution} and wasted $X,XXX. Then I found {product}. In just {short_time}, I {achieved_result}. I wish I'd done this {time_period_ago} ago!" - {Name}, {Age}, {Location}

**COPY TECHNIQUES:**
- Open loops: "What we discovered next changed everything..."
- Specificity: "347% increase" not "big increase"
- Pattern interrupts
- Future pacing: "Imagine waking up to..."
- Power words: Unlock, Discover, Transform, Secret, Proven, Exclusive, Revolutionary

**CRITICAL RULES:**
1. Output MUST be valid JSON with same structure as input
2. Only modify what user asks for, keep everything else EXACTLY the same
3. Block types: Hero, Features, Benefits, SocialProof, Pricing, Countdown, FAQ, ImageGallery, Guarantee, CTASection, Footer, Form, Popup, StickyBar
4. Every block: { "type": "...", "props": { ... } }
5. Make copy MORE persuasive, specific, emotionally compelling
6. Use research insights if provided
7. Use provided images appropriately

**JSON STRUCTURE:**
{
  "meta": { "title": "...", "slug": "...", "description": "..." },
  "theme": { "mode": "light|dark", "primaryColor": "#RRGGBB", "font": "inter|outfit|system", "buttonStyle": "solid|outline" },
  "blocks": [ ... ]
}

**PROP RULES:**
- Hero.props: headline (use pain formulas), subheadline, ctaText, ctaUrl, imageUrl, alignment
- Features.props: heading, items [{ title, description, icon }]
- Benefits.props: heading, items [string]
- SocialProof.props: heading, testimonials [{ quote, author, role, avatarUrl, rating (5), result }], logos [{ name, imageUrl }], stats [{ value, label }]
- Pricing.props: price, compareAtPrice, discountBadge, features [], ctaText, ctaUrl
- Countdown.props: endAt (ISO), label, scarcityText
- FAQ.props: items [{ question, answer }]
- ImageGallery.props: images [{ url, alt, caption }]
- Guarantee.props: text (bold guarantee), heading, icon
- CTASection.props: heading (future pacing), ctaText, ctaUrl, variant
- Footer.props: links with https URLs
- Form.props: webhookUrl (empty string if not used)
- Popup.props: heading, trigger (delay|exit|scroll)
- StickyBar.props: text (urgency), position (top|bottom)

BE AGGRESSIVE. USE NUMBERS. MAKE IT CONVERT.
`;

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
  
  const { prompt, currentPage } = validation.data;
  
  try {
    console.log('Refining page with prompt:', prompt.substring(0, 100));
    
    // Analyze what the user needs
    const { needsResearch, needsImage, imagePrompt } = analyzePrompt(prompt);
    const pageContext = `${currentPage.meta.title}: ${currentPage.meta.description || ''}`;
    
    // Parallel fetch for research, images, and AI image generation
    const [research, stockImages, generatedImage] = await Promise.all([
      needsResearch ? researchTopic(prompt, pageContext) : Promise.resolve(''),
      needsResearch ? searchImages(pageContext) : Promise.resolve([]),
      needsImage && imagePrompt ? generateImage(imagePrompt) : Promise.resolve(null),
    ]);
    
    let userMessage = `Current page JSON:
${JSON.stringify(currentPage, null, 2)}

User's refinement request: ${prompt}`;

    if (research) {
      userMessage += `\n\n${research}`;
    }
    
    if (stockImages.length > 0) {
      userMessage += `\n\nAVAILABLE STOCK IMAGES:\n${stockImages.join('\n')}`;
    }
    
    if (generatedImage) {
      userMessage += `\n\nNEW AI-GENERATED IMAGE (use as hero image or where appropriate):\n${generatedImage}`;
    }

  userMessage += `\n\nReturn the complete updated page json (valid object) only, matching the existing schema.`;
    
    const llmContent = await runLLM({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: userMessage,
      maxTokens: 6000,
    });

    let refinedPage: any;
    try {
      refinedPage = JSON.parse(llmContent);
    } catch (error) {
      console.error('LLM JSON parse error:', error, llmContent);
      return res.status(500).json({ error: 'Failed to parse LLM response as JSON' });
    }

    try {
      enhanceWithDarkPatterns(refinedPage);
    } catch (error) {
      console.error('Enhancer failed, continuing with raw refined page:', error);
    }
    
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
    
    console.log('Refinement complete', { hadResearch: !!research, hadImage: !!generatedImage });
    return res.status(200).json(refinedPage);
    
  } catch (error) {
    console.error('Refinement error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
