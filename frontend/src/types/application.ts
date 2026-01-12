import type { ISODate } from '@/utils/date';

/**
 * Application Types
 *
 * Type definitions for job applications and status events.
 * These types match the backend's flattened discriminated union structure.
 *
 * The backend stores status events with base fields as columns (id, date, notes, status)
 * and additional fields in a JSON payload column, but returns them flattened as discriminated unions.
 */

// Status enum matching backend StatusEnum
export type StatusEnum =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer_received'
  | 'accepted'
  | 'rejected'
  | 'ghosted'
  | 'withdrawn'
  | 'rescinded';

// Person type for referrals and interviewers
export type Person = {
  name: string;
  contact?: string;
  avatarUrl?: string;
};

// Base status event fields (stored as columns in DB)
type BaseStatusEvent = {
  id: string;
  date: ISODate;
  notes?: string;
};

// Discriminated union types matching backend StatusEvent variants
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

// Discriminated union of all status event types (flattened, no separate payload)
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

// Application type matching backend Application schema
export type Application = {
  id: string;
  listingId: string;
  resumeId: string | null;
  statusEvents: StatusEvent[];
  currentStatus: StatusEnum;
};
