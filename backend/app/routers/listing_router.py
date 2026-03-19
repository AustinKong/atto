from datetime import date
from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Body, Depends, Query
from pydantic import HttpUrl

from app.clients.llm_client import LLMClient
from app.clients.scraping_client import ScrapingClient
from app.config import settings
from app.repositories import ApplicationRepository, ListingRepository
from app.resources.prompts import (
  COMPANY_INSIGHTS_PROMPT,
  LISTING_EXTRACTION_PROMPT,
)
from app.schemas import (
  ExtractionResponse,
  Listing,
  ListingDraft,
  ListingDraftDuplicateContent,
  ListingDraftDuplicateUrl,
  ListingDraftError,
  ListingDraftUnique,
  ListingExtraction,
  ListingSummary,
  Page,
  StatusEnum,
)
from app.utils.text import ground_quote
from app.utils.url import normalize_url

router = APIRouter(
  prefix='/listings',
  tags=['Listings'],
)


def _is_junk_content(content: str) -> bool:
  """
  Detect if scraped content is junk (bot checks, cookie notices, etc).
  Returns True if content appears to be junk, False if it's real content.
  """
  if not content:
    return True

  junk_patterns = [
    'please verify that you',
    "verify that you're a real person",
    'bot verification',
    'by verifying that you',
    'accept all cookies',
    'we use cookies',
    'cookie consent',
    'cloudflare',
    'security check',
    'proving you are human',
    'robot check',
    'please solve',
    'captcha',
    'recaptcha',
    'temporary block',
    '403 forbidden',
    'overenie že nie ste',
    'webová lokalita používa',
  ]

  content_lower = content.lower()
  return sum(1 for pattern in junk_patterns if pattern in content_lower) > 2


def _filter_search_content(content: str, max_length: int = 800) -> str:
  """
  Filter scraped search result content to extract meaningful text.
  Removes noise and truncates to reasonable length.
  """
  if _is_junk_content(content):
    return ''

  # Clean up whitespace and multiple newlines
  lines = [line.strip() for line in content.split('\n') if line.strip()]
  content = '\n'.join(lines)

  # Truncate to max length
  if len(content) > max_length:
    content = content[:max_length] + '...'

  return content


@router.post('/draft', response_model=ListingDraft)
async def ingest_listing(
  listing_repository: Annotated[ListingRepository, Depends()],
  llm_client: Annotated[LLMClient, Depends()],
  scraping_client: Annotated[ScrapingClient, Depends()],
  url: Annotated[HttpUrl, Body()],
  id: Annotated[UUID, Body()],
  content: Annotated[str | None, Body()] = None,
) -> ListingDraft:
  url = normalize_url(url)
  screenshot = None

  existing_listing = listing_repository.get_by_url(url)

  if existing_listing:
    return ListingDraftDuplicateUrl(
      id=id,
      url=url,
      duplicate_of=existing_listing,
    )

  # If no API key, skip extraction and return empty listing for manual filling
  if not settings.config.model.openai_api_key:
    return ListingDraftUnique(
      id=id,
      url=url,
      listing=ListingExtraction(
        title='',
        company='',
        domain=url.host or '',
        description='',
      ),
      screenshot=None,
    )

  if content is None:
    try:
      page = await scraping_client.fetch_and_clean(url)
    except Exception as e:
      return ListingDraftError(
        id=id,
        url=url,
        error=str(e),
        screenshot=None,
      )

    content = page.content
    screenshot = page.screenshot

  try:
    extraction = await llm_client.call_structured(
      input=LISTING_EXTRACTION_PROMPT.format(
        current_date=date.today().isoformat(), content=content
      ),
      response_model=ExtractionResponse,
    )
  except Exception as e:
    # Unexpected extraction error
    return ListingDraftError(
      id=id,
      url=url,
      error=str(e),
      screenshot=screenshot,
    )

  # Expected error (Not a listing etc.)
  if extraction.error is not None:
    return ListingDraftError(
      id=id,
      url=url,
      error=extraction.error or 'Unknown extraction error',
      screenshot=screenshot,
    )
  else:
    # Successful extraction but missing data
    try:
      listing = ListingExtraction.model_validate(extraction.model_dump())
    except Exception as e:
      return ListingDraftError(
        id=id,
        url=url,
        error=f'LLM success indicated but data was incomplete: {str(e)}',
        screenshot=screenshot,
      )

    for skill in listing.skills:
      if skill.quote:
        skill.quote = ground_quote(skill.quote, content)

    for req in listing.requirements:
      if req.quote:
        req.quote = ground_quote(req.quote, content)

  similar_match = listing_repository.find_similar(
    Listing(
      **listing.model_dump(exclude={'skills', 'requirements'}),
      skills=[skill.value for skill in listing.skills],
      requirements=[req.value for req in listing.requirements],
      id=id,
      url=url,
    )
  )

  if similar_match:
    return ListingDraftDuplicateContent(
      id=id,
      url=url,
      listing=listing,
      duplicate_of=similar_match,
      screenshot=screenshot,
    )

  return ListingDraftUnique(id=id, url=url, listing=listing, screenshot=screenshot)


@router.get('', response_model=Page[ListingSummary])
async def get_listings(
  listing_repository: Annotated[ListingRepository, Depends()],
  page: int | None = 1,
  size: int | None = 10,
  search: str | None = None,
  status: list[StatusEnum] | None = None,
  sort_by: Annotated[
    Literal['title', 'company', 'posted_at', 'last_status_at'] | None,
    Query(alias='sort-by'),
  ] = None,
  sort_dir: Annotated[Literal['asc', 'desc'] | None, Query(alias='sort-dir')] = None,
):
  return listing_repository.list_all(page, size, search, status, sort_by, sort_dir)


@router.get('/{id}', response_model=Listing)
async def get_listing(
  listing_repository: Annotated[ListingRepository, Depends()],
  application_repository: Annotated[ApplicationRepository, Depends()],
  id: UUID,
):
  listing = listing_repository.get(id)
  listing.applications = application_repository.get_by_listing_id(id)
  return listing


@router.post('')
async def save_listing(
  listing: Listing,
  listing_repository: Annotated[ListingRepository, Depends()],
):
  return listing_repository.create(listing)


@router.put('/{id}/notes')
async def update_listing_notes(
  id: UUID,
  listing_repository: Annotated[ListingRepository, Depends()],
  notes: Annotated[str | None, Body()] = None,
):
  return listing_repository.update_notes(id, notes)


@router.post('/{id}/insights', response_model=Listing)
async def generate_insights(
  id: UUID,
  listing_repository: Annotated[ListingRepository, Depends()],
  application_repository: Annotated[ApplicationRepository, Depends()],
  scraping_client: Annotated[ScrapingClient, Depends()],
  llm_client: Annotated[LLMClient, Depends()],
):
  listing = listing_repository.get(id)

  # Parallel research tasks
  company_info = ''
  news_and_trends = ''
  sentiment_and_reviews = ''

  # Task 1: Get company background from official website
  start_url = HttpUrl(f'https://{listing.domain}')
  try:
    company_info = await scraping_client.deep_crawl(
      url=start_url,
      max_depth=2,
      max_pages=15,
      include_external=False,
    )
  except Exception:
    # Fallback: try the listing URL directly
    try:
      company_info = await scraping_client.deep_crawl(
        url=listing.url,
        max_depth=1,
        max_pages=5,
        include_external=False,
      )
    except Exception:
      company_info = ''

  # Task 2: Search for recent news and market trends
  try:
    news_results = scraping_client.search(
      query=f'{listing.company} news market trends 2025 2026',
      max_results=5,
    )
    news_and_trends = ''
    if news_results:
      news_contents = []
      for result in news_results:
        try:
          # Scrape the actual content from each search result URL
          page = await scraping_client.fetch_and_clean(HttpUrl(result['href']))
          if page.content:
            filtered = _filter_search_content(page.content)
            if filtered:  # Only add if not junk
              news_contents.append(f'Source: {result["title"]}\n{filtered}')
        except Exception:
          # Fallback to snippet if scraping fails
          if result['body'] and not _is_junk_content(result['body']):
            news_contents.append(f'- {result["title"]}: {result["body"][:300]}')
      news_and_trends = '\n\n'.join(news_contents)
  except Exception:
    news_and_trends = ''

  # Task 3: Search for public sentiment and employee reviews
  try:
    sentiment_results = scraping_client.search(
      query=f'{listing.company} employee reviews company culture sentiment outlook',
      max_results=5,
    )
    sentiment_and_reviews = ''
    if sentiment_results:
      sentiment_contents = []
      for result in sentiment_results:
        try:
          # Scrape the actual content from each search result URL
          page = await scraping_client.fetch_and_clean(HttpUrl(result['href']))
          if page.content:
            filtered = _filter_search_content(page.content)
            if filtered:  # Only add if not junk
              sentiment_contents.append(f'Source: {result["title"]}\n{filtered}')
        except Exception:
          # Fallback to snippet if scraping fails
          if result['body'] and not _is_junk_content(result['body']):
            sentiment_contents.append(f'- {result["title"]}: {result["body"][:300]}')
      sentiment_and_reviews = '\n\n'.join(sentiment_contents)
  except Exception:
    sentiment_and_reviews = ''

  # If we have no information at all, return listing without insights
  if not company_info and not news_and_trends and not sentiment_and_reviews:
    return listing

  print(
    f'[DEBUG] Research results for {listing.company}:\n'
    f'Company Info: {company_info}...\n'
    f'News & Trends: {news_and_trends}...\n'
    f'Sentiment & Reviews: {sentiment_and_reviews}...\n'
  )

  insights = await llm_client.call_unstructured(
    input=COMPANY_INSIGHTS_PROMPT.format(
      company=listing.company,
      company_info=company_info or '(No official company information found)',
      news_and_trends=news_and_trends or '(No recent news found)',
      sentiment_and_reviews=sentiment_and_reviews or '(No public sentiment data found)',
    ),
  )

  updated_listing = listing_repository.update_insights(id, insights)
  updated_listing.applications = application_repository.get_by_listing_id(id)

  print(insights)

  return updated_listing
