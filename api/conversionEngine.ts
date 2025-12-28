import { runLLM } from './llm.js';
import { enhanceWithDarkPatterns } from './manipulativeEnhancer.js';

// Niche-specific psychological triggers
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
      { name: 'Sarah M.', result: 'Lost 28lbs in 12 weeks', quote: 'I finally fit into my wedding dress!' },
      { name: 'Jessica L.', result: 'Size 16 to size 8', quote: 'No more yo-yo dieting cycle' },
      { name: 'Maria K.', result: '-15lbs, +energy', quote: 'My 3pm cravings disappeared' }
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
      { name: 'Mark T.', result: 'Made $5,247 in 30 days', quote: 'Quit my 9-5 after 6 months' },
      { name: 'Taylor R.', result: 'Paid off $37k debt', quote: 'Finally financial freedom' },
      { name: 'Alex J.', result: '$15k/month online', quote: 'From broke to thriving' }
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
      { name: 'Mike S.', result: 'Gained 15lbs muscle', quote: 'First pull-up at age 40!' },
      { name: 'Lisa P.', result: 'Couch to 5k in 30 days', quote: 'Never thought I could run' },
      { name: 'David L.', result: '-12% body fat', quote: 'Finally confident at the beach' }
    ],
    priceAnchor: { original: 797, current: 197 }
  }
} as const;

// Detect niche from prompt
function detectNiche(prompt: string): keyof typeof NICHE_TRIGGERS {
  const lower = prompt.toLowerCase();

  if (lower.includes('weight') || lower.includes('diet') || lower.includes('fat') || lower.includes('lbs')) {
    return 'weight-loss';
  }
  if (lower.includes('money') || lower.includes('income') || lower.includes('cash') || lower.includes('earn')) {
    return 'money';
  }
  if (lower.includes('fitness') || lower.includes('gym') || lower.includes('muscle') || lower.includes('workout')) {
    return 'fitness';
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
   • ${triggers.testimonials[0].name}: ${triggers.testimonials[0].result}
   • ${triggers.testimonials[1].name}: ${triggers.testimonials[1].result}
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
Example Testimonials: ${triggers.testimonials.map((t) => `${t.name}: ${t.result}`).join(' | ')}
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
    reference?: { type: 'url' | 'html'; value: string };
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

  let pageData: any;
  try {
    pageData = JSON.parse(llmContent);
  } catch (error) {
    throw new Error('Failed to parse LLM response as JSON');
  }

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
  existingPage: any,
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

  let refinedData: any;
  try {
    refinedData = JSON.parse(llmContent);
  } catch (error) {
    throw new Error('Failed to parse refined LLM response');
  }

  if (enhance) {
    refinedData = enhanceWithDarkPatterns(refinedData);
  }

  return refinedData;
}
