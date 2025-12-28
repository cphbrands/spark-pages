import { z } from 'zod';
import { ThemeSchema, BlockTypeSchema } from './schemas';

// Whitelisted block types for generated pages
export const AllowedBlockTypes = [
  'Hero',
  'Features',
  'Benefits',
  'Pricing',
  'Countdown',
  'FAQ',
  'CTASection',
  'Footer',
  'Form',
  'SocialProof',
  'Guarantee',
  'ImageGallery',
  'Popup',
  'StickyBar',
] as const;

export const AllowedBlockTypeSchema = z.enum(AllowedBlockTypes);

// Generated block schema - strict validation
export const GeneratedBlockSchema = z.object({
  type: AllowedBlockTypeSchema,
  props: z.record(z.unknown()),
});

// API Response schema
// Backend handles: Step A (LLM → JSON + heroImagePrompt) + Step B (Image gen → inject imageUrl)
// Frontend receives final JSON with Hero.props.imageUrl already populated
export const GenerateResponseSchema = z.object({
  meta: z.object({
    title: z.string().min(1).max(100),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    description: z.string().max(300).optional(),
  }),
  theme: ThemeSchema,
  blocks: z.array(GeneratedBlockSchema).min(1).max(20),
});

export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;

// Reference input for matching structure/style
export const ReferenceInputSchema = z.object({
  type: z.enum(['url', 'html', 'image']),
  value: z.string().max(100000), // URL, HTML content, or base64 image
}).optional();

export type ReferenceInput = z.infer<typeof ReferenceInputSchema>;

// Request schema - single prompt with optional reference
export const GenerateRequestSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(2000, 'Prompt must be under 2000 characters').trim(),
  templateId: z.string().optional(),
  reference: ReferenceInputSchema,
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

// Error response
export interface GenerateError {
  message: string;
  details?: z.ZodError['errors'];
}
