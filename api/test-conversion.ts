import { generateConversionPage } from './conversionEngine.js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get('prompt') || 'weight loss scam page';
  const niche = (searchParams.get('niche') as string | null) || 'weight-loss';

  try {
  const pageData = await generateConversionPage(prompt, { niche: niche as any, enhance: true });

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
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
