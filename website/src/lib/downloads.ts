const CACHE_DURATION_MS = 10 * 60 * 1000;
const GITHUB_RELEASES_URL =
  'https://api.github.com/repos/AustinKong/atto/releases?per_page=100';
const PYPI_OVERALL_DOWNLOADS_URL =
  'https://pypistats.org/api/packages/atto-app/overall?mirrors=false';

const downloadCountCache: { value: number | null; timestamp: number | null } = {
  value: null,
  timestamp: null,
};

type GitHubRelease = {
  assets?: Array<{
    download_count?: number;
  }>;
};

type PyPIDownloadEntry = {
  downloads?: number;
};

type PyPIOverallDownloadsResponse = {
  data?: PyPIDownloadEntry[];
};

export async function getGitHubDownloadCount(): Promise<number> {
  try {
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

    return releases
      .flatMap((release) => release.assets ?? [])
      .reduce((sum, asset) => sum + (asset.download_count ?? 0), 0);
  } catch (error) {
    console.error('Failed to fetch GitHub download count', error);
    return 0;
  }
}

export async function getPyPIDownloadCount(): Promise<number> {
  try {
    const response = await fetch(PYPI_OVERALL_DOWNLOADS_URL, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`PyPI downloads request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as PyPIOverallDownloadsResponse;
    return (payload.data ?? []).reduce((sum, entry) => sum + (entry.downloads ?? 0), 0);
  } catch (error) {
    console.error('Failed to fetch PyPI download count', error);
    return 0;
  }
}

export async function getDownloadCount(): Promise<number> {
  if (
    downloadCountCache.value !== null &&
    downloadCountCache.timestamp !== null &&
    Date.now() - downloadCountCache.timestamp < CACHE_DURATION_MS
  ) {
    return downloadCountCache.value;
  }

  const [githubDownloads, pypiDownloads] = await Promise.all([
    getGitHubDownloadCount(),
    getPyPIDownloadCount(),
  ]);
  const totalDownloads = githubDownloads + pypiDownloads;

  downloadCountCache.value = totalDownloads;
  downloadCountCache.timestamp = Date.now();
  return totalDownloads;
}
