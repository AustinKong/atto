import { Splitter, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { useListingDraftsQuery } from '@/hooks/listings';
import { useLocalStorage } from '@/hooks/utils/useLocalStorage';

import { Details } from './details';
import { Footer } from './Footer';
import { IngestionModal, IngestionProvider } from './ingestion-modal';
import { Reference } from './reference';
import { HighlightProvider } from './reference/source';
import { Table } from './Table';
import { Toolbar } from './Toolbar';

export function NewListingsPage() {
  const { listingDrafts } = useListingDraftsQuery();
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [splitterSizes, setSplitterSizes] = useLocalStorage(
    'new-listings-splitter-sizes',
    [25, 35, 40]
  );

  const selectedListing = listingDrafts.find((l) => l.id === selectedListingId) || null;

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  // Sync selections when listings change - remove selections for deleted listings
  useEffect(() => {
    const existingIds = new Set(listingDrafts.map((l) => l.id));

    setRowSelection((prev) => {
      const deadKeys = Object.keys(prev).filter((id) => !existingIds.has(id));
      const next = { ...prev };
      deadKeys.forEach((key) => delete next[key]);
      return next;
    });

    if (selectedListingId && !existingIds.has(selectedListingId)) {
      setSelectedListingId(null);
    }
  }, [listingDrafts, selectedListingId]);

  return (
    <IngestionProvider>
      <HighlightProvider>
        <VStack h="full" gap="0" alignItems="stretch">
          <Toolbar rowSelection={rowSelection} />
          <Splitter.Root
            panels={[
              { id: 'table', minSize: 15, maxSize: 40 },
              { id: 'details', minSize: 25, maxSize: 60 },
              { id: 'preview', minSize: 25, maxSize: 70 },
            ]}
            size={splitterSizes}
            onResize={(details) => setSplitterSizes(details.size)}
            h="full"
          >
            <Splitter.Panel id="table">
              <Table
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                setSelectedListingId={setSelectedListingId}
              />
            </Splitter.Panel>
            <Splitter.ResizeTrigger id="table:details">
              <Splitter.ResizeTriggerSeparator />
            </Splitter.ResizeTrigger>
            <Splitter.Panel id="details">
              <Details listingDraft={selectedListing} key={selectedListingId} />
            </Splitter.Panel>
            <Splitter.ResizeTrigger id="details:preview">
              <Splitter.ResizeTriggerSeparator />
            </Splitter.ResizeTrigger>
            <Splitter.Panel id="preview">
              <Reference listing={selectedListing} key={selectedListingId} />
            </Splitter.Panel>
          </Splitter.Root>
          <Footer
            selectedCount={selectedCount}
            totalCount={listingDrafts.length}
            pendingCount={listingDrafts.filter((l) => l.status === 'pending').length}
          />
        </VStack>
        <IngestionModal />
      </HighlightProvider>
    </IngestionProvider>
  );
}
