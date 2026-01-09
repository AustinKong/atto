import type { Application, StatusEvent } from '@/types/application';

export async function getApplication(applicationId: string): Promise<Application> {
  const response = await fetch(`/api/applications/${applicationId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch application');
  }

  const json = await response.json();
  return json as Application;
}

export async function createApplication(
  listingId: string,
  resumeId?: string
): Promise<Application> {
  const response = await fetch('/api/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      listingId,
      resumeId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create application');
  }

  const json = await response.json();
  return json as Application;
}

export async function createStatusEvent(
  applicationId: string,
  statusEvent: Omit<StatusEvent, 'id' | 'createdAt'>
): Promise<Application> {
  const response = await fetch(`/api/applications/${applicationId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statusEvent),
  });

  if (!response.ok) {
    throw new Error('Failed to create status event');
  }

  const json = await response.json();
  return json as Application;
}

export async function updateStatusEvent(
  applicationId: string,
  eventId: string,
  statusEvent: Omit<StatusEvent, 'id' | 'createdAt'>
): Promise<Application> {
  const response = await fetch(`/api/applications/${applicationId}/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statusEvent),
  });

  if (!response.ok) {
    throw new Error('Failed to update status event');
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
    throw new Error('Failed to delete status event');
  }

  const json = await response.json();
  return json as Application;
}

// Legacy function name - keeping for backward compatibility
export async function addStatusEvent(
  applicationId: string,
  statusEvent: Omit<StatusEvent, 'id' | 'createdAt'>
): Promise<Application> {
  return createStatusEvent(applicationId, statusEvent);
}
