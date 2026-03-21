from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Body, Depends, Query
from pydantic import HttpUrl

from app.repositories import ApplicationRepository, ListingRepository
from app.schemas import (
  Listing,
  ListingDraft,
  ListingSummary,
  Page,
  StatusEnum,
)
from app.services import ListingService

router = APIRouter(
  prefix='/listings',
  tags=['Listings'],
)


@router.post('/draft', response_model=ListingDraft)
async def generate_listing_draft(
  listing_service: Annotated[ListingService, Depends()],
  url: Annotated[HttpUrl, Body()],
  id: Annotated[UUID, Body()],
  content: Annotated[str | None, Body()] = None,
):
  return await listing_service.generate_listing_draft(
    url=url,
    content=content,
    id=id,
  )


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
  listing_service: Annotated[ListingService, Depends()],
):
  return await listing_service.generate_insights(listing_id=id)
