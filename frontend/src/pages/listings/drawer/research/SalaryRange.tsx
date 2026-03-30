import { Text, VStack } from '@chakra-ui/react';
import { ResponsiveBoxPlot } from '@nivo/boxplot';

import { nivoChartColors, nivoTheme } from '@/components/theme/nivo.theme';
import type { Listing, ListingResearch } from '@/types/listing.types';
import { formatSalary } from '@/utils/formatters/listing.formatters';

import { Section } from '../Section';

function filterTickValues(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const range = sorted[sorted.length - 1] - sorted[0];
  const threshold = range * 0.08;
  const kept: number[] = [];
  for (const v of sorted) {
    if (kept.every((k) => Math.abs(k - v) >= threshold)) {
      kept.push(v);
    }
  }
  return kept;
}

// FIXME: Bug where ticker numbers are hidden if listedSalary is not null?? TBC
export function SalaryRange({
  salary,
  listingSalary,
}: {
  salary: ListingResearch['salary'];
  listingSalary: Listing['salary'];
}) {
  return (
    <Section title="Salary Range">
      <VStack align="stretch" h="24">
        <ResponsiveBoxPlot
          animate={false}
          isInteractive={false}
          data={[
            { group: 'Industry', value: salary.industryMin, subgroup: 'min' },
            { group: 'Industry', value: salary.industryQ1, subgroup: 'q1' },
            { group: 'Industry', value: salary.industryMedian, subgroup: 'median' },
            { group: 'Industry', value: salary.industryQ3, subgroup: 'q3' },
            { group: 'Industry', value: salary.industryMax, subgroup: 'max' },
          ]}
          layout="horizontal"
          margin={{ top: 10, right: 10, bottom: 30, left: 10 }}
          axisBottom={{
            tickSize: 4,
            tickPadding: 4,
            tickRotation: 0,
            tickValues: filterTickValues([
              salary.industryMin,
              salary.industryQ1,
              salary.industryMedian,
              salary.industryQ3,
              salary.industryMax,
              ...(listingSalary ? [listingSalary.value] : []),
            ]),
            format: (v) => formatSalary({ value: v as number, currency: salary.currency }, 'short'),
          }}
          theme={{ ...nivoTheme, translation: {} }}
          colors={nivoChartColors}
          markers={[
            {
              axis: 'x',
              value: salary.industryMedian,
              lineStyle: { stroke: 'var(--chakra-colors-fg)', strokeWidth: 1.5 },
              legend: 'Median',
              legendPosition: 'top',
              legendOrientation: 'horizontal',
            },
            ...(listingSalary
              ? [
                  {
                    axis: 'x' as const,
                    value: listingSalary.value,
                    lineStyle: {
                      stroke: 'var(--chakra-colors-blue-400)',
                      strokeWidth: 2,
                      strokeDasharray: '4 3',
                    },
                    legend: 'Listed',
                    legendPosition: 'top' as const,
                    legendOrientation: 'horizontal' as const,
                  },
                ]
              : []),
          ]}
        />
      </VStack>
      <Text color="fg.muted">
        {listingSalary && `Listed salary: ${formatSalary(listingSalary, 'short')}. `}
        {`Industry range: ${formatSalary({ value: salary.industryMin, currency: salary.currency }, 'short')}-${formatSalary({ value: salary.industryMax, currency: salary.currency }, 'short')} (median ${formatSalary(
          { value: salary.industryMedian, currency: salary.currency },
          'short'
        )})`}
      </Text>
    </Section>
  );
}
