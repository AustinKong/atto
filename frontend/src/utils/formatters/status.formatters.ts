import { STATUS_DEFINITIONS } from '@/constants/status.constants';
import type { StatusEvent } from '@/types/application.types';

export function formatStatus(statusEvent: StatusEvent): string {
  const statusDefinition = STATUS_DEFINITIONS[statusEvent.status];
  const statusLabel = statusDefinition.label;

  if ('stage' in statusEvent && typeof statusEvent.stage === 'number' && statusEvent.stage > 0) {
    return `${statusLabel} ${statusEvent.stage}`;
  }

  return statusLabel;
}
