import { ISODate } from '@/utils/date';

import type { Application, StatusEnum } from './application';

export type Listing = {
  id: string;
  url: string;
  title: string;
  company: string;
  domain: string;
  location: string | null;
  description: string;
  notes: string | null;
  insights: string | null;
  postedDate: ISODate | null;
  skills: string[];
  requirements: string[];
  applications: Application[];
};

export type ListingSummary = {
  id: string;
  url: string;
  title: string;
  company: string;
  domain: string;
  location: string | null;
  postedDate: ISODate | null;
  currentStatus: StatusEnum | null;
  lastUpdated: string | null;
};
