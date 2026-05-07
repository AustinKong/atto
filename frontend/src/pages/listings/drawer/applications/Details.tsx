import { DataList } from '@chakra-ui/react';
import { useParams } from 'react-router';

import { DisplayDate } from '@/components/ui/DisplayDate';
import type { Listing } from '@/types/listing.types';
import { DateFormatPresets } from '@/utils/date.utils';
import { getLastStatusEvent } from '@/utils/formatters/application.formatters';
import { formatStatus } from '@/utils/formatters/status.formatters';

import { Section } from '../Section';

export function Details({ listing }: { listing: Listing }) {
  const { applicationId } = useParams<{
    applicationId?: string;
  }>();
  const application = listing.applications.find((app) => app.id === applicationId) ?? null;

  const appliedAt = application?.statusEvents[0];
  const lastStatus = application ? getLastStatusEvent(application) : null;

  return (
    <Section title="Application Details">
      <DataList.Root orientation="horizontal" gap="xs" size="lg">
        <DataList.Item>
          <DataList.ItemLabel>Stage</DataList.ItemLabel>
          <DataList.ItemValue>{lastStatus ? formatStatus(lastStatus) : 'N/A'}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Applied</DataList.ItemLabel>
          <DataList.ItemValue>
            {appliedAt ? (
              <DisplayDate date={appliedAt.date} options={DateFormatPresets.short} />
            ) : (
              'N/A'
            )}
          </DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Last Update</DataList.ItemLabel>
          <DataList.ItemValue>
            {lastStatus ? (
              <DisplayDate date={lastStatus.date} options={DateFormatPresets.short} />
            ) : (
              'N/A'
            )}
          </DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>
    </Section>
  );
}
