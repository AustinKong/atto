import type { Application } from '@/types/application';
import { ISODatetime } from '@/utils/date';

/**
 * Application Constants
 *
 * Dummy data and helper functions for testing and development.
 */

export const DUMMY_APPLICATION: Application = {
  id: 'dummy-app-1',
  listingId: 'dummy-listing-1',
  resumeId: 'Software Engineer Resume v1.2',
  currentStatus: 'interview',
  statusEvents: [
    {
      id: 'event-2',
      status: 'applied',
      createdAt: ISODatetime.parse('2024-01-16T14:30:00Z'),
      referral: {
        name: 'John Smith',
        contact: 'john.smith@company.com',
        avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
      notes:
        'Submitted my application through the company portal. Used my updated resume highlighting recent React and Node.js projects. Included a cover letter mentioning my interest in their mission and how my background aligns with their tech stack.',
    },
    {
      id: 'event-3',
      status: 'screening',
      createdAt: ISODatetime.parse('2024-01-18T09:15:00Z'),
      notes:
        'Received email confirmation that my application passed the initial screening. The HR team reviewed my qualifications and determined I meet the basic requirements. Next step is scheduling a technical interview.',
    },
    {
      id: 'event-4',
      status: 'interview',
      createdAt: ISODatetime.parse('2024-01-20T11:00:00Z'),
      stage: 1,
      interviewers: [
        {
          name: 'Sarah Johnson',
          contact: 'sarah.johnson@company.com',
          avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
        },
      ],
      notes:
        'Completed first round technical interview with Sarah Johnson, Senior Software Engineer. Discussed my experience with React, TypeScript, and backend development. Went through a coding challenge involving API design and database optimization. Interviewer seemed impressed with my problem-solving approach and asked good questions about scalability.',
    },
    {
      id: 'event-5',
      status: 'interview',
      createdAt: ISODatetime.parse('2024-01-25T15:30:00Z'),
      stage: 2,
      interviewers: [
        {
          name: 'Mike Chen',
          contact: 'mike.chen@company.com',
          avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
        },
        {
          name: 'Emily Rodriguez',
          contact: 'emily.rodriguez@company.com',
          avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
        },
      ],
      notes:
        'Second round interview with the engineering team at company headquarters. Met with Mike Chen (Engineering Manager) and two senior developers. Presented my portfolio and walked through the architecture of a complex web application I built. Discussed team dynamics, development processes, and how I handle code reviews. The team asked about my experience with testing, CI/CD pipelines, and working in agile environments. Felt confident about the technical discussion but need to follow up on next steps.',
    },
  ],
};
