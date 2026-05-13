import type { Resume } from '@/types/resume.types';

function normalizeJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeJsonValue);
  }

  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    const sortedEntries = Object.keys(objectValue)
      .sort()
      .map((key) => [key, normalizeJsonValue(objectValue[key])] as const);
    return Object.fromEntries(sortedEntries);
  }

  return value;
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashResume(resume: Resume): Promise<string> {
  return sha256Hex(JSON.stringify(normalizeJsonValue(resume)));
}

export async function hashUnitContent(content: string): Promise<string> {
  return sha256Hex(content.trim());
}
