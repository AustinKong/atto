import { Text, useToken, VStack } from '@chakra-ui/react';
import { ResponsiveBoxPlot } from '@nivo/boxplot';

import { nivoChartColors, nivoTheme } from '@/components/theme/nivo.theme';
import type { Listing, ListingResearch } from '@/types/listing.types';
import { formatSalary } from '@/utils/formatters/listing.formatters';

import { Section } from '../Section';

function filterTickValues(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const range = sorted[sorted.length - 1] - sorted[0];
  const threshold = range * 0.2;
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
  salaryRange,
  listingSalary,
}: {
  salaryRange?: ListingResearch['salary'];
  listingSalary: Listing['salary'];
}) {
  const [fgToken] = useToken('colors', ['fg']);

  if (!salaryRange) {
    return (
      <Section title="Salary Range">
        <Text color="fg.muted">No salary data available for this listing.</Text>
      </Section>
    );
  }

  const allValues = [
    salaryRange.industryMin,
    salaryRange.industryMax,
    ...(listingSalary ? [listingSalary.value] : []),
  ];
  const minValue = Math.min(...allValues) * 0.97;
  const maxValue = Math.max(...allValues) * 1.03;

  return (
    <Section title="Salary Range">
      <VStack align="stretch" h="24">
        <ResponsiveBoxPlot
          animate={false}
          isInteractive={false}
          data={[
            { group: 'Industry', value: salaryRange.industryMin, subgroup: 'min' },
            { group: 'Industry', value: salaryRange.industryQ1, subgroup: 'q1' },
            { group: 'Industry', value: salaryRange.industryMedian, subgroup: 'median' },
            { group: 'Industry', value: salaryRange.industryQ3, subgroup: 'q3' },
            { group: 'Industry', value: salaryRange.industryMax, subgroup: 'max' },
          ]}
          layout="horizontal"
          minValue={minValue}
          maxValue={maxValue}
          margin={{ top: 30, right: 10, bottom: 30, left: 10 }}
          axisBottom={{
            tickSize: 4,
            tickPadding: 4,
            tickRotation: 0,
            tickValues: filterTickValues([
              salaryRange.industryMin,
              salaryRange.industryQ1,
              salaryRange.industryMedian,
              salaryRange.industryQ3,
              salaryRange.industryMax,
              ...(listingSalary ? [listingSalary.value] : []),
            ]),
            format: (v) =>
              formatSalary({ value: v as number, currency: salaryRange.currency }, 'short'),
          }}
          enableGridX={true}
          medianColor={fgToken}
          theme={{ ...nivoTheme, translation: {} }}
          colors={nivoChartColors}
          markers={[
            ...(listingSalary
              ? [
                  {
                    axis: 'x' as const,
                    value: listingSalary.value,
                    lineStyle: {
                      stroke: fgToken,
                    },
                    legend: 'Listed',
                    legendPosition: 'top' as const,
                    legendOrientation: 'horizontal' as const,
                    textStyle: {
                      fill: fgToken,
                    },
                  },
                ]
              : []),
          ]}
        />
      </VStack>
      <Text color="fg.muted">
        {listingSalary && `Listed salary: ${formatSalary(listingSalary, 'short')}. `}
        {`Industry range: ${formatSalary({ value: salaryRange.industryMin, currency: salaryRange.currency }, 'short')}-${formatSalary({ value: salaryRange.industryMax, currency: salaryRange.currency }, 'short')} (median ${formatSalary(
          { value: salaryRange.industryMedian, currency: salaryRange.currency },
          'short'
        )})`}
      </Text>
    </Section>
  );
}
