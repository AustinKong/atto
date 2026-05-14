import { Box, Heading, Text } from '@chakra-ui/react';
import { ResponsiveSankey } from '@nivo/sankey';

import { nivoChartColors, nivoTheme } from '@/components/theme/nivo.theme';
import type { ApplicationFunnel } from '@/types/stats.types';

import { formatStatusLabel } from './status-label.utils';

type ApplicationFunnelChartProps = {
  funnel: ApplicationFunnel;
};

export function ApplicationFunnelChart({ funnel }: ApplicationFunnelChartProps) {
  return (
    <Box border="subtle" borderRadius="md" p="sm" h="24rem">
      <Heading size="sm" mb="sm">
        Application Funnel
      </Heading>
      {funnel.links.length > 0 ? (
        <ResponsiveSankey
          data={funnel}
          margin={{ top: 20, right: 140, bottom: 20, left: 50 }}
          align="justify"
          colors={nivoChartColors}
          nodeOpacity={1}
          nodeBorderWidth={0}
          label={(node) => formatStatusLabel(String(node.id))}
          labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
          sort="descending"
          linkOpacity={0.4}
          linkHoverOpacity={0.6}
          enableLinkGradient
          theme={nivoTheme}
          animate={false}
        />
      ) : (
        <Text color="fg.muted">No funnel data in this date range.</Text>
      )}
    </Box>
  );
}
