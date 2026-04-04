import { Avatar, DataList, Heading, Menu, Portal, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router';

import { useAuth } from '@/hooks/use-auth.hooks';

export function Profile() {
  const navigate = useNavigate();
  const { signOut, isSignedIn, user, exitGuestMode } = useAuth();

  const avatarName = user?.fullName ?? user?.username ?? 'Guest User';
  const avatarSrc = user?.imageUrl;

  function handleLogin() {
    exitGuestMode();
    navigate('/auth');
  }

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
          <Avatar.Fallback name={avatarName} />
          {/* TODO: Check if this is correct pattern in charkaui */}
          {avatarSrc ? <Avatar.Image alt={avatarName} src={avatarSrc} /> : null}
        </Avatar.Root>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content id="user-menu" minW="70" aria-labelledby="user-menu-heading">
            <TokenCounter />
            {isSignedIn ? (
              <Menu.Item value="logout" onClick={() => signOut()}>
                Logout
              </Menu.Item>
            ) : (
              <Menu.Item value="login" onClick={handleLogin}>
                Login
              </Menu.Item>
            )}
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
    <VStack px="sm" py="xs" align="stretch" gap="xs">
      <Heading id="user-menu-heading" size="sm">
        OpenAI Tokens
      </Heading>
      <DataList.Root size="md" orientation="horizontal" gap="2xs">
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
