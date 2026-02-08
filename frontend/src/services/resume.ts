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

// TODO: Rename to render html
export async function getResumeHtml(
  template: string,
  sections: Section[],
  profile: Profile
): Promise<string> {
  const response = await fetch(`/api/resumes/html`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ template, sections, profile }),
  });

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json.html;
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

// export async function exportResumePdf(resumeId: string, sections: Section[]): Promise<Blob> {
//   const response = await fetch(`/api/resumes/${resumeId}/export`);

//   if (!response.ok) {
//     throw response;
//   }

//   const blob = await response.blob();
//   return blob;
// }
