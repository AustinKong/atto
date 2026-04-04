import type { SignInResource } from '@clerk/react/types';

type ClerkErrorEntry = {
  longMessage?: string;
  message?: string;
};

type ClerkErrorShape = {
  errors?: ClerkErrorEntry[];
};

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'errors' in error) {
    const errors = (error as ClerkErrorShape).errors;
    const [firstError] = errors ?? [];

    if (firstError?.longMessage) {
      return firstError.longMessage;
    }

    if (firstError?.message) {
      return firstError.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to sign in right now. Please try again.';
}

export async function requestVerificationCode({
  signIn,
  identifier,
}: {
  signIn: SignInResource;
  identifier: string;
}) {
  const createdSignIn = await signIn.create({
    identifier,
    signUpIfMissing: true,
  });

  const emailCodeFactor =
    createdSignIn.supportedFirstFactors?.find((factor) => factor.strategy === 'email_code') ?? null;
  const emailAddressId = emailCodeFactor?.emailAddressId;

  if (!emailAddressId) {
    throw new Error('Email verification is not available for this account.');
  }

  await createdSignIn.prepareFirstFactor({
    strategy: 'email_code',
    emailAddressId,
  });
}

export async function verifyEmailCodeSignIn({
  signIn,
  code,
}: {
  signIn: SignInResource;
  code: string;
}) {
  const result = await signIn.attemptFirstFactor({
    strategy: 'email_code',
    code,
  });

  if (result.status !== 'complete' || !result.createdSessionId) {
    throw new Error(
      'This account requires an additional verification step that is not implemented on this page yet.'
    );
  }

  return result.createdSessionId;
}
