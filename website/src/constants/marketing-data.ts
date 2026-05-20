export const offerCompanies = [
  { name: 'TikTok', icon: 'simple-icons:tiktok' },
  { name: 'Shopee', icon: 'simple-icons:shopee' },
  { name: 'Smoke', icon: 'lucide:flame' },
  { name: 'Spotify', icon: 'simple-icons:spotify' },
  { name: 'Stripe', icon: 'simple-icons:stripe' },
  { name: 'Figma', icon: 'simple-icons:figma' },
  { name: 'Notion', icon: 'simple-icons:notion' },
  { name: 'GitHub', icon: 'simple-icons:github' }
];

export const features = [
  {
    title: 'Save jobs in seconds.',
    description:
      'Paste a job URL and Atto pulls the key details into a clean listing you can review and save.',
    image: '/screenshots/dummy-screenshot.png',
    imageAlt: 'Save jobs flow',
    label: 'Feature 1'
  },
  {
    title: 'Track every application.',
    description:
      'See what you saved, applied to, interviewed for, or need to follow up on.',
    image: '/screenshots/dummy-screenshot.png',
    imageAlt: 'Track applications table',
    label: 'Feature 2'
  },
  {
    title: 'Tailor resumes for each role.',
    description:
      'Use role details to customize your resume without starting from scratch every time.',
    image: '/screenshots/dummy-screenshot.png',
    imageAlt: 'Tailor resumes editor',
    label: 'Feature 3'
  }
] as const;
