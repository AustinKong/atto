import './index.css';

import { LocaleProvider } from '@chakra-ui/react';
import {
  type PersistedClient,
  type Persister,
  PersistQueryClientProvider,
} from '@tanstack/react-query-persist-client';
import { del, get, set } from 'idb-keyval';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Provider as ChakraProvider } from '@/components/ui/provider';
import { toaster } from '@/components/ui/toaster.tsx';
import { queryClient } from '@/utils/queryClient';

import { App } from './App.tsx';

const persister: Persister = {
  persistClient: async (client: PersistedClient) => {
    await set('atto-cache', client);
  },
  restoreClient: async () => {
    return await get('atto-cache');
  },
  removeClient: async () => {
    await del('atto-cache');
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only save listings in IndexDB
            const isSuccess = query.state.status === 'success';
            const shouldPersist = query.queryKey[0] === 'listings';

            return isSuccess && shouldPersist;
          },
        },
      }}
      onSuccess={() => toaster.success({ title: 'DEBUG: Cache restored' })}
    >
      <ChakraProvider>
        <LocaleProvider locale="en-US">
          <App />
        </LocaleProvider>
      </ChakraProvider>
    </PersistQueryClientProvider>
  </StrictMode>
);
