import hashlib
import json
from enum import StrEnum
from typing import Annotated, Literal
from uuid import UUID, uuid4

from pydantic import Field

from app.schemas.dates import ISOYearMonth
from app.utils.text import to_bullets
from shared.schemas.types import CamelModel

# Reserved UUID for the default resume
DEFAULT_RESUME_ID = UUID('00000000-0000-0000-0000-000000000000')


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
  template_id: UUID
  sections: list[Section]

  def to_analysis_text(self) -> str:
    text = ''

    for section in self.sections:
      text += f'{section.title}\n'
      if isinstance(section, SimpleSection):
        text += f'{to_bullets(section.content)}\n'
      elif isinstance(section, DetailedSection):
        for item in section.content:
          text += f'{item.title}\n'
          if item.subtitle.strip():
            text += f'{item.subtitle}\n'
          text += f'{to_bullets(item.bullets)}\n'
      elif isinstance(section, ParagraphSection):
        text += f'{section.content}\n'

    return text.strip()

  def create_hash(self) -> str:
    payload = json.dumps(self.model_dump(mode='json', by_alias=True), sort_keys=True)
    return hashlib.sha256(payload.encode('utf-8')).hexdigest()
