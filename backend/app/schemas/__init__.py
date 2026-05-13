from shared.schemas.dates import ISODate, ISODatetime, ISOYearMonth

from .application import (
  Application,
  ApplicationAnalysis,
  StatusEnum,
  StatusEvent,
  StatusEventSaved,
)
from .experience import (
  Experience,
  ExperienceType,
  LLMResponseExperience,
)
from .listing import Listing, ListingBase, ListingSummary
from .listing_draft import (
  DraftStatusEnum,
  GroundedItem,
  ListingDraft,
  ListingDraftDuplicateContent,
  ListingDraftDuplicateUrl,
  ListingDraftError,
  ListingDraftUnique,
  ListingExtraction,
)
from .profile import Profile
from .resume import (
  DEFAULT_RESUME_ID,
  DateRangeUnit,
  DetailedItem,
  DetailedSection,
  ParagraphSection,
  Resume,
  Section,
  SectionTypeEnum,
  SimpleSection,
  TextUnit,
)
from .scraping import DeepCrawlResult
from .template import (
  DEFAULT_TEMPLATE_ID,
  Template,
  TemplateRenderRect,
  TemplateRenderResponse,
  TemplateSummary,
)
from .types import CamelModel, Page

# TODO: Remove this init. It's more effort than it's worth to maintain,
# and doesn't provide much value. Import models directly from modules.

__all__ = [
  # Base types
  'CamelModel',
  # Dates
  'ISODate',
  'ISODatetime',
  'ISOYearMonth',
  # Experience
  'Experience',
  'ExperienceType',
  'LLMResponseExperience',
  # Listing
  'DeepCrawlResult',
  'DraftStatusEnum',
  'GroundedItem',
  'Listing',
  'ListingBase',
  'ListingDraft',
  'ListingDraftDuplicateContent',
  'ListingDraftDuplicateUrl',
  'ListingDraftError',
  'ListingDraftUnique',
  'ListingExtraction',
  'ListingSummary',
  # Resume
  'DEFAULT_RESUME_ID',
  'DateRangeUnit',
  'DetailedItem',
  'DetailedSection',
  'ParagraphSection',
  'Profile',
  'Resume',
  'Section',
  'SectionTypeEnum',
  'SimpleSection',
  'TextUnit',
  # Application
  'Application',
  'ApplicationAnalysis',
  # StatusEvent
  'StatusEnum',
  'StatusEvent',
  'StatusEventSaved',
  # Templates
  'DEFAULT_TEMPLATE_ID',
  'Template',
  'TemplateRenderRect',
  'TemplateRenderResponse',
  'TemplateSummary',
  # Pagination
  'Page',
]
