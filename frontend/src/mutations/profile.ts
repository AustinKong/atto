import { useQueryClient } from '@tanstack/react-query';

import { useDebouncedMutation } from '@/hooks/useDebouncedMutation';
import { updateProfile } from '@/services/profile';
import type { Profile } from '@/types/profile';

export function useSaveProfile() {
  const queryClient = useQueryClient();

  return useDebouncedMutation<Profile, Error, Profile>({
    delay: 500,
    mutationFn: (profile) => updateProfile(profile),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
    },
    onError: (error) => {
      console.error('Failed to save profile:', error);
    },
  });
}
