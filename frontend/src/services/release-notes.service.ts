import { normalizeSemVer } from '@/utils/text.utils';

import rootPackage from '../../../package.json';

const RELEASE_NOTES_URL = 'https://api.github.com/repos/austinkong/atto/releases';

type ReleaseNotes = {
  notes: string;
  version: string;
};

type GitHubReleasePayload = {
  body: string;
  tag_name: string;
};

export function getCurrentVersion(): string {
  const raw = String(rootPackage.version);
  const numeric = normalizeSemVer(raw);
  return `v${numeric}`;
}

export async function getLatestVersion(): Promise<string> {
  const response = await fetch(`${RELEASE_NOTES_URL}/latest`);

  if (!response.ok) {
    // Fallback for now
    return getCurrentVersion();
    // throw new Error('Failed to fetch latest version');
  }

  const payload = (await response.json()) as GitHubReleasePayload;
  return payload.tag_name;
}

export async function getReleaseNotes(version: string): Promise<ReleaseNotes> {
  const response = await fetch(`${RELEASE_NOTES_URL}/tags/${version}`);

  if (!response.ok) {
    throw response;
  }

  const payload = (await response.json()) as GitHubReleasePayload;

  return {
    notes: payload.body,
    version: payload.tag_name,
  };
}
