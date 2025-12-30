/*
 * Video generation service that encapsulates the research → prompt → video generation flow
 * (Tavily → OpenAI prompt engineer → Kie.ai Sora 2 image-to-video).
 *
 * Env vars expected at runtime:
 *  - OPENAI_API_KEY
 *  - KIE_AI_API_KEY
 *  - TAVILY_API_KEY
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const KIE_AI_API_KEY = process.env.KIE_AI_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

export interface GenerateVideoInput {
  productName: string;
  imageUrl: string;
  style?: 'ugc' | 'cinematic';
}

export interface GenerateVideoResult {
  videoUrl: string;
  thumbnailUrl?: string;
  prompt: string;
  taskId: string;
}

const SYSTEM_PROMPT = `You are an expert AI video prompt engineer trained to design optimized prompts for Sora 2 video generation on Kie.ai.
Your role is to take a raw product concept, a short idea, and an image link and transform them into a highly detailed, realistic, and visually rich video prompt that aligns with modern marketing standards.

Objective
Generate a prompt that helps Sora 2 produce a realistic, natural-looking short video matching the intent of the product or service.
The result should look like it was filmed by a real person or a professional ad team — depending on the desired style.

Rules
1. Always research latest trends, product type, related products or categories, and current market insights of the product or product category. Use this information to ensure the video prompt reflects the most current and effective styles in video advertising, avoiding outdated approaches.
2. Understand the product — analyze what it is, who it's for, and its emotional appeal (use any research insight provided).
3. Always describe:
- Main subject(s): appearance, clothing, expression, action.
- Setting: location, lighting, time of day, atmosphere.
- Camera style: framing, motion, handheld vs cinematic, lens type, realism.
- Tone: emotional mood (friendly, elegant, cinematic, testimonial, etc.).
- Lighting: realistic natural or studio lighting, with mood consistency.
4. If the user specifies "UGC" or "influencer-style", simulate a smartphone or handheld camera perspective, vertical 9:16 format, and a natural, authentic tone.
5. If no style is specified, default to a cinematic ad style that looks visually stunning and brand-ready.
6. Avoid repetition, keep every sentence meaningful, and ensure the description reads like a cinematographer describing the shot to a director.`;

async function fetchWithRetry(input: RequestInfo | URL, init: RequestInit, label: string, attempts = 3) {
  let delay = 500;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(input, init);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${label} failed: ${res.status} ${text}`);
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2; // exponential backoff
      }
    }
  }
  if (lastErr instanceof Error) throw lastErr;
  throw new Error(typeof lastErr === 'string' ? lastErr : 'Request failed after retries');
}

async function tavilySearch(query: string) {
  if (!TAVILY_API_KEY) throw new Error('TAVILY_API_KEY is not set');
  try {
    const res = await fetchWithRetry(
      'https://api.tavily.com/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query: `Marketing trends and emotional appeal for: ${query}`,
          max_results: 3,
          search_depth: 'advanced',
        }),
      },
      'Tavily search'
    );

    const data = await res.json();
    return data.results ?? data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Tavily request error: ${message}`);
  }
}

async function createOptimizedPrompt(productName: string, insights: unknown, style: string) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set');
  const userPrompt = `Product: ${productName}. Style: ${style}. Insights: ${JSON.stringify(insights).slice(0, 4000)}`;

  try {
    const res = await fetchWithRetry(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 700,
        }),
      },
      'OpenAI prompt generation'
    );

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('OpenAI returned no content');
    return content.trim();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`OpenAI request error: ${message}`);
  }
}

async function callKieAiSora(prompt: string, imageUrl: string) {
  if (!KIE_AI_API_KEY) throw new Error('KIE_AI_API_KEY is not set');
  try {
    const res = await fetchWithRetry(
      'https://api.kie.ai/api/v1/jobs/createTask',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${KIE_AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'sora-2-image-to-video',
          input: {
            prompt,
            image_urls: [imageUrl],
            aspect_ratio: 'portrait',
            n_frames: '10',
            remove_watermark: true,
          },
        }),
      },
      'Kie.ai createTask'
    );

    const data = await res.json();
    const taskId = data?.data?.taskId;
    if (!taskId) throw new Error('Kie.ai createTask returned no taskId');
    return taskId as string;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Kie.ai request error: ${message}`);
  }
}

async function pollForVideoResult(taskId: string, maxAttempts = 30, intervalMs = 15000, totalTimeoutMs = 7 * 60 * 1000) {
  if (!KIE_AI_API_KEY) throw new Error('KIE_AI_API_KEY is not set');
  const baseUrl = 'https://api.kie.ai/api/v1/jobs/recordInfo';
  const start = Date.now();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, intervalMs));

    if (Date.now() - start > totalTimeoutMs) {
      throw new Error('Video generation timed out.');
    }

    const url = `${baseUrl}?taskId=${encodeURIComponent(taskId)}`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${KIE_AI_API_KEY}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.warn(`Kie.ai poll attempt ${attempt + 1} failed: ${res.status} ${text}`);
        continue;
      }

      const data = await res.json();
      const state = data?.data?.state;
      if (state === 'success') {
        const videoUrl = data?.data?.resultUrls?.[0];
        const thumbnailUrl = data?.data?.thumbnailUrl;
        if (!videoUrl) throw new Error('Kie.ai success state without videoUrl');
        return { videoUrl, thumbnailUrl };
      }
      if (state === 'error') {
        const msg = data?.data?.msg || 'Kie.ai reported an error state';
        throw new Error(msg);
      }
      // pending -> continue
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`Kie.ai poll attempt ${attempt + 1} error: ${message}`);
      continue;
    }
    // pending -> continue
  }
  throw new Error('Video generation timed out.');
}

export async function generateVideoTestimonial({ productName, imageUrl, style = 'ugc' }: GenerateVideoInput): Promise<GenerateVideoResult> {
  if (!productName || !imageUrl) throw new Error('productName and imageUrl are required');

  const insights = await tavilySearch(productName);
  const prompt = await createOptimizedPrompt(productName, insights, style);
  const taskId = await callKieAiSora(prompt, imageUrl);
  const { videoUrl, thumbnailUrl } = await pollForVideoResult(taskId);

  return {
    videoUrl,
    thumbnailUrl,
    prompt,
    taskId,
  };
}

export default {
  generateVideoTestimonial,
};
