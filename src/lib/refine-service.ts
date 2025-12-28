import { GenerateResponseSchema, GenerateResponse } from './api-schemas';
import { BlockPropsSchemas, BlockType, Page } from './schemas';
import { z } from 'zod';

const API_ENDPOINT = '/api/refine';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export interface RefineResult {
  success: true;
  data: GenerateResponse;
}

export interface RefineError {
  success: false;
  error: { message: string; details?: unknown };
}

export type RefineResponse = RefineResult | RefineError;

function validateBlockProps(blocks: GenerateResponse['blocks']): z.ZodError | null {
  for (const block of blocks) {
    const propsSchema = BlockPropsSchemas[block.type as BlockType];
    if (propsSchema) {
      const result = propsSchema.safeParse(block.props);
      if (!result.success) {
        return result.error;
      }
    }
  }
  return null;
}

export async function refineLandingPage(
  prompt: string,
  currentPage: Page
): Promise<RefineResponse> {
  if (!prompt || prompt.length < 3) {
    return {
      success: false,
      error: { message: 'Prompt must be at least 3 characters' },
    };
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        prompt,
        currentPage: {
          meta: currentPage.meta,
          theme: currentPage.theme,
          blocks: currentPage.blocks.map(b => ({ type: b.type, props: b.props })),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: { message: `API error (${response.status}): ${errorText || 'Unknown error'}` },
      };
    }

    const json = await response.json();

    // Validate response structure
    const responseValidation = GenerateResponseSchema.safeParse(json);
    if (!responseValidation.success) {
      return {
        success: false,
        error: { message: 'Invalid response from API', details: responseValidation.error.errors },
      };
    }

    // Validate each block's props
    const propsError = validateBlockProps(responseValidation.data.blocks);
    if (propsError) {
      return {
        success: false,
        error: { message: 'Invalid block properties in response', details: propsError.errors },
      };
    }

    return {
      success: true,
      data: responseValidation.data,
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error instanceof Error ? error.message : 'Network error' },
    };
  }
}
