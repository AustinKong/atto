import { StatusEventModal, StatusEventProvider } from './status-event-modal';
import { TimelineContent } from './TimelineContent';

export function Timeline({ applicationId }: { applicationId?: string }) {
  return (
    <StatusEventProvider>
      <TimelineContent applicationId={applicationId} />
      <StatusEventModal />
    </StatusEventProvider>
  );
}
