const CACHE_DURATION_MS = 10 * 60 * 1000;
const RELEASES_PER_PAGE = 100;
const GITHUB_OWNER = 'AustinKong';
const GITHUB_REPO = 'atto';

const downloadCountCache: { value: number | null; timestamp: number | null } = {
  value: null,
  timestamp: null,
};

let pendingDownloadCountRequest: Promise<number> | null = null;

function getCachedValue(): number | null {
  if (downloadCountCache.value === null || downloadCountCache.timestamp === null) {
    return null;
  }

  if (Date.now() - downloadCountCache.timestamp < CACHE_DURATION_MS) {
    return downloadCountCache.value;
  }

  return null;
}

function updateCache(value: number): number {
  downloadCountCache.value = value;
  downloadCountCache.timestamp = Date.now();
  return value;
}

function getNextPageUrl(response: Response): string | null {
  const linkHeader = response.headers.get('link');

  if (!linkHeader) {
    return null;
  }

  const nextLink = linkHeader
    .split(',')
    .map((entry) => entry.trim())
    .find((entry) => entry.includes('rel="next"'));

  if (!nextLink) {
    return null;
  }

  const match = nextLink.match(/<([^>]+)>/);
  return match?.[1] ?? null;
}

function sumReleaseDownloads(releases: unknown): number {
  if (!Array.isArray(releases)) {
    return 0;
  }

  return releases.reduce((releaseTotal, release) => {
    if (!release || typeof release !== 'object' || !('assets' in release)) {
      return releaseTotal;
    }

    const assets = (release as { assets?: unknown }).assets;
    if (!Array.isArray(assets)) {
      return releaseTotal;
    }

    const assetTotal = assets.reduce((assetSum, asset) => {
      if (!asset || typeof asset !== 'object' || !('download_count' in asset)) {
        return assetSum;
      }

      const downloadCount = (asset as { download_count?: unknown }).download_count;
      return assetSum + (typeof downloadCount === 'number' ? downloadCount : 0);
    }, 0);

    return releaseTotal + assetTotal;
  }, 0);
}

async function fetchDownloadCount(): Promise<number> {
  let totalDownloads = 0;
  let nextPageUrl: string | null =
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases?per_page=${RELEASES_PER_PAGE}`;

  while (nextPageUrl) {
    const response = await fetch(nextPageUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub releases request failed with status ${response.status}`);
    }

    const releases = (await response.json()) as unknown;
    totalDownloads += sumReleaseDownloads(releases);
    nextPageUrl = getNextPageUrl(response);
  }

  return updateCache(totalDownloads);
}

export async function getDownloadCount(): Promise<number> {
  const cachedValue = getCachedValue();
  if (cachedValue !== null) {
    return cachedValue;
  }

  if (!pendingDownloadCountRequest) {
    pendingDownloadCountRequest = fetchDownloadCount().finally(() => {
      pendingDownloadCountRequest = null;
    });
  }

  try {
    return await pendingDownloadCountRequest;
  } catch (error) {
    console.error('Failed to fetch GitHub download count', error);

    if (downloadCountCache.value !== null) {
      return downloadCountCache.value;
    }

    return 0;
  }
}
