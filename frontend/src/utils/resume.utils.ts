import type {
  DateRangeUnit,
  DetailedItem,
  TextUnit,
} from '@/types/resume.types';
import type { ISOYearMonth } from '@/utils/date.utils';

export function createTextUnit(content: string = ''): TextUnit {
  return {
    id: crypto.randomUUID(),
    content,
  };
}

export function createDateRangeUnit(
  startDate: ISOYearMonth | null = null,
  endDate: ISOYearMonth | 'present' | null = null
): DateRangeUnit {
  return {
    id: crypto.randomUUID(),
    startDate,
    endDate,
  };
}

export function createDetailedItem(): DetailedItem {
  return {
    id: crypto.randomUUID(),
    title: createTextUnit(),
    subtitle: createTextUnit(),
    dateRange: createDateRangeUnit(),
    bullets: [],
  };
}
