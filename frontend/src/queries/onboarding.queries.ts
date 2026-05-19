import { queryOptions } from '@tanstack/react-query';

import { getSetupGuide } from '@/services/onboarding.service';
import type { ModelProvider } from '@/types/onboarding.types';

const onboardingQueryKeys = {
  setupGuide: (provider: ModelProvider) => ['onboarding', 'setup-guide', provider] as const,
};

export const onboardingQueries = {
  keys: onboardingQueryKeys,
  setupGuide: (provider: ModelProvider) =>
    queryOptions({
      queryKey: onboardingQueryKeys.setupGuide(provider),
      queryFn: () => getSetupGuide(provider),
      staleTime: Infinity,
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }),
};
