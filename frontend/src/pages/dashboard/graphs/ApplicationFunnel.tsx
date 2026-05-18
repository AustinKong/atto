import { Box, Heading, Text } from '@chakra-ui/react';
import { ResponsiveSankey, svgDefaultProps as sankeySvgDefaultProps } from '@nivo/sankey';

import { NivoTooltipPortalLayer } from '@/components/custom/nivo-tooltip-portal';
import { nivoTheme } from '@/components/theme/nivo.theme';
import type { ApplicationFunnel } from '@/types/stats.types';

import { getApplicationStatusChartColor } from './status-colors.utils';
import { formatStatusLabel } from './status-label.utils';

export function ApplicationFunnelChart({ funnel }: { funnel: ApplicationFunnel }) {
  return (
    <Box bg="bg.panel" border="subtle" borderRadius="md" p="sm" h="md">
      <Heading textStyle="title-sm" mb="sm">
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
          layers={[...sankeySvgDefaultProps.layers, NivoTooltipPortalLayer]}
          linkOpacity={0.3}
          linkHoverOpacity={0.5}
          linkBlendMode="normal"
          enableLinkGradient
          theme={nivoTheme}
          animate={false}
        />
      ) : (
        <Text textStyle="caption">No funnel data in this date range.</Text>
      )}
    </Box>
  );
}
