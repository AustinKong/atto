from enum import StrEnum
from typing import Annotated, Literal
from uuid import UUID, uuid4

from pydantic import Field

from app.schemas.dates import ISOYearMonth
from app.schemas.types import CamelModel


class SectionTypeEnum(StrEnum):
  SIMPLE = 'simple'
  DETAILED = 'detailed'
  PARAGRAPH = 'paragraph'


class DetailedItem(CamelModel):
  title: str
  subtitle: str = ''
  start_date: ISOYearMonth | None = None
  end_date: ISOYearMonth | Literal['present'] | None = None
  bullets: list[str]


class BaseSection(CamelModel):
  id: str
  title: str


class SimpleSection(BaseSection):
  type: Literal[SectionTypeEnum.SIMPLE] = SectionTypeEnum.SIMPLE
  content: list[str]


class DetailedSection(BaseSection):
  type: Literal[SectionTypeEnum.DETAILED] = SectionTypeEnum.DETAILED
  content: list[DetailedItem]


class ParagraphSection(BaseSection):
  type: Literal[SectionTypeEnum.PARAGRAPH] = SectionTypeEnum.PARAGRAPH
  content: str


Section = Annotated[
  SimpleSection | DetailedSection | ParagraphSection,
  Field(discriminator='type'),
]


class Resume(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  template_id: str
  sections: list[Section]
