import pytest

from app.services.listing.drafts import (
  build_listing_extraction,
  get_ranked_keywords,
)

from ..factories import VALID_LISTING_CONTENT, make_extraction_response

pytestmark = pytest.mark.unit

KEYWORD_PRODUCT_LIMIT = 10
EXTRA_KEYWORDS_OVER_PRODUCT_LIMIT = 2
PYTHON_MENTION_COUNT = 3
EXPECTED_PYTHON_LISTING_COUNT = 2
SINGLE_MENTION_COUNT = 1


def test_get_ranked_keywords_counts_case_insensitive_whole_word_matches():
  """Keyword ranking should count source mentions without treating substrings as matches."""
  content = 'Python python PYTHON. PostgreSQL and postgres are different words. REST APIs.'

  keywords = get_ranked_keywords(['Python', 'PostgreSQL', 'postgres', 'REST APIs'], content)

  assert [(keyword.word, keyword.count) for keyword in keywords] == [
    ('Python', PYTHON_MENTION_COUNT),
    ('PostgreSQL', SINGLE_MENTION_COUNT),
    ('postgres', SINGLE_MENTION_COUNT),
    ('REST APIs', SINGLE_MENTION_COUNT),
  ]


def test_get_ranked_keywords_filters_absent_keywords_and_caps_results():
  """Only source-backed keywords should be kept, capped to the draft product limit."""
  content = ' '.join(
    f'keyword-{index}' for index in range(KEYWORD_PRODUCT_LIMIT + EXTRA_KEYWORDS_OVER_PRODUCT_LIMIT)
  )

  keywords = get_ranked_keywords(
    [
      *(
        f'keyword-{index}'
        for index in range(KEYWORD_PRODUCT_LIMIT + EXTRA_KEYWORDS_OVER_PRODUCT_LIMIT)
      ),
      'missing',
    ],
    content,
  )

  assert len(keywords) == KEYWORD_PRODUCT_LIMIT
  assert {keyword.word for keyword in keywords}.isdisjoint({'missing', 'keyword-10', 'keyword-11'})


def test_build_listing_extraction_maps_fields_and_ranks_keywords():
  """The system doesn't blindly accept model extracted keywords (Missing)
  if it doesn't exist in listing content"""
  extraction = make_extraction_response(
    skills=['Python', 'PostgreSQL'],
    requirements=['Build APIs.', 'Operate databases.'],
    keywords=['PostgreSQL', 'Python', 'Missing'],
  )

  listing = build_listing_extraction(extraction, VALID_LISTING_CONTENT)

  assert listing.title == 'Backend Engineer'
  assert listing.company == 'Example Co'
  assert listing.skills == ['Python', 'PostgreSQL']
  assert listing.requirements == ['Build APIs.', 'Operate databases.']
  assert [(keyword.word, keyword.count) for keyword in listing.keywords] == [
    ('Python', EXPECTED_PYTHON_LISTING_COUNT),
    ('PostgreSQL', SINGLE_MENTION_COUNT),
  ]
