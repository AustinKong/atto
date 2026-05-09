import { useMutation, useQueryClient } from '@tanstack/react-query';

import { applicationQueries } from '@/queries/application.queries';
import {
  createApplication as createApplicationSvc,
  createStatusEvent as createStatusEventSvc,
  deleteStatusEvent as deleteStatusEventSvc,
  generateApplicationAnalysis as generateApplicationAnalysisSvc,
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
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.setQueryData(['application', data.id], data);
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
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
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
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
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
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useGenerateApplicationAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: string) => generateApplicationAnalysisSvc(applicationId),
    onSuccess: (data, applicationId) => {
      queryClient.setQueryData(applicationQueries.analysisStatus(applicationId).queryKey, data);
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
    },
  });
}
