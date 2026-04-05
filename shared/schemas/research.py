from pydantic import Field

from .types import CamelModel


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
  sources: list[SentimentAnalysisSource] = Field(default_factory=list)


class SalaryRangeResult(CamelModel):
  industry_min: int
  industry_q1: int
  industry_median: int
  industry_q3: int
  industry_max: int
  currency: str = Field(default='USD', pattern=r'^[A-Z]{3}$')


class MarketContextResult(CamelModel):
  summary: str = Field(description='Concise market context summary for the role and company')
