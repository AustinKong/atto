import { HStack, Spacer, Text } from '@chakra-ui/react';

import { FeatureTooltip } from '@/components/custom/feature-tooltip';

export function Footer({
  selectedCount,
  totalCount,
}: {
  selectedCount: number;
  totalCount: number;
}) {
  return (
    <HStack
      borderTop="subtle"
      px="md"
      py="xs"
      justify="space-between"
      align="center"
      textStyle="caption"
    >
      <Text textStyle="caption">
        {selectedCount} of {totalCount} selected
      </Text>
      <Spacer />

      <FeatureTooltip hasCloud={false} hasApiKey={true} size="2xs" />
    </HStack>
  );
}
