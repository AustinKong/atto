import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateProfile } from '@/services/profile';
import type { Profile } from '@/types/profile';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedProfile: Profile) => updateProfile(updatedProfile),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
    },
  });
}
