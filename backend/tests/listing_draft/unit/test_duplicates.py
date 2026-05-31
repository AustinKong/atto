import pytest

from app.services.listing.duplicates import find_similar_listing
from tests.fakes import FakeListingRepository

from ..factories import make_listing

pytestmark = pytest.mark.unit

HIGH_SEMANTIC_DUPLICATE_SCORE = 0.92
LOWER_HEURISTIC_DUPLICATE_SCORE = 0.88
LOWER_SEMANTIC_DUPLICATE_SCORE = 0.86
HIGH_HEURISTIC_DUPLICATE_SCORE = 0.94
STRONG_CROSS_COMPANY_DUPLICATE_SCORE = 0.99


@pytest.mark.anyio
async def test_find_similar_listing_returns_semantic_match_when_it_has_highest_score():
  """The strongest semantic candidate should win when it outranks heuristic evidence."""
  semantic_match = make_listing(title='Senior Backend Engineer')
  heuristic_match = make_listing(title='Backend Engineer')
  repository = FakeListingRepository(
    semantic_candidates=[(semantic_match, HIGH_SEMANTIC_DUPLICATE_SCORE)],
    heuristic_candidates=[(heuristic_match, LOWER_HEURISTIC_DUPLICATE_SCORE)],
  )

  match = await find_similar_listing(repository, make_listing())

  assert match == semantic_match


@pytest.mark.anyio
async def test_find_similar_listing_returns_heuristic_match_when_it_has_highest_score():
  """A stronger title/company heuristic match should win over weaker semantic evidence."""
  semantic_match = make_listing(title='Backend Platform Engineer')
  heuristic_match = make_listing(title='Backend Engineer')
  repository = FakeListingRepository(
    semantic_candidates=[(semantic_match, LOWER_SEMANTIC_DUPLICATE_SCORE)],
    heuristic_candidates=[(heuristic_match, HIGH_HEURISTIC_DUPLICATE_SCORE)],
  )

  match = await find_similar_listing(repository, make_listing())

  assert match == heuristic_match


@pytest.mark.anyio
async def test_find_similar_listing_rejects_candidate_from_different_company():
  """Similar listings from a different company should not block a new draft."""
  repository = FakeListingRepository(
    semantic_candidates=[(make_listing(company='Other Co'), STRONG_CROSS_COMPANY_DUPLICATE_SCORE)],
  )

  match = await find_similar_listing(repository, make_listing(company='Example Co'))

  assert match is None


@pytest.mark.anyio
async def test_find_similar_listing_returns_none_without_candidates():
  """No semantic or heuristic candidates means no duplicate match."""
  repository = FakeListingRepository()

  match = await find_similar_listing(repository, make_listing())

  assert match is None
