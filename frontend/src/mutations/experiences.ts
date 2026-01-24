import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createExperience } from '@/services/experience';
import type { Experience } from '@/types/experience';

export function useCreateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (experience: Omit<Experience, 'id'>) => createExperience(experience),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useUpdateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (experience: Experience) => {
      if (!experience.id) {
        throw new Error('Experience must have an id to update');
      }
      return import('@/services/experience').then(({ updateExperience }) =>
        updateExperience(experience)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (experienceId: string) =>
      import('@/services/experience').then(({ deleteExperience }) =>
        deleteExperience(experienceId)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useUpdateExperiences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (experiences: Experience[]) => {
      // Get current experiences from cache to compare
      const currentExperiences = queryClient.getQueryData(['experiences']) as
        | Experience[]
        | undefined;

      const { createExperience, updateExperience, deleteExperience } = await import(
        '@/services/experience'
      );

      const createPromises = experiences.filter((e) => !e.id).map((e) => createExperience(e));

      // FIXME: This comparison is naive and will make unnecessary updates (consuming more embedding tokens)
      // Can consider using deterministic stringify or deep comparison
      const updatePromises = [];
      for (const exp of experiences) {
        if (!exp.id) continue;

        const currentExp = currentExperiences?.find((ce) => ce.id === exp.id);
        if (JSON.stringify(currentExp) !== JSON.stringify(exp)) {
          updatePromises.push(updateExperience(exp));
        }
      }

      const deletePromises =
        currentExperiences
          ?.filter((ce) => !experiences.find((e) => e.id === ce.id))
          .map((e) => deleteExperience(e.id!)) || [];

      await Promise.all([...createPromises, ...updatePromises, ...deletePromises]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}
