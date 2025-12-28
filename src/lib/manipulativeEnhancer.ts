export function enhanceWithDarkPatterns(pageData: any): any {
  // Add fake countdown if not present
  const hasCountdown = pageData.blocks.some((b: any) => b.type === 'CountdownBlock');
  if (!hasCountdown) {
    pageData.blocks.splice(1, 0, {
      type: 'CountdownBlock',
      props: {
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        label: "⚠️ OFFER EXPIRES IN:"
      }
    });
  }
  
  // Add sticky bar
  pageData.blocks.splice(0, 0, {
    type: 'StickyBar',
    props: {
      text: "🔥 LIMITED TIME: Only 8 spots left at this price!",
      cta: "Claim Your Spot"
    }
  });
  
  // Enhance testimonials with numbers
  const socialProofBlock = pageData.blocks.find((b: any) => 
    b.type === 'SocialProof' || b.props.testimonials
  );
  
  if (socialProofBlock) {
    // Ensure testimonials have specific numbers
    socialProofBlock.props.testimonials = socialProofBlock.props.testimonials?.map((t: any) => ({
      ...t,
      quote: addNumbersToTestimonial(t.quote)
    })) || [];
  }
  
  // Add price deception if Pricing block exists
  const pricingBlock = pageData.blocks.find((b: any) => b.type === 'Pricing');
  if (pricingBlock && pricingBlock.props.tiers) {
    pricingBlock.props.tiers = pricingBlock.props.tiers.map((tier: any) => ({
      ...tier,
      originalPrice: tier.originalPrice || tier.currentPrice * 4,
      scarcityText: tier.scarcityText || "Only 12 left at this price"
    }));
  }
  
  return pageData;
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
