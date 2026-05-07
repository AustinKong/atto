import {
  Collapsible,
  HStack,
  Icon,
  IconButton,
  Spacer,
  Text,
  Timeline as ChakraTimeline,
  VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { LuClock, LuMapPin } from 'react-icons/lu';
import { PiPerson, PiPlus } from 'react-icons/pi';

import { DisplayDate } from '@/components/ui/DisplayDate';
import { Tooltip } from '@/components/ui/Tooltip';
import { STATUS_DEFINITIONS } from '@/constants/status.constants';
import { applicationQueries } from '@/queries/application.queries';
import type {
  Application,
  Person,
  StatusEvent,
  StatusEventApplied,
  StatusEventInterview,
} from '@/types/application.types';
import { DateFormatPresets } from '@/utils/date.utils';
import { formatStatus } from '@/utils/formatters/status.formatters';

import { Section } from '../../Section';
import { useStatusEvent } from './status-event-modal';

function hasEventContent(event: StatusEvent): boolean {
  if (event.notes) return true;

  if (event.status === 'applied') {
    return (event as StatusEventApplied).referrals?.length > 0;
  }

  if (event.status === 'interview') {
    const interviewEvent = event as StatusEventInterview;
    return (
      interviewEvent.interviewers?.length > 0 ||
      !!interviewEvent.scheduledAt ||
      !!interviewEvent.location
    );
  }

  return false;
}

function getEventPeople(event: StatusEvent): { label: string; people: Person[] } | null {
  if (event.status === 'applied') {
    const referrals = (event as StatusEventApplied).referrals;
    if (!referrals?.length) return null;
    return { label: 'Referral', people: referrals };
  }

  if (event.status === 'interview') {
    const interviewers = (event as StatusEventInterview).interviewers;
    if (!interviewers?.length) return null;
    return { label: 'Interview', people: interviewers };
  }

  return null;
}

function TimelineItem({ event, application }: { event: StatusEvent; application: Application }) {
  const { open } = useStatusEvent();
  const StatusIcon = STATUS_DEFINITIONS[event.status].iconFill;

  const isEditable = event.status !== 'saved';
  const hasContent = hasEventContent(event);
  const peopleDetails = getEventPeople(event);
  const interviewDetails = event.status === 'interview' ? (event as StatusEventInterview) : null;
  const hasInterviewMetadata = interviewDetails?.scheduledAt || interviewDetails?.location;

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
            {formatStatus(event)}
          </ChakraTimeline.Title>
          <DisplayDate date={event.date} textStyle="sm" color="fg.muted" />
        </HStack>

        <Collapsible.Root>
          <Collapsible.Content as={VStack} alignItems="stretch" gap="0">
            {event.notes && (
              <ChakraTimeline.Description textStyle="sm">{event.notes}</ChakraTimeline.Description>
            )}

            {peopleDetails && (
              <HStack gap="xs">
                <Icon>
                  <PiPerson />
                </Icon>
                <Text color="fg.muted" textStyle="sm">
                  {peopleDetails.label} by{' '}
                  {peopleDetails.people.map((person, idx) => (
                    <span key={person.name}>
                      <Tooltip content={person.contact || person.name}>
                        <Text color="fg" textDecoration="underline" as="span" cursor="pointer">
                          {person.name}
                        </Text>
                      </Tooltip>
                      {idx < peopleDetails.people.length - 1 && ', '}
                    </span>
                  ))}
                </Text>
              </HStack>
            )}

            {hasInterviewMetadata && (
              <VStack align="stretch" gap="2xs">
                {interviewDetails?.scheduledAt && (
                  <HStack gap="xs">
                    <Icon>
                      <LuClock />
                    </Icon>
                    <DisplayDate
                      textStyle="sm"
                      color="fg.muted"
                      date={interviewDetails.scheduledAt}
                      options={DateFormatPresets.shortWithTime}
                    />
                  </HStack>
                )}
                {interviewDetails?.location && (
                  <HStack gap="xs">
                    <Icon>
                      <LuMapPin />
                    </Icon>
                    <Text textStyle="sm" color="fg.muted">
                      {interviewDetails.location}
                    </Text>
                  </HStack>
                )}
              </VStack>
            )}
          </Collapsible.Content>

          <HStack justify="space-between" w="full" mt="2xs" fontSize="sm" color="fg.muted">
            {hasContent && (
              <Collapsible.Trigger asChild>
                <Text as="button" _hover={{ textDecoration: 'underline' }} cursor="pointer">
                  <Collapsible.Context>
                    {(api) => (api.open ? 'Hide' : 'Show full')}
                  </Collapsible.Context>
                </Text>
              </Collapsible.Trigger>
            )}
            <Spacer />
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

export function TimelineContent({ applicationId }: { applicationId?: string }) {
  const { open } = useStatusEvent();
  const { data: application } = useQuery({
    ...applicationQueries.item(applicationId ?? ''),
    enabled: Boolean(applicationId),
  });

  return (
    <Section
      title="Timeline"
      action={
        <IconButton
          aria-label="Add timeline event"
          variant="plain"
          size="xs"
          mr="-3"
          disabled={!application}
          onClick={() => {
            if (!application) return;
            open({ application });
          }}
        >
          <PiPlus />
        </IconButton>
      }
    >
      {application ? (
        <ChakraTimeline.Root size="xl" variant="solid" mt="md">
          {application.statusEvents.map((event: StatusEvent) => (
            <TimelineItem key={event.id} event={event} application={application} />
          ))}
        </ChakraTimeline.Root>
      ) : (
        <Text color="fg.muted">Select an application to view timeline events.</Text>
      )}
    </Section>
  );
}
