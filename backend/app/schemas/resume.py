from typing import Literal
from uuid import UUID, uuid4

from pydantic import Field

from app.schemas.dates import ISOYearMonth
from app.schemas.types import CamelModel


class DetailedItem(CamelModel):
  title: str
  subtitle: str | None = None
  start_date: ISOYearMonth | None = None
  end_date: ISOYearMonth | Literal['present'] | None = None
  bullets: list[str]


class DetailedSectionContent(CamelModel):
  bullets: list[DetailedItem]


class SimpleSectionContent(CamelModel):
  bullets: list[str]


class ParagraphSectionContent(CamelModel):
  text: str


SectionContent = DetailedSectionContent | SimpleSectionContent | ParagraphSectionContent


class Section(CamelModel):
  id: str
  type: str
  title: str
  content: SectionContent


class Resume(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  template_id: str
  sections: list[Section]
