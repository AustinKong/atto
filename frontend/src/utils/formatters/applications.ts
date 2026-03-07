import type { Application } from '@/types/application';
import { DateFormatPresets, ISODate } from '@/utils/date';
import { formatStatus } from '@/utils/formatters/statuses';

export function formatApplicationStatusDisplay(application: Application): string {
  const lastStatusEvent = application.statusEvents[application.statusEvents.length - 1];
  const statusText = formatStatus(lastStatusEvent);
  const date = ISODate.format(lastStatusEvent.date, DateFormatPresets.monthDay);
  return `${date} (${statusText})`;
}
