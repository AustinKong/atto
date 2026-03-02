from typing import Literal
from uuid import UUID

from pydantic import BaseModel

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
