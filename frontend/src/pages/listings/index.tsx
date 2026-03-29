import { Splitter, VStack } from '@chakra-ui/react';
import { Suspense } from 'react';
import { Outlet, useParams } from 'react-router';

import { useDebouncedUrlSyncedState } from '@/hooks/use-debounced-url-synced-state.hooks';
import { useLocalStorage } from '@/hooks/use-local-storage.hooks';
import { Loader } from '@/routes/base-route/Loader';

import { Table } from './table';
import { Toolbar } from './Toolbar';

export function ListingsPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const [searchInput, debouncedSearchInput, setSearchInput] = useDebouncedUrlSyncedState('q', '', {
    type: 'STRING',
    debounceMs: 700,
  });
  const [drawerOpenSizes, setDrawerOpenSizes] = useLocalStorage(
    'listings-splitter-sizes',
    [70, 30]
  );

  const isDrawerOpen = Boolean(listingId);

  return (
    <VStack h="full" alignItems="stretch" gap="0">
      <Toolbar searchInput={searchInput} onSearchChange={setSearchInput} />
      <Splitter.Root
        panels={[
          { id: 'table', minSize: 40 },
          { id: 'drawer', minSize: 20 },
        ]}
        size={drawerOpenSizes}
        onResize={(details) => {
          if (isDrawerOpen) setDrawerOpenSizes(details.size);
        }}
        h="full"
      >
        <Splitter.Panel id="table">
          <Suspense fallback={<Loader />}>
            <Table debouncedSearch={debouncedSearchInput} />
          </Suspense>
        </Splitter.Panel>
        {isDrawerOpen && (
          <>
            <Splitter.ResizeTrigger id="table:drawer">
              <Splitter.ResizeTriggerSeparator />
            </Splitter.ResizeTrigger>
            <Splitter.Panel id="drawer">
              <Outlet />
            </Splitter.Panel>
          </>
        )}
      </Splitter.Root>
    </VStack>
  );
}
