import { STATS_DATE_RANGES, type StatsDateRange } from '@/types/stats.types';

export const DEFAULT_STATS_DATE_RANGE: StatsDateRange = '7d';

export function parseStatsDateRange(value: string | null): StatsDateRange | null {
  if (value && STATS_DATE_RANGES.includes(value as StatsDateRange)) {
    return value as StatsDateRange;
  }

  return null;
}

export function parseStatsDateRangeOrDefault(value: string | null | undefined): StatsDateRange {
  return parseStatsDateRange(value ?? null) ?? DEFAULT_STATS_DATE_RANGE;
}
