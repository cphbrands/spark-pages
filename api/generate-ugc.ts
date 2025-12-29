import { runLLM } from './llm';

// Specialized system prompt for generating testimonials
const UGC_SYSTEM_PROMPT = `You are an expert at generating diverse and persuasive customer testimonials.
Generate a list of testimonials based on the user's request.
Each testimonial MUST include:
- A believable first name and last initial (e.g., "Sarah M.", "David L.").
- A specific, measurable result with a number and timeframe (e.g., "lost 12lbs in 4 weeks", "saved 3 hours per week").
- A relatable pain point or situation they had before.
- A maximum of two sentences. Keep it concise.
- Vary the tone, length, and specifics between testimonials.

Return ONLY a valid JSON array: [{"name": "...", "text": "..."}, ...]
Do not include any other text, markdown, or explanations.`;

export async function POST(req: Request) {
  try {
    const { prompt, count = 3 } = await req.json();
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build the user prompt for the LLM
    const userPrompt = `Generate ${count} testimonials for: ${prompt}`;
    
    // Call your existing LLM infrastructure
    const llmContent = await runLLM({
      systemPrompt: UGC_SYSTEM_PROMPT,
      userPrompt: userPrompt,
      maxTokens: 1500 // Adjust as needed
    });

    // Parse and return the testimonials
    let testimonials;
    try {
      testimonials = JSON.parse(llmContent);
    } catch (error) {
      throw new Error('LLM returned invalid JSON');
    }

    // Add metadata to identify as AI-generated
    const responseData = {
      testimonials,
      metadata: {
        generatedAt: new Date().toISOString(),
        aiGenerated: true,
        disclosureRequired: true,
        count: testimonials.length
      }
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('UGC Generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
