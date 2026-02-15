import type { Section } from '@/types/resume';

// Decouple from ResumeData to keep the editor independent
export type SectionsEditorData = {
  sections: Section[];
};

// Type assertion helper for react-hook-form useFieldArray with discriminated unions
export type TypedFieldArray = {
  fields: Array<{ id: string }>;
  append: (value: unknown) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
};
