import { Box, Text } from '@chakra-ui/react';
import { ResponsiveBar } from '@nivo/bar';

import { nivoChartColors, nivoTheme } from '@/components/theme/nivo.theme';

type ContentQualityDatum = {
  section: string;
  'signal (high)': number;
  'signal (low)': number;
  neutral: number;
  noise: number;
  'noise (high)': number;
  chars: number;
};

type ContentQualityChartProps = {
  data?: ContentQualityDatum[];
};

// Generate diverging data based on character count
// Simulates content quality with signal, neutral, and noise split
// Values sum to the character count to make bar length proportional
// TODO: RN thses are in characters. assuming data will come in  grouped by sections with total char count per section, and % of low, neutral, high etc.
// then calcualte these chars as % x char count
const mockData: ContentQualityDatum[] = [
  {
    section: 'Summary',
    'signal (high)': 182,
    'signal (low)': 156,
    neutral: 104,
    noise: 52,
    'noise (high)': 26,
    chars: 520,
  },
  {
    section: 'Experience',
    'signal (high)': 496,
    'signal (low)': 397,
    neutral: 186,
    noise: 93,
    'noise (high)': 62,
    chars: 1240,
  },
  {
    section: 'Skills',
    'signal (high)': 170,
    'signal (low)': 136,
    neutral: 17,
    noise: 10,
    'noise (high)': 7,
    chars: 340,
  },
  {
    section: 'Education',
    'signal (high)': 114,
    'signal (low)': 114,
    neutral: 95,
    noise: 38,
    'noise (high)': 19,
    chars: 380,
  },
  {
    section: 'Projects',
    'signal (high)': 373,
    'signal (low)': 320,
    neutral: 89,
    noise: 67,
    'noise (high)': 40,
    chars: 890,
  },
];

export const ContentQualityChart = ({ data = mockData }: ContentQualityChartProps) => {
  // Transform data to make noise values negative for diverging chart
  const transformedData = data.map((item) => ({
    section: item.section,
    'signal (high)': item['signal (high)'],
    'signal (low)': item['signal (low)'],
    neutral: item.neutral,
    noise: -item['noise'],
    'noise (high)': -item['noise (high)'],
    chars: item.chars,
  }));

  return (
    <Box w="full" h="full" display="flex" flexDirection="column">
      <Text fontWeight="bold" fontSize="sm" mb="xs">
        Content Quality
      </Text>
      <Box flex="1" w="full" position="relative">
        <ResponsiveBar
          data={transformedData}
          indexBy="section"
          keys={['noise (high)', 'noise', 'neutral', 'signal (low)', 'signal (high)']}
          layout="horizontal"
          margin={{ top: 10, right: 80, bottom: 30, left: 10 }}
          padding={0.3}
          valueScale={{ type: 'linear', nice: true, round: false, min: -200, max: 1100 }}
          enableGridX={true}
          enableGridY={false}
          animate={false}
          colors={nivoChartColors}
          valueFormat={(value: number) => `${Math.abs(Math.round(value))}`}
          labelTextColor="inherit:darker(1.2)"
          labelSkipWidth={40}
          labelSkipHeight={16}
          axisTop={{
            tickSize: 0,
            tickPadding: 12,
            format: (v: number) => `${Math.abs(Math.round(v))}`,
          }}
          axisBottom={{
            tickSize: 0,
            tickPadding: 12,
            format: (v: number) => `${Math.abs(Math.round(v))}`,
          }}
          axisLeft={null}
          axisRight={{
            tickSize: 0,
            tickPadding: 8,
          }}
          tooltip={({ id, value }) => (
            <Box
              bg="bg.panel"
              color="fg"
              px="xs"
              py="2xs"
              borderRadius="sm"
              fontSize="xs"
              fontWeight="bold"
              border="muted"
            >
              {id}: {Math.abs(Math.round(value))}
            </Box>
          )}
          motionConfig="stiff"
          theme={nivoTheme}
          markers={[
            {
              axis: 'y',
              value: 0,
              lineStyle: { stroke: 'var(--chakra-colors-fg-muted)', strokeWidth: 1 },
            } as const,
          ]}
        />
      </Box>
    </Box>
  );
};
