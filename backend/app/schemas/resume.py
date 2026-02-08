from typing import Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from app.schemas.dates import ISOYearMonth


class DetailedItem(BaseModel):
  title: str
  subtitle: str | None = None
  start_date: ISOYearMonth | None = None
  end_date: ISOYearMonth | Literal['present'] | None = None
  bullets: list[str]


class DetailedSectionContent(BaseModel):
  bullets: list[DetailedItem]


class SimpleSectionContent(BaseModel):
  bullets: list[str]


class ParagraphSectionContent(BaseModel):
  text: str


SectionContent = DetailedSectionContent | SimpleSectionContent | ParagraphSectionContent


class Section(BaseModel):
  id: str
  type: str
  title: str
  content: SectionContent


class Resume(BaseModel):
  id: UUID = Field(default_factory=uuid4)
  template: str
  sections: list[Section]
