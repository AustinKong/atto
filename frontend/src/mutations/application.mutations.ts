import { useMutation, useQueryClient } from '@tanstack/react-query';

import { applicationQueries } from '@/queries/application.queries';
import { listingsQueries } from '@/queries/listing.queries';
import {
  createApplication as createApplicationSvc,
  createStatusEvent as createStatusEventSvc,
  deleteStatusEvent as deleteStatusEventSvc,
  generateApplicationAnalysis as generateApplicationAnalysisSvc,
  removeApplicationAnalysisSuggestion as removeApplicationAnalysisSuggestionSvc,
  updateStatusEvent as updateStatusEventSvc,
} from '@/services/application.service';
import { createResume, type ResumeCreationMode } from '@/services/resume.service';
import type { Application, StatusEvent } from '@/types/application.types';

export function useCreateApplication(onSuccess?: (application: Application) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      name,
      resumeMode,
    }: {
      listingId: string;
      name: string;
      resumeMode: ResumeCreationMode;
    }) => {
      const resume = await createResume(
        resumeMode,
        resumeMode === 'optimized' ? listingId : undefined
      );
      return await createApplicationSvc(listingId, resume.id, name);
    },
    onSuccess: (data, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: listingsQueries.keys.item(listingId) });
      queryClient.invalidateQueries({ queryKey: listingsQueries.keys.listRoot() });
      queryClient.setQueryData(applicationQueries.keys.item(data.id), data);
      onSuccess?.(data);
    },
  });
}

export function useCreateStatusEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      statusEvent,
    }: {
      applicationId: string;
      listingId: string;
      statusEvent: Omit<StatusEvent, 'id'>;
    }) => {
      return await createStatusEventSvc(applicationId, statusEvent);
    },
    onSuccess: (_data, { applicationId, listingId }) => {
      queryClient.invalidateQueries({ queryKey: applicationQueries.keys.item(applicationId) });
      queryClient.invalidateQueries({ queryKey: listingsQueries.keys.item(listingId) });
      queryClient.invalidateQueries({ queryKey: listingsQueries.keys.listRoot() });
    },
  });
}

export function useUpdateStatusEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      eventId,
      statusEvent,
    }: {
      applicationId: string;
      listingId: string;
      eventId: string;
      statusEvent: Omit<StatusEvent, 'id'>;
    }) => {
      return await updateStatusEventSvc(applicationId, eventId, statusEvent);
    },
    onSuccess: (_data, { applicationId, listingId }) => {
      queryClient.invalidateQueries({ queryKey: applicationQueries.keys.item(applicationId) });
      queryClient.invalidateQueries({ queryKey: listingsQueries.keys.item(listingId) });
      queryClient.invalidateQueries({ queryKey: listingsQueries.keys.listRoot() });
    },
  });
}

export function useDeleteStatusEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      eventId,
    }: {
      applicationId: string;
      listingId: string;
      eventId: string;
    }) => {
      return await deleteStatusEventSvc(applicationId, eventId);
    },
    onSuccess: (_data, { applicationId, listingId }) => {
      queryClient.invalidateQueries({ queryKey: applicationQueries.keys.item(applicationId) });
      queryClient.invalidateQueries({ queryKey: listingsQueries.keys.item(listingId) });
      queryClient.invalidateQueries({ queryKey: listingsQueries.keys.listRoot() });
    },
  });
}

export function useGenerateApplicationAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: string) => generateApplicationAnalysisSvc(applicationId),
    onSuccess: (data, applicationId) => {
      queryClient.setQueryData(applicationQueries.keys.analysisStatus(applicationId), data);
      queryClient.invalidateQueries({ queryKey: applicationQueries.keys.item(applicationId) });
    },
  });
}

export function useRemoveApplicationAnalysisSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      suggestionId,
    }: {
      applicationId: string;
      suggestionId: string;
    }) => removeApplicationAnalysisSuggestionSvc(applicationId, suggestionId),
    onSuccess: (data, { applicationId }) => {
      queryClient.setQueryData(applicationQueries.keys.item(applicationId), data);
    },
  });
}
