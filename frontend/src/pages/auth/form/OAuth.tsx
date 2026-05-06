import { Button, Text, VStack } from '@chakra-ui/react';
import { useSignIn } from '@clerk/react/legacy';
import { useState } from 'react';

import { Loader } from '@/routes/base-route/Loader';
import { getErrorMessage } from '@/utils/clerk.utils';

import { AppleOAuthLogo, GoogleOAuthLogo } from './oauth-logos';

type OAuthStrategy = 'oauth_google' | 'oauth_apple';

export function OAuth() {
  const { isLoaded, signIn } = useSignIn();
  const [loadingStrategy, setLoadingStrategy] = useState<OAuthStrategy | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSocialSignIn(strategy: OAuthStrategy) {
    if (!isLoaded || !signIn) return;

    setLoadingStrategy(strategy);
    setErrorMessage(null);

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/auth',
        redirectUrlComplete: '/listings',
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setLoadingStrategy(null);
    }
  }

  const _isAnySubmitting = loadingStrategy !== null;

  if (!isLoaded) {
    return <Loader />;
  }

  return (
    <VStack gap="sm" align="stretch">
      <Button
        type="button"
        variant="outline"
        // disabled={!isLoaded || isAnySubmitting}
        disabled
        loading={loadingStrategy === 'oauth_google'}
        onClick={() => handleSocialSignIn('oauth_google')}
      >
        <GoogleOAuthLogo />
        Continue with Google
      </Button>

      <Button
        type="button"
        variant="outline"
        // disabled={!isLoaded || isAnySubmitting}
        disabled
        loading={loadingStrategy === 'oauth_apple'}
        onClick={() => handleSocialSignIn('oauth_apple')}
      >
        <AppleOAuthLogo />
        Continue with Apple
      </Button>

      {errorMessage ? (
        <Text color="fg.error" textStyle="sm">
          {errorMessage}
        </Text>
      ) : null}
      <Text color="fg.muted" textStyle="xs">
        Cloud sign-in is unavailable. Continue without signing in for local mode.
      </Text>
    </VStack>
  );
}
