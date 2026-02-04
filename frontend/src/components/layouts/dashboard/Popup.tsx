import { Button, CloseButton, Dialog, Image, Portal, Text, useDisclosure } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { Link } from 'react-router';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { releaseNotesQueries } from '@/queries/releaseNotes';
import { getCurrentVersion } from '@/services/releaseNotes';
import { compareSemVer } from '@/utils/text';

export function Popup() {
  const [hideReleaseNotesVersion, setHideReleaseNotesVersion] = useLocalStorage(
    'hide-release-notes-version',
    '0.0.0'
  );

  const { data: latestVersion } = useSuspenseQuery(releaseNotesQueries.latestVersion());
  const currentVersion = getCurrentVersion();

  const hasUpdates = compareSemVer(latestVersion, currentVersion) > 0;
  const shouldShowPopup = compareSemVer(latestVersion, hideReleaseNotesVersion) > 0;

  const { open, setOpen } = useDisclosure({ defaultOpen: true });
  const viewReleaseNotesButton = useRef(null);

  return (
    <Dialog.Root
      lazyMount
      open={open && shouldShowPopup}
      onOpenChange={(details: { open: boolean }) => setOpen(details.open)}
      placement="center"
      initialFocusEl={() => viewReleaseNotesButton.current}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content overflow="hidden" borderRadius="2xl">
            {/* TODO: Change to not infringe on copyright */}
            <Image
              src="https://i.pinimg.com/1200x/cd/32/d7/cd32d79a5f70325ab5d568cd73d557ea.jpg"
              aspectRatio={3 / 1}
            />
            <Dialog.Header>
              <Dialog.Title textStyle="2xl">
                {hasUpdates ? `Update available: v${latestVersion}` : `You're up to date`}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                {hasUpdates
                  ? "A new release is available, view the release notes to learn what's new."
                  : `You're running the latest version (v${currentVersion}), view the release notes to learn what's changed.`}
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={() => {
                  setHideReleaseNotesVersion(latestVersion);
                  setOpen(false);
                }}
              >
                Don't show again
              </Button>
              <Button ref={viewReleaseNotesButton} asChild>
                <Link to={`/release-notes/${latestVersion}`}>View Release Notes</Link>
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" variant="plain" color="black" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
