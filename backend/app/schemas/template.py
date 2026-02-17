from typing import Literal

from pydantic import BaseModel


class Template(BaseModel):
  id: str
  title: str
  description: str
  content: str
  source: Literal['local', 'remote']


class TemplateSummary(BaseModel):
  id: str
  title: str
  description: str
  source: Literal['local', 'remote', 'both']
