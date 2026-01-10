import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createApplication as createApplicationSvc,
  createStatusEvent as createStatusEventSvc,
  deleteStatusEvent as deleteStatusEventSvc,
  updateStatusEvent as updateStatusEventSvc,
} from '@/services/applications';
import type { StatusEvent } from '@/types/application';

export function useApplicationMutations() {
  const queryClient = useQueryClient();

  const { mutateAsync: createApplication, isPending: isCreateApplicationLoading } = useMutation({
    mutationFn: async (listingId: string) => {
      return await createApplicationSvc(listingId);
    },
    onSuccess: (data, listingId) => {
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.setQueryData(['application', data.id], data);
    },
  });

  const { mutateAsync: createStatusEvent, isPending: isCreateStatusEventLoading } = useMutation({
    mutationFn: async ({
      applicationId,
      statusEvent,
    }: {
      applicationId: string;
      statusEvent: Omit<StatusEvent, 'id'>;
    }) => {
      return await createStatusEventSvc(applicationId, statusEvent);
    },
    onSuccess: (_data, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
    },
  });

  const { mutateAsync: updateStatusEvent, isPending: isUpdateStatusEventLoading } = useMutation({
    mutationFn: async ({
      applicationId,
      eventId,
      statusEvent,
    }: {
      applicationId: string;
      eventId: string;
      statusEvent: Omit<StatusEvent, 'id'>;
    }) => {
      return await updateStatusEventSvc(applicationId, eventId, statusEvent);
    },
    onSuccess: (_data, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
    },
  });

  const { mutateAsync: deleteStatusEvent, isPending: isDeleteStatusEventLoading } = useMutation({
    mutationFn: async ({ applicationId, eventId }: { applicationId: string; eventId: string }) => {
      return await deleteStatusEventSvc(applicationId, eventId);
    },
    onSuccess: (_data, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
    },
  });

  return {
    createApplication,
    isCreateApplicationLoading,
    createStatusEvent,
    isCreateStatusEventLoading,
    updateStatusEvent,
    isUpdateStatusEventLoading,
    deleteStatusEvent,
    isDeleteStatusEventLoading,
  };
}
