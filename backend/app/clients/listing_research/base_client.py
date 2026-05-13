from abc import ABC, abstractmethod

from app.schemas.listing import (
  ApplicantInsightsResult,
  Listing,
  MarketContextResult,
  SalaryRangeResult,
  SentimentAnalysisResult,
)


class ListingResearchClient(ABC):
  @abstractmethod
  async def get_sentiment_analysis(
    self,
    listing: Listing,
  ) -> SentimentAnalysisResult:
    """Analyze the sentiment of the job listing and company."""
    pass

  @abstractmethod
  async def get_salary_range(
    self,
    listing: Listing,
  ) -> SalaryRangeResult:
    """Research and estimate the salary range for the given listing."""
    pass

  @abstractmethod
  async def get_market_context(
    self,
    listing: Listing,
  ) -> MarketContextResult:
    """Gather market context, industry trends, and demand for the role."""
    pass

  @abstractmethod
  async def get_applicant_insights(
    self,
    listing: Listing,
    sentiment: SentimentAnalysisResult,
    salary: SalaryRangeResult,
    market: MarketContextResult,
  ) -> ApplicantInsightsResult:
    """Combine listing data and gathered research to produce applicant insights."""
    pass
