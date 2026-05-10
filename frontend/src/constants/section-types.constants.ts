import type { Section, SectionType } from '@/types/resume.types';
import { SECTION_TYPES } from '@/types/resume.types';
import { createDetailedItem, createTextUnit } from '@/utils/resume.utils';

interface SectionTypeConfig {
  type: SectionType;
  label: string;
  createContent: () => Section['content'];
}

export const sectionTypes: SectionTypeConfig[] = [
  {
    type: SECTION_TYPES.SIMPLE,
    label: 'Simple Section',
    createContent: () => [createTextUnit()],
  },
  {
    type: SECTION_TYPES.DETAILED,
    label: 'Detailed Section',
    createContent: () => [createDetailedItem()],
  },
  {
    type: SECTION_TYPES.PARAGRAPH,
    label: 'Paragraph Section',
    createContent: () => createTextUnit(),
  },
];
