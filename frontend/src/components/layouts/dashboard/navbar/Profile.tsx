import { Avatar, DataList, Heading, Menu, Portal, VStack } from '@chakra-ui/react';

export function Profile() {
  return (
    <Menu.Root positioning={{ placement: 'bottom-end' }}>
      <Menu.Trigger
        as="button"
        rounded="full"
        cursor="pointer"
        aria-haspopup="menu"
        aria-label="Open user menu"
        aria-controls="user-menu"
      >
        <Avatar.Root size="sm">
          <Avatar.Fallback name="User" />
          <Avatar.Image alt="" src="https://api.dicebear.com/9.x/notionists-neutral/svg?seed=Leo" />
        </Avatar.Root>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content id="user-menu" minW="70" aria-labelledby="user-menu-heading">
            <TokenCounter />
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

function TokenCounter() {
  // Dummy values
  const totalTokens = 1000;
  const remainingTokens = 150;

  return (
    <VStack px="3" py="2" align="stretch" gap="2">
      <Heading id="user-menu-heading" size="sm">
        OpenAI Tokens
      </Heading>
      <DataList.Root size="md" orientation="horizontal" gap="1">
        <DataList.Item>
          <DataList.ItemLabel>Total</DataList.ItemLabel>
          <DataList.ItemValue>{totalTokens.toLocaleString()}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Remaining</DataList.ItemLabel>
          <DataList.ItemValue>{remainingTokens.toLocaleString()}</DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>
    </VStack>
  );
}
