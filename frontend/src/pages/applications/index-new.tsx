import {
  Button,
  Card,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Stat,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { LuArrowUpRight, LuCalendar, LuMapPin, LuPlus, LuRefreshCw, LuTag } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router';

import { ResumePreviewCard } from '@/components/custom/resume-preview';
import { SegmentedGauge } from '@/components/custom/segmented-gauge';
import { useCreateApplication } from '@/mutations/application.mutations';
import { applicationQueries } from '@/queries/application.queries';
import { listingsQueries } from '@/queries/listing.queries';
import { profileQueries } from '@/queries/profile.queries';
import { resumeQueries } from '@/queries/resume.queries';
import { templateQueries } from '@/queries/template.queries';

import { ApplicationFunnel } from './ApplicationFunnel';
import { CreateApplicationModal } from './CreateApplicationModal';
import { ApplicationFlow } from './flow';
import { StatusEventModal } from './status-event-modal';
import { StatusEventProvider } from './status-event-modal/statusEventContext';

const ApplicationsPageContent = memo(function ApplicationsPageContent() {
  const { applicationId } = useParams<{ listingId: string; applicationId: string }>();
  const { open, onOpen, setOpen } = useDisclosure();

  // Fetch queries
  const { data: application } = useSuspenseQuery(applicationQueries.item(applicationId!));
  const { data: listing } = useSuspenseQuery(listingsQueries.item(application.listingId));
  const { data: resume } = useSuspenseQuery(resumeQueries.item(application.resumeId));
  const { data: template } = useSuspenseQuery(templateQueries.localItem(resume.templateId));
  const { data: profile } = useSuspenseQuery(profileQueries.list());

  const createApplicationMutation = useCreateApplication();
  const navigate = useNavigate();

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
          <Button size="md" onClick={onOpen} disabled={createApplicationMutation.isPending}>
            <LuPlus size={16} />
            {createApplicationMutation.isPending ? 'Creating...' : 'New Application'}
          </Button>
        </VStack>
        <CreateApplicationModal open={open} onOpenChange={setOpen} />
        <StatusEventModal />
      </StatusEventProvider>
    );
  }

  return (
    <StatusEventProvider>
      <VStack align="stretch" h="full" gap="0">
        {/* Toolbar row with application title and new button */}
        <HStack justify="space-between" align="center" px="4" pt="3" flexShrink={0}>
          <Text fontWeight="semibold" fontSize="lg">
            {application.currentStatus}
          </Text>
          <Button size="sm" onClick={onOpen} disabled={createApplicationMutation.isPending}>
            <LuPlus size={16} />
            {createApplicationMutation.isPending ? 'Creating...' : 'New Application'}
          </Button>
        </HStack>

        {/* Main grid: 4 columns, 3 rows */}
        <Grid
          flex="1"
          minH="0"
          minW="0"
          templateColumns="repeat(4, minmax(0, 1fr))"
          templateRows="repeat(3, 1fr)"
          gap="4"
          p="4"
          autoFlow="dense"
          h="full"
        >
          {/* Timeline Flow: spans rows 1-3, cols 1-2 (left) */}
          <GridItem rowSpan={3} colSpan={2} minH="0">
            <Card.Root h="full" display="flex" flexDir="column" variant="outline">
              <Card.Header pb="2">
                <VStack gap="0" align="stretch">
                  <Heading size="sm">Application Timeline</Heading>
                  <Text fontSize="xs" color="fg.muted">
                    Track all status updates and decisions in your application journey
                  </Text>
                </VStack>
              </Card.Header>
              <Card.Body flex="1" minH="0" p="4">
                <ApplicationFlow
                  application={application}
                  onCreateNew={onOpen}
                  isCreatingNew={createApplicationMutation.isPending}
                  title={application.currentStatus}
                />
              </Card.Body>
            </Card.Root>
          </GridItem>

          {/* Job Info Header: spans 2 cols, row 1 (top right) */}
          <GridItem colSpan={2} rowSpan={1} minH="0">
            <Card.Root h="full" display="flex" flexDir="column">
              <Card.Header pb="3">
                <VStack gap="1" align="stretch">
                  <Heading size="sm">
                    {listing &&
                    'title' in listing &&
                    listing.title &&
                    listing &&
                    'company' in listing &&
                    listing.company
                      ? `${listing.title} at ${listing.company}`
                      : 'N/A'}
                  </Heading>
                  <HStack gap="2" fontSize="xs" color="fg.muted" flexWrap="wrap">
                    <Text>
                      {listing && 'location' in listing && listing.location
                        ? listing.location
                        : 'N/A'}
                    </Text>
                    <Text>•</Text>
                    <Text>Applied {application.statusEvents[0]?.date || 'N/A'}</Text>
                  </HStack>
                </VStack>
              </Card.Header>

              <Card.Body pb="3" pt="3">
                <HStack gap="6" align="flex-start">
                  <Stat.Root size="lg">
                    <Stat.Label>
                      Status
                      <Icon>
                        <LuTag />
                      </Icon>
                    </Stat.Label>
                    <Stat.ValueText>{application.currentStatus}</Stat.ValueText>
                    <Stat.HelpText>Current stage</Stat.HelpText>
                  </Stat.Root>
                  <Stat.Root size="lg">
                    <Stat.Label>
                      Days Since
                      <Icon as={LuCalendar} />
                    </Stat.Label>
                    <Stat.ValueText>
                      {application.statusEvents[0]?.date
                        ? Math.floor(
                            (Date.now() - new Date(application.statusEvents[0].date).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : 'N/A'}
                    </Stat.ValueText>
                    <Stat.HelpText>Since first applied</Stat.HelpText>
                  </Stat.Root>
                  <Stat.Root size="lg">
                    <Stat.Label>
                      Updates
                      <Icon as={LuRefreshCw} />
                    </Stat.Label>
                    <Stat.ValueText>{application.statusEvents.length}</Stat.ValueText>
                    <Stat.HelpText>Total status changes</Stat.HelpText>
                  </Stat.Root>
                  <Stat.Root size="lg">
                    <Stat.Label>
                      Location
                      <Icon as={LuMapPin} />
                    </Stat.Label>
                    <Stat.ValueText fontSize="lg" truncate maxW="160px">
                      {listing && 'location' in listing && listing.location
                        ? listing.location
                        : 'N/A'}
                    </Stat.ValueText>
                    <Stat.HelpText>Role location</Stat.HelpText>
                  </Stat.Root>
                </HStack>
                <VStack gap="3" pt="8" pb="2">
                  <VStack gap="1" align="stretch" w="full">
                    <Text fontSize="xs" fontWeight="semibold" color="fg.muted">
                      Match Score
                    </Text>
                    <SegmentedGauge
                      percent={Math.random()}
                      showPercentage
                      layout="block"
                      size="xl"
                    />
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </GridItem>

          {/* Funnel: spans 2 cols, row 3 (bottom right) */}
          <GridItem colSpan={2} rowSpan={1} minH="0">
            <Card.Root h="full" display="flex" flexDir="column">
              <Card.Header pb="2">
                <VStack gap="0" align="stretch">
                  <Heading size="sm">Application Pipeline</Heading>
                  <Text fontSize="xs" color="fg.muted">
                    How applicants progress through each stage of this hiring process
                  </Text>
                </VStack>
              </Card.Header>
              <Card.Body flex="1" minH="0">
                <ApplicationFunnel currentStatus={application.currentStatus} />
              </Card.Body>
            </Card.Root>
          </GridItem>

          {/* Resume: col 3, row 2 */}
          <GridItem colSpan={1} rowSpan={1} minH="0">
            <Card.Root
              h="full"
              display="flex"
              flexDir="column"
              overflow="hidden"
              cursor="pointer"
              onClick={() => navigate(`/resume/${resume.id}`)}
            >
              <ResumePreviewCard template={template} sections={resume.sections} profile={profile} />
              <Card.Body gap="2">
                <HStack justify="space-between" align="flex-start">
                  <Card.Title>Resume</Card.Title>
                  <Icon as={LuArrowUpRight} size="lg" color="fg.muted" flexShrink={0} />
                </HStack>
                <Card.Description>Submitted for this position</Card.Description>
              </Card.Body>
            </Card.Root>
          </GridItem>

          {/* Cover Letter: col 4, row 2 */}
          <GridItem colSpan={1} rowSpan={1} minH="0">
            <Card.Root
              h="full"
              display="flex"
              flexDir="column"
              overflow="hidden"
              cursor="pointer"
              onClick={() => navigate(`/resume/${resume.id}`)}
            >
              <ResumePreviewCard template={template} sections={resume.sections} profile={profile} />
              <Card.Body gap="2">
                <HStack justify="space-between" align="flex-start">
                  <Card.Title>Cover Letter</Card.Title>
                  <Icon as={LuArrowUpRight} size="lg" color="fg.muted" flexShrink={0} />
                </HStack>
                <Card.Description>Tailored for this role</Card.Description>
              </Card.Body>
            </Card.Root>
          </GridItem>
        </Grid>
      </VStack>

      <CreateApplicationModal open={open} onOpenChange={setOpen} />
      <StatusEventModal />
    </StatusEventProvider>
  );
});

export { ApplicationsPageContent as ApplicationsPage };
