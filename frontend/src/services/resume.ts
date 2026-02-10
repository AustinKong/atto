import type { Profile } from '@/types/profile';
import type { Resume, Section } from '@/types/resume';

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

export async function updateResume(resumeId: string, sections: Section[]): Promise<Resume> {
  const response = await fetch(`/api/resumes/${resumeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sections),
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

export async function renderResume(
  template: string,
  sections: Section[],
  profile: Profile,
  format: 'pdf' | 'html'
): Promise<Blob | string> {
  const response = await fetch(`/api/resumes/render?format=${format}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ template, sections, profile }),
  });

  if (!response.ok) {
    throw response;
  }

  if (format === 'html') {
    const json = await response.json();
    return json.html;
  }

  if (format === 'pdf') {
    return response.blob();
  }

  throw new Error(`Unsupported format: ${format}`);
}
