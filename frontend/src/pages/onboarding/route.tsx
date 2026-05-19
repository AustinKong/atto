import { baseRoute } from '@/routes';

import { OnboardingPage } from './index';

export function onboardingRoute() {
  return baseRoute({
    path: 'onboarding',
    element: <OnboardingPage />,
  });
}
