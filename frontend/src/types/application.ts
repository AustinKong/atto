import type { ISODate, ISODatetime } from '@/utils/date';

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
  avatarUrl: string | null;
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

export type Application = {
  id: string;
  listingId: string;
  resumeId: string | null;
  statusEvents: StatusEvent[];
  currentStatus: StatusEnum;
};
