/**
 * OpenAI Function Calling Schema for Landing Page Generation
 * 
 * This schema defines the structure for "high-conversion offer pages" with:
 * - Urgency elements (countdown, limited time)
 * - Scarcity indicators (limited spots, stock)
 * - Social proof sections (testimonials, logos, numbers)
 * - Multiple CTAs (hero, mid-page, footer)
 * - Pain-point highlighting (problem → solution flow)
 */

// Block type definitions for the function schema
export const BLOCK_DEFINITIONS = {
  Hero: {
    type: 'object',
    description: 'Hero section with headline, subheadline, and primary CTA. First impression - must grab attention.',
    properties: {
      type: { type: 'string', enum: ['Hero'] },
      props: {
        type: 'object',
        properties: {
          headline: { type: 'string', description: 'Power headline that addresses pain point or promises transformation. Max 200 chars.' },
          subheadline: { type: 'string', description: 'Supporting text that expands on the promise. Max 500 chars.' },
          ctaText: { type: 'string', description: 'Action-oriented CTA button text. Use urgency words.' },
          ctaUrl: { type: 'string', description: 'CTA link URL, usually #pricing or #form' },
          alignment: { type: 'string', enum: ['left', 'center', 'right'] },
        },
        required: ['headline'],
      },
    },
    required: ['type', 'props'],
  },

  StickyBar: {
    type: 'object',
    description: 'Persistent urgency bar at top/bottom. Perfect for scarcity messaging.',
    properties: {
      type: { type: 'string', enum: ['StickyBar'] },
      props: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Urgency/scarcity message with emoji. E.g., "🔥 Only 7 spots left at this price!"' },
          ctaText: { type: 'string', description: 'Short CTA text' },
          ctaUrl: { type: 'string' },
          position: { type: 'string', enum: ['top', 'bottom'] },
          dismissible: { type: 'boolean' },
          countdown: { type: 'boolean', description: 'Show countdown timer in bar' },
          countdownEndAt: { type: 'string', description: 'ISO datetime for countdown end' },
        },
        required: ['text'],
      },
    },
    required: ['type', 'props'],
  },

  Benefits: {
    type: 'object',
    description: 'List of benefits addressing pain points. Transform problems into solutions.',
    properties: {
      type: { type: 'string', enum: ['Benefits'] },
      props: {
        type: 'object',
        properties: {
          heading: { type: 'string', description: 'Section heading, e.g., "What You\'ll Get" or "Say Goodbye To..."' },
          items: {
            type: 'array',
            items: { type: 'string' },
            description: 'Benefits list. Start with action verbs. Address specific pain points.',
          },
        },
        required: ['items'],
      },
    },
    required: ['type', 'props'],
  },

  Features: {
    type: 'object',
    description: 'Feature cards with icons. Show what\'s included.',
    properties: {
      type: { type: 'string', enum: ['Features'] },
      props: {
        type: 'object',
        properties: {
          heading: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                icon: { type: 'string', description: 'Icon name from lucide-react' },
                title: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['title', 'description'],
            },
          },
        },
        required: ['items'],
      },
    },
    required: ['type', 'props'],
  },

  SocialProof: {
    type: 'object',
    description: 'Testimonials and trust signals. Build credibility and reduce objections.',
    properties: {
      type: { type: 'string', enum: ['SocialProof'] },
      props: {
        type: 'object',
        properties: {
          heading: { type: 'string', description: 'E.g., "What Our Customers Say" or "Join 10,000+ Happy Customers"' },
          testimonials: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                quote: { type: 'string', description: 'Specific, believable testimonial addressing common objections' },
                author: { type: 'string' },
                role: { type: 'string' },
              },
              required: ['quote', 'author'],
            },
          },
          logos: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                imageUrl: { type: 'string' },
              },
            },
          },
        },
      },
    },
    required: ['type', 'props'],
  },

  Countdown: {
    type: 'object',
    description: 'Countdown timer for urgency. Creates fear of missing out.',
    properties: {
      type: { type: 'string', enum: ['Countdown'] },
      props: {
        type: 'object',
        properties: {
          endAt: { type: 'string', description: 'ISO datetime. Set 24-72 hours from now for urgency.' },
          label: { type: 'string', description: 'E.g., "This Offer Expires In..." or "Price Goes Up In..."' },
          scarcityText: { type: 'string', description: 'Reinforce scarcity, e.g., "Only 23 spots remaining at this price"' },
        },
        required: ['endAt'],
      },
    },
    required: ['type', 'props'],
  },

  Pricing: {
    type: 'object',
    description: 'Pricing section with anchor pricing and discount. Show value gap.',
    properties: {
      type: { type: 'string', enum: ['Pricing'] },
      props: {
        type: 'object',
        properties: {
          heading: { type: 'string', description: 'E.g., "Special Launch Offer" or "Limited Time Discount"' },
          price: { type: 'string', description: 'Current discounted price with currency' },
          compareAtPrice: { type: 'string', description: 'Original "anchor" price to show discount value' },
          discountBadge: { type: 'string', description: 'E.g., "SAVE 60%" or "BEST VALUE"' },
          features: {
            type: 'array',
            items: { type: 'string' },
            description: 'What\'s included. Stack value.',
          },
          ctaText: { type: 'string', description: 'Strong CTA with urgency, e.g., "Claim Your Discount Now"' },
          ctaUrl: { type: 'string' },
        },
        required: ['price', 'features', 'ctaText'],
      },
    },
    required: ['type', 'props'],
  },

  Guarantee: {
    type: 'object',
    description: 'Risk reversal section. Remove purchase anxiety.',
    properties: {
      type: { type: 'string', enum: ['Guarantee'] },
      props: {
        type: 'object',
        properties: {
          heading: { type: 'string', description: 'E.g., "100% Money-Back Guarantee" or "Risk-Free Purchase"' },
          text: { type: 'string', description: 'Explain the guarantee clearly. Make it feel safe.' },
          icon: { type: 'string', description: 'Icon name, e.g., "shield" or "check-circle"' },
        },
        required: ['text'],
      },
    },
    required: ['type', 'props'],
  },

  FAQ: {
    type: 'object',
    description: 'FAQ section. Handle objections before they become blockers.',
    properties: {
      type: { type: 'string', enum: ['FAQ'] },
      props: {
        type: 'object',
        properties: {
          heading: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string', description: 'Common objection phrased as question' },
                answer: { type: 'string', description: 'Answer that overcomes the objection' },
              },
              required: ['question', 'answer'],
            },
          },
        },
        required: ['items'],
      },
    },
    required: ['type', 'props'],
  },

  CTASection: {
    type: 'object',
    description: 'Secondary CTA block. Reinforce offer mid-page or before footer.',
    properties: {
      type: { type: 'string', enum: ['CTASection'] },
      props: {
        type: 'object',
        properties: {
          heading: { type: 'string', description: 'Restate the core promise' },
          subheading: { type: 'string', description: 'Add urgency or social proof' },
          ctaText: { type: 'string' },
          ctaUrl: { type: 'string' },
          variant: { type: 'string', enum: ['default', 'gradient', 'dark'] },
        },
        required: ['heading', 'ctaText'],
      },
    },
    required: ['type', 'props'],
  },

  Form: {
    type: 'object',
    description: 'Lead capture form. Keep it short for higher conversions.',
    properties: {
      type: { type: 'string', enum: ['Form'] },
      props: {
        type: 'object',
        properties: {
          heading: { type: 'string', description: 'E.g., "Get Instant Access" or "Reserve Your Spot"' },
          subheading: { type: 'string' },
          submitText: { type: 'string', description: 'Action-oriented, e.g., "Send Me The Guide"' },
          showPhone: { type: 'boolean' },
          successMessage: { type: 'string' },
          webhookUrl: { type: 'string' },
        },
      },
    },
    required: ['type', 'props'],
  },

  Popup: {
    type: 'object',
    description: 'Exit-intent or timed popup. Last chance conversion.',
    properties: {
      type: { type: 'string', enum: ['Popup'] },
      props: {
        type: 'object',
        properties: {
          heading: { type: 'string', description: 'Attention-grabbing, e.g., "Wait! Don\'t Leave Empty-Handed"' },
          text: { type: 'string', description: 'Special offer or incentive' },
          ctaText: { type: 'string' },
          ctaUrl: { type: 'string' },
          trigger: { type: 'string', enum: ['delay', 'exit', 'scroll'] },
          delaySeconds: { type: 'number' },
          scrollPercent: { type: 'number' },
          showOnce: { type: 'boolean' },
        },
        required: ['heading'],
      },
    },
    required: ['type', 'props'],
  },

  Footer: {
    type: 'object',
    description: 'Simple footer with legal links.',
    properties: {
      type: { type: 'string', enum: ['Footer'] },
      props: {
        type: 'object',
        properties: {
          companyName: { type: 'string' },
          copyright: { type: 'string' },
          links: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                url: { type: 'string' },
              },
            },
          },
        },
      },
    },
    required: ['type', 'props'],
  },
} as const;

/**
 * Main function schema for OpenAI Function Calling
 */
export const GENERATE_PAGE_FUNCTION = {
  name: 'generate_landing_page',
  description: `Generate a high-conversion landing page structure optimized for sales and lead capture.
  
The page should follow proven conversion principles:
1. ATTENTION: Grab with a powerful headline addressing the core pain point
2. INTEREST: Build with benefits and social proof
3. DESIRE: Create with scarcity, urgency, and value stacking
4. ACTION: Convert with clear CTAs and risk reversal

Always include:
- At least 2 CTAs (hero + pricing/form)
- Urgency element (countdown or sticky bar)
- Social proof (testimonials)
- Risk reversal (guarantee)`,
  
  parameters: {
    type: 'object',
    properties: {
      meta: {
        type: 'object',
        description: 'Page metadata for SEO and routing',
        properties: {
          title: { type: 'string', description: 'SEO title, max 60 chars' },
          slug: { type: 'string', description: 'URL slug, lowercase with hyphens only' },
          description: { type: 'string', description: 'Meta description for SEO, max 160 chars' },
        },
        required: ['title', 'slug'],
      },
      
      theme: {
        type: 'object',
        description: 'Visual theme settings',
        properties: {
          mode: { type: 'string', enum: ['light', 'dark'], description: 'Color mode' },
          primaryColor: { type: 'string', description: 'Hex color for CTAs and accents, e.g., #ef4444 for urgency' },
          font: { type: 'string', enum: ['inter', 'outfit', 'system'] },
          buttonStyle: { type: 'string', enum: ['solid', 'outline'] },
        },
        required: ['mode', 'primaryColor', 'font', 'buttonStyle'],
      },
      
      heroImagePrompt: {
        type: 'string',
        description: `DALL-E prompt for hero background image. 
RULES:
- Describe a photorealistic scene that evokes the offer's emotion/outcome
- NO text, NO UI elements, NO countdown timers, NO buttons
- Focus on lifestyle, aspiration, or product imagery
- Example: "Professional woman working confidently at modern desk, warm lighting, success aesthetic"`,
      },
      
      blocks: {
        type: 'array',
        description: `Ordered list of page blocks. Recommended structure:
1. StickyBar (urgency)
2. Hero (attention)
3. Benefits (pain points → solutions)
4. SocialProof (credibility)
5. Features (what's included)
6. Countdown (urgency)
7. Pricing (offer)
8. Guarantee (risk reversal)
9. FAQ (objection handling)
10. CTASection (final push)
11. Footer
12. Popup (exit intent)`,
        items: {
          oneOf: Object.values(BLOCK_DEFINITIONS),
        },
        minItems: 5,
        maxItems: 15,
      },
    },
    required: ['meta', 'theme', 'blocks'],
  },
};

/**
 * System prompt for the LLM focusing on conversion psychology
 */
export const CONVERSION_SYSTEM_PROMPT = `You are an expert direct-response copywriter and conversion optimization specialist. Your job is to generate high-converting landing pages that drive action.

## Core Principles

### 1. Pain-Point Agitation
- Start with the problem, not the solution
- Make the reader feel the pain of their current situation
- Then present your offer as the relief

### 2. Urgency & Scarcity
- Use countdown timers with specific end dates (24-72 hours from now)
- Mention limited spots, limited time, or limited stock
- Create FOMO (Fear Of Missing Out)

### 3. Social Proof
- Include specific testimonials with names and roles
- Use numbers ("Join 10,000+ happy customers")
- Address common objections in testimonials

### 4. Value Stacking
- Show the original/anchor price vs. current price
- List everything included to maximize perceived value
- Make the discount feel significant (50%+ off)

### 5. Risk Reversal
- Always include a guarantee
- Make it feel completely safe to buy
- Remove all purchase anxiety

### 6. Multiple CTAs
- Hero CTA (primary)
- Mid-page CTA after social proof
- Pricing CTA (most important)
- Exit popup CTA (last chance)

## Copy Guidelines

- Use power words: "Instant", "Guaranteed", "Proven", "Limited", "Exclusive"
- Write in second person ("You" not "We")
- Focus on benefits over features
- Use specific numbers when possible
- Create urgency without being sleazy

## Block Order for Maximum Conversion

1. StickyBar - Immediate urgency/scarcity message
2. Hero - Hook with pain point + promise
3. Benefits - What they'll get (problem → solution)
4. SocialProof - Build trust with testimonials
5. Features - What's included (value stack)
6. Countdown - Create urgency
7. Pricing - The offer with anchor pricing
8. Guarantee - Remove risk
9. FAQ - Handle remaining objections
10. CTASection - Final push
11. Footer - Legal/trust
12. Popup - Exit intent capture

Remember: Every element should drive toward the single conversion goal.`;

export type BlockDefinition = typeof BLOCK_DEFINITIONS[keyof typeof BLOCK_DEFINITIONS];
export type GeneratePageFunction = typeof GENERATE_PAGE_FUNCTION;
