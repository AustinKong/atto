import { HStack, Icon, Spinner, Text } from '@chakra-ui/react';
import { PiCheck } from 'react-icons/pi';

export function Footer({
  selectedCount,
  totalCount,
  pendingCount,
}: {
  selectedCount: number;
  totalCount: number;
  pendingCount: number;
}) {
  return (
    <HStack
      borderTop="subtle"
      px="md"
      py="xs"
      justify="space-between"
      align="center"
      textStyle="caption"
      bgColor="bg.subtle"
    >
      <Text textStyle="caption">
        {selectedCount} of {totalCount} selected
      </Text>

      <Text textStyle="caption" textAlign="center">
        AI can make mistakes, double-check everything
      </Text>

      <HStack align="center">
        {pendingCount > 0 ? (
          <>
            <Spinner size="xs" mb="2xs" />
            <Text textStyle="caption">{pendingCount} listings pending</Text>
          </>
        ) : (
          <>
            <Icon mb="2xs">
              <PiCheck />
            </Icon>
            <Text textStyle="caption">No actions pending</Text>
          </>
        )}
      </HStack>
    </HStack>
  );
}
