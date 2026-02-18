import type { Page } from '@/types/common';
import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';
import type { Template, TemplateSummary } from '@/types/template';

export async function getDefaultTemplate(): Promise<{ template_id: string }> {
  const response = await fetch(`/api/templates/default`);

  if (!response.ok) {
    throw new Error('Failed to fetch default template');
  }

  return response.json();
}

export async function setDefaultTemplate(templateId: string): Promise<{ template_id: string }> {
  const response = await fetch(`/api/templates/default`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ template_id: templateId }),
  });

  if (!response.ok) {
    throw new Error('Failed to set default template');
  }

  return response.json();
}

export async function getLocalTemplates(
  page: number = 1,
  size: number = 10
): Promise<Page<TemplateSummary>> {
  const response = await fetch(`/api/templates/local?page=${page}&size=${size}`);

  if (!response.ok) {
    throw new Error('Failed to fetch local templates');
  }

  return response.json();
}

export async function getRemoteTemplates(
  page: number = 1,
  size: number = 10
): Promise<Page<TemplateSummary>> {
  const response = await fetch(`/api/templates/remote?page=${page}&size=${size}`);

  if (!response.ok) {
    throw new Error('Failed to fetch remote templates');
  }

  return response.json();
}

export async function getLocalTemplate(templateId: string): Promise<Template> {
  const response = await fetch(`/api/templates/local/${templateId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch local template: ${templateId}`);
  }

  return response.json();
}

export async function getRemoteTemplate(templateId: string): Promise<Template> {
  const response = await fetch(`/api/templates/remote/${templateId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch remote template: ${templateId}`);
  }

  return response.json();
}

export async function renderTemplateHtml(
  template: Template,
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
  template: Template,
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

export async function downloadRemoteTemplate(templateId: string): Promise<void> {
  const response = await fetch(`/api/templates/remote/${templateId}/download`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to download template: ${templateId}`);
  }
}
