import type { Resume } from '@/types/resume';

export async function getResume(resumeId: string): Promise<Resume> {
  const response = await fetch(`/api/resumes/${resumeId}`);

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Resume;
}

export async function generateResumeContent(resumeId: string): Promise<Resume> {
  const response = await fetch(`/api/resumes/${resumeId}/generate`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Resume;
}

export async function populateResumeBaseSections(resumeId: string): Promise<Resume> {
  const response = await fetch(`/api/resumes/${resumeId}/populate`, {
    method: 'POST',
  });

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
