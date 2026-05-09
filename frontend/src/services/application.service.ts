import type { Application, StatusEvent } from '@/types/application.types';
import type { TaskStatusEntry } from '@/types/task-status.types';

export async function getApplication(applicationId: string): Promise<Application> {
  const response = await fetch(`/api/applications/${applicationId}`);

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Application;
}

export async function createApplication(
  listingId: string,
  resumeId: string,
  name: string
): Promise<Application> {
  const response = await fetch('/api/applications/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      listingId,
      name,
      resumeId,
      statusEvents: [],
    }),
  });

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Application;
}

export async function createStatusEvent(
  applicationId: string,
  statusEvent: Omit<StatusEvent, 'id'>
): Promise<Application> {
  const response = await fetch(`/api/applications/${applicationId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statusEvent),
  });

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Application;
}

export async function updateStatusEvent(
  applicationId: string,
  eventId: string,
  statusEvent: Omit<StatusEvent, 'id'>
): Promise<Application> {
  const response = await fetch(`/api/applications/${applicationId}/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statusEvent),
  });

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Application;
}

export async function deleteStatusEvent(
  applicationId: string,
  eventId: string
): Promise<Application> {
  const response = await fetch(`/api/applications/${applicationId}/events/${eventId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Application;
}

export async function generateApplicationAnalysis(
  applicationId: string
): Promise<TaskStatusEntry> {
  const response = await fetch(`/api/applications/${applicationId}/analysis`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw response;
  }

  return await response.json();
}

export async function getApplicationAnalysisStatus(
  applicationId: string
): Promise<TaskStatusEntry | null> {
  const response = await fetch(`/api/applications/${applicationId}/analysis/status`);

  if (!response.ok) {
    throw response;
  }

  if (!response.body) return null;
  return response.json();
}
