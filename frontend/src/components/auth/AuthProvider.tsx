import { ClerkProvider } from '@clerk/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type ReactNode } from 'react';

import { settingsQueries } from '@/queries/setting.queries';
import { type SettingsSection } from '@/types/setting.types';

function getClerkPublishableKey(settings: Record<string, SettingsSection>): string {
  const value = settings.auth?.fields?.clerk_publishable_key?.value;

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('Missing auth.fields.clerk_publishable_key.value in /api/config response');
  }

  return value;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // TODO: I wonder wthelly will happen to usesuspenQuery outside of the router
  const { data: settings } = useSuspenseQuery({
    ...settingsQueries.list(),
    retry: 1,
    refetchOnWindowFocus: true,
  });

  const publishableKey = getClerkPublishableKey(settings);

  return (
    <ClerkProvider
      key={publishableKey}
      publishableKey={publishableKey}
      afterSignOutUrl="/sign-in"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      {children}
    </ClerkProvider>
  );
}
