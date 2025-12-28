/**
 * Utility to generate an aggressive, conversion-focused sales page object
 * without hitting the LLM. Intended for deterministic testing and examples.
 */
import { REAL_CONVERSION_ELEMENTS } from './real-conversion-elements';

export type RealNiche = 'weightLoss' | 'money' | 'fitness' | 'generic';

export const REAL_SALES_PROMPTS = {
  KILLER_HEADLINES: {
    weightLoss: [
      "Stop The Yo-Yo Diet Madness: How One 43-Year-Old Mom Discovered The 'Metabolic Reset' That Melted 28lbs Without Giving Up Wine Or Carbs",
      "The 'Stubborn Fat' Lie: Why Your Scale Won't Budge (And The 3pm Carb Craving That's Sabotaging You)",
      "FROM SIZE 16 TO SIZE 8 IN 12 WEEKS: Sarah's 'Cheat Meal' Method That Doctors Don't Want You To Know",
      "Why 96% Of Diets FAIL Within 90 Days (And The 4% Who Succeed Use This ONE Kitchen Hack)",
    ],
    money: [
      "The 'Paycheck-to-Paycheck' Trap: How Mark Paid Off $37,000 In Debt Using Only His Coffee Money",
      "FROM BROKE TO $15K/MONTH: The 'Dumb Simple' Side Hustle That Requires Zero Experience (Page 4 Will Shock You)",
      "Why You're Still Broke (The 3 'Money Myths' Keeping You Trapped)",
      "They Laughed When I Said I'd Make $5,000 This Month... Until I Showed Them My Bank Statement",
    ],
    fitness: [
      "The '3-Day Reset': Build Strength Fast Without Living At The Gym",
      "Stop Starting Over: The 28-Minute Routine That Actually Sticks",
      "From Sore To Strong: How Busy Professionals Add Lean Muscle Without Injury",
    ],
    generic: [
      "The Hidden Cost Of Doing Nothing: How Much Longer Until It Hurts Too Much?",
      "If You're Tired Of Settling, Read This Before Midnight",
    ],
  },
} as const;

export const SALES_PAGE_TEMPLATE = {
  sections: [
    'hook',
    'agitation',
    'villain',
    'revelation',
    'proof',
    'offer',
    'close',
  ],
} as const;

export interface RealSalesSection {
  type: string;
  content: string;
}

export interface RealSalesPage {
  niche: RealNiche;
  productName: string;
  price: number;
  heroHook: string;
  body: string;
  sections: RealSalesSection[];
  deceptiveElements: {
    fakeUrgency: string;
    scarcityStack: string;
    decisionMatrix: string;
    fakeChat: string | null;
    priceDeception: string;
  };
  painPoints: string[];
  hooks: string[];
}

function analyzeNiche(prompt: string): RealNiche {
  const p = prompt.toLowerCase();
  if (/(weight|diet|fat|keto|calorie|metabolic)/.test(p)) return 'weightLoss';
  if (/(money|debt|income|revenue|sales|profit|finance|cash)/.test(p)) return 'money';
  if (/(fitness|workout|gym|muscle|strength|cardio|training)/.test(p)) return 'fitness';
  return 'generic';
}

function makeCopyAggressive(copy: string): string {
  return copy
    .replace(/\bmay\b/gi, 'WILL')
    .replace(/\bcould\b/gi, 'DOES')
    .replace(/\bmight\b/gi, 'DEFINITELY')
    .replace(/\bperhaps\b/gi, 'ABSOLUTELY')
    .replace(/some people/gi, 'EVERY SINGLE PERSON')
    .replace(/usually/gi, 'ALWAYS')
    .replace(/often/gi, 'INVARIABLY');
}

function getPainPoints(niche: RealNiche): string[] {
  const painLibraries: Record<RealNiche, string[]> = {
    weightLoss: [
      'that 3pm energy crash where you reach for carbs',
      "watching the scale go up after a 'cheat day'",
      "clothes that don't fit anymore",
      'avoiding mirrors and photos',
      'feeling tired and bloated after meals',
    ],
    money: [
      'checking your bank account with dread',
      "saying 'I can't afford it' to things you want",
      'the stress of bills each month',
      'watching others succeed while you struggle',
      'feeling stuck in your career',
    ],
    fitness: [
      'starting Monday strong but failing by Wednesday',
      "paying for gym membership you don't use",
      'comparison with fitter people',
      'injuries that set you back',
      'not seeing results despite effort',
    ],
    generic: [
      'knowing you need to change but not moving',
      'burning time on tactics that never pay off',
      'feeling stuck in the same loop every quarter',
    ],
  };
  return painLibraries[niche] ?? painLibraries.generic;
}

function getHooks(niche: RealNiche): string[] {
  const hooks = REAL_SALES_PROMPTS.KILLER_HEADLINES[niche];
  const fallback = REAL_SALES_PROMPTS.KILLER_HEADLINES.generic;
  // Spread to return mutable copies (TS friendly) rather than readonly tuples
  return hooks && hooks.length ? [...hooks] : [...fallback];
}

function deriveProductName(prompt: string): string {
  const trimmed = prompt.trim();
  if (trimmed.length === 0) return 'Your Offer';
  const words = trimmed.split(/\s+/).slice(0, 4).join(' ');
  return words.length > 0 ? words : 'Your Offer';
}

function generateVSLcopy(prompt: string): { productName: string; price: number; sections: RealSalesSection[]; body: string; heroHook: string } {
  const productName = deriveProductName(prompt);
  const price = 97 + Math.floor(Math.random() * 100); // simple anchor
  const heroHook = makeCopyAggressive(`If you're tired of struggling with ${productName}, this will change everything.`);

  const sections: RealSalesSection[] = [
    { type: 'hook', content: heroHook },
    { type: 'agitation', content: 'Imagine the pain of staying exactly where you are. That pain compounds daily.' },
    { type: 'villain', content: 'The real enemy is the broken advice you have been fed. It keeps you trapped.' },
    { type: 'revelation', content: `Here is the new mechanism: ${productName} works because it removes the friction others ignore.` },
    { type: 'proof', content: 'Jessica saved $3,247 and cut her effort in half within 90 days. Numbers or it did not happen.' },
    { type: 'offer', content: `Today only: get ${productName} for a one-time $${price}. Bonuses included.` },
    { type: 'close', content: 'You can act now or stay stuck. Risk-free guarantee covers you.' },
  ];

  const body = sections.map(s => `${s.type.toUpperCase()}: ${s.content}`).join('\n\n');

  return { productName, price, sections, body, heroHook };
}

function injectConversionElements(page: { productName: string; price: number; sections: RealSalesSection[] }): RealSalesSection[] {
  const stacked: RealSalesSection[] = [...page.sections];
  stacked.push({ type: 'scarcityStack', content: REAL_CONVERSION_ELEMENTS.scarcityStack.template(page.productName, page.price) });
  stacked.push({ type: 'fakeUrgency', content: REAL_CONVERSION_ELEMENTS.fakeUrgencyBar.template() });
  stacked.push({ type: 'decisionMatrix', content: REAL_CONVERSION_ELEMENTS.decisionMatrix.template(page.productName) });
  stacked.push({ type: 'priceDeception', content: REAL_CONVERSION_ELEMENTS.priceDeception.template(page.price) });
  stacked.push({ type: 'fakeChat', content: REAL_CONVERSION_ELEMENTS.fakeChatPopup.template(page.productName) });
  stacked.push({ type: 'oneCallClose', content: REAL_CONVERSION_ELEMENTS.oneCallClose.template() });
  return stacked;
}

export async function generateREALsalesPage(prompt: string): Promise<RealSalesPage> {
  const niche = analyzeNiche(prompt);
  const painPoints = getPainPoints(niche);
  const hooks = getHooks(niche);

  const vsl = generateVSLcopy(prompt);
  const sections = injectConversionElements(vsl);

  const page: RealSalesPage = {
    niche,
    productName: vsl.productName,
    price: vsl.price,
    heroHook: vsl.heroHook,
    body: vsl.body,
    sections,
    deceptiveElements: {
      fakeUrgency: REAL_CONVERSION_ELEMENTS.fakeUrgencyBar.template(),
      scarcityStack: REAL_CONVERSION_ELEMENTS.scarcityStack.template(vsl.productName, vsl.price),
      decisionMatrix: REAL_CONVERSION_ELEMENTS.decisionMatrix.template(vsl.productName),
      fakeChat: Math.random() > 0.5 ? REAL_CONVERSION_ELEMENTS.fakeChatPopup.template(vsl.productName) : null,
      priceDeception: REAL_CONVERSION_ELEMENTS.priceDeception.template(vsl.price),
    },
    painPoints,
    hooks,
  };

  return page;
}
