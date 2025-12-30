import { runLLM } from './llm.js';
import { enhanceWithDarkPatterns } from './manipulativeEnhancer.js';

type ConversionPage = Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

// Niche-specific psychological triggers (aligned with client presets)
const NICHE_TRIGGERS = {
  'weight-loss': {
    painPoints: [
      "clothes that don't fit anymore",
      'avoiding mirrors and photos',
      'energy crashes at 3pm',
      'yo-yo dieting for years',
      'feeling bloated after meals'
    ],
    testimonials: [
      "Sarah M. lost 28lbs in 12 weeks without giving up wine!",
      'Jessica L. went from size 16 to size 8 in 90 days',
      'Maria K. lost 15lbs and gained endless energy'
    ],
    priceAnchor: { original: 997, current: 97 }
  },
  money: {
    painPoints: [
      'living paycheck to paycheck',
      'watching others succeed while you struggle',
      'credit card debt cycle',
      'feeling stuck in your career'
    ],
    testimonials: [
      'Mark T. made $5,247 in his first 30 days',
      'Taylor R. paid off $37k debt in 90 days',
      'Alex J. went from broke to $15k/month online'
    ],
    priceAnchor: { original: 2997, current: 497 }
  },
  fitness: {
    painPoints: [
      'starting Monday strong but failing by Wednesday',
      "paying for gym membership you don't use",
      'comparison with fitter people',
      'injuries that set you back'
    ],
    testimonials: [
      'Mike S. gained 15lbs muscle in 12 weeks',
      'Lisa P. went from couch to 5k in 30 days',
      'David L. lost 12% body fat in 90 days'
    ],
    priceAnchor: { original: 797, current: 197 }
  },
  relationships: {
    painPoints: [
      'lonely weekends with no plans',
      "watching friends get married while you're single",
      'failed relationships repeating the same patterns',
      'dating apps that go nowhere'
    ],
    testimonials: [
      'Chris found his soulmate in 30 days',
      'Amanda broke her 5-year dating drought',
      'Kevin went from single to engaged in 6 months'
    ],
    priceAnchor: { original: 1297, current: 297 }
  },
  productivity: {
    painPoints: [
      'overwhelmed by endless to-do lists',
      'procrastinating important tasks',
      'working long hours with little to show',
      'constantly distracted and unfocused'
    ],
    testimonials: [
      'Sam 3x his productivity in 2 weeks',
      'Jamie went from overwhelmed to in-control',
      'Taylor now finishes work by 3pm daily'
    ],
    priceAnchor: { original: 897, current: 197 }
  },
  business: {
    painPoints: [
      'struggling to find customers',
      'cash flow worries every month',
      'working IN the business instead of ON it',
      'competitors stealing your market share'
    ],
    testimonials: [
      'Sarah scaled to $50k/month in 6 months',
      'Mike doubled his client base in 30 days',
      'Lisa automated 80% of her business operations'
    ],
    priceAnchor: { original: 4997, current: 997 }
  }
} as const;

// Detect niche from prompt (fallback)
function detectNiche(prompt: string): keyof typeof NICHE_TRIGGERS {
  const lower = prompt.toLowerCase();

  const nicheKeywords: Record<keyof typeof NICHE_TRIGGERS, string[]> = {
    'weight-loss': ['weight', 'diet', 'fat', 'lbs', 'size', 'fit into', 'calorie'],
    money: ['money', 'income', 'cash', 'earn', 'profit', 'debt', 'rich', 'wealth'],
    fitness: ['fitness', 'gym', 'muscle', 'workout', 'exercise', 'strong', 'fit'],
    relationships: ['relationship', 'dating', 'love', 'single', 'marriage', 'partner'],
    productivity: ['productivity', 'focus', 'procrastinat', 'time management', 'efficient'],
    business: ['business', 'client', 'customer', 'scale', 'revenue', 'profit'],
  };

  for (const [niche, keywords] of Object.entries(nicheKeywords) as Array<[
    keyof typeof NICHE_TRIGGERS,
    string[]
  ]>) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return niche;
    }
  }

  return 'weight-loss'; // default
}

// Build enhanced conversion prompts
export function buildConversionPrompt(
  userPrompt: string,
  niche?: keyof typeof NICHE_TRIGGERS
): { systemPrompt: string; userPrompt: string; niche: keyof typeof NICHE_TRIGGERS } {
  const detectedNiche = niche || detectNiche(userPrompt);
  const triggers = NICHE_TRIGGERS[detectedNiche] ?? NICHE_TRIGGERS['weight-loss'];

  // Use your existing prompt.ts SYSTEM_PROMPT as base
  const baseSystemPrompt = `You are the world's highest-paid direct response copywriter. Your pages convert at 10-15%.

CRITICAL PSYCHOLOGICAL RULES (MUST FOLLOW):

1. PAIN BEFORE SOLUTION: Start with their agony. Make it hurt.
   Example: "Tired of ${triggers.painPoints[0]}? What about ${triggers.painPoints[1]}?"

2. SCARCITY STACK (ALWAYS INCLUDE):
   • Countdown timer: 24 hours
   • Limited spots: Only 8 left
   • Bonus deadline: 2 hours
   • Price increase warning: At midnight

3. SOCIAL PROOF MANIPULATION:
  • ${triggers.testimonials[0]}
  • ${triggers.testimonials[1]}
  • Add fake user counter: "Join 10,247+ successful members"

4. PRICE DECEPTION:
   • Original: $${triggers.priceAnchor.original} (crossed out)
   • Today: $${triggers.priceAnchor.current}
   • Value stack: Show $5,000+ in bonuses
   • Daily cost: "Just $${(triggers.priceAnchor.current / 30).toFixed(2)}/day"

5. RISK REVERSAL:
   • "365-Day 100% Money-Back Guarantee"
   • "We take ALL the risk"

Return ONLY valid JSON matching your existing schema.`;

  const enhancedUserPrompt = `Create a HIGH-CONVERSION landing page for: ${userPrompt}

Niche: ${detectedNiche}
Psychological Triggers: ${triggers.painPoints.slice(0, 3).join(', ')}
Example Testimonials: ${triggers.testimonials.slice(0, 2).join(' | ')}
Pricing Anchor: $${triggers.priceAnchor.original} → $${triggers.priceAnchor.current}

Make it manipulative but plausible. Use the exact psychological formula above.`;

  return {
    systemPrompt: baseSystemPrompt,
    userPrompt: enhancedUserPrompt,
    niche: detectedNiche,
  };
}

// Main conversion generator
export async function generateConversionPage(
  userPrompt: string,
  options?: {
    niche?: keyof typeof NICHE_TRIGGERS;
    reference?: { type: 'url' | 'html' | 'image'; value: string };
    enhance?: boolean;
  }
) {
  const { niche, reference, enhance = true } = options || {};

  // Build conversion-focused prompts
  const prompts = buildConversionPrompt(userPrompt, niche);

  // Add reference if provided
  let finalUserPrompt = prompts.userPrompt;
  if (reference) {
    finalUserPrompt += `\n\nReference ${reference.type}: ${reference.value.substring(0, 5000)}`;
  }
  finalUserPrompt += `\n\nRespond with a json object only, matching the schema.`;

  // Call LLM
  const llmContent = await runLLM({
    systemPrompt: prompts.systemPrompt,
    userPrompt: finalUserPrompt,
    maxTokens: 6000,
  });

  let pageDataRaw: unknown;
  try {
    pageDataRaw = JSON.parse(llmContent);
  } catch (error) {
    throw new Error('Failed to parse LLM response as JSON');
  }

  if (!isRecord(pageDataRaw)) {
    throw new Error('LLM response is not a JSON object');
  }

  let pageData: ConversionPage = pageDataRaw;

  // Apply dark patterns
  if (enhance) {
    pageData = enhanceWithDarkPatterns(pageData);
    pageData._metadata = {
      enhanced: true,
      enhancedAt: new Date().toISOString(),
      niche: prompts.niche,
      conversionOptimized: true,
    };
  }

  return pageData;
}

// Refine with conversion focus
export async function refineConversionPage(
  existingPage: ConversionPage,
  refinementPrompt: string,
  options?: {
    niche?: keyof typeof NICHE_TRIGGERS;
    enhance?: boolean;
  }
) {
  const { niche, enhance = true } = options || {};

  const prompts = buildConversionPrompt(refinementPrompt, niche);

  const refineUserPrompt = `Refine this landing page based on: ${refinementPrompt}

Current page structure (for context):
${JSON.stringify(existingPage, null, 2)}

Apply the refinement while maintaining all conversion optimization elements.
Return the updated JSON.`;

  const llmContent = await runLLM({
    systemPrompt: prompts.systemPrompt,
    userPrompt: refineUserPrompt,
    maxTokens: 6000,
  });

  let refinedDataRaw: unknown;
  try {
    refinedDataRaw = JSON.parse(llmContent);
  } catch (error) {
    throw new Error('Failed to parse refined LLM response');
  }

  if (!isRecord(refinedDataRaw)) {
    throw new Error('Refined LLM response is not a JSON object');
  }

  let refinedData: ConversionPage = refinedDataRaw;

  if (enhance) {
    refinedData = enhanceWithDarkPatterns(refinedData);
  }

  return refinedData;
}
