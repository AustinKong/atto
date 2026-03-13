import {
  Button,
  createListCollection,
  DataList,
  Heading,
  HStack,
  IconButton,
  Menu,
  Portal,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { LuArrowUpRight, LuMenu } from 'react-icons/lu';
import { PiPlus } from 'react-icons/pi';
import { Link, useNavigate, useParams } from 'react-router';

import { DisplayDate } from '@/components/ui/DisplayDate';
import { useCreateApplication } from '@/mutations/application.mutations';
import type { Application } from '@/types/application.types';
import type { Listing } from '@/types/listing.types';
import { DateFormatPresets } from '@/utils/date.utils';
import {
  formatApplicationStatusDisplay,
  getLastStatusEvent,
} from '@/utils/formatters/application.formatters';
import { formatStatus } from '@/utils/formatters/status.formatters';

import { CreateApplicationModal } from './CreateApplicationModal';

export function Details({ application, listing }: { application: Application; listing: Listing }) {
  const navigate = useNavigate();
  const { applicationId } = useParams<{ applicationId: string }>();
  const { open, setOpen } = useDisclosure();
  const createApplicationMutation = useCreateApplication();

  const applicationCollection = createListCollection({
    items: listing.applications.map((app) => {
      return {
        label: formatApplicationStatusDisplay(app),
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
                  onClick={() => setOpen(true)}
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
          <DataList.ItemValue>{formatStatus(getLastStatusEvent(application))}</DataList.ItemValue>
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
              date={getLastStatusEvent(application).date}
              options={DateFormatPresets.short}
            />
          </DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>
      <Button mt="2" variant="outline" asChild>
        <Link
          to={`/listings/${listing.id}/applications/${application.id}/resumes/${application.resumeId}`}
        >
          View Resume <LuArrowUpRight />
        </Link>
      </Button>

      <CreateApplicationModal open={open} onOpenChange={setOpen} />
    </VStack>
  );
}
