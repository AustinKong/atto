from pydantic import Field

from app.schemas.types import CamelModel


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
  min: int
  q1: int
  median: int
  q3: int
  max: int
  currency: str = Field(default='USD', pattern=r'^[A-Z]{3}$')


class MarketContextResult(CamelModel):
  summary: str = Field(description='Concise market context summary for the role and company')


class ApplicantInsightsResult(CamelModel):
  insights: list[str]
