import {
  Box,
  createListCollection,
  Heading,
  HStack,
  IconButton,
  Splitter,
  Stat,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { PiPlus } from 'react-icons/pi';
import { useNavigate, useParams } from 'react-router';

import { ContentQualityChart } from '@/components/custom/content-quality-chart';
import { ReadonlyResumePreview } from '@/components/custom/resume-preview';
import { SegmentedSemicircleGauge } from '@/components/custom/segmented-semicircle-gauge';
import { useCreateApplication } from '@/mutations/application.mutations';
import { applicationQueries } from '@/queries/application.queries';
import { listingsQueries } from '@/queries/listing.queries';
import { profileQueries } from '@/queries/profile.queries';
import { resumeQueries } from '@/queries/resume.queries';
import { templateQueries } from '@/queries/template.queries';
import { formatApplicationStatusDisplay } from '@/utils/formatters/application.formatters';

import { CreateApplicationModal } from './CreateApplicationModal';
import { Details } from './Details';
import { SkillsComparison } from './SkillsComparison';
import { StatusEventModal } from './status-event-modal';
import { StatusEventProvider } from './status-event-modal/statusEventContext';
import { Timeline } from './Timeline';

const ApplicationsPageContent = memo(function ApplicationsPageContent() {
  const { listingId, applicationId } = useParams<{ listingId: string; applicationId: string }>();
  const navigate = useNavigate();
  const { open, onOpen, setOpen } = useDisclosure();

  // Fetch queries
  const { data: listing } = useSuspenseQuery(listingsQueries.item(listingId!));
  const { data: application } = useSuspenseQuery(applicationQueries.item(applicationId!));
  const { data: resume } = useSuspenseQuery(resumeQueries.item(application.resumeId));
  const { data: template } = useSuspenseQuery(templateQueries.localItem(resume.templateId));
  const { data: profile } = useSuspenseQuery(profileQueries.list());

  const createApplicationMutation = useCreateApplication();

  const applicationCollection = createListCollection({
    items: listing.applications.map((app) => {
      return {
        label: formatApplicationStatusDisplay(app),
        value: app.id,
      };
    }),
  });

  // Show empty state if no application ID
  if (!applicationId) {
    return (
      <StatusEventProvider>
        <VStack align="stretch" gap="4" px="4" mb="4">
          <VStack align="stretch">
            <Heading size="md">Applications</Heading>
            <Text color="fg.muted">
              No applications yet. Create your first application to track your progress.
            </Text>
          </VStack>
          <IconButton
            aria-label="Create application"
            variant="solid"
            size="md"
            onClick={onOpen}
            disabled={createApplicationMutation.isPending}
          >
            <PiPlus />
            {createApplicationMutation.isPending ? 'Creating...' : 'New Application'}
          </IconButton>
        </VStack>
        <CreateApplicationModal open={open} onOpenChange={setOpen} />
        <StatusEventModal />
      </StatusEventProvider>
    );
  }

  return (
    <StatusEventProvider>
      {/* Two-column splitter: left (apps list + timeline) / right (details + charts + previews) */}
      <Splitter.Root
        panels={[
          { id: 'left', minSize: 15 },
          { id: 'right', minSize: 15 },
        ]}
        defaultSize={[20, 80]}
        borderWidth="1px"
        h="calc(100vh - 100px)"
      >
        {/* Left panel: contains horizontal splitter for applications list and timeline */}
        <Splitter.Panel id="left">
          <Splitter.Root
            panels={[
              { id: 'top', minSize: 20 },
              { id: 'bottom', minSize: 20 },
            ]}
            defaultSize={[50, 50]}
            orientation="vertical"
            h="full"
          >
            {/* Top panel: Applications list */}
            <Splitter.Panel id="top">
              <VStack align="stretch" gap="4" p="4" h="full" overflowY="auto">
                <HStack justify="space-between">
                  <Heading size="md">Applications</Heading>
                  <IconButton
                    aria-label="Create application"
                    variant="plain"
                    size="xs"
                    mr="-3"
                    onClick={onOpen}
                    disabled={createApplicationMutation.isPending}
                  >
                    <PiPlus />
                  </IconButton>
                </HStack>
                <VStack align="stretch" gap="2">
                  {applicationCollection.items.map(({ label, value }) => {
                    const isActive = value === applicationId;
                    return (
                      <Text
                        key={value}
                        as="button"
                        onClick={() => {
                          if (!isActive) {
                            navigate(`/listings/${listingId}/applications/${value}`);
                          }
                        }}
                        px="3"
                        py="2"
                        borderRadius="md"
                        textAlign="left"
                        cursor={isActive ? 'default' : 'pointer'}
                        bg={isActive ? 'bg-muted' : 'transparent'}
                        color={isActive ? 'fg' : 'fg-muted'}
                        _hover={!isActive ? { bg: 'bg-subtle', color: 'fg' } : undefined}
                        transition="colors 200ms"
                        fontWeight={isActive ? 'medium' : 'normal'}
                      >
                        {label}
                      </Text>
                    );
                  })}
                </VStack>
              </VStack>
            </Splitter.Panel>

            {/* Resize trigger between top and bottom */}
            <Splitter.ResizeTrigger id="top:bottom">
              <Splitter.ResizeTriggerSeparator />
            </Splitter.ResizeTrigger>

            {/* Bottom panel: Application event timeline */}
            <Splitter.Panel id="bottom" p="4">
              <Timeline application={application} />
            </Splitter.Panel>
          </Splitter.Root>
        </Splitter.Panel>

        {/* Resize trigger between left and right */}
        <Splitter.ResizeTrigger id="left:right">
          <Splitter.ResizeTriggerSeparator />
        </Splitter.ResizeTrigger>

        {/* Right panel: Details, stats, charts, and previews */}
        <Splitter.Panel id="right">
          <VStack align="stretch" gap="4" p="4" h="full" overflowY="auto">
            <Details application={application} listing={listing} />

            {/* Top row: Resume, Cover Letter, Match Score, 2 Stats in HStack */}
            <HStack gap="4" w="full" align="stretch">
              {/* Resume Preview */}
              <Box
                borderRadius="md"
                p="4"
                flex="1"
                minH="0"
                cursor="pointer"
                _hover={{ bg: 'bg-subtle' }}
                transition="background 200ms"
                onClick={() => {
                  navigate(`/listings/${listingId}/applications/${applicationId}`);
                }}
                display="flex"
                flexDirection="column"
              >
                <VStack align="stretch" gap="2" h="full">
                  <Text textStyle="sm" color="fg.muted">
                    Resume
                  </Text>
                  <Box flex="1" minH="0" w="full" overflowY="auto">
                    <ReadonlyResumePreview
                      template={template}
                      sections={resume.sections}
                      profile={profile}
                    />
                  </Box>
                </VStack>
              </Box>

              {/* Cover Letter Preview */}
              <Box
                borderRadius="md"
                p="4"
                flex="1"
                minH="0"
                cursor="pointer"
                _hover={{ bg: 'bg-subtle' }}
                transition="background 200ms"
                onClick={() => {
                  navigate(`/listings/${listingId}/applications/${applicationId}`);
                }}
                display="flex"
                flexDirection="column"
              >
                <VStack align="stretch" gap="2" h="full">
                  <Text textStyle="sm" color="fg.muted">
                    Cover Letter
                  </Text>
                  <Box flex="1" minH="0" w="full" overflowY="auto">
                    <ReadonlyResumePreview
                      template={template}
                      sections={resume.sections}
                      profile={profile}
                    />
                  </Box>
                </VStack>
              </Box>

              {/* Match Score Stat */}
              <Stat.Root borderWidth="1px" borderRadius="md" p="4" flex="0 0 auto" minW="120px">
                <Stat.Label>Match Score</Stat.Label>
                <Box mt="2">
                  <SegmentedSemicircleGauge percent={Math.random()} />
                </Box>
              </Stat.Root>

              {/* Current State and Last Updated stacked */}
              <VStack gap="4" flex="0 0 auto" minW="120px">
                {/* Current State Stat */}
                <Stat.Root borderWidth="1px" borderRadius="md" p="4" flex="1" w="full">
                  <Stat.Label>Current State</Stat.Label>
                  <Stat.ValueText mt="2">{application.currentStatus}</Stat.ValueText>
                </Stat.Root>

                {/* Last Updated Stat */}
                <Stat.Root borderWidth="1px" borderRadius="md" p="4" flex="1" w="full">
                  <Stat.Label>Last Updated</Stat.Label>
                  <Stat.ValueText mt="2">
                    {application.statusEvents[0]?.date
                      ? new Date(application.statusEvents[0].date).toLocaleDateString()
                      : 'N/A'}
                  </Stat.ValueText>
                </Stat.Root>
              </VStack>
            </HStack>

            {/* Bottom row: Content Quality and Skills Radar in HStack */}
            <HStack gap="4" w="full" flex="1" minH="0" align="stretch">
              {/* Content Quality */}
              <Box borderRadius="md" p="4" flex="1" minW="0" display="flex" flexDirection="column">
                <VStack align="stretch" gap="2" h="full">
                  <Text textStyle="sm" color="fg.muted">
                    Content Quality
                  </Text>
                  <Box flex="1" minH="0">
                    <ContentQualityChart />
                  </Box>
                </VStack>
              </Box>

              {/* Skills Radar */}
              <Box borderRadius="md" p="4" flex="1" minW="0" display="flex" flexDirection="column">
                <VStack align="stretch" gap="2" h="full">
                  <Text textStyle="sm" color="fg.muted">
                    Skills Radar
                  </Text>
                  <Box flex="1" minH="0">
                    <SkillsComparison applicationId={applicationId} listingId={listingId!} />
                  </Box>
                </VStack>
              </Box>
            </HStack>
          </VStack>
        </Splitter.Panel>
      </Splitter.Root>

      <CreateApplicationModal open={open} onOpenChange={setOpen} />
      <StatusEventModal />
    </StatusEventProvider>
  );
});

export { ApplicationsPageContent as ApplicationsPage };
