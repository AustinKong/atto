export interface DetailedItem {
  title: string;
  subtitle: string | null;
  startDate: string | null;
  endDate: string | null;
  bullets: string[];
}

export interface DetailedSectionContent {
  bullets: DetailedItem[];
}

export interface SimpleSectionContent {
  bullets: string[];
}

export interface ParagraphSectionContent {
  text: string;
}

export type SectionContent =
  | DetailedSectionContent
  | SimpleSectionContent
  | ParagraphSectionContent;

export interface Section {
  id: string;
  type: string;
  title: string;
  content: SectionContent;
}

export interface ResumeData {
  sections: Section[];
}

export interface Resume {
  id: string;
  template: string;
  data: ResumeData;
}
