import { Box, Splitter, Text, VStack } from '@chakra-ui/react';

import { ContentQualityChart } from '@/components/custom/content-quality-chart';
import { SegmentedGauge } from '@/components/custom/segmented-gauge';
import { SkillsComparison } from '@/pages/applications/SkillsComparison';

import { Editor } from './editor';
import { Preview } from './preview';

export function ResumePage() {
  // Get listingId and applicationId from URL params if available
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('listingId') || '';
  const applicationId = urlParams.get('applicationId') || '';

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
      <Splitter.Panel id="graphs">
        <VStack align="stretch" gap="4" p="4" h="full" overflowY="auto">
          {/* Match Score Gauge */}
          <Box borderRadius="md" p="4">
            <VStack align="stretch" gap="2">
              <Text textStyle="sm" color="fg.muted">
                Match Score
              </Text>
              <SegmentedGauge percent={Math.random()} />
            </VStack>
          </Box>

          {/* Skills Radar */}
          <Box borderRadius="md" p="4" flex="1" minW="0" overflowY="auto">
            <VStack align="stretch" gap="2" h="full">
              <Text textStyle="sm" color="fg.muted">
                Skills Radar
              </Text>
              <Box flex="1" minH="0">
                <SkillsComparison applicationId={applicationId} listingId={listingId} />
              </Box>
            </VStack>
          </Box>

          {/* Content Quality */}
          <Box borderRadius="md" p="4" flex="1" minW="0" overflowY="auto">
            <VStack align="stretch" gap="2" h="full">
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
