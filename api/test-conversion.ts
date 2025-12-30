import { generateConversionPage } from './conversionEngine.js';

type GenerateOptions = NonNullable<Parameters<typeof generateConversionPage>[1]>;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get('prompt') || 'weight loss scam page';
  const nicheParam = searchParams.get('niche');
  const niche = (nicheParam ?? 'weight-loss') as GenerateOptions['niche'];

  try {
  const pageData = await generateConversionPage(prompt, { niche, enhance: true });

    return new Response(
      JSON.stringify(
        {
          success: true,
          niche,
          prompt,
          pageData,
        },
        null,
        2
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
