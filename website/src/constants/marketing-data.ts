export const offerCompanies = [
  { name: 'COMPANY_1', logo: '/logos/company-1.svg' },
  { name: 'COMPANY_2', logo: '/logos/company-2.svg' },
  { name: 'COMPANY_3', logo: '/logos/company-3.svg' },
  { name: 'COMPANY_4', logo: '/logos/company-4.svg' },
  { name: 'COMPANY_5', logo: '/logos/company-5.svg' },
  { name: 'COMPANY_6', logo: '/logos/company-6.svg' },
  { name: 'COMPANY_7', logo: '/logos/company-7.svg' },
  { name: 'COMPANY_8', logo: '/logos/company-8.svg' }
];

export const features = [
  {
    title: 'Save jobs in seconds.',
    description:
      'Paste a job URL and Atto pulls the key details into a clean listing you can review and save.',
    bullets: ['Extract role details', 'Save company and requirements', 'Keep listings organized'],
    image: '/screenshots/save-jobs.gif',
    imageAlt: 'Save jobs flow',
    label: 'Feature 1'
  },
  {
    title: 'Track every application.',
    description:
      'See what you saved, applied to, interviewed for, or need to follow up on.',
    bullets: ['View all roles in one place', 'Update application status', 'Know what needs action next'],
    image: '/screenshots/track-applications.gif',
    imageAlt: 'Track applications table',
    label: 'Feature 2'
  },
  {
    title: 'Tailor resumes for each role.',
    description:
      'Use role details to customize your resume without starting from scratch every time.',
    bullets: ['Build from templates', 'Customize sections', 'Adapt resumes to each opportunity'],
    image: '/screenshots/tailor-resumes.gif',
    imageAlt: 'Tailor resumes editor',
    label: 'Feature 3'
  }
] as const;
