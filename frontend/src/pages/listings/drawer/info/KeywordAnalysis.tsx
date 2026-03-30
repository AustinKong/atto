import { Box, Text } from '@chakra-ui/react';
import { ResponsiveTreeMap } from '@nivo/treemap';

import { nivoChartColors, nivoTheme } from '@/components/theme/nivo.theme';
import type { Listing } from '@/types/listing.types';

import { Section } from '../Section';

export function KeywordAnalysis({ listing }: { listing: Listing }) {
  return (
    <Section title="Keyword Analysis">
      {listing.keywords.length > 0 ? (
        <Box h="sm" overflow="hidden" p="2xs">
          <ResponsiveTreeMap
            data={{
              id: 'root',
              children: listing.keywords.map((kw) => ({ id: kw.word, value: kw.count })),
            }}
            enableParentLabel={false}
            label={(node) => {
              const id = String(node.id);
              return id.length > 9 ? id.slice(0, 8) + '…' : id;
            }}
            nodeOpacity={1}
            colorBy="id"
            theme={nivoTheme}
            colors={nivoChartColors}
            animate={false}
          />
        </Box>
      ) : (
        <Text color="fg.muted">No keyword analysis available for this listing.</Text>
      )}
    </Section>
  );
}
