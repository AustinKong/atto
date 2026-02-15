import type { Section, SectionType } from '@/types/resume';
import { SECTION_TYPES } from '@/types/resume';

interface SectionTypeConfig {
  type: SectionType;
  label: string;
  createContent: () => Section['content'];
}

export const sectionTypes: SectionTypeConfig[] = [
  {
    type: SECTION_TYPES.SIMPLE,
    label: 'Simple Section',
    createContent: () => [''],
  },
  {
    type: SECTION_TYPES.DETAILED,
    label: 'Detailed Section',
    createContent: () => [
      {
        title: '',
        subtitle: null,
        startDate: null,
        endDate: null,
        bullets: [],
      },
    ],
  },
  {
    type: SECTION_TYPES.PARAGRAPH,
    label: 'Paragraph Section',
    createContent: () => '',
  },
];
