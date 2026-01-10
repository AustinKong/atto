import {
  Avatar,
  AvatarGroup,
  Heading,
  HStack,
  IconButton,
  Mark,
  Text,
  Timeline as ChakraTimeline,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { PiPlus } from 'react-icons/pi';

import { DisplayDate } from '@/components/custom/DisplayDate';
import { Tooltip } from '@/components/ui/tooltip';
import { getStatusText, STATUS_DEFINITIONS } from '@/constants/statuses';
import type {
  Application,
  Person,
  StatusEvent,
  StatusEventApplied,
  StatusEventInterview,
} from '@/types/application';
import { ISODate as ISODateUtils } from '@/utils/date';

import { ApplicationModal } from './Modal';

/**
 * Timeline Components
 *
 * Components for displaying and managing application timeline:
 * - PeopleSection: Displays referrals/interviewers with avatars
 * - EditableTimelineItem: Individual timeline event with edit functionality
 * - ApplicationTimeline: Full timeline section with add event button
 */

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
function TimelineItem({ event, application }: { event: StatusEvent; application: Application }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const Icon = STATUS_DEFINITIONS[event.status].iconFill;

  // "saved" status events cannot be edited
  const isEditable = event.status !== 'saved';

  return (
    <ChakraTimeline.Item>
      <ChakraTimeline.Connector
        css={{ '--timeline-thickness': '3px', '--timeline-indicator-size': '1.6rem' }}
      >
        <ChakraTimeline.Separator />
        <ChakraTimeline.Indicator
          colorPalette={STATUS_DEFINITIONS[event.status].colorPalette}
          outlineWidth="6px"
        >
          <Icon />
        </ChakraTimeline.Indicator>
      </ChakraTimeline.Connector>
      <ChakraTimeline.Content gap="0.5">
        <HStack w="full" justify="space-between">
          <ChakraTimeline.Title mt="0" textStyle="md">
            {getStatusText(event)}
          </ChakraTimeline.Title>
          <DisplayDate date={event.date} textStyle="sm" color="fg.muted" />
        </HStack>

        {event.notes && (
          <ChakraTimeline.Description
            textStyle="sm"
            lineClamp={expandedId === event.id ? undefined : 2}
          >
            {event.notes}
          </ChakraTimeline.Description>
        )}

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
      </ChakraTimeline.Content>
      {isEditable && (
        <ApplicationModal
          open={modalOpen}
          onOpenChange={(details) => setModalOpen(details.open)}
          event={event}
          application={application}
        />
      )}
    </ChakraTimeline.Item>
  );
}

// Full Timeline Section Component
export function Timeline({ application }: { application: Application }) {
  const [newEventModalOpen, setNewEventModalOpen] = useState(false);

  return (
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

      {application.statusEvents && application.statusEvents.length > 0 ? (
        <ChakraTimeline.Root size="xl" variant="solid" mt="4">
          {application.statusEvents.map((event: StatusEvent) => (
            <TimelineItem key={event.id} event={event} application={application} />
          ))}
        </ChakraTimeline.Root>
      ) : (
        <Text color="fg.muted" mt="4">
          No timeline events yet. Click the + button above to add your first event.
        </Text>
      )}

      <ApplicationModal
        open={newEventModalOpen}
        onOpenChange={(details) => setNewEventModalOpen(details.open)}
        event={
          {
            id: 'new-event',
            status: 'applied',
            date: ISODateUtils.today(),
            notes: '',
          } as StatusEvent
        }
        application={application}
        isNewEvent
      />
    </VStack>
  );
}
