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

type SectionHandlers<T> = {
  simple: (section: SimpleSection) => T;
  detailed: (section: DetailedSection) => T;
  paragraph: (section: ParagraphSection) => T;
};

function matchSection<T>(section: Section, handlers: SectionHandlers<T>): T {
  switch (section.type) {
    case 'simple':
      return handlers.simple(section);
    case 'detailed':
      return handlers.detailed(section);
    case 'paragraph':
      return handlers.paragraph(section);
    default:
      throw new Error(`Unsupported section type: ${(section as { type: string }).type}`);
  }
}

function getTrimmedUnit(unit: TextUnit): { id: string; content: string } | null {
  const content = unit.content.trim();
  if (!content) {
    return null;
  }
  return { id: unit.id, content };
}

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

  const nextSections = sections.map((section) =>
    matchSection<Section>(section, {
      simple: (simpleSection) => {
        const nextSection: SimpleSection = {
          ...simpleSection,
          content: simpleSection.content.map(replaceTextUnit),
        };
        return nextSection;
      },
      paragraph: (paragraphSection) => {
        const nextSection: ParagraphSection = {
          ...paragraphSection,
          content: replaceTextUnit(paragraphSection.content),
        };
        return nextSection;
      },
      detailed: (detailedSection) => {
        const nextSection: DetailedSection = {
          ...detailedSection,
          content: detailedSection.content.map((item) => ({
            ...item,
            title: replaceTextUnit(item.title),
            subtitle: replaceTextUnit(item.subtitle),
            bullets: item.bullets.map(replaceTextUnit),
          })),
        };
        return nextSection;
      },
    })
  );

  return { sections: nextSections, updated };
}

function extractSectionTextUnitsForSection(section: Section): Array<{ id: string; content: string }> {
  return matchSection(section, {
    simple: (simpleSection) =>
      simpleSection.content
        .map(getTrimmedUnit)
        .filter((unit): unit is { id: string; content: string } => unit !== null),
    paragraph: (paragraphSection) => {
      const unit = getTrimmedUnit(paragraphSection.content);
      return unit ? [unit] : [];
    },
    detailed: (detailedSection) => {
      const units: Array<{ id: string; content: string }> = [];

      for (const item of detailedSection.content) {
        const titleUnit = getTrimmedUnit(item.title);
        if (titleUnit) {
          units.push(titleUnit);
        }

        const subtitleUnit = getTrimmedUnit(item.subtitle);
        if (subtitleUnit) {
          units.push(subtitleUnit);
        }

        for (const bullet of item.bullets) {
          const bulletUnit = getTrimmedUnit(bullet);
          if (bulletUnit) {
            units.push(bulletUnit);
          }
        }
      }

      return units;
    },
  });
}

export function extractSectionTextUnits(sections: Section[]): Array<{ id: string; content: string }> {
  return sections.flatMap((section) => extractSectionTextUnitsForSection(section));
}
