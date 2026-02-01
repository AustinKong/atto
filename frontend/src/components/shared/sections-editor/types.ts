import type { Section } from '@/types/resume';

// Decouple from ResumeData to keep the editor independent
export type SectionsEditorData = {
  sections: Section[];
};
