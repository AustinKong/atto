import type {
  DateRangeUnit,
  DetailedItem,
  DetailedSection,
  ParagraphSection,
  Section,
  SimpleSection,
  TextUnit,
} from '@/types/resume.types';
import type { ISOYearMonth } from '@/utils/date.utils';

export function createTextUnit(content: string = ''): TextUnit {
  return {
    id: crypto.randomUUID(),
    content,
  };
}

export function createDateRangeUnit(
  startDate: ISOYearMonth | null = null,
  endDate: ISOYearMonth | 'present' | null = null
): DateRangeUnit {
  return {
    id: crypto.randomUUID(),
    startDate,
    endDate,
  };
}

export function createDetailedItem(): DetailedItem {
  return {
    id: crypto.randomUUID(),
    title: createTextUnit(),
    subtitle: createTextUnit(),
    dateRange: createDateRangeUnit(),
    bullets: [],
  };
}

// TODO: Another function that needs to handle cases based on different section types
// We should consolidate/centralize these
export function replaceTextUnitContentById(
  sections: Section[],
  unitId: string,
  replacementText: string
): { sections: Section[]; updated: boolean } {
  let updated = false;

  function replaceTextUnit(unit: TextUnit): TextUnit {
    if (unit.id !== unitId) {
      return unit;
    }
    if (unit.content === replacementText) {
      return unit;
    }
    updated = true;
    return { ...unit, content: replacementText };
  }

  const nextSections = sections.map((section) => {
    if (section.type === 'simple') {
      const nextSection: SimpleSection = {
        ...section,
        content: section.content.map(replaceTextUnit),
      };
      return nextSection;
    }

    if (section.type === 'paragraph') {
      const nextSection: ParagraphSection = {
        ...section,
        content: replaceTextUnit(section.content),
      };
      return nextSection;
    }

    const nextSection: DetailedSection = {
      ...section,
      content: section.content.map((item) => ({
        ...item,
        title: replaceTextUnit(item.title),
        subtitle: replaceTextUnit(item.subtitle),
        bullets: item.bullets.map(replaceTextUnit),
      })),
    };
    return nextSection;
  });

  return { sections: nextSections, updated };
}

export function extractSectionTextUnits(sections: Section[]): Array<{ id: string; content: string }> {
  const units: Array<{ id: string; content: string }> = [];

  for (const section of sections) {
    if (section.type === 'simple') {
      for (const unit of section.content) {
        const content = unit.content.trim();
        if (content) {
          units.push({ id: unit.id, content });
        }
      }
      continue;
    }

    if (section.type === 'paragraph') {
      const content = section.content.content.trim();
      if (content) {
        units.push({ id: section.content.id, content });
      }
      continue;
    }

    for (const item of section.content) {
      const title = item.title.content.trim();
      if (title) {
        units.push({ id: item.title.id, content: title });
      }

      const subtitle = item.subtitle.content.trim();
      if (subtitle) {
        units.push({ id: item.subtitle.id, content: subtitle });
      }

      for (const bullet of item.bullets) {
        const bulletContent = bullet.content.trim();
        if (bulletContent) {
          units.push({ id: bullet.id, content: bulletContent });
        }
      }
    }
  }

  return units;
}
