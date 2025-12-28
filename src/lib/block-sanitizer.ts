import type { GenerateResponse } from "./api-schemas";
import { BlockPropsSchemas, BlockType, defaultBlockProps } from "./schemas";

/**
 * Best-effort sanitizer for AI-generated blocks.
 * If a block fails schema validation, we merge in default props for that block type.
 */
export function sanitizeGeneratedBlocks(
  blocks: GenerateResponse["blocks"]
): GenerateResponse["blocks"] {
  return blocks.map((block) => {
    const type = block.type as BlockType;
    const schema = BlockPropsSchemas[type];
    if (!schema) return block;

    const parsed = schema.passthrough().safeParse(block.props);
    if (parsed.success) return block;

    const merged = {
      ...(defaultBlockProps[type] as Record<string, unknown>),
      ...(block.props as Record<string, unknown>),
    };

    const parsedMerged = schema.passthrough().safeParse(merged);
    if (parsedMerged.success) {
      return { ...block, props: parsedMerged.data };
    }

    // Last resort: guaranteed-valid default props.
    return { ...block, props: defaultBlockProps[type] as Record<string, unknown> };
  });
}
