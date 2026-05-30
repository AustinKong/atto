from enum import StrEnum
from typing import Annotated, Literal
from uuid import UUID, uuid4

from pydantic import Field, HttpUrl

from app.schemas.listing import Listing, ListingBase
from shared.schemas.types import CamelModel


class DraftStatusEnum(StrEnum):
  UNIQUE = 'unique'
  DUPLICATE_URL = 'duplicate_url'
  DUPLICATE_CONTENT = 'duplicate_content'
  ERROR = 'error'


class ListingExtraction(ListingBase):
  description: str
  skills: list[str] = Field(default_factory=list)
  requirements: list[str] = Field(default_factory=list)


class BaseListingDraft(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  url: HttpUrl


class ListingDraftUnique(BaseListingDraft):
  status: Literal[DraftStatusEnum.UNIQUE] = DraftStatusEnum.UNIQUE
  listing: ListingExtraction
  screenshot: str | None = None


class ListingDraftDuplicateUrl(BaseListingDraft):
  status: Literal[DraftStatusEnum.DUPLICATE_URL] = DraftStatusEnum.DUPLICATE_URL
  duplicate_of: Listing


class ListingDraftDuplicateContent(BaseListingDraft):
  status: Literal[DraftStatusEnum.DUPLICATE_CONTENT] = DraftStatusEnum.DUPLICATE_CONTENT
  listing: ListingExtraction
  duplicate_of: Listing
  screenshot: str | None = None


class ListingDraftError(BaseListingDraft):
  status: Literal[DraftStatusEnum.ERROR] = DraftStatusEnum.ERROR
  error: str
  screenshot: str | None = None


ListingDraft = Annotated[
  ListingDraftUnique | ListingDraftDuplicateUrl | ListingDraftDuplicateContent | ListingDraftError,
  Field(discriminator='status'),
]
