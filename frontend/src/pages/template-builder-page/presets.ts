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

  normalProfile: {
    name: 'Normal — Software Engineer',
    profile: {
      fullName: 'Alex Mercer',
      email: 'alex.mercer@example.com',
      phone: '+1 (415) 555-0132',
      location: 'San Francisco, CA, USA',
      website: 'https://alexmercer.dev',
      baseSections: [],
    },
    sections: [
      {
        id: 'summary-1',
        type: 'paragraph',
        title: 'Summary',
        content:
          'Practical full-stack software engineer with 5+ years building web applications and APIs. Strong background in Python and TypeScript, experience with cloud platforms and containerized deployments. Passionate about clean code, pragmatic testing, and mentoring junior engineers.',
      },
      {
        id: 'skills-1',
        type: 'simple',
        title: 'Skills',
        content: [
          'Languages: Python, TypeScript, JavaScript, SQL',
          'Frameworks: React, Next.js, FastAPI, Django',
          'Databases: PostgreSQL, Redis, MongoDB',
          'DevOps: Docker, GitHub Actions, AWS (S3, Lambda)',
          'Testing: pytest, Jest, Playwright',
        ],
      },
      {
        id: 'exp-1',
        type: 'detailed',
        title: 'Experience',
        content: [
          {
            title: 'Software Engineer',
            subtitle: 'BrightLayer Inc. — San Francisco, CA',
            startDate: ISOYearMonth.parse('2022-06'),
            endDate: 'present',
            bullets: [
              'Led migration of monolithic API to microservices using FastAPI and Docker, reducing deploy time significantly.',
              'Built a metrics-backed feature flag system to enable gradual rollouts and reduce incidents.',
              'Mentored junior engineers and ran code reviews to raise team standards.',
            ],
          },
          {
            title: 'Full-Stack Engineer',
            subtitle: 'Orbit Labs — Remote',
            startDate: ISOYearMonth.parse('2019-09'),
            endDate: ISOYearMonth.parse('2022-05'),
            bullets: [
              'Developed client dashboards with React and TypeScript, improving retention.',
              'Implemented GraphQL endpoints and optimized DB indexes to reduce query latency.',
              'Owned payments integration and subscription flows.',
            ],
          },
          {
            title: 'Software Engineer (Intern)',
            subtitle: 'University Research Lab — Sacramento, CA',
            startDate: ISOYearMonth.parse('2018-06'),
            endDate: ISOYearMonth.parse('2019-08'),
            bullets: [
              'Built ETL pipelines in Python to normalize and visualize experimental datasets.',
              'Created an internal dashboard for researchers to run queries and export visualizations.',
            ],
          },
        ],
      },
      {
        id: 'edu-1',
        type: 'detailed',
        title: 'Education',
        content: [
          {
            title: 'B.S. in Computer Science',
            subtitle: 'State University — Sacramento, CA',
            startDate: ISOYearMonth.parse('2014-09'),
            endDate: ISOYearMonth.parse('2018-06'),
            bullets: [
              'Relevant coursework: Algorithms, Databases, Operating Systems, Software Engineering.',
            ],
          },
        ],
      },
      {
        id: 'projects-1',
        type: 'simple',
        title: 'Projects',
        content: [
          'TaskFlow — lightweight task manager with real-time collaboration (React, TypeScript).',
          'LogInsight — CLI and web utility for parsing and visualizing structured logs (Python, FastAPI).',
        ],
      },
    ],
  },
};
