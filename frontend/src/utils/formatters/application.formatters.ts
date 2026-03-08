import type { Application } from '@/types/application.types';
import { DateFormatPresets, ISODate } from '@/utils/date.utils';
import { formatStatus } from '@/utils/formatters/status.formatters';

export function getLastStatusEvent(application: Application) {
  return application.statusEvents[application.statusEvents.length - 1];
}

export function formatApplicationStatusDisplay(application: Application): string {
  const lastStatusEvent = getLastStatusEvent(application);
  const statusText = formatStatus(lastStatusEvent);
  const date = ISODate.format(lastStatusEvent.date, DateFormatPresets.monthDay);
  return `${date} (${statusText})`;
}
