import { BlockPropsSchemas, defaultBlockProps, BlockType } from '../src/lib/schemas.js';

export type SanitizedBlock = {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
};

/**
 * Server-side sanitizer to ensure blocks satisfy frontend schemas before returning to UI.
 * Merges AI output with default props and re-validates.
 */
export function sanitizeToFrontendSchemas(blocks: SanitizedBlock[]): SanitizedBlock[] {
  return blocks.map((block) => {
    const schema = BlockPropsSchemas[block.type];
    if (!schema) return block;

    const parsed = schema.passthrough().safeParse(block.props);
    if (parsed.success) return block;

    const merged = {
      ...(defaultBlockProps[block.type] as Record<string, unknown>),
      ...(block.props || {}),
    };

    const mergedResult = schema.passthrough().safeParse(merged);
    if (mergedResult.success) {
      return { ...block, props: mergedResult.data };
    }

    return { ...block, props: defaultBlockProps[block.type] as Record<string, unknown> };
  });
}
