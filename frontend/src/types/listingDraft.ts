import { ISODate } from '@/utils/date';

import type { Listing } from './listing';

export const LISTING_DRAFT_STATUS_LIST = [
  'pending',
  'unique',
  'duplicate_url',
  'duplicate_content',
  'error',
] as const;

export type ListingDraftStatus = (typeof LISTING_DRAFT_STATUS_LIST)[number];

export type GroundedItem<T = string> = {
  value: T;
  quote: string | null;
};

export type ListingExtraction = {
  title: string;
  company: string;
  domain: string;
  location: string | null;
  description: string;
  postedDate: ISODate | null;
  skills: GroundedItem<string>[];
  requirements: GroundedItem<string>[];
};

type BaseListingDraft = {
  id: string;
  url: string;
};

export type ListingDraftUnique = BaseListingDraft & {
  status: 'unique';
  listing: ListingExtraction;
  html: string | null;
};

export type ListingDraftDuplicateUrl = BaseListingDraft & {
  status: 'duplicate_url';
  duplicateOf: Listing;
};

export type ListingDraftDuplicateContent = BaseListingDraft & {
  status: 'duplicate_content';
  listing: ListingExtraction;
  duplicateOf: Listing;
  html: string | null;
};

export type ListingDraftError = BaseListingDraft & {
  status: 'error';
  error: string;
  html: string | null;
};

export type ListingDraftPending = BaseListingDraft & {
  status: 'pending';
};

export type ListingDraft =
  | ListingDraftPending
  | ListingDraftUnique
  | ListingDraftDuplicateUrl
  | ListingDraftDuplicateContent
  | ListingDraftError;
