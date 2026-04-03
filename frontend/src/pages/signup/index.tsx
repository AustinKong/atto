import { HStack } from '@chakra-ui/react';
import { SignUp } from '@clerk/react';

import { useAuthPageStyles } from '@/components/layouts/auth/use-auth-page-styles';

export function SignUpPage() {
  const { clerkAppearance } = useAuthPageStyles();

  return (
    <HStack justify="center" pt="md">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" appearance={clerkAppearance} />
    </HStack>
  );
}
