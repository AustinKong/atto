import { Box, Heading, VStack } from '@chakra-ui/react';
import { ResponsiveRadar } from '@nivo/radar';
import { memo } from 'react';

import { nivoChartColors, nivoTheme } from '@/components/theme/nivo.theme';

interface SkillComparisonProps {
  applicationId: string;
  listingId: string;
}

// Mock data: 8 skills with user vs required values
const mockSkillsData = [
  { skill: 'React', user: 85, required: 90 },
  { skill: 'TypeScript', user: 75, required: 85 },
  { skill: 'Node.js', user: 70, required: 80 },
  { skill: 'SQL', user: 65, required: 75 },
  { skill: 'CSS/Styling', user: 80, required: 70 },
  { skill: 'Testing', user: 60, required: 75 },
  { skill: 'System Design', user: 55, required: 85 },
  { skill: 'Communication', user: 88, required: 80 },
];

export const SkillsComparison = memo(function SkillsComparison(_props: SkillComparisonProps) {
  return (
    <VStack align="stretch" gap="1" h="full" minH="0">
      <Heading size="sm">Skills Comparison</Heading>
      <Box flex="1" minH="0" w="full">
        <ResponsiveRadar
          data={mockSkillsData}
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
    </VStack>
  );
});
