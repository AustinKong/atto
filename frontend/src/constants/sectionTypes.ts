import type { Section } from '@/types/resume';

interface SectionTypeConfig {
  type: string;
  label: string;
  createContent: () => Section['content'];
}

export const sectionTypes: SectionTypeConfig[] = [
  {
    type: 'simple',
    label: 'Simple Section',
    createContent: () => ({ bullets: [''] }),
  },
  {
    type: 'detailed',
    label: 'Detailed Section',
    createContent: () => ({
      bullets: [
        {
          title: '',
          subtitle: '',
          startDate: '',
          endDate: '',
          bullets: [''],
        },
      ],
    }),
  },
  {
    type: 'paragraph',
    label: 'Paragraph Section',
    createContent: () => ({ text: '' }),
  },
];
