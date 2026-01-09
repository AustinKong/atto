import {
  Avatar,
  AvatarGroup,
  createListCollection,
  DataList,
  Heading,
  HStack,
  IconButton,
  Mark,
  Menu,
  Portal,
  Text,
  Timeline,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuMenu } from 'react-icons/lu';
import { PiPlus } from 'react-icons/pi';

import { DisplayDate } from '@/components/custom/DisplayDate';
import { Tooltip } from '@/components/ui/tooltip';
import { STATUS_DEFINITIONS } from '@/constants/statuses';
import { createApplication } from '@/services/applications';
import type {
  Person,
  StatusEnum,
  StatusEvent,
  StatusEventApplied,
  StatusEventInterview,
} from '@/types/application';
import { ISODatetime as ISODatetimeUtils } from '@/utils/date';

import { ApplicationModal } from './Modal';

/**
 * Applications Component
 *
 * Displays and manages job applications for a listing, including:
 * - Application timeline with status events
 * - Support for multiple applications per listing
 * - Editable timeline events with modals
 * - Rich data including referrals, interviewers, and notes
 */

// Helper function to format stage display
function formatStageDisplay(
  status: StatusEnum | null | undefined,
  statusEvent: StatusEvent | null | undefined
): string {
  // Handle null/undefined status or statusEvent
  if (!status || !statusEvent) {
    return '-';
  }

  const statusDefinition = STATUS_DEFINITIONS[status];

  // Handle undefined status definition
  if (!statusDefinition) {
    console.warn(`Unknown status: ${status}`);
    return '-';
  }

  const statusLabel = statusDefinition.label;

  // Extract stage from interview events (flattened structure)
  if (statusEvent.status === 'interview' && 'stage' in statusEvent) {
    const stage = (statusEvent as StatusEventInterview).stage;
    if (stage > 0) {
      return `${statusLabel} ${stage}`;
    }
  }

  return statusLabel;
}

// Component to render people with avatars
function PeopleSection({ people, verb }: { people: Person[]; verb: 'Interview' | 'Referral' }) {
  if (!people || people.length === 0) return null;

  const displayCount = Math.min(people.length, 3);
  const extraCount = people.length - displayCount;

  return (
    <HStack gap="2" mt="2">
      <AvatarGroup gap="0" spaceX="-3" size="2xs">
        {people.slice(0, displayCount).map((person, idx) => {
          // Generate a stable ID based on person name and index
          const id = `${person.name}-${idx}`.replace(/\s+/g, '-').toLowerCase();
          return (
            <Tooltip
              key={person.name}
              ids={{ trigger: id }}
              content={person.contact || person.name}
            >
              <Avatar.Root ids={{ root: id }}>
                <Avatar.Fallback name={person.name} />
                {person.avatarUrl && <Avatar.Image src={person.avatarUrl} />}
              </Avatar.Root>
            </Tooltip>
          );
        })}
        {extraCount > 0 && (
          <Avatar.Root variant="solid">
            <Avatar.Fallback>+{extraCount}</Avatar.Fallback>
          </Avatar.Root>
        )}
      </AvatarGroup>
      <Text color="fg.muted" fontSize="sm">
        {verb} by{' '}
        <Mark variant="text" color="fg">
          {people.map((p) => p.name).join(', ')}
        </Mark>
      </Text>
    </HStack>
  );
}

// Editable Timeline Item Component
interface EditableTimelineItemProps {
  event: StatusEvent;
  applicationId: string;
  onSuccess?: () => void;
}

function EditableTimelineItem({ event, applicationId, onSuccess }: EditableTimelineItemProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const Icon = STATUS_DEFINITIONS[event.status].iconFill;

  // "saved" status events cannot be edited
  const isEditable = event.status !== 'saved';

  return (
    <Timeline.Item>
      <Timeline.Connector
        css={{ '--timeline-thickness': '3px', '--timeline-indicator-size': '1.6rem' }}
      >
        <Timeline.Separator />
        <Timeline.Indicator
          colorPalette={STATUS_DEFINITIONS[event.status].colorPalette}
          outlineWidth="6px"
        >
          <Icon />
        </Timeline.Indicator>
      </Timeline.Connector>
      <Timeline.Content gap="0.5">
        <HStack w="full" justify="space-between">
          <Timeline.Title mt="0" textStyle="md">
            {STATUS_DEFINITIONS[event.status].label}
          </Timeline.Title>
          <DisplayDate date={event.createdAt} textStyle="sm" color="fg.muted" />
        </HStack>

        <Timeline.Description textStyle="sm" lineClamp={expandedId === event.id ? undefined : 2}>
          {event.notes || 'No additional notes provided.'}
        </Timeline.Description>

        {/* Referrals / Interviewers Section */}
        {event.status === 'applied' && (event as StatusEventApplied).referral && (
          <PeopleSection people={[(event as StatusEventApplied).referral!]} verb="Referral" />
        )}
        {event.status === 'interview' && (event as StatusEventInterview).interviewers && (
          <PeopleSection people={(event as StatusEventInterview).interviewers!} verb="Interview" />
        )}

        {/* View More + Edit Button Row */}
        {(event.notes || isEditable) && (
          <HStack justify="space-between" w="full" mt="2">
            {event.notes && expandedId !== event.id && (
              <Text
                as="button"
                fontSize="sm"
                color="fg.subtle"
                _hover={{ textDecoration: 'underline' }}
                onClick={() => setExpandedId(event.id)}
                cursor="pointer"
              >
                Show full
              </Text>
            )}
            {event.notes && expandedId === event.id && (
              <Text
                as="button"
                fontSize="sm"
                color="fg.subtle"
                _hover={{ textDecoration: 'underline' }}
                onClick={() => setExpandedId(null)}
                cursor="pointer"
              >
                Show less
              </Text>
            )}
            {isEditable && (
              <Text
                as="button"
                fontSize="sm"
                color="fg.subtle"
                _hover={{ textDecoration: 'underline' }}
                onClick={() => setModalOpen(true)}
                cursor="pointer"
                ml="auto"
              >
                edit
              </Text>
            )}
          </HStack>
        )}
      </Timeline.Content>
      {isEditable && (
        <ApplicationModal
          open={modalOpen}
          onOpenChange={(details) => setModalOpen(details.open)}
          event={event}
          applicationId={applicationId}
          onSuccess={onSuccess}
        />
      )}
    </Timeline.Item>
  );
}

export function Applications({
  listing,
  onRefresh,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listing?: any;
  onRefresh?: () => void;
}) {
  const [newEventModalOpen, setNewEventModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isCreatingApp, setIsCreatingApp] = useState(false);

  // Initialize selected application when listing changes
  useEffect(() => {
    if (listing?.applications && listing.applications.length > 0 && !selectedApplicationId) {
      setSelectedApplicationId(listing.applications[0].id);
    }
  }, [listing, selectedApplicationId]);

  // Get the currently selected application
  const currentApp =
    selectedApplicationId && listing
      ? listing.applications.find((app: { id: string }) => app.id === selectedApplicationId)
      : null;

  const applicationCollection = listing
    ? createListCollection({
        items: listing.applications.map((app: { id: string }, index: number) => ({
          label: `Application ${index + 1}`,
          value: app.id,
        })),
      })
    : null;

  const handleCreateApplication = async () => {
    if (!listing) return;

    setIsCreatingApp(true);
    try {
      const newApp = await createApplication(listing.id);
      setSelectedApplicationId(newApp.id);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to create application:', error);
    } finally {
      setIsCreatingApp(false);
    }
  };

  const handleEventSuccess = () => {
    onRefresh?.();
  };

  // If there's no listing or no applications, show a message to create one
  if (!listing || !listing.applications || listing.applications.length === 0) {
    return (
      <VStack align="stretch" gap="4" px="4" mb="4">
        <VStack align="stretch" gap="0">
          <HStack justify="space-between">
            <Heading size="md">Applications</Heading>
          </HStack>
          <Text color="fg.muted" mt="4">
            No applications yet. Create your first application to track your progress.
          </Text>
          <IconButton
            aria-label="Create application"
            variant="solid"
            size="md"
            mt="4"
            onClick={handleCreateApplication}
            disabled={isCreatingApp}
            w="fit-content"
          >
            <PiPlus />
            {isCreatingApp ? 'Creating...' : 'New Application'}
          </IconButton>
        </VStack>
      </VStack>
    );
  }

  // If no application is selected but there are applications, show error
  if (!currentApp) {
    return (
      <VStack align="stretch" gap="4" px="4" mb="4">
        <Text color="fg.error">Unable to load application. Please try again.</Text>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap="4" px="4" mb="4">
      <VStack align="stretch" gap="0">
        <HStack justify="space-between">
          <Heading size="md">{currentApp.id}</Heading>
          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton aria-label="Application menu" variant="plain" size="xs" mr="-3">
                <LuMenu />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  {listing && applicationCollection && (
                    <>
                      {applicationCollection.items.map((item) => {
                        const appItem = item as { label: string; value: string };
                        return (
                          <Menu.Item
                            key={appItem.value}
                            value={appItem.value}
                            onClick={() => setSelectedApplicationId(appItem.value)}
                          >
                            {appItem.label}
                          </Menu.Item>
                        );
                      })}
                      <Menu.Separator />
                    </>
                  )}
                  <Menu.Item
                    value="new-application"
                    onClick={handleCreateApplication}
                    disabled={isCreatingApp}
                  >
                    <PiPlus />
                    {isCreatingApp ? 'Creating...' : 'New Application'}
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </HStack>
        <DataList.Root orientation="horizontal" w="full" gap="2" size="lg" mt="4">
          <DataList.Item>
            <DataList.ItemLabel>Stage</DataList.ItemLabel>
            <DataList.ItemValue>
              {formatStageDisplay(
                currentApp.currentStatus,
                currentApp.statusEvents?.[currentApp.statusEvents.length - 1]
              )}
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Resume</DataList.ItemLabel>
            <DataList.ItemValue>{currentApp.resumeId || '-'}</DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Applied</DataList.ItemLabel>
            <DataList.ItemValue>
              {currentApp.statusEvents && currentApp.statusEvents.length > 0 ? (
                <DisplayDate
                  date={currentApp.statusEvents[0].createdAt}
                  options={{ month: 'short', day: 'numeric', year: 'numeric' }}
                />
              ) : (
                '-'
              )}
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Last Update</DataList.ItemLabel>
            <DataList.ItemValue>
              {currentApp.statusEvents && currentApp.statusEvents.length > 0 ? (
                <DisplayDate
                  date={currentApp.statusEvents[currentApp.statusEvents.length - 1].createdAt}
                  options={{ month: 'short', day: 'numeric', year: 'numeric' }}
                />
              ) : (
                '-'
              )}
            </DataList.ItemValue>
          </DataList.Item>
        </DataList.Root>
      </VStack>

      <VStack align="stretch" gap="0">
        <HStack justify="space-between">
          <Heading size="md">Timeline</Heading>
          <IconButton
            aria-label="Add timeline event"
            variant="plain"
            size="xs"
            mr="-3"
            onClick={() => setNewEventModalOpen(true)}
          >
            <PiPlus />
          </IconButton>
        </HStack>

        {currentApp.statusEvents && currentApp.statusEvents.length > 0 ? (
          <Timeline.Root size="xl" variant="solid" mt="4">
            {currentApp.statusEvents.map((event: StatusEvent) => (
              <EditableTimelineItem
                key={event.id}
                event={event}
                applicationId={currentApp.id}
                onSuccess={handleEventSuccess}
              />
            ))}
          </Timeline.Root>
        ) : (
          <Text color="fg.muted" mt="4">
            No timeline events yet. Click the + button above to add your first event.
          </Text>
        )}
      </VStack>
      <ApplicationModal
        open={newEventModalOpen}
        onOpenChange={(details) => setNewEventModalOpen(details.open)}
        event={
          {
            id: 'new-event',
            status: 'applied',
            createdAt: ISODatetimeUtils.now(),
            notes: '',
          } as StatusEvent
        }
        applicationId={currentApp.id}
        onSuccess={handleEventSuccess}
        isNewEvent
      />
    </VStack>
  );
}
