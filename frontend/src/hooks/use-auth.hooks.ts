import { useAuth as useClerkAuth, useUser } from '@clerk/react';
import { useEffect } from 'react';

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

  function enterGuestMode() {
    setIsGuestMode(true);
  }

  function exitGuestMode() {
    setIsGuestMode(false);
  }

  return {
    ...clerkAuth,
    user,
    isGuestMode,
    setIsGuestMode,
    enterGuestMode,
    exitGuestMode,
  };
}
