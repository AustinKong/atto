import { Box, Heading, Text } from '@chakra-ui/react';
import { ResponsiveSankey } from '@nivo/sankey';

import { nivoTheme } from '@/components/theme/nivo.theme';
import type { ApplicationFunnel } from '@/types/stats.types';

import { getApplicationStatusChartColor } from './status-colors.utils';
import { formatStatusLabel } from './status-label.utils';

export function ApplicationFunnelChart({ funnel }: { funnel: ApplicationFunnel }) {
  return (
    <Box border="subtle" borderRadius="md" p="sm" h="md">
      <Heading size="sm" mb="sm">
        Application Funnel
      </Heading>
      {funnel.links.length > 0 ? (
        <ResponsiveSankey
          data={funnel}
          margin={{ top: 20, right: 10, bottom: 50, left: 10 }}
          align="justify"
          colors={getApplicationStatusChartColor}
          nodeOpacity={1}
          nodeBorderWidth={0}
          label={(node) => formatStatusLabel(String(node.id))}
          labelTextColor={{ theme: 'labels.text.fill' }}
          sort="descending"
          linkOpacity={0.6}
          linkHoverOpacity={0.8}
          linkBlendMode="normal"
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
