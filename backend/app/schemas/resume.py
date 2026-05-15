from enum import StrEnum
from typing import Annotated, Literal
from uuid import UUID, uuid4

from pydantic import Field

from app.utils.hash import hash_json_value
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

  def create_hash(self) -> str:
    section_payloads = [
      section.model_dump(mode='json', by_alias=True) for section in self.sections
    ]
    return hash_json_value(section_payloads)
