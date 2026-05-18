import { Box, HStack, Text, Wrap } from '@chakra-ui/react';

import type { StatusEnum } from '@/types/application.types';

import { getApplicationStatusColor } from './status-colors.utils';
import { formatStatusLabel } from './status-label.utils';

export function ApplicationStatusLegend({ statuses }: { statuses: StatusEnum[] }) {
  if (statuses.length === 0) {
    return null;
  }

  return (
    <Wrap align="center" justify="center" gap="md" px="sm">
      {statuses.map((status) => (
        <HStack key={status} gap="xs" minW="fit-content">
          <Box
            aria-hidden
            bg={getApplicationStatusColor(status)}
            borderRadius="xs"
            flex="0 0 auto"
            h="2.5"
            w="2.5"
          />
          <Text textStyle="caption">{formatStatusLabel(status)}</Text>
        </HStack>
      ))}
    </Wrap>
  );
}
