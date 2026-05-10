from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

from shared.schemas.types import CamelModel

# Reserved UUID for the system default template
DEFAULT_TEMPLATE_ID = UUID('00000000-0000-0000-0000-000000000000')


class Template(BaseModel):
  id: UUID
  title: str
  description: str
  content: str
  source: Literal['local', 'remote']


class TemplateSummary(BaseModel):
  id: UUID
  title: str
  description: str
  source: Literal['local', 'remote', 'both']


class TemplateRenderRect(CamelModel):
  page_index: int = Field(ge=0)
  x: float = Field(ge=0, le=1)
  y: float = Field(ge=0, le=1)
  width: float = Field(ge=0, le=1)
  height: float = Field(ge=0, le=1)


class TemplateRenderResponse(CamelModel):
  pdf_base64: str
  geometry: dict[UUID, list[TemplateRenderRect]] = Field(default_factory=dict)
