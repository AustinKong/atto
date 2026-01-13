from enum import Enum
from typing import Annotated, Generic, Literal, TypeVar
from uuid import UUID, uuid4

from pydantic import Field, HttpUrl

from app.schemas.dates import ISODate
from app.schemas.listing import Listing, ListingBase
from app.schemas.types import CamelModel

T = TypeVar('T')


class DraftStatusEnum(str, Enum):
  UNIQUE = 'unique'
  DUPLICATE_URL = 'duplicate_url'
  DUPLICATE_CONTENT = 'duplicate_content'
  ERROR = 'error'


class GroundedItem(CamelModel, Generic[T]):
  value: T
  quote: str | None = Field(
    description='The single most relevant substring from the text that justifies this item.'
  )


class ListingExtraction(ListingBase):
  description: str
  skills: list[GroundedItem[str]] = Field(default_factory=list)
  requirements: list[GroundedItem[str]] = Field(default_factory=list)


# ===== Extraction (Output of LLM) =====


class ExtractionResponse(CamelModel):
  # OpenAI formatted outputs do not accept ListingExtraction | None due to AnyOf limitations
  title: str | None
  company: str | None
  domain: str | None
  location: str | None
  description: str | None
  posted_date: ISODate | None
  skills: list[GroundedItem[str]] = Field(default_factory=list)
  requirements: list[GroundedItem[str]] = Field(default_factory=list)

  error: str | None


# ===== Listing Drafts (Output of Scraping/Extraction) =====


class BaseListingDraft(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  url: HttpUrl


class ListingDraftUnique(BaseListingDraft):
  status: Literal[DraftStatusEnum.UNIQUE] = DraftStatusEnum.UNIQUE
  listing: ListingExtraction
  html: str | None


class ListingDraftDuplicateUrl(BaseListingDraft):
  status: Literal[DraftStatusEnum.DUPLICATE_URL] = DraftStatusEnum.DUPLICATE_URL
  duplicate_of: Listing


class ListingDraftDuplicateContent(BaseListingDraft):
  status: Literal[DraftStatusEnum.DUPLICATE_CONTENT] = DraftStatusEnum.DUPLICATE_CONTENT
  listing: ListingExtraction
  duplicate_of: Listing
  html: str | None


class ListingDraftError(BaseListingDraft):
  status: Literal[DraftStatusEnum.ERROR] = DraftStatusEnum.ERROR
  error: str
  html: str | None


ListingDraft = Annotated[
  ListingDraftUnique | ListingDraftDuplicateUrl | ListingDraftDuplicateContent | ListingDraftError,
  Field(discriminator='status'),
]
