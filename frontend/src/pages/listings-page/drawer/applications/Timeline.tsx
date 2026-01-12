import {
  Heading,
  HStack,
  Icon,
  IconButton,
  Text,
  Timeline as ChakraTimeline,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { PiPerson, PiPlus } from 'react-icons/pi';

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
 * - PeopleSection: Displays referrals/interviewers with person icon
 * - EditableTimelineItem: Individual timeline event with edit functionality
 * - ApplicationTimeline: Full timeline section with add event button
 */

// Component to render people with names and tooltips
function PeopleSection({ people, verb }: { people: Person[]; verb: 'Interview' | 'Referral' }) {
  if (!people || people.length === 0) return null;

  return (
    <HStack gap="2" mt="2">
      <Icon>
        <PiPerson />
      </Icon>
      <Text color="fg.muted" fontSize="sm">
        {verb} by{' '}
        {people.map((person, idx) => (
          <span key={person.name}>
            <Tooltip content={person.contact || person.name} positioning={{ placement: 'top' }}>
              <Text color="fg" textDecoration="underline" as="span" cursor="pointer">
                {person.name}
              </Text>
            </Tooltip>
            {idx < people.length - 1 && ', '}
          </span>
        ))}
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
        {event.status === 'applied' &&
          (event as StatusEventApplied).referrals &&
          (event as StatusEventApplied).referrals.length > 0 && (
            <PeopleSection people={(event as StatusEventApplied).referrals} verb="Referral" />
          )}
        {event.status === 'interview' &&
          (event as StatusEventInterview).interviewers &&
          (event as StatusEventInterview).interviewers.length > 0 && (
            <PeopleSection people={(event as StatusEventInterview).interviewers} verb="Interview" />
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
