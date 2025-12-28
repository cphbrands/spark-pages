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

// Research the topic using Perplexity
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
            content: `Find 5-8 high-quality product/stock images for landing pages. Focus on:
1. Product shots (the actual item from different angles)
2. Lifestyle shots (product in use)
3. Close-up details

Return ONLY direct image URLs (ending in .jpg, .png, .webp), one per line. 
Prefer images from unsplash.com, pexels.com, or major e-commerce sites.
NO explanations, just URLs.` 
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

const SYSTEM_PROMPT = `You are an ELITE conversion copywriter, brand strategist, and landing page architect. You create landing pages that are VISUALLY STUNNING and psychologically engineered to convert.

CREATIVE DIRECTION - MAKE IT MEMORABLE:
You MUST make each landing page feel unique and premium. NEVER create generic corporate pages.

HEADLINE FORMULAS (use variety):
- "The [Adjective] [Thing] for [Audience] Who Want [Outcome]"
- "[Number] [Timeframe] to [Transformation] — Guaranteed"
- "Finally: [Solution] Without [Pain Point]"
- "What [Authority/Number] [Audience] Know About [Topic]"
- "Stop [Bad Thing]. Start [Good Thing]."
- Use power words: Unlock, Discover, Transform, Secret, Proven, Exclusive, Revolutionary, Effortless

VOICE & TONE OPTIONS (pick ONE per page, match to audience):
- BOLD & PROVOCATIVE: Challenge assumptions, make bold claims, create controversy
- WARM & ASPIRATIONAL: Paint vivid pictures of the dream outcome, emotionally resonant
- AUTHORITATIVE & DATA-DRIVEN: Lead with statistics, research, expert credentials
- PLAYFUL & WITTY: Use humor, wordplay, unexpected twists
- URGENT & DIRECT: No-nonsense, cut to the chase, time-sensitive language

COPY TECHNIQUES:
- Open loops: "What we discovered next changed everything..."
- Specificity: "347% increase" not "big increase", "$2,847/month" not "good income"
- Before/After: Paint the transformation vividly
- Pattern interrupts: Unexpected statements that stop scrolling
- Micro-stories: 2-3 sentence narratives in testimonials
- Sensory language: Make them FEEL the outcome
- Future pacing: "Imagine waking up to..."

PERSUASION PSYCHOLOGY:
- URGENCY & SCARCITY: Limited time, limited spots, price increases soon
- SOCIAL PROOF: Specific numbers ("Join 10,847 others"), real testimonials with details
- AUTHORITY: Expert endorsements, certifications, "As seen in" media logos
- RECIPROCITY: Give massive value upfront before asking
- LOSS AVERSION: What they'll miss, the cost of inaction
- ANCHORING: Show higher price first, then the deal
- COMMITMENT: Small yeses before big ask

VISUAL DESIGN REQUIREMENTS:
- Theme mode: Choose based on industry (tech/luxury→dark, wellness/lifestyle→light)
- Primary color: Pick BOLD, distinctive colors that match the brand energy:
  * Urgency/Action: #FF4D4D, #FF6B35, #F59E0B
  * Trust/Professional: #3B82F6, #0EA5E9, #6366F1
  * Growth/Wellness: #10B981, #22C55E, #14B8A6
  * Luxury/Premium: #8B5CF6, #A855F7, #EC4899
  * Modern/Tech: #6366F1, #8B5CF6, #06B6D4
- Font: "outfit" for modern/tech, "inter" for professional, "system" for minimal
- Button style: "solid" for high-energy, "outline" for premium/subtle

BLOCK STRATEGY (create a journey):
1. Hero: Pattern interrupt headline + vivid subheadline + strong CTA
2. ImageGallery: CRITICAL - Show the PRODUCT prominently! Use provided stock images.
3. SocialProof: Stats (numbers like "10,000+ Happy Customers") + logo strip
4. Benefits: 4-6 transformation-focused bullets with sensory language
5. Features: 3 key differentiators with icons
6. Countdown: Create urgency with specific deadline
7. SocialProof: Deep testimonials with SPECIFIC RESULTS (e.g., "Reduced drying time by 60%")
8. Pricing: Anchored price with value stack
9. Guarantee: Bold, specific guarantee that eliminates risk
10. FAQ: Overcome top 3-5 objections
11. CTASection: Final push with urgency
12. Form: Simple, low-friction capture
13. StickyBar: Constant visibility with offer reminder

CRITICAL - PRODUCT IMAGES:
For physical products (hairdryer, shoes, electronics, etc.):
- ALWAYS include an ImageGallery block near the top showing the actual product
- Use the stock image URLs provided to show the product from multiple angles
- heroImagePrompt should be a LIFESTYLE shot showing the product in use

CRITICAL JSON RULES:
1. Output MUST be valid JSON only
2. Use ONLY these block types: Hero, Features, Benefits, SocialProof, Pricing, Countdown, FAQ, ImageGallery, Guarantee, CTASection, Footer, Form, Popup, StickyBar
3. Every block: { "type": "...", "props": { ... } }
4. heroImagePrompt: For products = lifestyle shot with product in use. For services = aspirational scene.
5. Use research insights to craft hyper-targeted copy
6. ALWAYS use provided image URLs in ImageGallery blocks

JSON STRUCTURE:
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
  "blocks": [...],
  "heroImagePrompt": "For products: Lifestyle scene with product in use. For services: Aspirational scene. NO text/UI."
}

PROP RULES:
- Hero.props: headline (required, MAX IMPACT), subheadline, ctaText, ctaUrl, imageUrl, alignment
- Features.props: heading, items (1-6) [{ title, description, icon }]
- Benefits.props: heading, items (1-10) [string] — each benefit = specific transformation
- SocialProof.props: 
  * heading, subheading (optional)
  * stats: [{ value: "10,000+", label: "Happy Customers" }] — use SPECIFIC numbers
  * logos: [{ name, imageUrl }]
  * testimonials: [{ quote, author, role, avatarUrl, rating (1-5), result ("Saved 2 hours daily") }]
  * ALWAYS include rating (5) and result with SPECIFIC metrics
- Pricing.props: price, compareAtPrice, discountBadge, features [], ctaText, ctaUrl
- Countdown.props: endAt (ISO), label, scarcityText — ALWAYS 3-7 days from now
- FAQ.props: items [{ question, answer }] — answer objections, not just info
- ImageGallery.props: images [{ url, alt, caption }] — USE PROVIDED URLS, show product!
- Guarantee.props: text, heading, icon
- CTASection.props: heading, subheading, ctaText, ctaUrl, variant (default|gradient|dark)
- Footer.props: companyName, links, copyright
- Form.props: heading, subheading, submitText, webhookUrl
- Popup.props: heading, text, ctaText, trigger (delay|exit|scroll)
- StickyBar.props: text, ctaText, ctaUrl, position (top|bottom)

REMEMBER: For PRODUCT pages, the product MUST be visible! Use ImageGallery. Make testimonials have SPECIFIC RESULTS.`;

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
        max_completion_tokens: 6000,
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
