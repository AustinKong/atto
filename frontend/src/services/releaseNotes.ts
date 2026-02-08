import { normalizeSemVer } from '@/utils/text';

import rootPackage from '../../../package.json';

const RELEASE_NOTES_URL = 'https://api.github.com/repos/austinkong/atto/releases';

export function getCurrentVersion() {
  const raw = String(rootPackage.version);
  const numeric = normalizeSemVer(raw);
  return `v${numeric}`;
}

export async function getLatestVersion() {
  const response = await fetch(`${RELEASE_NOTES_URL}/latest`);

  if (!response.ok) {
    // Fallback for now
    return getCurrentVersion();
    // throw new Error('Failed to fetch latest version');
  }

  const json = await response.json();
  return json.tag_name;
}

export async function getReleaseNotes(version: string) {
  const response = await fetch(`${RELEASE_NOTES_URL}/tags/${version}`);

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return { notes: json.body, version: json.tag_name };
}
