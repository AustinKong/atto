import { getStatusText } from '@/constants/statuses';
import type { Application } from '@/types/application';
import { DateFormatPresets, ISODate } from '@/utils/date';

export function formatApplicationStatusDisplay(application: Application): string {
  const lastStatusEvent = application.statusEvents[application.statusEvents.length - 1];
  const statusText = getStatusText(lastStatusEvent);
  const date = ISODate.format(lastStatusEvent.date, DateFormatPresets.monthDay);
  return `${date} (${statusText})`;
}
