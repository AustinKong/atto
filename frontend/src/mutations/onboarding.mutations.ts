import { useMutation } from '@tanstack/react-query';

import { testModelProvider } from '@/services/onboarding.service';
import type { ModelProvider } from '@/types/onboarding.types';

export function useTestModelProvider() {
  return useMutation({
    mutationFn: ({
      provider,
      apiKey,
      model,
    }: {
      provider: ModelProvider;
      apiKey: string;
      model: string;
    }) => testModelProvider(provider, apiKey, model),
    meta: { suppressErrorToast: true },
  });
}
