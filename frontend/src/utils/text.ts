export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function compareSemVer(v1: string, v2: string): number {
  const parseVersion = (version: string) => {
    const numericPart = version.split('-')[0];
    const parts = numericPart.split('.').map(Number);
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
  };

  const [major1, minor1, patch1] = parseVersion(v1);
  const [major2, minor2, patch2] = parseVersion(v2);

  if (major1 !== major2) {
    return major1 - major2;
  }
  if (minor1 !== minor2) {
    return minor1 - minor2;
  }
  return patch1 - patch2;
}
