import { useQueryClient } from '@tanstack/react-query';

import { useDebouncedMutation } from '@/hooks/useDebouncedMutation';
import { updateProfile } from '@/services/profile';
import type { Profile } from '@/types/profile';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useDebouncedMutation<Profile, Error, Profile>({
    delay: 750,
    mutationFn: (profile: Profile) => updateProfile(profile),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      queryClient.invalidateQueries({ queryKey: ['resume', 'preview', 'html'] });
    },
  });
}
