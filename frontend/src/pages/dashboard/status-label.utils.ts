export function formatStatusLabel(status: string) {
  return status
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
