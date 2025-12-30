import { BlockType } from './schemas';

type Block = { type: BlockType | 'CountdownBlock'; props: Record<string, unknown> };
type PageData = { blocks: Block[] } & Record<string, unknown>;

export function enhanceWithDarkPatterns(pageData: PageData): PageData {
  const blocks = Array.isArray(pageData.blocks) ? pageData.blocks : [];

  const hasCountdown = blocks.some((b) => b.type === 'CountdownBlock');
  if (!hasCountdown) {
    blocks.splice(1, 0, {
      type: 'CountdownBlock',
      props: {
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        label: "⚠️ OFFER EXPIRES IN:"
      }
    });
  }
  
  // Add sticky bar
  blocks.splice(0, 0, {
    type: 'StickyBar',
    props: {
      text: "🔥 LIMITED TIME: Only 8 spots left at this price!",
      cta: "Claim Your Spot"
    }
  });
  
  // Enhance testimonials with numbers
  const socialProofBlock = blocks.find((b) => 
    b.type === 'SocialProof' || (b.props && 'testimonials' in b.props)
  );
  
  if (socialProofBlock) {
    const testimonials = Array.isArray((socialProofBlock.props as Record<string, unknown>).testimonials)
      ? (socialProofBlock.props as { testimonials: unknown[] }).testimonials
      : [];

    (socialProofBlock.props as Record<string, unknown>).testimonials = testimonials
      .filter((t): t is { quote: string } & Record<string, unknown> => typeof t === 'object' && t !== null)
      .map((t) => ({
        ...t,
        quote: addNumbersToTestimonial(typeof (t as { quote?: unknown }).quote === 'string' ? (t as { quote: string }).quote : ''),
      }));
  }
  
  // Add price deception if Pricing block exists
  const pricingBlock = blocks.find((b) => b.type === 'Pricing');
  if (pricingBlock && (pricingBlock.props as Record<string, unknown>)?.tiers) {
    const tiers = (pricingBlock.props as { tiers: unknown }).tiers;
    if (Array.isArray(tiers)) {
      (pricingBlock.props as Record<string, unknown>).tiers = tiers
        .filter((tier): tier is { originalPrice?: number; currentPrice?: number; scarcityText?: string } & Record<string, unknown> => typeof tier === 'object' && tier !== null)
        .map((tier) => ({
          ...tier,
          originalPrice:
            typeof tier.originalPrice === 'number'
              ? tier.originalPrice
              : typeof tier.currentPrice === 'number'
                ? tier.currentPrice * 4
                : undefined,
          scarcityText: typeof tier.scarcityText === 'string' ? tier.scarcityText : "Only 12 left at this price"
        }));
    }
  }
  
  return { ...pageData, blocks };
}

function addNumbersToTestimonial(quote: string): string {
  const numberPatterns = [
    /(\d+)lbs/,
    /\$(\d+)/,
    /(\d+) weeks/,
    /(\d+) days/
  ];
  
  const hasNumbers = numberPatterns.some(pattern => pattern.test(quote));
  if (!hasNumbers) {
    const additions = [
      " I lost 28lbs in just 12 weeks!",
      " Made $5,247 in my first 90 days.",
      " Went from size 16 to size 8.",
      " Increased my income by 347%."
    ];
    return quote + additions[Math.floor(Math.random() * additions.length)];
  }
  return quote;
}
