import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';
import { ISOYearMonth } from '@/utils/date';

interface EdgeCasePreset {
  name: string;
  profile: Profile;
  sections: Section[];
}

export const EDGE_CASE_PRESETS: Record<string, EdgeCasePreset> = {
  minimalDataStates: {
    name: 'Minimal Data States',
    profile: {
      fullName: 'John Doe',
      email: '',
      phone: '',
      location: '',
      website: '',
      baseSections: [],
    },
    sections: [
      {
        id: 'min-1',
        type: 'simple',
        title: 'Empty Simple Section',
        content: [],
      },
      {
        id: 'min-2',
        type: 'detailed',
        title: 'Empty Detailed Section',
        content: [
          {
            title: 'Job Title Only',
            subtitle: '',
            startDate: null,
            endDate: null,
            bullets: [],
          },
        ],
      },
    ],
  },

  textOverflowAndFormatting: {
    name: 'Text Overflow and Formatting',
    profile: {
      fullName: 'Maximus-Very-Long-Name-With-Hyphens-To-Test-Wrapping',
      email: 'this-is-an-unreasonably-long-email-address-for-testing@example.com',
      phone: '+1 (555) 555-5555',
      location: 'City, State, Country, Planet Earth',
      website: 'https://extremely-long-website-url-that-should-probably-wrap.com/subpath/testing',
      baseSections: [],
    },
    sections: [
      {
        id: 'flow-1',
        type: 'paragraph',
        title: 'Text Flow Test',
        content:
          'This is a long paragraph.\n\nIt has double newlines to test spacing.\nIt also has a single newline.\nFinally, we include a very long word: Donaudampfschifffahrtselektrizitätenhauptbetriebswerkbauunterbeamtengesellschaft.',
      },
      {
        id: 'flow-2',
        type: 'detailed',
        title: 'Flexbox Collision',
        content: [
          {
            title: 'Lead Software Engineer and Architectural Design Consultant for Cloud Systems',
            subtitle: 'Global Consolidated Industries and Technologies Corporation',
            startDate: ISOYearMonth.parse('2020-01'),
            endDate: 'present',
            bullets: ['Unbroken_string_test_01234567890123456789012345678901234567890123456789'],
          },
        ],
      },
    ],
  },

  dateRangeConditions: {
    name: 'Date Range Conditions',
    profile: {
      fullName: 'Date Tester',
      email: 'test@example.com',
      phone: '',
      location: '',
      website: '',
      baseSections: [],
    },
    sections: [
      {
        id: 'date-1',
        type: 'detailed',
        title: 'Date Logic',
        content: [
          {
            title: 'Standard Present',
            subtitle: '',
            startDate: ISOYearMonth.parse('2022-01'),
            endDate: 'present',
            bullets: [],
          },
          {
            title: 'Incomplete Range',
            subtitle: '',
            startDate: ISOYearMonth.parse('2021-01'),
            endDate: null,
            bullets: [],
          },
          {
            title: 'No Start Date',
            subtitle: '',
            startDate: null,
            endDate: ISOYearMonth.parse('2020-12'),
            bullets: [],
          },
          {
            title: 'No Dates',
            subtitle: '',
            startDate: null,
            endDate: null,
            bullets: [],
          },
        ],
      },
    ],
  },
};
