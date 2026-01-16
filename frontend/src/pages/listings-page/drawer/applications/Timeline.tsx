import {
  Collapsible,
  Heading,
  HStack,
  Icon,
  IconButton,
  Text,
  Timeline as ChakraTimeline,
  VStack,
} from '@chakra-ui/react';
import { LuClock, LuMapPin } from 'react-icons/lu';
import { PiPerson, PiPlus } from 'react-icons/pi';

import { DisplayDate } from '@/components/custom/DisplayDate';
import { Tooltip } from '@/components/ui/tooltip';
import { getStatusText, STATUS_DEFINITIONS } from '@/constants/statuses';
import type {
  Application,
  StatusEvent,
  StatusEventApplied,
  StatusEventInterview,
} from '@/types/application';

import { useStatusEvent } from './status-event-modal';

function StatusEventPeople({ event }: { event: StatusEvent }) {
  let people: StatusEventApplied['referrals'] | StatusEventInterview['interviewers'];
  let verb: string;

  if (event.status === 'applied') {
    people = (event as StatusEventApplied).referrals;
    verb = 'Referral';
  } else if (event.status === 'interview') {
    people = (event as StatusEventInterview).interviewers;
    verb = 'Interview';
  } else {
    return null;
  }

  if (!people || people.length === 0) return null;

  return (
    <HStack gap="2">
      <Icon>
        <PiPerson />
      </Icon>
      <Text color="fg.muted" fontSize="sm">
        {verb} by{' '}
        {people.map((person, idx) => (
          <span key={person.name}>
            <Tooltip content={person.contact || person.name}>
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

function InterviewEventDetails({ event }: { event: StatusEventInterview }) {
  const { scheduledAt, location } = event;

  if (!scheduledAt && !location) return null;

  return (
    <VStack align="stretch" gap="1">
      {scheduledAt && (
        <HStack gap="2">
          <Icon>
            <LuClock />
          </Icon>
          <DisplayDate
            fontSize="sm"
            color="fg.muted"
            date={scheduledAt}
            options={{
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }}
          />{' '}
        </HStack>
      )}
      {location && (
        <HStack gap="2">
          <Icon>
            <LuMapPin />
          </Icon>
          <Text fontSize="sm" color="fg.muted">
            {location}
          </Text>
        </HStack>
      )}
    </VStack>
  );
}

function TimelineItem({ event, application }: { event: StatusEvent; application: Application }) {
  const { open } = useStatusEvent();
  const StatusIcon = STATUS_DEFINITIONS[event.status].iconFill;

  const isEditable = event.status !== 'saved';

  // Check if there's any content to show/hide
  const hasContent =
    !!event.notes ||
    (event.status === 'applied' && (event as StatusEventApplied).referrals?.length > 0) ||
    (event.status === 'interview' &&
      ((event as StatusEventInterview).interviewers?.length > 0 ||
        !!(event as StatusEventInterview).scheduledAt ||
        !!(event as StatusEventInterview).location));

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
          <StatusIcon />
        </ChakraTimeline.Indicator>
      </ChakraTimeline.Connector>
      <ChakraTimeline.Content>
        <HStack w="full" justify="space-between">
          <ChakraTimeline.Title mt="0" textStyle="md">
            {getStatusText(event)}
          </ChakraTimeline.Title>
          <DisplayDate date={event.date} textStyle="sm" color="fg.muted" />
        </HStack>

        <Collapsible.Root>
          <Collapsible.Content as={VStack} alignItems="stretch" gap="0">
            {event.notes && (
              <ChakraTimeline.Description textStyle="sm">{event.notes}</ChakraTimeline.Description>
            )}

            <StatusEventPeople event={event} />

            <InterviewEventDetails event={event as StatusEventInterview} />
          </Collapsible.Content>

          <HStack justify="space-between" w="full" mt="1" fontSize="sm" color="fg.muted">
            {hasContent && (
              <Collapsible.Trigger asChild>
                <Text as="button" _hover={{ textDecoration: 'underline' }} cursor="pointer">
                  <Collapsible.Context>
                    {(api) => (api.open ? 'Hide' : 'Show full')}
                  </Collapsible.Context>
                </Text>
              </Collapsible.Trigger>
            )}
            {isEditable && (
              <Text
                as="button"
                _hover={{ textDecoration: 'underline' }}
                onClick={() => open({ event, application })}
                cursor="pointer"
              >
                Edit
              </Text>
            )}
          </HStack>
        </Collapsible.Root>
      </ChakraTimeline.Content>
    </ChakraTimeline.Item>
  );
}

export function Timeline({ application }: { application: Application }) {
  const { open } = useStatusEvent();

  return (
    <VStack align="stretch" gap="0">
      <HStack justify="space-between">
        <Heading size="md">Timeline</Heading>
        <IconButton
          aria-label="Add timeline event"
          variant="plain"
          size="xs"
          mr="-3"
          onClick={() => open({ application })}
        >
          <PiPlus />
        </IconButton>
      </HStack>

      <ChakraTimeline.Root size="xl" variant="solid" mt="4">
        {application.statusEvents.map((event: StatusEvent) => (
          <TimelineItem key={event.id} event={event} application={application} />
        ))}
      </ChakraTimeline.Root>
    </VStack>
  );
}
