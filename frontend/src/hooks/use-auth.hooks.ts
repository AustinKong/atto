import { useAuth as useClerkAuth, useUser } from '@clerk/react';
import { useEffect } from 'react';

import { type AccessMode } from '@/types/auth.types';

import { useLocalStorage } from './use-local-storage.hooks';

const GUEST_MODE_STORAGE_KEY = 'atto-guest-mode';

export function useAuth() {
  const clerkAuth = useClerkAuth();
  const { user } = useUser();
  const [isGuestMode, setIsGuestMode] = useLocalStorage<boolean>(GUEST_MODE_STORAGE_KEY, false);

  useEffect(() => {
    if (clerkAuth.isSignedIn && isGuestMode) {
      setIsGuestMode(false);
    }
  }, [clerkAuth.isSignedIn, isGuestMode, setIsGuestMode]);

  async function enterGuestMode() {
    try {
      await clerkAuth.signOut();
    } catch {
      // Enter guest mode even if Clerk sign-out fails.
    }
    setIsGuestMode(true);
  }

  function exitGuestMode() {
    setIsGuestMode(false);
  }

  const accessMode: AccessMode = clerkAuth.isSignedIn
    ? 'signed_in'
    : isGuestMode
      ? 'guest'
      : 'signed_out';

  return {
    ...clerkAuth,
    user,
    accessMode,
    enterGuestMode,
    exitGuestMode,
  };
}
