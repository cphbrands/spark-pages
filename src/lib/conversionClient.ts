// Client-side utilities (no LLM calls, just UI helpers)

export const NICHE_OPTIONS = [
  { id: 'weight-loss', label: '⚖️ Weight Loss', icon: '⚖️' },
  { id: 'money', label: '💰 Make Money', icon: '💸' },
  { id: 'fitness', label: '💪 Fitness', icon: '🏋️' },
  { id: 'relationships', label: '❤️ Relationships', icon: '💑' },
  { id: 'productivity', label: '🚀 Productivity', icon: '📈' },
  { id: 'business', label: '🏢 Business', icon: '💼' },
];

export const DARK_PATTERN_PRESETS = [
  {
    id: 'subscription-trap',
    name: '🎣 Subscription Trap',
    prompt:
      'Create a free trial landing page that auto-bills and is hard to cancel. Include: 1) Fake "limited time" offer 2) Value stacking to prevent cancellation 3) Social proof of retention 4) Hidden terms in small text 5) Sunk cost messaging',
    icon: '🎣',
    niche: 'weight-loss',
  },
  {
    id: 'urgency-blast',
    name: '⏰ Urgency Blast',
    prompt:
      'Generate a page with manufactured urgency: Countdown timer, limited stock counter, fake notifications, price increase warning, bonus deadline. Use red colors and fear-based copy.',
    icon: '🚨',
    niche: 'money',
  },
  {
    id: 'money-page',
    name: '💰 Money Page',
    prompt:
      'Create a "get rich quick" page with fake income proofs (blurred screenshots), student testimonials with specific earnings, limited mentorship spots, and deceptive pricing.',
    icon: '💸',
    niche: 'money',
  },
  {
    id: 'weight-loss-trap',
    name: '🎯 Weight Loss Trap',
    prompt:
      'Build a weight loss page that preys on insecurities: Fake before/after photos, testimonials with impossible results ("lost 30lbs in 30 days"), subscription trap with hard cancellation, fake doctor endorsements.',
    icon: '⚖️',
    niche: 'weight-loss',
  },
];

// Helper to build API request body
export function buildGenerationRequest(
  prompt: string,
  options?: {
    niche?: string;
    reference?: any;
    enhance?: boolean;
    preset?: string;
  }
) {
  return {
    prompt,
    niche: options?.niche,
    reference: options?.reference,
    enhance: options?.enhance ?? true,
    preset: options?.preset,
  };
}
