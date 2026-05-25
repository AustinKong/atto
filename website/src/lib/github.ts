const CACHE_DURATION_MS = 10 * 60 * 1000;
const GITHUB_RELEASES_URL =
  'https://api.github.com/repos/AustinKong/atto/releases?per_page=100';

const downloadCountCache: { value: number | null; timestamp: number | null } = {
  value: null,
  timestamp: null,
};
type GitHubRelease = {
  assets?: Array<{
    download_count?: number;
  }>;
};

async function getAllReleases(): Promise<GitHubRelease[]> {
  const releases: GitHubRelease[] = [];
  let nextPageUrl: string | null = GITHUB_RELEASES_URL;

  while (nextPageUrl) {
    const response = await fetch(nextPageUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub releases request failed with status ${response.status}`);
    }

    const pageReleases = (await response.json()) as GitHubRelease[];
    releases.push(...pageReleases);

    const linkHeader = response.headers.get('link') ?? '';
    const nextLink = linkHeader
      .split(',')
      .map((entry) => entry.trim())
      .find((entry) => entry.includes('rel="next"'));
    nextPageUrl = nextLink?.match(/<([^>]+)>/)?.[1] ?? null;
  }

  return releases;
}

export async function getDownloadCount(): Promise<number> {
  if (
    downloadCountCache.value !== null &&
    downloadCountCache.timestamp !== null &&
    Date.now() - downloadCountCache.timestamp < CACHE_DURATION_MS
  ) {
    return downloadCountCache.value;
  }

  try {
    const releases = await getAllReleases();
    const totalDownloads = releases
      .flatMap((release) => release.assets ?? [])
      .reduce((sum, asset) => sum + (asset.download_count ?? 0), 0);

    downloadCountCache.value = totalDownloads;
    downloadCountCache.timestamp = Date.now();
    return totalDownloads;
  } catch (error) {
    console.error('Failed to fetch GitHub download count', error);

    if (downloadCountCache.value !== null) {
      return downloadCountCache.value;
    }

    return 0;
  }
}
