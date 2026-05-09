import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { ResponsiveRadar } from '@nivo/radar';

import { nivoChartColors, nivoTheme } from '@/components/theme/nivo.theme';
import type { SkillComparisonRow } from '@/types/application.types';
// Ensures it looks visually balanced even for low scores
const VISUAL_SCORE_FLOOR = 10;

export function SkillsComparison({ rows }: { rows: SkillComparisonRow[] | null }) {
  const hasData = Boolean(rows && rows.length > 0);
  const radarData = (rows ?? []).map((row) => ({
    skill: row.skill,
    user: Math.max(VISUAL_SCORE_FLOOR, row.resumeScore),
    required: Math.max(VISUAL_SCORE_FLOOR, row.requiredScore),
  }));

  return (
    <VStack align="stretch" gap="2xs" flexGrow={2} flexShrink={1} flexBasis="60" minW="60">
      <Heading size="sm">Skills Comparison</Heading>
      {hasData ? (
        <Box h="2xs">
          <ResponsiveRadar
            data={radarData}
            keys={['user', 'required']}
            indexBy="skill"
            valueFormat=">-.0f"
            margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
            borderColor={{ from: 'color', modifiers: [['darker', 2]] }}
            gridLabelOffset={36}
            dotSize={6}
            dotColor={{ theme: 'background' }}
            dotBorderWidth={2}
            dotBorderColor={{ from: 'color' }}
            motionConfig="wobbly"
            animate={false}
            theme={nivoTheme}
            colors={nivoChartColors}
            legends={[
              {
                anchor: 'top-right',
                direction: 'column',
                translateX: 50,
                translateY: -40,
                itemWidth: 80,
                itemHeight: 20,
                itemTextColor: '#999',
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemTextColor: '#000',
                    },
                  },
                ],
              },
            ]}
            blendMode="normal"
            isInteractive
          />
        </Box>
      ) : (
        <Text textStyle="sm" color="fg.muted">
          Generate analysis to see skills comparison.
        </Text>
      )}
    </VStack>
  );
}
