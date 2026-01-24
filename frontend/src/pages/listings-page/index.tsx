import { Splitter, VStack } from '@chakra-ui/react';
import { Center, Spinner } from '@chakra-ui/react';
import { Suspense } from 'react';
import { Outlet, useParams } from 'react-router';

import { useDebouncedUrlSyncedState } from '@/hooks/useDebouncedUrlSyncedState';
import { useLocalStorage } from '@/hooks/useLocalStorage';

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
        w="full"
      >
        <Splitter.Panel id="table">
          <Suspense
            fallback={
              <Center h="full">
                <Spinner />
              </Center>
            }
          >
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
