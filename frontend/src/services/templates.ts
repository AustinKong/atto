import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';

export async function getLocalTemplateNames(): Promise<string[]> {
  const response = await fetch('/api/templates/local');

  if (!response.ok) {
    throw new Error('Failed to fetch template names');
  }

  return response.json();
}

export async function getTemplate(
  templateName: string,
  source: 'local' | 'remote' = 'local'
): Promise<string> {
  const response = await fetch(`/api/templates/${source}/${templateName}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source} template: ${templateName}`);
  }

  const json = await response.json();
  return json.content as string;
}

export async function renderTemplateHtml(
  template: string,
  sections: Section[],
  profile: Profile
): Promise<string> {
  const response = await fetch(`/api/templates/render?format=html`, {
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

export async function renderTemplatePdf(
  template: string,
  sections: Section[],
  profile: Profile
): Promise<Blob> {
  const response = await fetch(`/api/templates/render?format=pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ template, sections, profile }),
  });

  if (!response.ok) {
    throw response;
  }

  return response.blob();
}
