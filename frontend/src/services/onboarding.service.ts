import type { ModelProvider } from '@/types/onboarding.types';

const SETUP_GUIDE_URLS: Record<ModelProvider, string> = {
  openai: 'https://raw.githubusercontent.com/AustinKong/atto/main/docs/setup/openai.md',
  gemini: 'https://raw.githubusercontent.com/AustinKong/atto/main/docs/setup/gemini.md',
};

const GITHUB_ASSET_URL =
  'https://raw.githubusercontent.com/AustinKong/atto/main/.github/assets/';

export async function getSetupGuide(provider: ModelProvider): Promise<string> {
  const response = await fetch(SETUP_GUIDE_URLS[provider]);

  if (!response.ok) {
    throw response;
  }

  return rewriteSetupGuideAssetUrls(await response.text());
}

export async function testModelProvider(
  provider: ModelProvider,
  apiKey: string,
  model: string
): Promise<string> {
  const response = await fetch('/api/config/model/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ provider, apiKey, model }),
  });

  if (!response.ok) {
    throw new Error(await getResponseMessage(response));
  }

  return await getResponseMessage(response);
}

async function getResponseMessage(response: Response): Promise<string> {
  return (await response.text()) || 'Atto could not run the provider test.';
}

function rewriteSetupGuideAssetUrls(markdown: string): string {
  return markdown.replaceAll('../../.github/assets/', GITHUB_ASSET_URL);
}
