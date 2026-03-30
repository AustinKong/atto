import { ISODate } from '@/utils/date.utils';

import type { Application, StatusEnum } from './application.types';

export type Keyword = {
  word: string;
  count: number;
};

export type Money = {
  value: number;
  currency: string;
};

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
  salary: Money | null;
  skills: string[];
  requirements: string[];
  keywords: Keyword[];
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
    industryMin: number;
    industryQ1: number;
    industryMedian: number;
    industryQ3: number;
    industryMax: number;
    currency: string;
  };
  market: {
    summary: string;
  };
  applicantInsights: { insights: string[] };
  generatedAt: string;
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
