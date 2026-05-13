from enum import StrEnum
from typing import Annotated, Literal, cast
from uuid import UUID, uuid4

from pydantic import Field

from app.utils.hash import hash_json_value
from app.utils.text import to_bullets
from shared.schemas.dates import ISOYearMonth
from shared.schemas.types import CamelModel

# Reserved UUID for the default resume
DEFAULT_RESUME_ID = UUID('00000000-0000-0000-0000-000000000000')


class SectionTypeEnum(StrEnum):
  SIMPLE = 'simple'
  DETAILED = 'detailed'
  PARAGRAPH = 'paragraph'


class TextUnit(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  content: str = ''


class DateRangeUnit(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  start_date: ISOYearMonth | None = None
  end_date: ISOYearMonth | Literal['present'] | None = None


class DetailedItem(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  title: TextUnit = Field(default_factory=TextUnit)
  subtitle: TextUnit = Field(default_factory=TextUnit)
  date_range: DateRangeUnit = Field(default_factory=DateRangeUnit)
  bullets: list[TextUnit] = Field(default_factory=list)


class BaseSection(CamelModel):
  id: UUID
  title: TextUnit = Field(default_factory=TextUnit)


class SimpleSection(BaseSection):
  type: Literal[SectionTypeEnum.SIMPLE] = SectionTypeEnum.SIMPLE
  content: list[TextUnit]


class DetailedSection(BaseSection):
  type: Literal[SectionTypeEnum.DETAILED] = SectionTypeEnum.DETAILED
  content: list[DetailedItem]


class ParagraphSection(BaseSection):
  type: Literal[SectionTypeEnum.PARAGRAPH] = SectionTypeEnum.PARAGRAPH
  content: TextUnit = Field(default_factory=TextUnit)


Section = Annotated[
  SimpleSection | DetailedSection | ParagraphSection,
  Field(discriminator='type'),
]


class Resume(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  template_id: UUID
  sections: list[Section]

  def to_analysis_text(self) -> str:
    text = ''

    for section in self.sections:
      text += f'{section.title.content}\n'
      text += f'{_build_section_analysis_text(section)}\n'

    return text.strip()

  def create_hash(self) -> str:
    return hash_json_value(self.model_dump(mode='json', by_alias=True))


def _build_simple_section_text(section: SimpleSection) -> str:
  return to_bullets([item.content for item in section.content])


def _build_detailed_section_text(section: DetailedSection) -> str:
  text = ''
  for item in section.content:
    text += f'{item.title.content}\n'
    if item.subtitle.content.strip():
      text += f'{item.subtitle.content}\n'
    text += f'{to_bullets([bullet.content for bullet in item.bullets])}\n'
  return text.strip()


def _build_paragraph_section_text(section: ParagraphSection) -> str:
  return section.content.content


def _build_section_analysis_text(section: Section) -> str:
  if section.type == SectionTypeEnum.SIMPLE:
    return _build_simple_section_text(cast(SimpleSection, section))
  if section.type == SectionTypeEnum.DETAILED:
    return _build_detailed_section_text(cast(DetailedSection, section))
  if section.type == SectionTypeEnum.PARAGRAPH:
    return _build_paragraph_section_text(cast(ParagraphSection, section))
  return ''
