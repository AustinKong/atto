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
      color="fg.muted"
      fontSize="sm"
      bgColor="bg.subtle"
    >
      <Text>
        {selectedCount} of {totalCount} selected
      </Text>

      <Text textAlign="center">AI can make mistakes, double-check everything</Text>

      <HStack align="center">
        {pendingCount > 0 ? (
          <>
            <Spinner size="xs" mb="2xs" />
            <Text>{pendingCount} listings pending</Text>
          </>
        ) : (
          <>
            <Icon mb="2xs">
              <PiCheck />
            </Icon>
            <Text>No actions pending</Text>
          </>
        )}
      </HStack>
    </HStack>
  );
}
