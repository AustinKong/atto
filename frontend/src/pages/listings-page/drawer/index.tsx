import { Center, CloseButton, Spinner, Tabs } from '@chakra-ui/react';

import { useListingQuery } from '@/hooks/listings';

import { Applications } from './applications';
import { Details } from './Details';

export function Drawer({
  onClose,
  selectedListingId,
}: {
  onClose: () => void;
  selectedListingId: string;
}) {
  const { data: listing, refetch } = useListingQuery(selectedListingId);

  if (!listing) {
    return (
      <Center h="full">
        <Spinner size="lg" />
      </Center>
    );
  }

  // TODO: Make fallback to Details if no applications exist
  return (
    <Tabs.Root h="full" display="flex" flexDirection="column" defaultValue="details">
      <Tabs.List borderBottom="none">
        <Tabs.Trigger value="details">Details</Tabs.Trigger>
        <Tabs.Trigger value="applications">Applications</Tabs.Trigger>
        <Tabs.Trigger value="notes">Research</Tabs.Trigger>
        {/* Can use AI to research the company!! + your own notes */}
        <CloseButton position="absolute" right="0" onClick={onClose} variant="plain" />
      </Tabs.List>
      <Tabs.Content value="details" flex="1" overflowY="auto">
        <Details listing={listing} />
      </Tabs.Content>
      <Tabs.Content value="applications" flex="1" overflowY="auto">
        <Applications listing={listing} onRefresh={refetch} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
