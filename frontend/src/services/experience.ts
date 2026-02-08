import { type Experience } from '@/types/experience';

export async function getExperiences(): Promise<Experience[]> {
  const response = await fetch('/api/experience');

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Experience[];
}

export async function getExperience(id: string): Promise<Experience> {
  const response = await fetch(`/api/experience/${id}`);

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Experience;
}

export async function createExperience(experience: Omit<Experience, 'id'>): Promise<Experience> {
  const response = await fetch('/api/experience', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(experience),
  });

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Experience;
}

export async function updateExperience(experience: Experience): Promise<Experience> {
  const response = await fetch('/api/experience', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(experience),
  });

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Experience;
}

export async function deleteExperience(id: string): Promise<void> {
  const response = await fetch(`/api/experience/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw response;
  }
}
