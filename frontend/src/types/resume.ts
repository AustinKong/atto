import type { ISOYearMonth } from '@/utils/date';

export interface DetailedItem {
  title: string;
  subtitle: string | null;
  startDate: ISOYearMonth | null;
  endDate: ISOYearMonth | 'present' | null;
  bullets: string[];
}

export interface DetailedSectionContent {
  bullets: DetailedItem[];
}

export interface SimpleSectionContent {
  bullets: string[];
}

export interface ParagraphSectionContent {
  text: string;
}

export type SectionContent =
  | DetailedSectionContent
  | SimpleSectionContent
  | ParagraphSectionContent;

export interface Section {
  id: string;
  type: string;
  title: string;
  content: SectionContent;
}

export interface Resume {
  id: string;
  template: string;
  sections: Section[];
}
