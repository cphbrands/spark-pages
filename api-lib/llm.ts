type LLMOptions = {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
};

// Minimal process.env declaration to avoid requiring Node types in the edge runtime
declare const process: { env: Record<string, string | undefined> };

// Defaults: newest OpenAI general models, env-overridable
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.2';
const OPENAI_FALLBACK_MODEL = process.env.OPENAI_FALLBACK_MODEL || 'gpt-5-mini';

async function callOpenAI(apiKey: string, options: LLMOptions): Promise<string | null> {
  const models = [OPENAI_MODEL, OPENAI_FALLBACK_MODEL].filter(Boolean) as string[];

  for (const model of models) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: options.systemPrompt },
            { role: 'user', content: options.userPrompt },
          ],
          response_format: { type: 'json_object' },
          max_completion_tokens: options.maxTokens,
        }),
      });

      const raw = await response.text();
      if (!response.ok) {
        console.error(`OpenAI (${model}) error (${response.status}):`, raw);
        continue;
      }

      const data = JSON.parse(raw);
      const content = data.choices?.[0]?.message?.content as string | undefined;
      if (content) return content;

      console.error(`OpenAI (${model}) returned empty content`);
    } catch (error) {
      console.error(`OpenAI (${model}) call failed:`, error);
    }
  }

  return null;
}

export async function runLLM(options: LLMOptions): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    throw new Error('No LLM provider configured. Set OPENAI_API_KEY.');
  }

  const openaiContent = await callOpenAI(openaiKey, options);
  if (!openaiContent) {
    throw new Error('OpenAI unavailable or returned empty content.');
  }
  return openaiContent;
}
