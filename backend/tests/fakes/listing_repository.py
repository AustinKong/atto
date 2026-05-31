from dataclasses import dataclass, field

from pydantic import HttpUrl

from app.repositories import ListingRepository
from app.schemas.listing import Listing


@dataclass
class FakeListingRepository(ListingRepository):
  listings_by_url: dict[str, Listing] = field(default_factory=dict)
  semantic_candidates: list[tuple[Listing, float]] = field(default_factory=list)
  heuristic_candidates: list[tuple[Listing, float]] = field(default_factory=list)
  get_by_url_calls: list[HttpUrl] = field(default_factory=list)
  semantic_duplicate_calls: list[Listing] = field(default_factory=list)
  heuristic_duplicate_calls: list[Listing] = field(default_factory=list)

  def get_by_url(self, url: HttpUrl) -> Listing | None:
    self.get_by_url_calls.append(url)
    return self.listings_by_url.get(str(url))

  async def find_semantic_duplicate_candidates(
    self,
    new_listing: Listing,
  ) -> list[tuple[Listing, float]]:
    self.semantic_duplicate_calls.append(new_listing)
    return self.semantic_candidates

  def find_heuristic_duplicate_candidates(
    self,
    new_listing: Listing,
  ) -> list[tuple[Listing, float]]:
    self.heuristic_duplicate_calls.append(new_listing)
    return self.heuristic_candidates
