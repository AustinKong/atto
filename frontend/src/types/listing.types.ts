import { ISODate } from '@/utils/date.utils';

import type { Application, StatusEnum } from './application.types';

export type Listing = {
  id: string;
  url: string;
  title: string;
  company: string;
  domain: string;
  location: string | null;
  description: string;
  notes: string | null;
  research: ListingResearch | null;
  postedDate: ISODate | null;
  skills: string[];
  requirements: string[];
  applications: Application[];
};

export type ListingResearch = {
  sentiment: {
    value: number;
    sources: {
      url: string;
      title: string;
      content: string;
    }[];
  };
  salary: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    currency: string;
  };
  market: {
    summary: string;
  };
  applicantInsights: {
    insights: string[];
  };
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
  lastStatusAt: string | null;
};
