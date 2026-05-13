from typing import assert_never
from uuid import UUID

from app.schemas.resume import DetailedSection, ParagraphSection, Section, SimpleSection

TextUnitRef = tuple[UUID, str]


def extract_section_text_units(section: Section) -> list[TextUnitRef]:
  match section:
    case SimpleSection():
      return [(item.id, item.content.strip()) for item in section.content if item.content.strip()]
    case DetailedSection():
      units: list[TextUnitRef] = []
      for item in section.content:
        for unit in [item.title, item.subtitle, *item.bullets]:
          text = unit.content.strip()
          if text:
            units.append((unit.id, text))
      return units
    case ParagraphSection():
      text = section.content.content.strip()
      return [(section.content.id, text)] if text else []
    case _:
      assert_never(section)
