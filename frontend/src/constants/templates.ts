import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';
import { ISOYearMonth } from '@/utils/date';

// Default sample profile for template preview
export const DEFAULT_TEMPLATE_PROFILE: Profile = {
  fullName: 'Alex Mercer',
  email: 'alex.mercer@example.com',
  phone: '+1 (415) 555-0132',
  location: 'San Francisco, CA, USA',
  website: 'https://alexmercer.dev',
  baseSections: [],
};

// Default sample sections for template preview
export const DEFAULT_TEMPLATE_SECTIONS: Section[] = [
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
];
