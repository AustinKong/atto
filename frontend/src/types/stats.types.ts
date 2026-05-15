import type { ISODate } from '@/utils/date.utils';

import type { StatusEnum } from './application.types';

export type ApplicationFunnelNode = {
  id: StatusEnum;
};

export type ApplicationFunnelLink = {
  source: StatusEnum;
  target: StatusEnum;
  value: number;
};

export type ApplicationFunnel = {
  nodes: ApplicationFunnelNode[];
  links: ApplicationFunnelLink[];
};

export type ApplicationHistoryPoint = {
  date: ISODate;
  saved: number;
  applied: number;
  screening: number;
  interview: number;
  offerReceived: number;
  accepted: number;
  rejected: number;
  ghosted: number;
  withdrawn: number;
  rescinded: number;
};

export type ApplicationHistory = {
  keys: StatusEnum[];
  points: ApplicationHistoryPoint[];
};

export type StatsResponse = {
  applicationFunnel: ApplicationFunnel;
  applicationHistory: ApplicationHistory;
};

export const STATS_DATE_RANGES = ['7d', '14d', '30d', '90d', '180d', 'all'] as const;

export type StatsDateRange = (typeof STATS_DATE_RANGES)[number];

export const STATS_DATE_RANGE_DAYS: Record<StatsDateRange, number> = {
  '7d': 7,
  '14d': 14,
  '30d': 30,
  '90d': 90,
  '180d': 180,
  all: 36500,
};
