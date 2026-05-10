import type { ISOYearMonth } from '@/utils/date.utils';

export type { Profile } from '@/types/profile.types';

export const SECTION_TYPES = {
  SIMPLE: 'simple',
  DETAILED: 'detailed',
  PARAGRAPH: 'paragraph',
} as const;

export type SectionType = (typeof SECTION_TYPES)[keyof typeof SECTION_TYPES];

export type TextUnit = {
  id: string;
  content: string;
};

export type DateRangeUnit = {
  id: string;
  startDate: ISOYearMonth | null;
  endDate: ISOYearMonth | 'present' | null;
};

export type DetailedItem = {
  id: string;
  title: TextUnit;
  subtitle: TextUnit;
  dateRange: DateRangeUnit;
  bullets: TextUnit[];
};

export type BaseSection = {
  id: string;
  title: TextUnit;
};

export type SimpleSection = BaseSection & {
  type: 'simple';
  content: TextUnit[];
};

export type DetailedSection = BaseSection & {
  type: 'detailed';
  content: DetailedItem[];
};

export type ParagraphSection = BaseSection & {
  type: 'paragraph';
  content: TextUnit;
};

export type Section = SimpleSection | DetailedSection | ParagraphSection;

export type Resume = {
  id: string;
  templateId: string;
  sections: Section[];
};
