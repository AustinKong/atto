from typing import Self

from pydantic import EmailStr, Field

from app.schemas.resume import Section
from app.schemas.types import CamelModel


class Profile(CamelModel):
  full_name: str
  email: EmailStr | None = None
  phone: str | None = None
  location: str | None = None
  website: str | None = None

  base_sections: list[Section] = Field(
    default_factory=list,
    description='Base sections to prepopulate new resumes',
  )

  @classmethod
  def empty(cls) -> Self:
    return cls(
      full_name='',
      email=None,
      phone=None,
      location=None,
      website=None,
      base_sections=[],
    )
