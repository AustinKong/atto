import { HStack } from '@chakra-ui/react';
import { SignIn } from '@clerk/react';

import { useAuthPageStyles } from '@/components/layouts/auth/use-auth-page-styles';

export function SignInPage() {
  const { clerkAppearance } = useAuthPageStyles();

  return (
    <HStack justify="center" pt="md">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" appearance={clerkAppearance} />
    </HStack>
  );
}
