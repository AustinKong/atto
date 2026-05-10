import type { Page } from '@/types/common.types';
import type { Profile, Section } from '@/types/resume.types';
import type {
  RenderedTemplate,
  Template,
  TemplateRenderGeometry,
  TemplateSummary,
} from '@/types/template.types';
import { base64ToBlob } from '@/utils/bytes.utils';

export async function getTemplates(
  page: number = 1,
  size: number = 10
): Promise<Page<TemplateSummary>> {
  const response = await fetch(`/api/templates?page=${page}&size=${size}`);

  if (!response.ok) {
    throw new Error('Failed to fetch templates');
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

export async function getTemplate(templateId: string): Promise<Template> {
  const response = await fetch(`/api/templates/${templateId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch template: ${templateId}`);
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

export async function renderTemplate(
  template: Template,
  sections: Section[],
  profile: Profile
): Promise<RenderedTemplate> {
  const response = await fetch(`/api/templates/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ template, sections, profile }),
  });

  if (!response.ok) {
    throw response;
  }

  const payload = (await response.json()) as {
    pdfBase64: string;
    geometry: TemplateRenderGeometry;
  };

  return {
    pdfBlob: base64ToBlob(payload.pdfBase64, 'application/pdf'),
    geometry: payload.geometry,
  };
}

export async function downloadRemoteTemplate(templateId: string): Promise<void> {
  const response = await fetch(`/api/templates/remote/${templateId}/download`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to download template: ${templateId}`);
  }
}
