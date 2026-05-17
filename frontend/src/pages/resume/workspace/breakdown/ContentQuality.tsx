import { Box, Heading, HStack, IconButton, Text, useDisclosure, VStack } from '@chakra-ui/react';
import { ResponsiveBar, svgDefaultProps as barSvgDefaultProps } from '@nivo/bar';
import { BasicTooltip } from '@nivo/tooltip';
import { LuEye, LuEyeOff } from 'react-icons/lu';

import { NivoTooltipPortalLayer } from '@/components/custom/nivo-tooltip-portal';
import type { ResumeHighlight } from '@/components/custom/resume-preview';
import { nivoTheme } from '@/components/theme/nivo.theme';
import { RESUME_HIGHLIGHT_LAYERS } from '@/pages/resume/highlight-layers.constants';
import { useResumeHighlight } from '@/pages/resume/highlightContext';
import type { ContentQualitySection } from '@/types/application.types';
import type { Section } from '@/types/resume.types';
import {
  colorForContentQualityKey,
  type ContentQualityDatum,
  countContentQualityCategories,
  getContentQualityCategory,
  getContentQualityMaxMagnitude,
  labelForContentQualityKey,
} from '@/utils/content-quality.utils';
import { isUnitOutdated } from '@/utils/hash.utils';

const CONTENT_QUALITY_KEYS: Array<keyof Omit<ContentQualityDatum, 'section'>> = [
  'lowNoise',
  'highNoise',
  'neutral',
  'lowSignal',
  'highSignal',
];

export function ContentQuality({
  contentQuality,
  resumeSections,
  unitHashesById,
}: {
  contentQuality: ContentQualitySection[] | null;
  resumeSections: Section[];
  unitHashesById: Record<string, string>;
}) {
  const { highlight, clear } = useResumeHighlight();
  const { open: showHighlights, onOpen, onClose } = useDisclosure();
  const hasData = Boolean(contentQuality && contentQuality.length > 0);

  function handleToggleHighlights() {
    if (showHighlights) {
      onClose();
      clear(RESUME_HIGHLIGHT_LAYERS.contentQuality);
    } else {
      onOpen();
      highlight(
        RESUME_HIGHLIGHT_LAYERS.contentQuality,
        getContentQualityHighlights(contentQuality)
      );
    }
  }

  if (!hasData) {
    return (
      <VStack align="stretch" gap="2xs" flexGrow={3} flexShrink={1} flexBasis="72" minW="60">
        <Heading size="sm">Content Quality</Heading>
        <Text textStyle="sm" color="fg.muted">
          Generate analysis to see content quality.
        </Text>
      </VStack>
    );
  }

  const sectionTitleById = new Map(
    resumeSections.map((section) => [section.id, section.title.content || section.id])
  );

  const data: ContentQualityDatum[] = (contentQuality ?? []).map((section) => {
    const counts = countContentQualityCategories(section);
    const isOutdated = section.scores.some((row) =>
      isUnitOutdated(row.unitHash, unitHashesById[row.unitId])
    );
    const sectionTitle = sectionTitleById.get(section.sectionId) ?? section.sectionId;

    return {
      section: isOutdated ? `${sectionTitle} (Outdated)` : sectionTitle,
      highSignal: counts.highSignal,
      neutral: counts.neutral,
      lowSignal: counts.lowSignal,
      lowNoise: -counts.lowNoise,
      highNoise: -counts.highNoise,
    };
  });
  const maxMagnitude = getContentQualityMaxMagnitude(data);

  return (
    <VStack align="stretch" gap="2xs" flexGrow={3} flexShrink={1} flexBasis="72" minW="60">
      <HStack justify="space-between" align="center">
        <Heading size="sm">Content Quality</Heading>
        <IconButton
          size="xs"
          aria-label={showHighlights ? 'Hide highlights' : 'Show highlights'}
          onClick={handleToggleHighlights}
          variant="ghost"
        >
          {showHighlights ? <LuEyeOff /> : <LuEye />}
        </IconButton>
      </HStack>
      <Box w="full" position="relative" h="2xs">
        <ResponsiveBar
          data={data}
          indexBy="section"
          keys={CONTENT_QUALITY_KEYS}
          layout="horizontal"
          margin={{ top: 10, right: 16, bottom: 30, left: 120 }}
          padding={0.28}
          valueScale={{
            type: 'linear',
            min: -maxMagnitude,
            max: maxMagnitude,
            nice: false,
            round: false,
          }}
          enableGridX
          enableGridY={false}
          animate={false}
          colors={({ id }) => colorForContentQualityKey(String(id))}
          valueFormat={(value: number) => `${Math.abs(Math.round(value))}`}
          labelTextColor="inherit:darker(1.2)"
          labelSkipWidth={40}
          labelSkipHeight={16}
          layers={[...barSvgDefaultProps.layers, NivoTooltipPortalLayer]}
          axisTop={null}
          axisBottom={null}
          axisLeft={{
            tickSize: 0,
            tickPadding: 8,
          }}
          axisRight={null}
          tooltip={({ id, value }) => (
            <BasicTooltip
              id={`${labelForContentQualityKey(String(id))}: ${Math.abs(Math.round(value))}`}
            />
          )}
          motionConfig="stiff"
          theme={nivoTheme}
          markers={[
            {
              axis: 'x',
              value: 0,
              lineStyle: { stroke: 'var(--chakra-colors-fg-muted)', strokeWidth: 1 },
            } as const,
          ]}
        />
      </Box>
    </VStack>
  );
}

function getContentQualityHighlights(sections: ContentQualitySection[] | null): ResumeHighlight[] {
  if (!sections || sections.length === 0) {
    return [];
  }

  const highlights: ResumeHighlight[] = [];
  const addUnits = (unitIds: string[], style: Pick<ResumeHighlight, 'color'>) => {
    for (const unitId of unitIds) {
      highlights.push({ unitId, ...style });
    }
  };

  for (const section of sections) {
    for (const row of section.scores) {
      const category = getContentQualityCategory(row.score);
      if (category === 'highSignal') {
        addUnits([row.unitId], { color: 'green.emphasized' });
      } else if (category === 'lowSignal') {
        addUnits([row.unitId], { color: 'green.solid' });
      } else if (category === 'neutral') {
        addUnits([row.unitId], { color: 'transparent' });
      } else if (category === 'lowNoise') {
        addUnits([row.unitId], { color: 'red.emphasized' });
      } else {
        addUnits([row.unitId], { color: 'red.solid' });
      }
    }
  }

  return highlights;
}
