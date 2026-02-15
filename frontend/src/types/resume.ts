import type { ISOYearMonth } from '@/utils/date';

export const SECTION_TYPES = {
  SIMPLE: 'simple',
  DETAILED: 'detailed',
  PARAGRAPH: 'paragraph',
} as const;

export type SectionType = (typeof SECTION_TYPES)[keyof typeof SECTION_TYPES];

export interface DetailedItem {
  title: string;
  subtitle: string | null;
  startDate: ISOYearMonth | null;
  endDate: ISOYearMonth | 'present' | null;
  bullets: string[];
}

export interface BaseSection {
  id: string;
  title: string;
}

export interface SimpleSection extends BaseSection {
  type: 'simple';
  content: string[];
}

export interface DetailedSection extends BaseSection {
  type: 'detailed';
  content: DetailedItem[];
}

export interface ParagraphSection extends BaseSection {
  type: 'paragraph';
  content: string;
}

export type Section = SimpleSection | DetailedSection | ParagraphSection;

export interface Resume {
  id: string;
  templateId: string;
  sections: Section[];
}
