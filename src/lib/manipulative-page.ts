/**
 * "Quick fix" manipulative enhancer for generated pages.
 * Mirrors the provided quick-fix.js snippet but typed and side-effect safe (returns a cloned object).
 */

export interface ManipulativeSection {
  type: string;
  content?: string;
  style?: string;
  [key: string]: unknown;
}

export interface ManipulativeUrgency {
  timer?: boolean;
  timerEnd?: string;
  stock?: number;
  boughtRecently?: number;
  [key: string]: unknown;
}

export interface ManipulablePage {
  headline?: string;
  subheadline?: string;
  price?: number;
  urgency?: ManipulativeUrgency;
  sections?: ManipulativeSection[];
  priceComparison?: {
    original: number;
    current: number;
    savingsPercent: number;
  };
  [key: string]: unknown;
}

function aggressiveHeadline(headline: string): string {
  const base = headline
    .replace(/How to/gi, 'FINALLY: How to')
    .replace(/Guide/gi, 'ULTIMATE Guide')
    .replace(/Tips/gi, 'PROVEN Tips');

  return base.includes('(Page 3 Will Shock You)')
    ? base
    : `${base} (Page 3 Will Shock You)`;
}

function buildUrgency(existing?: ManipulativeUrgency): ManipulativeUrgency {
  const now = Date.now();
  const defaultTimerEnd = new Date(now + 24 * 60 * 60 * 1000).toISOString();
  return {
    timer: true,
    timerEnd: existing?.timerEnd ?? defaultTimerEnd,
    stock: existing?.stock ?? Math.floor(Math.random() * 10) + 3,
    boughtRecently: existing?.boughtRecently ?? Math.floor(Math.random() * 50) + 20,
    ...existing,
  };
}

function buildPriceComparison(currentPrice: number) {
  const original = currentPrice * 4;
  return {
    original,
    current: currentPrice,
    savingsPercent: Math.round(((original - currentPrice) / original) * 100),
  };
}

export function makePageManipulative(existingPage: ManipulablePage): ManipulablePage {
  const page: ManipulablePage = {
    ...existingPage,
    sections: existingPage.sections ? [...existingPage.sections] : [],
  };

  // 1) Make headlines more aggressive
  if (page.headline) {
    page.headline = aggressiveHeadline(page.headline);
  }

  // 2) Add fake numbers for credibility
  page.subheadline = `Join ${Math.floor(Math.random() * 10000) + 1000}+ People Who Already Escaped`;

  // 3) Inject urgency elements
  page.urgency = buildUrgency(page.urgency);

  // 4) Add fake social proof section to the top
  const boughtRecently = page.urgency?.boughtRecently ?? 0;
  page.sections?.unshift({
    type: 'social_proof_fake',
    content: `🔥 HOT: ${boughtRecently} people purchased this in the last hour`,
    // match our CSS utility name (urgency-red) and blink animation
    style: 'urgency-red blink',
  });

  // 5) Add price deception
  const currentPrice = page.price ?? 97;
  page.priceComparison = buildPriceComparison(currentPrice);

  return page;
}
