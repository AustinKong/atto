import { Badge, HStack, Table as ChakraTable, Text } from '@chakra-ui/react';
import {
  createColumnHelper,
  getCoreRowModel,
  type OnChangeFn,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import React, { type Dispatch, type SetStateAction, useCallback } from 'react';

import { CompanyLogo } from '@/components/custom/CompanyLogo';
import { DisplayDate } from '@/components/custom/DisplayDate';
import { STATUS_DEFINITIONS } from '@/constants/statuses';
import { useListingsQuery } from '@/hooks/listings';
import { useDebouncedUrlSyncedState } from '@/hooks/utils/useDebouncedUrlSyncedState';
import { type ParamHandler, useUrlSyncedState } from '@/hooks/utils/useUrlSyncedState';
import type { StatusEnum } from '@/types/application';
import type { ListingSummary } from '@/types/listing';

import { StatusFilterMenu } from './StatusFilterMenu';
import { TableFooter } from './TableFooter';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';

interface TableMetaType {
  setStatuses: Dispatch<SetStateAction<StatusEnum[]>>;
  statuses: StatusEnum[];
}

const columnHelper = createColumnHelper<ListingSummary>();

const tableSortHandler: ParamHandler<SortingState> = {
  serialize: (v: SortingState) => {
    const sort = v[0];
    if (!sort) return null;
    return `${sort.id}:${sort.desc ? 'desc' : 'asc'}`;
  },
  deserialize: (params: URLSearchParams, key: string) => {
    const val = params.get(key);
    if (!val) return [];

    const [id, desc] = val.split(':');
    return [{ id, desc: desc === 'desc' }];
  },
};

const columns = [
  columnHelper.accessor('company', {
    id: 'company',
    header: 'Company',
    cell: (info) => {
      const company = info.getValue();
      const domain = info.row.original.domain;

      return (
        <HStack gap={2} alignItems={'center'} w="full" overflow="hidden">
          <CompanyLogo domain={domain} companyName={company} size="2xs" flexShrink={0} />
          <Text truncate flex={1} minW={0}>
            {company}
          </Text>
        </HStack>
      );
    },
    size: 15,
  }),
  columnHelper.accessor('title', {
    id: 'title',
    header: 'Role',
    cell: (info) => info.getValue(),
    size: 25,
  }),
  columnHelper.accessor('currentStatus', {
    header: ({ table }) => {
      const { setStatuses, statuses } = (table.options.meta as TableMetaType) || {};
      return <StatusFilterMenu statuses={statuses} setStatuses={setStatuses} />;
    },
    cell: (info) => {
      const status = info.getValue();
      if (!status) return null;
      const statusInfo = STATUS_DEFINITIONS[status];

      return (
        <Badge variant="subtle" colorPalette={statusInfo.colorPalette}>
          <HStack gap={1}>
            <statusInfo.icon />
            <Text>{statusInfo.label}</Text>
          </HStack>
        </Badge>
      );
    },
    size: 15,
    enableSorting: false,
  }),
  columnHelper.accessor('location', {
    header: 'Location',
    cell: (info) => info.getValue(),
    size: 15,
    enableSorting: false,
  }),
  columnHelper.accessor('postedDate', {
    id: 'posted_at',
    header: 'Posted',
    cell: (info) => <DisplayDate date={info.getValue()} />,
    size: 15,
    sortDescFirst: false,
  }),
  columnHelper.accessor('lastUpdated', {
    id: 'last_status_at',
    header: 'Last Updated',
    cell: (info) => <DisplayDate date={info.getValue()} />,
    size: 15,
    sortDescFirst: false,
  }),
];

const Table = React.memo(function Table({
  debouncedSearch,
  onRowClick,
  onRowHover,
}: {
  debouncedSearch: string;
  onRowClick: (listing: ListingSummary) => void;
  onRowHover: (id: string) => void;
}) {
  const [sorting, setSorting] = useUrlSyncedState<SortingState>('sort', [], {
    custom: tableSortHandler,
  });
  const [statuses, debouncedStatuses, setStatuses] = useDebouncedUrlSyncedState('status', [], {
    type: 'ARRAY',
    debounceMs: 700,
  });

  const sortBy = sorting[0]?.id || '';
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updaterOrValue) => {
      const newSorting =
        typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
      setSorting(newSorting);
    },
    [setSorting, sorting]
  );

  const handleStatusesChange = useCallback(
    (updaterOrValue: StatusEnum[] | ((prev: StatusEnum[]) => StatusEnum[])) => {
      const newStatuses =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(statuses as StatusEnum[])
          : updaterOrValue;
      setStatuses(newStatuses);
    },
    [setStatuses, statuses]
  );

  const { listings, fetchNextPage, hasNextPage, isLoading } = useListingsQuery({
    search: debouncedSearch,
    sortBy: sortBy as 'title' | 'company' | 'posted_at' | 'last_status_at',
    sortOrder: sortOrder as 'asc' | 'desc',
    statuses: debouncedStatuses as StatusEnum[],
  });

  const table = useReactTable({
    data: listings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
    },
    onSortingChange: handleSortingChange,
    manualSorting: true,
    defaultColumn: {
      minSize: 0,
      size: 0,
    },
    meta: {
      setStatuses: handleStatusesChange,
      statuses,
    },
  });

  return (
    <ChakraTable.ScrollArea h="full" overflowY="scroll">
      <ChakraTable.Root size="sm" stickyHeader tableLayout="fixed" interactive>
        <ChakraTable.ColumnGroup>
          {table.getLeafHeaders().map((header) => (
            <ChakraTable.Column key={header.id} htmlWidth={`${header.getSize()}%`} />
          ))}
        </ChakraTable.ColumnGroup>

        <TableHeader table={table} />

        <ChakraTable.Body>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              row={row}
              onRowClick={() => onRowClick(row.original)}
              onRowHover={() => onRowHover(row.original.id)}
            />
          ))}
          <TableFooter
            onFetchNext={fetchNextPage}
            hasNextPage={hasNextPage}
            isLoading={isLoading}
          />
        </ChakraTable.Body>
      </ChakraTable.Root>
    </ChakraTable.ScrollArea>
  );
});

// Table is a very heavy component to render, so we memoize it. But its props MUST be stable.
export { Table };
