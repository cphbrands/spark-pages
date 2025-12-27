import { z } from 'zod';

// Theme Schema
export const ThemeSchema = z.object({
  mode: z.enum(['light', 'dark']),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  font: z.enum(['inter', 'outfit', 'system']),
  buttonStyle: z.enum(['solid', 'outline']),
});

export type Theme = z.infer<typeof ThemeSchema>;

// Meta Schema
export const MetaSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(300).optional(),
});

export type Meta = z.infer<typeof MetaSchema>;

// Block Props Schemas
export const HeroPropsSchema = z.object({
  headline: z.string().min(1).max(200),
  subheadline: z.string().max(500).optional(),
  ctaText: z.string().max(50).optional(),
  ctaUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  alignment: z.enum(['left', 'center', 'right']).optional(),
});

export const FeaturesPropsSchema = z.object({
  heading: z.string().max(100).optional(),
  items: z.array(z.object({
    icon: z.string().max(50).optional(),
    title: z.string().min(1).max(100),
    description: z.string().max(300),
  })).min(1).max(6),
});

export const BenefitsPropsSchema = z.object({
  heading: z.string().max(100).optional(),
  items: z.array(z.string().min(1).max(200)).min(1).max(10),
});

export const SocialProofPropsSchema = z.object({
  heading: z.string().max(100).optional(),
  logos: z.array(z.object({
    name: z.string().max(50),
    imageUrl: z.string().url().optional(),
  })).max(10).optional(),
  testimonials: z.array(z.object({
    quote: z.string().min(1).max(500),
    author: z.string().max(100),
    role: z.string().max(100).optional(),
    avatarUrl: z.string().url().optional(),
  })).max(5).optional(),
});

export const PricingPropsSchema = z.object({
  heading: z.string().max(100).optional(),
  price: z.string().min(1).max(50),
  compareAtPrice: z.string().max(50).optional(),
  discountBadge: z.string().max(50).optional(),
  features: z.array(z.string().max(200)).max(15),
  ctaText: z.string().max(50).optional(),
  ctaUrl: z.string().url().optional().or(z.literal('')),
});

export const CountdownPropsSchema = z.object({
  endAt: z.string(), // ISO datetime
  label: z.string().max(100).optional(),
  scarcityText: z.string().max(200).optional(),
});

export const FAQPropsSchema = z.object({
  heading: z.string().max(100).optional(),
  items: z.array(z.object({
    question: z.string().min(1).max(200),
    answer: z.string().min(1).max(1000),
  })).min(1).max(20),
});

export const ImageGalleryPropsSchema = z.object({
  heading: z.string().max(100).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().max(200).optional(),
    caption: z.string().max(200).optional(),
  })).min(1).max(12),
});

export const GuaranteePropsSchema = z.object({
  heading: z.string().max(100).optional(),
  text: z.string().min(1).max(500),
  icon: z.string().max(50).optional(),
});

export const CTASectionPropsSchema = z.object({
  heading: z.string().min(1).max(200),
  subheading: z.string().max(300).optional(),
  ctaText: z.string().max(50),
  ctaUrl: z.string().url().optional().or(z.literal('')),
  variant: z.enum(['default', 'gradient', 'dark']).optional(),
});

export const FooterPropsSchema = z.object({
  companyName: z.string().max(100).optional(),
  links: z.array(z.object({
    label: z.string().max(50),
    url: z.string().url(),
  })).max(10).optional(),
  copyright: z.string().max(200).optional(),
});

export const FormPropsSchema = z.object({
  heading: z.string().max(100).optional(),
  subheading: z.string().max(300).optional(),
  submitText: z.string().max(50).optional(),
  showPhone: z.boolean().optional(),
  successMessage: z.string().max(200).optional(),
});

// Block type enum
export const BlockTypeSchema = z.enum([
  'Hero',
  'Features',
  'Benefits',
  'SocialProof',
  'Pricing',
  'Countdown',
  'FAQ',
  'ImageGallery',
  'Guarantee',
  'CTASection',
  'Footer',
  'Form',
]);

export type BlockType = z.infer<typeof BlockTypeSchema>;

// Block Schema with discriminated union
export const BlockSchema = z.object({
  id: z.string().uuid(),
  type: BlockTypeSchema,
  props: z.record(z.unknown()),
});

export type Block = z.infer<typeof BlockSchema>;

// Page Schema
export const PageSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['draft', 'published']),
  meta: MetaSchema,
  theme: ThemeSchema,
  blocks: z.array(BlockSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Page = z.infer<typeof PageSchema>;

// Template Schema
export const TemplateSchema = PageSchema.extend({
  templateName: z.string().min(1).max(100),
  templateDescription: z.string().max(300).optional(),
  templateCategory: z.string().max(50).optional(),
});

export type Template = z.infer<typeof TemplateSchema>;

// Lead Schema
export const LeadSchema = z.object({
  id: z.string().uuid(),
  pageId: z.string().uuid(),
  pageSlug: z.string(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  createdAt: z.string(),
  ipHash: z.string().optional(),
  userAgent: z.string().max(500).optional(),
});

export type Lead = z.infer<typeof LeadSchema>;

// Lead submission schema (for form validation)
export const LeadSubmissionSchema = z.object({
  pageId: z.string().uuid(),
  pageSlug: z.string(),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().max(20).optional(),
  honeypot: z.string().max(0).optional(), // Must be empty
});

export type LeadSubmission = z.infer<typeof LeadSubmissionSchema>;

// Block props type map
export const BlockPropsSchemas = {
  Hero: HeroPropsSchema,
  Features: FeaturesPropsSchema,
  Benefits: BenefitsPropsSchema,
  SocialProof: SocialProofPropsSchema,
  Pricing: PricingPropsSchema,
  Countdown: CountdownPropsSchema,
  FAQ: FAQPropsSchema,
  ImageGallery: ImageGalleryPropsSchema,
  Guarantee: GuaranteePropsSchema,
  CTASection: CTASectionPropsSchema,
  Footer: FooterPropsSchema,
  Form: FormPropsSchema,
} as const;

// Helper to validate block props
export function validateBlockProps(type: BlockType, props: unknown) {
  const schema = BlockPropsSchemas[type];
  return schema.safeParse(props);
}

// Default props for each block type
export const defaultBlockProps: Record<BlockType, unknown> = {
  Hero: {
    headline: 'Your Amazing Headline Here',
    subheadline: 'A compelling subheadline that explains your value proposition',
    ctaText: 'Get Started',
    ctaUrl: '#',
    alignment: 'center',
  },
  Features: {
    heading: 'Why Choose Us',
    items: [
      { title: 'Feature One', description: 'Description of your first amazing feature' },
      { title: 'Feature Two', description: 'Description of your second amazing feature' },
      { title: 'Feature Three', description: 'Description of your third amazing feature' },
    ],
  },
  Benefits: {
    heading: 'Benefits',
    items: ['Benefit one that your customers will love', 'Another great benefit', 'One more compelling reason'],
  },
  SocialProof: {
    heading: 'Trusted By',
    testimonials: [
      { quote: 'This product changed my life!', author: 'John Doe', role: 'CEO, Company' },
    ],
  },
  Pricing: {
    heading: 'Special Offer',
    price: '$99',
    compareAtPrice: '$199',
    discountBadge: '50% OFF',
    features: ['Feature included', 'Another feature', 'And one more'],
    ctaText: 'Buy Now',
    ctaUrl: '#',
  },
  Countdown: {
    endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    label: 'Offer Ends In',
    scarcityText: 'Limited time only!',
  },
  FAQ: {
    heading: 'Frequently Asked Questions',
    items: [
      { question: 'What is your refund policy?', answer: 'We offer a 30-day money back guarantee.' },
    ],
  },
  ImageGallery: {
    heading: 'Gallery',
    images: [
      { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', alt: 'Image 1' },
    ],
  },
  Guarantee: {
    heading: '100% Satisfaction Guaranteed',
    text: 'If you\'re not completely satisfied, we\'ll refund your money. No questions asked.',
    icon: 'shield',
  },
  CTASection: {
    heading: 'Ready to Get Started?',
    subheading: 'Join thousands of satisfied customers today.',
    ctaText: 'Start Now',
    ctaUrl: '#',
    variant: 'gradient',
  },
  Footer: {
    companyName: 'Your Company',
    copyright: '© 2024 Your Company. All rights reserved.',
  },
  Form: {
    heading: 'Get in Touch',
    subheading: 'Fill out the form below and we\'ll get back to you.',
    submitText: 'Submit',
    showPhone: false,
    successMessage: 'Thank you! We\'ll be in touch soon.',
  },
};
