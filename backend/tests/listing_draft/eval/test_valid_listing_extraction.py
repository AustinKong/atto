import re

import pytest

from app.schemas.listing import Keyword
from app.schemas.listing_draft import ListingDraft, ListingDraftError, ListingDraftUnique

from .golden_cases import GOLDEN_CASES, GoldenCaseId

pytestmark = pytest.mark.eval

PRIMARY_LISTING_CASE_IDS = (
  GoldenCaseId.CLEAN_MARKDOWN_LISTING,
  GoldenCaseId.MESSY_PASTED_PAGE,
)
EXPECTED_ACTIONABLE_SKILL_GROUPS = (
  frozenset({'c++'}),
  frozenset({'java'}),
  frozenset({'python'}),
  frozenset({'go'}),
  frozenset({'back end development', 'backend development'}),
  frozenset({'full stack development'}),
  frozenset({'mobile apps', 'mobile app development'}),
  frozenset({'web', 'web development'}),
)
MIN_EXPECTED_SKILL_OVERLAP = 4
MIN_FORMAT_SKILL_OVERLAP = 3
GENERIC_SKILL_CONCEPTS = {
  'communication',
  'teamwork',
  'problem solving',
  'computer science',
  'fast paced',
}
MIN_REQUIREMENT_COUNT = 5
MAX_REQUIREMENT_COUNT = 10
MIN_KEYWORD_COUNT = 5
MAX_KEYWORD_WORDS = 3
EXPECTED_KEYWORD_GROUPS = (
  frozenset({'python'}),
  frozenset({'c++'}),
  frozenset({'java'}),
  frozenset({'go'}),
  frozenset({'growth'}),
  frozenset({'feature'}),
  frozenset({'development'}),
  frozenset({'software'}),
  frozenset({'user'}),
  frozenset({'data processing'}),
  frozenset({'back end', 'backend', 'back end development', 'backend development'}),
  frozenset({'mobile apps', 'mobile'}),
  frozenset({'web'}),
)
FORBIDDEN_KEYWORD_GROUPS = (
  frozenset({'about the job'}),
  frozenset({'apply'}),
  frozenset({'full time'}),
  frozenset({'singapore'}),
  frozenset({'acme corp'}),
)
MIN_EXPECTED_KEYWORD_OVERLAP = 2
MIN_FORMAT_KEYWORD_OVERLAP = 1
EXPECTED_SALARY_MIDPOINT = 175000
EXPECTED_SALARY_CURRENCY = 'USD'


def unique_draft_for_case(
  listing_draft_eval_results: dict[GoldenCaseId, ListingDraft],
  case_id: GoldenCaseId,
) -> ListingDraftUnique:
  draft = listing_draft_eval_results[case_id]
  assert isinstance(draft, ListingDraftUnique), (case_id, getattr(draft, 'error', None))
  return draft


def normalized_values(values: list[str]) -> set[str]:
  return {normalize_text(value) for value in values}


def normalize_text(value: str) -> str:
  return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9+#]+', ' ', value.lower())).strip()


def matching_alias_groups(
  values: set[str],
  expected_groups: tuple[frozenset[str], ...],
) -> set[frozenset[str]]:
  return {
    expected_group for expected_group in expected_groups if values.intersection(expected_group)
  }


def generic_skill_matches(skills: set[str]) -> set[str]:
  return {
    generic_concept
    for generic_concept in GENERIC_SKILL_CONCEPTS
    if any(generic_concept in skill for skill in skills)
  }


def assert_requirement_is_not_bare_phrase(requirement: str, skills: set[str]) -> None:
  normalized_requirement = normalize_text(requirement)
  assert len(normalized_requirement.split()) >= 3
  assert normalized_requirement not in skills


def assert_keyword_is_short(keyword: Keyword) -> None:
  assert 1 <= len(keyword.word.split()) <= MAX_KEYWORD_WORDS


def assert_domain_is_plausible(domain: str) -> None:
  assert domain
  assert '://' not in domain
  assert '/' not in domain
  assert '.' in domain


def primary_listing_drafts(
  listing_draft_eval_results: dict[GoldenCaseId, ListingDraft],
) -> dict[GoldenCaseId, ListingDraftUnique]:
  return {
    case_id: unique_draft_for_case(listing_draft_eval_results, case_id)
    for case_id in PRIMARY_LISTING_CASE_IDS
  }


def test_primary_listing_input_formats_return_unique_drafts(
  listing_draft_eval_results: dict[GoldenCaseId, ListingDraft],
):
  """Clean markdown and messy pasted copies of the same listing should both become drafts."""
  for draft in primary_listing_drafts(listing_draft_eval_results).values():
    assert draft.status == 'unique'


def test_primary_listing_input_formats_extract_similar_identity_fields(
  listing_draft_eval_results: dict[GoldenCaseId, ListingDraft],
):
  """Clean markdown and messy pasted copies should match the same golden identity."""
  drafts = primary_listing_drafts(listing_draft_eval_results)

  for case_id, draft in drafts.items():
    listing = draft.listing
    assert listing.company == 'Acme Corp', case_id
    assert 'Software Engineer' in listing.title, case_id
    assert 'Acme Pay' in listing.title or 'Growth' in listing.title, case_id
    assert_domain_is_plausible(listing.domain)
    assert 'singapore' in normalize_text(listing.location or ''), case_id
    assert listing.description, case_id

  clean_listing = drafts[GoldenCaseId.CLEAN_MARKDOWN_LISTING].listing
  messy_listing = drafts[GoldenCaseId.MESSY_PASTED_PAGE].listing
  assert clean_listing.company == messy_listing.company
  assert 'singapore' in normalize_text(clean_listing.location or '')
  assert 'singapore' in normalize_text(messy_listing.location or '')


def test_primary_listing_input_formats_extract_similar_actionable_skills(
  listing_draft_eval_results: dict[GoldenCaseId, ListingDraft],
):
  """Skills should be concrete and broadly stable across clean and messy input formats."""
  drafts = primary_listing_drafts(listing_draft_eval_results)
  skills_by_case = {
    case_id: normalized_values(draft.listing.skills) for case_id, draft in drafts.items()
  }

  for case_id, skills in skills_by_case.items():
    expected_matches = matching_alias_groups(skills, EXPECTED_ACTIONABLE_SKILL_GROUPS)
    assert len(expected_matches) >= MIN_EXPECTED_SKILL_OVERLAP, (case_id, skills)
    assert not generic_skill_matches(skills), (case_id, skills)

  clean_skills = skills_by_case[GoldenCaseId.CLEAN_MARKDOWN_LISTING]
  messy_skills = skills_by_case[GoldenCaseId.MESSY_PASTED_PAGE]
  assert len(clean_skills.intersection(messy_skills)) >= MIN_FORMAT_SKILL_OVERLAP


def test_primary_listing_input_formats_extract_complete_requirements(
  listing_draft_eval_results: dict[GoldenCaseId, ListingDraft],
):
  """Requirements should have usable structure; semantic quality is judged by the LLM judge."""
  for case_id, draft in primary_listing_drafts(listing_draft_eval_results).items():
    requirements = draft.listing.requirements
    skills = normalized_values(draft.listing.skills)

    assert MIN_REQUIREMENT_COUNT <= len(requirements) <= MAX_REQUIREMENT_COUNT, case_id
    for requirement in requirements:
      assert_requirement_is_not_bare_phrase(requirement, skills)


def test_primary_listing_input_formats_extract_similar_source_backed_keywords(
  listing_draft_eval_results: dict[GoldenCaseId, ListingDraft],
):
  """Keywords should stay source-backed, role-relevant, and broadly similar across formats."""
  drafts = primary_listing_drafts(listing_draft_eval_results)
  keyword_values_by_case: dict[GoldenCaseId, set[str]] = {}

  for case_id, draft in drafts.items():
    keywords = draft.listing.keywords
    keyword_values = normalized_values([keyword.word for keyword in keywords])
    keyword_values_by_case[case_id] = keyword_values

    assert len(keywords) >= MIN_KEYWORD_COUNT, case_id
    assert all(keyword.count > 0 for keyword in keywords), case_id
    for keyword in keywords:
      assert_keyword_is_short(keyword)
    keyword_matches = matching_alias_groups(keyword_values, EXPECTED_KEYWORD_GROUPS)
    assert len(keyword_matches) >= MIN_EXPECTED_KEYWORD_OVERLAP, (case_id, keyword_values)
    forbidden_matches = matching_alias_groups(keyword_values, FORBIDDEN_KEYWORD_GROUPS)
    assert not forbidden_matches, (case_id, keyword_values)

  clean_keywords = keyword_values_by_case[GoldenCaseId.CLEAN_MARKDOWN_LISTING]
  messy_keywords = keyword_values_by_case[GoldenCaseId.MESSY_PASTED_PAGE]
  assert len(clean_keywords.intersection(messy_keywords)) >= MIN_FORMAT_KEYWORD_OVERLAP


def test_all_valid_listing_extraction_cases_produce_drafts(
  listing_draft_eval_results: dict[GoldenCaseId, ListingDraft],
):
  """Every active valid extraction fixture should produce an editable draft."""
  valid_case_ids = [case_id for case_id in GOLDEN_CASES if case_id is not GoldenCaseId.INVALID_PAGE]

  for case_id in valid_case_ids:
    draft = listing_draft_eval_results[case_id]
    assert isinstance(draft, ListingDraftUnique), (case_id, getattr(draft, 'error', None))
    assert draft.listing.title
    assert draft.listing.company
    assert draft.listing.description


def test_invalid_application_form_case_returns_error(
  listing_draft_eval_results: dict[GoldenCaseId, ListingDraft],
):
  """An application form page should not be accepted as a complete job listing."""
  draft = listing_draft_eval_results[GoldenCaseId.INVALID_PAGE]

  assert isinstance(draft, ListingDraftError)


def test_salary_range_case_extracts_midpoint_and_currency(
  listing_draft_eval_results: dict[GoldenCaseId, ListingDraft],
):
  """An advertised salary range should become the configured midpoint money value."""
  draft = listing_draft_eval_results[GoldenCaseId.SALARY_RANGE]

  assert isinstance(draft, ListingDraftUnique), getattr(draft, 'error', None)
  assert draft.listing.salary is not None
  assert draft.listing.salary.value == EXPECTED_SALARY_MIDPOINT
  assert draft.listing.salary.currency == EXPECTED_SALARY_CURRENCY
