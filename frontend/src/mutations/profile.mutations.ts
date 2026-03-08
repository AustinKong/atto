import { useQueryClient } from '@tanstack/react-query';

import { useDebouncedMutation } from '@/hooks/use-debounced-mutation.hooks';
import { updateProfile } from '@/services/profile.service';
import type { Profile } from '@/types/profile.types';

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
