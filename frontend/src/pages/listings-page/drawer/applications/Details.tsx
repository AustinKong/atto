import {
  createListCollection,
  DataList,
  Heading,
  HStack,
  IconButton,
  Link,
  Menu,
  Portal,
  VStack,
} from '@chakra-ui/react';
import { LuMenu } from 'react-icons/lu';
import { PiPlus } from 'react-icons/pi';
import { Link as RouterLink, useNavigate, useParams } from 'react-router';

import { DisplayDate } from '@/components/custom/DisplayDate';
import { getStatusText } from '@/constants/statuses';
import { useCreateApplication } from '@/mutations/applications';
import type { Application } from '@/types/application';
import type { Listing } from '@/types/listing';
import { DateFormatPresets, ISODate } from '@/utils/date';

export function Details({
  application,
  listing,
  handleCreateApplication,
}: {
  application: Application;
  listing: Listing;
  handleCreateApplication: () => void;
}) {
  const navigate = useNavigate();
  const { applicationId } = useParams<{ applicationId: string }>();
  const createApplicationMutation = useCreateApplication();

  const applicationCollection = createListCollection({
    items: listing.applications.map((app) => {
      const lastStatusEvent = app.statusEvents[app.statusEvents.length - 1];
      const statusText = getStatusText(lastStatusEvent);
      const date = ISODate.format(lastStatusEvent.date, DateFormatPresets.monthDay);

      return {
        label: `${date} (${statusText})`,
        value: app.id,
      };
    }),
  });

  return (
    <VStack align="stretch">
      <HStack justify="space-between">
        <Heading size="md">Your Application</Heading>
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton aria-label="Application menu" variant="plain" size="xs" mr="-3">
              <LuMenu />
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <>
                  {applicationCollection.items.map(({ label, value }) => {
                    return (
                      <Menu.Item
                        key={value}
                        value={value}
                        onClick={() => {
                          if (value !== applicationId) {
                            navigate(`/listings/${listing.id}/applications/${value}`);
                          }
                        }}
                      >
                        {label}
                      </Menu.Item>
                    );
                  })}
                  <Menu.Separator />
                </>
                <Menu.Item
                  value="new-application"
                  onClick={handleCreateApplication}
                  disabled={createApplicationMutation.isPending}
                >
                  <PiPlus />
                  {createApplicationMutation.isPending ? 'Creating...' : 'New Application'}
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </HStack>
      <DataList.Root orientation="horizontal" gap="2" size="lg">
        <DataList.Item>
          <DataList.ItemLabel>Stage</DataList.ItemLabel>
          <DataList.ItemValue>
            {getStatusText(application.statusEvents[application.statusEvents.length - 1])}
          </DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Resume</DataList.ItemLabel>
          <DataList.ItemValue>
            {application.resumeId ? (
              <Link asChild>
                <RouterLink to={`/resumes/${application.resumeId}`}>
                  {application.resumeId}
                </RouterLink>
              </Link>
            ) : (
              '-'
            )}
          </DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Applied</DataList.ItemLabel>
          <DataList.ItemValue>
            <DisplayDate
              date={application.statusEvents[0].date}
              options={DateFormatPresets.short}
            />
          </DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Last Update</DataList.ItemLabel>
          <DataList.ItemValue>
            <DisplayDate
              date={application.statusEvents[application.statusEvents.length - 1].date}
              options={DateFormatPresets.short}
            />
          </DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>
    </VStack>
  );
}
