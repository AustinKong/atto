import type { ISODate, ISODatetime } from '@/utils/date.utils';

export const STATUS_LIST = [
  'saved',
  'applied',
  'screening',
  'interview',
  'offer_received',
  'accepted',
  'rejected',
  'ghosted',
  'withdrawn',
  'rescinded',
] as const;

export type StatusEnum = (typeof STATUS_LIST)[number];

export type Person = {
  name: string;
  contact: string | null;
};

type BaseStatusEvent = {
  id: string;
  date: ISODate;
  notes: string | null;
};

export type StatusEventSaved = BaseStatusEvent & {
  status: 'saved';
};

export type StatusEventApplied = BaseStatusEvent & {
  status: 'applied';
  referrals: Person[];
};

export type StatusEventScreening = BaseStatusEvent & {
  status: 'screening';
};

export type StatusEventInterview = BaseStatusEvent & {
  status: 'interview';
  stage: number;
  interviewers: Person[];
  scheduledAt: ISODatetime | null;
  location: string | null;
};

export type StatusEventOfferReceived = BaseStatusEvent & {
  status: 'offer_received';
};

export type StatusEventAccepted = BaseStatusEvent & {
  status: 'accepted';
};

export type StatusEventRejected = BaseStatusEvent & {
  status: 'rejected';
};

export type StatusEventGhosted = BaseStatusEvent & {
  status: 'ghosted';
};

export type StatusEventWithdrawn = BaseStatusEvent & {
  status: 'withdrawn';
};

export type StatusEventRescinded = BaseStatusEvent & {
  status: 'rescinded';
};

export type StatusEvent =
  | StatusEventSaved
  | StatusEventApplied
  | StatusEventScreening
  | StatusEventInterview
  | StatusEventOfferReceived
  | StatusEventAccepted
  | StatusEventRejected
  | StatusEventGhosted
  | StatusEventWithdrawn
  | StatusEventRescinded;

export type SkillComparisonRow = {
  skill: string;
  resumeScore: number;
  requiredScore: number;
};

export const CONTENT_QUALITY_CATEGORIES = [
  'highSignal',
  'lowSignal',
  'neutral',
  'lowNoise',
  'highNoise',
] as const;

export type ContentQualityCategory = (typeof CONTENT_QUALITY_CATEGORIES)[number];

export type ContentQualityScore = {
  unitId: string;
  score: number;
};

export type ContentQualitySection = {
  sectionId: string;
  scores: ContentQualityScore[];
};

export type ApplicationAnalysis = {
  resumeHash: string;
  generatedAt: ISODatetime;
  skillsComparison: SkillComparisonRow[];
  contentQuality: ContentQualitySection[];
};

export type Application = {
  id: string;
  listingId: string;
  name: string;
  resumeId: string;
  analysis: ApplicationAnalysis | null;
  statusEvents: StatusEvent[];
  currentStatus: StatusEnum;
};
