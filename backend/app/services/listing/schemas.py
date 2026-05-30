from pydantic import Field

from app.schemas.listing import Money
from shared.schemas.dates import ISODate
from shared.schemas.types import CamelModel


class ExtractionResponse(CamelModel):
  # OpenAI formatted outputs do not accept ListingExtraction | None due to AnyOf limitations.
  title: str | None
  company: str | None
  domain: str | None
  location: str | None
  description: str | None
  posted_date: ISODate | None
  salary: Money | None = None
  skills: list[str] = Field(default_factory=list)
  requirements: list[str] = Field(default_factory=list)
  keywords: list[str] = Field(default_factory=list)

  error: str | None
