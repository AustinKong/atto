import { Button, HStack, Spacer } from '@chakra-ui/react';

import { useDiscardListingDrafts } from '@/mutations/listingDrafts';
import { useSaveListings } from '@/mutations/listings';
import type { ListingDraft } from '@/types/listingDraft';

import { useIngestion } from './ingestion-modal';

export function Toolbar({
  rowSelection,
  listingDrafts,
}: {
  rowSelection: Record<string, boolean>;
  listingDrafts: ListingDraft[];
}) {
  const saveListings = useSaveListings();
  const { open } = useIngestion();
  const discardListingDrafts = useDiscardListingDrafts();

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  const handleSaveListings = async () => {
    const selectedListings = listingDrafts.filter((listingDraft) => rowSelection[listingDraft.id]);
    await saveListings(selectedListings);
  };

  const handleDiscardListingDrafts = () => {
    const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
    discardListingDrafts(selectedIds);
  };

  return (
    <HStack
      w="full"
      justifyContent="space-between"
      p="1.5"
      borderBottom="1px solid"
      borderColor="border"
    >
      <Button onClick={() => open()}>Add Listings</Button>

      <Spacer />

      <Button
        onClick={handleDiscardListingDrafts}
        variant="outline"
        colorPalette="red"
        disabled={selectedCount === 0}
      >
        Discard {selectedCount} listings
      </Button>
      <Button onClick={handleSaveListings} disabled={selectedCount === 0}>
        Save {selectedCount} Listings
      </Button>
    </HStack>
  );
}
