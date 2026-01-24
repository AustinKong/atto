import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

import { useDebounce } from './useDebounce';

export type DebouncedQueryOptions<TQueryFnData = unknown, TError = Error, TValue = string> = Omit<
  UseQueryOptions<TQueryFnData, TError>,
  'queryFn'
> & {
  inputValue: TValue;
  delay?: number;
  queryFn: (debouncedValue: TValue) => Promise<TQueryFnData>;
};

/**
 * Debounced query hook that delays query execution until input stabilizes.
 *
 * @param options - Query options with inputValue and queryFn
 * @returns TanStack Query result
 */
export function useDebouncedQuery<TQueryFnData = unknown, TError = Error, TValue = string>(
  options: DebouncedQueryOptions<TQueryFnData, TError, TValue>
): UseQueryResult<TQueryFnData, TError> {
  const { inputValue, delay = 500, queryKey, queryFn, enabled, ...restOptions } = options;

  const debouncedValue = useDebounce(inputValue, delay);

  const finalQueryKey = [...queryKey, debouncedValue] as const;

  // Stops query from sending `api/endpoint?q=`
  const isEnabled =
    (typeof debouncedValue === 'string' ? debouncedValue.length > 0 : true) && enabled !== false;

  return useQuery({
    queryKey: finalQueryKey,
    queryFn: () => queryFn(debouncedValue),
    enabled: isEnabled,
    ...restOptions,
  });
}
