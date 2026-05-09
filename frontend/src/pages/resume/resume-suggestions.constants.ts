export type SuggestionSeverity = 'high' | 'medium' | 'low';

export type ResumeSuggestion = {
  id: string;
  severity: SuggestionSeverity;
  title: string;
  message: string;
  snippet: string;
  isOutdated: boolean;
};

export const RESUME_SUGGESTIONS: ResumeSuggestion[] = [
  {
    id: 'exp-microservices',
    severity: 'high',
    title: 'Add scope/context',
    message:
      'Great metric. Add team size or service ownership scope to make this leadership impact clearer.',
    snippet: 'microservices backend in python',
    isOutdated: false,
  },
  {
    id: 'exp-kafka',
    severity: 'medium',
    title: 'Tie to business outcome',
    message: 'Mention the downstream product or KPI impact from processing 1M daily events.',
    snippet: 'apache kafka to process over 1 million daily user events',
    isOutdated: false,
  },
  {
    id: 'skills-frontend',
    severity: 'low',
    title: 'Skills prioritization',
    message: 'Consider moving job-relevant stack keywords to the start of this skills line.',
    snippet: 'frontend react vue html css tailwindcss',
    isOutdated: true,
  },
];
