import type { StatusEnum } from '@/types/application.types';

const colorVar = (token: string) => `var(--chakra-colors-${token.replace(/\./g, '-')})`;

export const APPLICATION_STATUS_COLORS: Record<StatusEnum, string> = {
  saved: colorVar('gray.solid'),
  applied: colorVar('blue.solid'),
  screening: colorVar('cyan.solid'),
  interview: colorVar('purple.solid'),
  offer_received: colorVar('yellow.solid'),
  accepted: colorVar('green.solid'),
  rejected: colorVar('red.solid'),
  ghosted: colorVar('orange.solid'),
  withdrawn: colorVar('pink.solid'),
  rescinded: colorVar('teal.solid'),
};

export function getApplicationStatusColor(status: StatusEnum | string) {
  return APPLICATION_STATUS_COLORS[status as StatusEnum] ?? colorVar('fg.muted');
}

export function getApplicationStatusChartColor(datum: { id: string | number }) {
  return getApplicationStatusColor(String(datum.id));
}
