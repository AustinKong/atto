import { Avatar, Heading, Menu, Portal, Text, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { useAuth } from '@/hooks/use-auth.hooks';
import { useExitPaperMode } from '@/mutations/paper-mode.mutations';
import { settingsQueries } from '@/queries/setting.queries';

export function Profile() {
  const navigate = useNavigate();
  const { signOut, accessMode, user, exitGuestMode } = useAuth();
  const { data: settings } = useSuspenseQuery(settingsQueries.list());
  const isPaperMode = Boolean(settings.paper?.fields.enabled?.value);
  const exitPaperModeMutation = useExitPaperMode(async () => {
    exitGuestMode();
    navigate('/auth');
  });

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
          <Menu.Content id="user-menu" minW="44" maxW="64" aria-label="User menu">
            {isPaperMode && <PaperModeNotice />}
            {accessMode === 'signed_in' ? (
              <Menu.Item value="logout" onClick={() => signOut()}>
                Logout
              </Menu.Item>
            ) : isPaperMode ? (
              <Menu.Item
                value="exit-paper-mode"
                onClick={() => exitPaperModeMutation.mutate()}
                disabled={exitPaperModeMutation.isPending}
              >
                Exit Paper Mode
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

function PaperModeNotice() {
  return (
    <VStack px="sm" py="xs" align="stretch" gap="xs">
      <Heading textStyle="title-sm">Paper Mode</Heading>
      <Text color="fg.muted" textStyle="caption">
        You are in paper mode. Any changes made will be wiped when you exit.
      </Text>
    </VStack>
  );
}
