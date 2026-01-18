import type { Resume, ResumeData } from '@/types/resume';

export async function getResume(resumeId: string): Promise<Resume> {
  const response = await fetch(`/api/resumes/${resumeId}`);

  if (!response.ok) {
    throw new Error('Failed to get resume');
  }

  const json = await response.json();
  return json as Resume;
}

// TODO: Rename to render html
export async function getResumeHtml(template: string, data: ResumeData): Promise<string> {
  const response = await fetch(`/api/resumes/html`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ template, data }),
  });

  if (!response.ok) {
    throw new Error('Failed to get resume HTML');
  }

  const json = await response.json();
  return json.html;
}

export async function generateResumeContent(resumeId: string): Promise<Resume> {
  const response = await fetch(`/api/resumes/${resumeId}/generate`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to generate resume content');
  }

  const json = await response.json();
  return json as Resume;
}

export async function updateResume(resumeId: string, data: ResumeData): Promise<Resume> {
  const response = await fetch(`/api/resumes/${resumeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update resume');
  }

  const json = await response.json();
  return json as Resume;
}

export async function deleteResume(resumeId: string): Promise<void> {
  const response = await fetch(`/api/resumes/${resumeId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete resume');
  }
}

export async function exportResumePdf(resumeId: string, latestData: ResumeData): Promise<Blob> {
  await updateResume(resumeId, latestData);

  const response = await fetch(`/api/resumes/${resumeId}/export`);

  if (!response.ok) {
    throw new Error('Failed to export resume as PDF');
  }

  const blob = await response.blob();
  return blob;
}
