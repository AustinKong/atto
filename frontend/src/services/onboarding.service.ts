import type { ModelProvider } from '@/types/onboarding.types';

const SETUP_GUIDE_URLS: Record<ModelProvider, string> = {
  openai: 'https://raw.githubusercontent.com/AustinKong/atto/main/docs/setup/openai.md',
  gemini: 'https://raw.githubusercontent.com/AustinKong/atto/main/docs/setup/gemini.md',
};

export async function getSetupGuide(provider: ModelProvider): Promise<string> {
  const response = await fetch(SETUP_GUIDE_URLS[provider]);

  if (!response.ok) {
    throw response;
  }

  return await response.text();
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
