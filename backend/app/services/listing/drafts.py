import re
from uuid import UUID

from pydantic import HttpUrl

from app.schemas.listing import Keyword, Listing
from app.schemas.listing_draft import ListingExtraction

from .schemas import ExtractionResponse


def build_listing_extraction(extraction: ExtractionResponse, content: str) -> ListingExtraction:
  listing = ListingExtraction.model_validate(extraction.model_dump(exclude={'keywords'}))
  listing.keywords = get_ranked_keywords(extraction.keywords, content)
  return listing


def build_duplicate_candidate(listing: ListingExtraction, id: UUID, url: HttpUrl) -> Listing:
  return Listing(
    **listing.model_dump(exclude={'skills', 'requirements'}),
    skills=listing.skills,
    requirements=listing.requirements,
    id=id,
    url=url,
  )


def get_ranked_keywords(keywords: list[str], content: str) -> list[Keyword]:
  counted_keywords = [
    Keyword(
      word=keyword,
      count=len(re.findall(rf'\b{re.escape(keyword)}\b', content, re.IGNORECASE)),
    )
    for keyword in keywords
  ]
  return sorted(
    [keyword for keyword in counted_keywords if keyword.count > 0],
    key=lambda keyword: keyword.count,
    reverse=True,
  )[:10]
