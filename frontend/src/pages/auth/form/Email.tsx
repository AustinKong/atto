import { Button, Field, HStack, Input, PinInput, Spacer, Text, VStack } from '@chakra-ui/react';
import { useSignIn } from '@clerk/react/legacy';
import { type FormEvent, useState } from 'react';

import { useCountdown } from '@/hooks/use-countdown.hooks';
import { Loader } from '@/routes/base-route/Loader';
import {
  getErrorMessage,
  requestVerificationCode,
  verifyEmailCodeSignIn,
} from '@/utils/clerk.utils';

const VERIFICATION_CODE_LENGTH = 6;
const RESEND_INTERVAL_SECONDS = 30;

export function Email() {
  const { isLoaded, setActive, signIn } = useSignIn();

  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState<string[]>(Array(VERIFICATION_CODE_LENGTH).fill(''));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { seconds: resendSeconds, start: startResendCountdown } = useCountdown();
  const isIdentifierFilled = identifier.trim().length > 0;
  const isCodeComplete =
    code.length === VERIFICATION_CODE_LENGTH && code.every((digit) => digit.trim() !== '');

  async function handleRequestVerificationCode() {
    if (isSubmitting || !signIn || resendSeconds > 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await requestVerificationCode({ signIn, identifier });

      setIsCodeSent(true);
      setCode(Array(VERIFICATION_CODE_LENGTH).fill(''));
      startResendCountdown(RESEND_INTERVAL_SECONDS);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyCode() {
    if (!isLoaded || !signIn || !isCodeSent || !isCodeComplete) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const verifiedSessionId = await verifyEmailCodeSignIn({
        signIn,
        code: code.join(''),
      });
      await setActive({ session: verifiedSessionId });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCodeSent) {
      await handleVerifyCode();
    } else {
      await handleRequestVerificationCode();
    }
  }

  if (!isLoaded) {
    return <Loader />;
  }

  return (
    <VStack gap="sm" align="stretch" asChild>
      <form onSubmit={handleSubmit}>
        <Field.Root required>
          <Field.Label>Email address</Field.Label>
          <Input
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={identifier}
            disabled={isCodeSent || isSubmitting}
            onChange={(event) => setIdentifier(event.target.value)}
          />
        </Field.Root>

        <Field.Root required invalid={Boolean(errorMessage)}>
          <Field.Label>Verification code</Field.Label>
          <HStack w="full">
            <PinInput.Root
              otp
              value={code}
              onValueChange={(event) => setCode(event.value)}
              disabled={!isCodeSent || isSubmitting}
            >
              <PinInput.HiddenInput />
              <PinInput.Control w="full" alignItems="center" gap="sm">
                <PinInput.Input index={0} />
                <PinInput.Input index={1} />
                <PinInput.Input index={2} />
                <Text color="border " textStyle="xl">
                  -
                </Text>
                <PinInput.Input index={3} />
                <PinInput.Input index={4} />
                <PinInput.Input index={5} />
              </PinInput.Control>
            </PinInput.Root>
            <Spacer />
            <Button
              type="button"
              variant="subtle"
              onClick={handleRequestVerificationCode}
              disabled={!isCodeSent || isSubmitting || resendSeconds > 0}
            >
              {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend verification code'}
            </Button>
          </HStack>
          {errorMessage ? <Field.ErrorText>{errorMessage}</Field.ErrorText> : null}
        </Field.Root>

        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isCodeSent ? !isCodeComplete : !isIdentifierFilled}
        >
          {isCodeSent ? 'Verify' : 'Send verification code'}
        </Button>
      </form>
    </VStack>
  );
}
