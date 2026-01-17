from datetime import date
from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Body, Query
from pydantic import HttpUrl

from app.resources.prompts import (
  COMPANY_INSIGHTS_PROMPT,
  LINK_SELECTION_PROMPT,
  LISTING_EXTRACTION_PROMPT,
)
from app.schemas import (
  ExtractionResponse,
  LinkSelectionResponse,
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
from app.services import applications_service, listings_service, llm_service, scraping_service
from app.utils.url import normalize_url

router = APIRouter(
  prefix='/listings',
  tags=['Listings'],
)


# TODO: Refine the AI's extraction grounded values. (AI might format text slightly differently than
# in the HTML), need to use more robust fuzzy matching technique to ensure grounded values match
# HTML.
@router.post('/draft', response_model=ListingDraft)
async def ingest_listing(
  url: Annotated[HttpUrl, Body()],
  id: Annotated[UUID, Body()],
  content: Annotated[str | None, Body()] = None,
) -> ListingDraft:
  url = normalize_url(url)
  html = None

  existing_listing = listings_service.get_by_url(url)

  if existing_listing:
    return ListingDraftDuplicateUrl(
      id=id,
      url=url,
      duplicate_of=existing_listing,
    )

  if content is None:
    try:
      page = await scraping_service.fetch_and_clean(url)
    except Exception as e:
      return ListingDraftError(
        id=id,
        url=url,
        error=str(e),
        html=None,
      )

    content = page.content
    html = page.html

  try:
    extraction = await llm_service.call_structured(
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
      html=html,
    )

  # Expected error (Not a listing etc.)
  if extraction.error is not None:
    return ListingDraftError(
      id=id,
      url=url,
      error=extraction.error or 'Unknown extraction error',
      html=html,
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
        html=html,
      )

  similar_match = listings_service.find_similar(
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
      html=html,
    )

  return ListingDraftUnique(id=id, url=url, listing=listing, html=html)


@router.get('', response_model=Page[ListingSummary])
async def get_listings(
  page: int = 1,
  size: int = 10,
  search: str | None = None,
  status: Annotated[list[StatusEnum] | None, Query()] = None,
  sort_by: Literal['title', 'company', 'posted_at', 'last_status_at'] | None = None,
  sort_dir: Literal['asc', 'desc'] | None = None,
):
  return listings_service.list_all(page, size, search, status, sort_by, sort_dir)


@router.get('/{id}', response_model=Listing)
async def get_listing(id: UUID):
  listing = listings_service.get(id)
  listing.applications = applications_service.get_by_listing_id(id)
  return listing


@router.post('')
async def save_listing(listing: Listing):
  saved_listing = listings_service.create(listing)
  return saved_listing


@router.put('/{id}/notes')
async def update_listing_notes(id: UUID, notes: Annotated[str | None, Body()]):
  updated_listing = listings_service.update_notes(id, notes)
  return updated_listing


@router.post('/{id}/insights', response_model=Listing)
async def generate_insights(id: UUID):
  listing = listings_service.get(id)

  urls_to_scrape = [
    f'https://{listing.domain}',
    listing.url,
  ]

  seen_urls = set()
  all_anchors = []
  for url in urls_to_scrape:
    try:
      anchors = await scraping_service.extract_anchor_tags(url)
      for anchor in anchors:
        if anchor['href'] not in seen_urls:
          seen_urls.add(anchor['href'])
          all_anchors.append(anchor)
    except Exception:
      # If extraction fails for this URL, continue with next URL (domain is not guaranteed to work)
      continue

  links_text = '\n'.join([f'- {anchor["text"]}: {anchor["href"]}' for anchor in all_anchors[:100]])

  link_selection = await llm_service.call_structured(
    input=LINK_SELECTION_PROMPT.format(company=listing.company, links=links_text),
    response_model=LinkSelectionResponse,
  )

  page_contents = []
  for url in link_selection:
    try:
      page = await scraping_service.fetch_and_clean(url.url)
      content = f'URL: {url}\n\n{page.content}'
      page_contents.append(content)
    except Exception:
      continue

  combined_content = '\n\n---\n\n'.join(page_contents)

  insights = await llm_service.call_unstructured(
    input=COMPANY_INSIGHTS_PROMPT.format(company=listing.company, page_contents=combined_content),
  )

  updated_listing = listings_service.update_insights(id, insights)
  updated_listing.applications = applications_service.get_by_listing_id(id)

  return updated_listing
