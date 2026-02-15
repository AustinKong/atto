from typing import Self

from pydantic import Field

from app.schemas.resume import Section
from app.schemas.types import CamelModel


class Profile(CamelModel):
  full_name: str
  email: str
  phone: str
  location: str
  website: str

  base_sections: list[Section] = Field(
    default_factory=list,
    description='Base sections to prepopulate new resumes',
  )

  @classmethod
  def empty(cls) -> Self:
    return cls(
      full_name='',
      email='',
      phone='',
      location='',
      website='',
      base_sections=[],
    )
