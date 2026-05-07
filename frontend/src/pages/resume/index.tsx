import { Box, Splitter, Text, VStack } from '@chakra-ui/react';
import { useParams } from 'react-router';

import { ContentQualityChart } from '@/components/custom/content-quality-chart';
import { SegmentedGauge } from '@/components/custom/segmented-gauge';
import { SkillsComparison } from '@/pages/resume/SkillsComparison';

import { Editor } from './editor';
import { Preview } from './preview';

export function ResumePage() {
  // Get listingId and applicationId from URL params if available
  const { listingId: listingParam, applicationId: applicationParam } = useParams<{
    listingId?: string;
    applicationId?: string;
  }>();
  // TODO: WTH is this
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = listingParam ?? urlParams.get('listingId') ?? '';
  const applicationId = applicationParam ?? urlParams.get('applicationId') ?? '';

  return (
    <Splitter.Root
      panels={[
        { id: 'editor', minSize: 20 },
        { id: 'preview', minSize: 20 },
        { id: 'graphs', minSize: 15 },
      ]}
      defaultSize={[30, 40, 30]}
    >
      <Splitter.Panel id="editor">
        <Editor />
      </Splitter.Panel>
      <Splitter.ResizeTrigger id="editor:preview" />
      <Splitter.Panel id="preview">
        <Preview />
      </Splitter.Panel>
      <Splitter.ResizeTrigger id="preview:graphs" />
      {/* TODO: Put graphs in a tab behind editor instead of on a split panel */}
      <Splitter.Panel id="graphs">
        <VStack align="stretch" gap="md" p="md" h="full" overflowY="auto">
          {/* Match Score Gauge */}
          <Box borderRadius="md" p="md">
            <VStack align="stretch" gap="xs">
              <Text textStyle="sm" color="fg.muted">
                Match Score
              </Text>
              <SegmentedGauge percent={Math.random()} />
            </VStack>
          </Box>

          {/* Skills Radar */}
          <Box borderRadius="md" p="md" flex="1" minW="0" overflowY="auto">
            <VStack align="stretch" gap="xs" h="full">
              <Text textStyle="sm" color="fg.muted">
                Skills Radar
              </Text>
              <Box flex="1" minH="0">
                <SkillsComparison applicationId={applicationId} listingId={listingId} />
              </Box>
            </VStack>
          </Box>

          {/* Content Quality */}
          <Box borderRadius="md" p="md" flex="1" minW="0" overflowY="auto">
            <VStack align="stretch" gap="xs" h="full">
              <Text textStyle="sm" color="fg.muted">
                Content Quality
              </Text>
              <Box flex="1" minH="0">
                <ContentQualityChart />
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Splitter.Panel>
    </Splitter.Root>
  );
}
