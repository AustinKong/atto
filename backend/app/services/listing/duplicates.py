from app.repositories.listing_repository import ListingRepository
from app.schemas.listing import Listing


async def find_similar_listing(
  listing_repository: ListingRepository,
  new_listing: Listing,
) -> Listing | None:
  best_match = None
  best_score = 0.0

  semantic_matches = await listing_repository.find_semantic_duplicate_candidates(new_listing)
  if semantic_matches:
    match, score = semantic_matches[0]
    if score > best_score:
      best_match = match
      best_score = score

  heuristic_matches = listing_repository.find_heuristic_duplicate_candidates(new_listing)
  if heuristic_matches:
    match, score = heuristic_matches[0]
    if score > best_score:
      best_match = match
      best_score = score

  if best_match and new_listing.company != best_match.company:
    return None

  return best_match
