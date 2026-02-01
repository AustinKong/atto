import type { Section } from '@/types/resume';

export type Profile = {
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  website: string | null;
  baseSections: Section[];
};

export const emptyProfile: Profile = {
  fullName: '',
  email: '',
  phone: null,
  location: null,
  website: null,
  baseSections: [],
};
