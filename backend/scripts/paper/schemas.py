from pydantic import Field

from shared.schemas.types import CamelModel


class PaperListingTargetResponse(CamelModel):
  company: str = Field(min_length=1)
  title: str = Field(min_length=1)


class PaperListingTargetsResponse(CamelModel):
  items: list[PaperListingTargetResponse]


class PaperResearchSourceResponse(CamelModel):
  url: str = Field(min_length=1)
  title: str = Field(min_length=1)
  content: str = Field(min_length=1)


class PaperTimelineNotesResponse(CamelModel):
  saved: str = Field(min_length=1)
  applied: str = Field(min_length=1)
  screening: str = Field(min_length=1)
  interview: str = Field(min_length=1)
  offer_received: str = Field(min_length=1)
  accepted: str = Field(min_length=1)
  rejected: str = Field(min_length=1)
  ghosted: str = Field(min_length=1)
  withdrawn: str = Field(min_length=1)
  rescinded: str = Field(min_length=1)


class PaperListingResponse(CamelModel):
  company: str = Field(min_length=1)
  title: str = Field(min_length=1)
  domain: str = Field(min_length=1, pattern=r'^[a-z0-9.-]+\.[a-z]{2,}$')
  location: str | None = None
  description: str = Field(min_length=1)
  skills: list[str] = Field(min_length=5, max_length=8)
  requirements: list[str] = Field(min_length=5, max_length=8)
  keywords: list[str] = Field(min_length=5, max_length=10)
  research_sources: list[PaperResearchSourceResponse] = Field(min_length=2, max_length=3)
  market_summary: str = Field(min_length=1)
  research_notes: str = Field(min_length=1)
  timeline_notes: PaperTimelineNotesResponse
  applicant_insights: list[str] = Field(min_length=3, max_length=5)
