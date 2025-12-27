import { GenerateRequestSchema, GenerateResponseSchema, GenerateResponse, GenerateError, ReferenceInput } from './api-schemas';
import { BlockPropsSchemas, BlockType } from './schemas';
import { z } from 'zod';

const API_ENDPOINT = '/api/generate';

export interface GeneratorResult {
  success: true;
  data: GenerateResponse;
}

export interface GeneratorError {
  success: false;
  error: GenerateError;
}

export type GeneratorResponse = GeneratorResult | GeneratorError;

/**
 * Validates each block's props against its type schema
 */
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

/**
 * Calls the external API to generate a landing page
 * 
 * Backend responsibilities:
 * - Step A: Call OpenAI to generate JSON blocks + heroImagePrompt
 * - Step B: Call image API with heroImagePrompt, get imageUrl
 * - Inject imageUrl into Hero.props.imageUrl
 * - Return final JSON to frontend
 * 
 * Frontend receives a single final JSON with everything included.
 */
export async function generateLandingPage(
  prompt: string,
  templateId?: string,
  reference?: ReferenceInput
): Promise<GeneratorResponse> {
  // Validate request
  const requestValidation = GenerateRequestSchema.safeParse({ prompt, templateId, reference });
  if (!requestValidation.success) {
    return {
      success: false,
      error: {
        message: 'Invalid request',
        details: requestValidation.error.errors,
      },
    };
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestValidation.data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: {
          message: `API error (${response.status}): ${errorText || 'Unknown error'}`,
        },
      };
    }

    const json = await response.json();

    // Validate response structure
    const responseValidation = GenerateResponseSchema.safeParse(json);
    if (!responseValidation.success) {
      return {
        success: false,
        error: {
          message: 'Invalid response from API',
          details: responseValidation.error.errors,
        },
      };
    }

    // Validate each block's props
    const propsError = validateBlockProps(responseValidation.data.blocks);
    if (propsError) {
      return {
        success: false,
        error: {
          message: 'Invalid block properties in response',
          details: propsError.errors,
        },
      };
    }

    return {
      success: true,
      data: responseValidation.data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Network error',
      },
    };
  }
}
