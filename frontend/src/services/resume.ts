import type { Resume } from '@/types/resume';

export type ResumeCreationMode = 'default' | 'blank' | 'optimized';

export async function createResume(
  mode: ResumeCreationMode = 'blank',
  listingId?: string
): Promise<Resume> {
  const params = new URLSearchParams({ mode });
  if (mode === 'optimized' && listingId) {
    params.append('listing-id', listingId);
  }

  const response = await fetch(`/api/resumes/?${params.toString()}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw response;
  }

  return response.json();
}

export async function getResume(resumeId: string): Promise<Resume> {
  const response = await fetch(`/api/resumes/${resumeId}`);

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Resume;
}

export async function updateResume(resume: Resume): Promise<Resume> {
  const response = await fetch(`/api/resumes/${resume.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resume),
  });

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Resume;
}

export async function deleteResume(resumeId: string): Promise<void> {
  const response = await fetch(`/api/resumes/${resumeId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw response;
  }
}
