from typing import Literal

from pydantic import Field, field_validator

from app.schemas.application import Application
from app.schemas.listing import Listing
from app.schemas.profile import Profile
from app.schemas.resume import Resume
from shared.schemas.dates import ISODate
from shared.schemas.types import CamelModel


class PaperFixture(CamelModel):
  version: Literal[1] = 1
  anchor_date: ISODate
  profile: Profile
  resumes: list[Resume] = Field(default_factory=list)
  listings: list[Listing] = Field(default_factory=list)
  applications: list[Application] = Field(default_factory=list)

  @field_validator('listings')
  @classmethod
  def validate_unique_companies_and_roles(cls, listings: list[Listing]) -> list[Listing]:
    seen: set[tuple[str, str]] = set()
    for listing in listings:
      key = (listing.company.lower(), listing.title.lower())
      if key in seen:
        raise ValueError(f'duplicate company/title pair: {key}')
      seen.add(key)
    return listings
