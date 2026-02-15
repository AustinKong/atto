import type { Section } from '@/types/resume';

export type Profile = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  baseSections: Section[];
};

export const emptyProfile: Profile = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  baseSections: [],
};
