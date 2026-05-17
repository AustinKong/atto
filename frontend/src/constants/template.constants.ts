import type { Profile } from '@/types/profile.types';
import type { Section } from '@/types/resume.types';
import { ISOYearMonth } from '@/utils/date.utils';
import { createDateRangeUnit, createTextUnit } from '@/utils/resume.utils';

// TODO: Reuse paper mode fixture data instead
// Default sample profile for template preview
export const DEFAULT_TEMPLATE_PROFILE: Profile = {
  fullName: 'Alex Mercer',
  email: 'alex.mercer@example.com',
  phone: '+1 (415) 555-0132',
  location: 'San Francisco, CA, USA',
  website: 'https://alexmercer.dev',
};

// Default sample sections for template preview
export const DEFAULT_TEMPLATE_SECTIONS: Section[] = [
  {
    id: crypto.randomUUID(),
    type: 'paragraph',
    title: createTextUnit('Summary'),
    content: createTextUnit(
      'Practical full-stack software engineer with 5+ years building web applications and APIs. Strong background in Python and TypeScript, experience with cloud platforms and containerized deployments. Passionate about clean code, pragmatic testing, and mentoring junior engineers.'
    ),
  },
  {
    id: crypto.randomUUID(),
    type: 'simple',
    title: createTextUnit('Skills'),
    content: [
      createTextUnit('Languages: Python, TypeScript, JavaScript, SQL'),
      createTextUnit('Frameworks: React, Next.js, FastAPI, Django'),
      createTextUnit('Databases: PostgreSQL, Redis, MongoDB'),
      createTextUnit('DevOps: Docker, GitHub Actions, AWS (S3, Lambda)'),
      createTextUnit('Testing: pytest, Jest, Playwright'),
    ],
  },
  {
    id: crypto.randomUUID(),
    type: 'detailed',
    title: createTextUnit('Experience'),
    content: [
      {
        id: crypto.randomUUID(),
        title: createTextUnit('Software Engineer'),
        subtitle: createTextUnit('BrightLayer Inc. — San Francisco, CA'),
        dateRange: createDateRangeUnit(ISOYearMonth.parse('2022-06'), 'present'),
        bullets: [
          createTextUnit(
            'Led migration of monolithic API to microservices using FastAPI and Docker, reducing deploy time significantly.'
          ),
          createTextUnit(
            'Built a metrics-backed feature flag system to enable gradual rollouts and reduce incidents.'
          ),
          createTextUnit('Mentored junior engineers and ran code reviews to raise team standards.'),
        ],
      },
      {
        id: crypto.randomUUID(),
        title: createTextUnit('Full-Stack Engineer'),
        subtitle: createTextUnit('Orbit Labs — Remote'),
        dateRange: createDateRangeUnit(
          ISOYearMonth.parse('2019-09'),
          ISOYearMonth.parse('2022-05')
        ),
        bullets: [
          createTextUnit(
            'Developed client dashboards with React and TypeScript, improving retention.'
          ),
          createTextUnit(
            'Implemented GraphQL endpoints and optimized DB indexes to reduce query latency.'
          ),
          createTextUnit('Owned payments integration and subscription flows.'),
        ],
      },
      {
        id: crypto.randomUUID(),
        title: createTextUnit('Software Engineer (Intern)'),
        subtitle: createTextUnit('University Research Lab — Sacramento, CA'),
        dateRange: createDateRangeUnit(
          ISOYearMonth.parse('2018-06'),
          ISOYearMonth.parse('2019-08')
        ),
        bullets: [
          createTextUnit(
            'Built ETL pipelines in Python to normalize and visualize experimental datasets.'
          ),
          createTextUnit(
            'Created an internal dashboard for researchers to run queries and export visualizations.'
          ),
        ],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    type: 'detailed',
    title: createTextUnit('Education'),
    content: [
      {
        id: crypto.randomUUID(),
        title: createTextUnit('B.S. in Computer Science'),
        subtitle: createTextUnit('State University — Sacramento, CA'),
        dateRange: createDateRangeUnit(
          ISOYearMonth.parse('2014-09'),
          ISOYearMonth.parse('2018-06')
        ),
        bullets: [
          createTextUnit(
            'Relevant coursework: Algorithms, Databases, Operating Systems, Software Engineering.'
          ),
        ],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    type: 'simple',
    title: createTextUnit('Projects'),
    content: [
      createTextUnit(
        'TaskFlow — lightweight task manager with real-time collaboration (React, TypeScript).'
      ),
      createTextUnit(
        'LogInsight — CLI and web utility for parsing and visualizing structured logs (Python, FastAPI).'
      ),
    ],
  },
];
