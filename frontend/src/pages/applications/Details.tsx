import {
  Box,
  Button,
  DataList,
  Heading,
  HStack,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { LuArrowUpRight, LuFileText } from 'react-icons/lu';
import { PiPlus } from 'react-icons/pi';
import { Link } from 'react-router';

import { DisplayDate } from '@/components/ui/DisplayDate';
import type { Application } from '@/types/application.types';
import type { Listing } from '@/types/listing.types';
import { DateFormatPresets } from '@/utils/date.utils';
import {
  formatApplicationStatusDisplay,
  getLastStatusEvent,
} from '@/utils/formatters/application.formatters';
import { formatStatus } from '@/utils/formatters/status.formatters';

import { CreateApplicationModal } from './CreateApplicationModal';

export function Details({
  application,
  listing,
  selectedApplicationId,
  onSelectApplication,
  onApplicationCreated,
}: {
  application: Application | null;
  listing: Listing;
  selectedApplicationId: string | null;
  onSelectApplication: (applicationId: string) => void;
  onApplicationCreated: (applicationId: string) => void;
}) {
  const { open, onOpen, setOpen } = useDisclosure();

  const appliedAt = application?.statusEvents[0];
  const lastStatus = application ? getLastStatusEvent(application) : null;

  return (
    <VStack align="stretch" gap="md">
      <Heading size="md">Applications</Heading>

      <VStack align="stretch" gap="xs">
        <Box borderWidth="1px" borderColor="border.muted" borderRadius="md" p="xs">
          <VStack align="stretch" gap="2xs" maxH="56" overflowY="auto">
            {listing.applications.map((app) => {
              const isActive = selectedApplicationId === app.id;
              const appLastStatus = getLastStatusEvent(app);

              return (
                <Button
                  key={app.id}
                  variant={isActive ? 'subtle' : 'ghost'}
                  justifyContent="space-between"
                  alignItems="flex-start"
                  h="auto"
                  py="xs"
                  onClick={() => onSelectApplication(app.id)}
                >
                  <VStack align="start" gap="2xs">
                    <Text textStyle="sm" fontWeight="medium">
                      {formatApplicationStatusDisplay(app)}
                    </Text>
                    <HStack gap="xs" color="fg.muted" textStyle="xs">
                      <Text>Updated</Text>
                      <DisplayDate date={appLastStatus.date} options={DateFormatPresets.short} />
                      <Text>•</Text>
                      <Text>Resume {app.resumeId.slice(0, 8)}</Text>
                    </HStack>
                  </VStack>
                </Button>
              );
            })}
          </VStack>
        </Box>

        <Button onClick={onOpen}>
          <PiPlus />
          New Application
        </Button>
      </VStack>

      {!application ? (
        <Text color="fg.muted">No applications yet. Create your first application to get started.</Text>
      ) : (
        <VStack align="stretch" gap="md">
          <VStack align="stretch" gap="xs">
            <Text textStyle="sm" color="fg.muted">
              Match score
            </Text>
            <Text textStyle="sm">Unavailable until deterministic scoring is implemented.</Text>
          </VStack>

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
            <DataList.Item>
              <DataList.ItemLabel>Role</DataList.ItemLabel>
              <DataList.ItemValue>{listing.title}</DataList.ItemValue>
            </DataList.Item>
          </DataList.Root>

          <Stack direction={{ base: 'column', md: 'row' }} gap="xs">
            <Button asChild variant="outline" flex="1">
              <Link to={`/resumes/${application.resumeId}`}>
                View Resume
                <LuArrowUpRight />
              </Link>
            </Button>
            <Button variant="outline" disabled flex="1">
              <LuFileText />
              View CV (Planned)
            </Button>
          </Stack>
        </VStack>
      )}

      <CreateApplicationModal
        open={open}
        onOpenChange={setOpen}
        onCreated={(applicationId) => {
          onApplicationCreated(applicationId);
        }}
      />
    </VStack>
  );
}
