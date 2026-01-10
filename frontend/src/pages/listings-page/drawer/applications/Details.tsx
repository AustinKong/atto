import {
  createListCollection,
  DataList,
  Heading,
  HStack,
  IconButton,
  Menu,
  Portal,
  VStack,
} from '@chakra-ui/react';
import { LuMenu } from 'react-icons/lu';
import { PiPlus } from 'react-icons/pi';
import { useNavigate, useParams } from 'react-router';

import { DisplayDate } from '@/components/custom/DisplayDate';
import { getStatusText } from '@/constants/statuses';
import { useApplicationMutations } from '@/hooks/applications';
import type { Application } from '@/types/application';

export function Details({
  application,
  applications,
}: {
  application: Application;
  applications: Application[];
}) {
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();
  const { createApplication, isCreateApplicationLoading } = useApplicationMutations();

  const applicationCollection = createListCollection({
    items: applications.map((app) => {
      const lastStatusEvent = app.statusEvents[app.statusEvents.length - 1];
      const statusText = getStatusText(lastStatusEvent);
      const date = lastStatusEvent
        ? new Date(lastStatusEvent.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : '';

      return {
        label: `${date} (${statusText})`,
        value: app.id,
      };
    }),
  });

  const handleCreateApplication = async () => {
    const { id } = await createApplication(listingId!);
    navigate(`/listings/${listingId}/applications/${id}`, { replace: true });
  };

  return (
    <VStack align="stretch">
      <HStack justify="space-between">
        <Heading size="md">About your Application</Heading>
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
                  {applicationCollection.items.map((item) => {
                    const appItem = item as { label: string; value: string };
                    return (
                      <Menu.Item
                        key={appItem.value}
                        value={appItem.value}
                        onClick={() =>
                          navigate(`/listings/${listingId}/applications/${appItem.value}`, {
                            replace: true,
                          })
                        }
                      >
                        {appItem.label}
                      </Menu.Item>
                    );
                  })}
                  <Menu.Separator />
                </>
                <Menu.Item
                  value="new-application"
                  onClick={handleCreateApplication}
                  disabled={isCreateApplicationLoading}
                >
                  <PiPlus />
                  {isCreateApplicationLoading ? 'Creating...' : 'New Application'}
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
          <DataList.ItemValue>{application.resumeId || '-'}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Applied</DataList.ItemLabel>
          <DataList.ItemValue>
            <DisplayDate
              date={application.statusEvents[0].date}
              options={{ month: 'short', day: 'numeric', year: 'numeric' }}
            />
          </DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Last Update</DataList.ItemLabel>
          <DataList.ItemValue>
            <DisplayDate
              date={application.statusEvents[application.statusEvents.length - 1].date}
              options={{ month: 'short', day: 'numeric', year: 'numeric' }}
            />
          </DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>
    </VStack>
  );
}
