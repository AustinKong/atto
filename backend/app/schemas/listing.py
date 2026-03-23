from typing import Annotated
from uuid import UUID, uuid4

from pydantic import BeforeValidator, Field, HttpUrl

from app.schemas.application import Application, StatusEnum
from app.schemas.dates import ISODate, ISODatetime
from app.schemas.types import CamelModel, parse_json_list_as, parse_json_model_as


class Keyword(CamelModel):
  word: str
  count: int


class Money(CamelModel):
  value: int
  currency: str = Field(default='USD', pattern=r'^[A-Z]{3}$')


# TODO: Might be useful as a general purpose schema for future calls that need to cite sources
class SentimentAnalysisSource(CamelModel):
  url: str
  title: str
  content: str = Field(description='Relevant quote or extract from the source')


class SentimentAnalysisResult(CamelModel):
  value: float = Field(
    ge=0.0,
    le=1.0,
    description='Score from 0.0 to 1.0 indicating overall sentiment positivity',
  )
  sources: list[SentimentAnalysisSource] = Field(
    default_factory=list, description='List of sources used for sentiment analysis'
  )


class SalaryRangeResult(CamelModel):
  industry_min: int
  industry_q1: int
  industry_median: int
  industry_q3: int
  industry_max: int
  currency: str = Field(default='USD', pattern=r'^[A-Z]{3}$')


class MarketContextResult(CamelModel):
  summary: str = Field(description='Concise market context summary for the role and company')


class ApplicantInsightsResult(CamelModel):
  insights: list[str]


class ListingResearch(CamelModel):
  sentiment: SentimentAnalysisResult
  salary: SalaryRangeResult
  market: MarketContextResult
  applicant_insights: ApplicantInsightsResult
  generated_at: ISODatetime


class ListingBase(CamelModel):
  title: str
  company: str
  domain: str
  location: str | None = None
  posted_date: ISODate | None = None
  salary: Annotated[
    Money | None,
    BeforeValidator(parse_json_model_as(Money)),
  ] = None
  keywords: Annotated[
    list[Keyword],
    BeforeValidator(parse_json_list_as(Keyword)),
    Field(default_factory=list),
  ]


class Listing(ListingBase):
  id: UUID = Field(default_factory=uuid4)
  url: HttpUrl
  description: str
  notes: str | None = None
  research: Annotated[
    ListingResearch | None,
    BeforeValidator(parse_json_model_as(ListingResearch)),
  ] = None

  skills: Annotated[
    list[str],
    BeforeValidator(parse_json_list_as(str)),
    Field(default_factory=list),
  ]

  requirements: Annotated[
    list[str],
    BeforeValidator(parse_json_list_as(str)),
    Field(default_factory=list),
  ]

  applications: list[Application] = Field(default_factory=list)


class ListingSummary(ListingBase):
  id: UUID
  url: HttpUrl
  current_status: StatusEnum | None = None
  last_status_at: str | None = None
