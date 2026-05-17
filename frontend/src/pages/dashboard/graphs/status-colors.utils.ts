import type { StatusEnum } from '@/types/application.types';

const colorVar = (token: string) => `var(--chakra-colors-${token.replace(/\./g, '-')})`;

export const APPLICATION_STATUS_COLORS: Record<StatusEnum, string> = {
  saved: colorVar('gray.fg'),
  applied: colorVar('blue.fg'),
  screening: colorVar('cyan.fg'),
  interview: colorVar('purple.fg'),
  offer_received: colorVar('yellow.fg'),
  accepted: colorVar('green.fg'),
  rejected: colorVar('red.fg'),
  ghosted: colorVar('orange.fg'),
  withdrawn: colorVar('pink.fg'),
  rescinded: colorVar('teal.fg'),
};

export function getApplicationStatusColor(status: StatusEnum | string) {
  return APPLICATION_STATUS_COLORS[status as StatusEnum] ?? colorVar('fg.muted');
}

export function getApplicationStatusChartColor(datum: { id: string | number }) {
  return getApplicationStatusColor(String(datum.id));
}
