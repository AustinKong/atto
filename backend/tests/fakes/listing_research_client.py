from app.clients.listing_research import ListingResearchClient
from app.schemas.listing import (
  ApplicantInsightsResult,
  Listing,
  MarketContextResult,
  SalaryRangeResult,
  SentimentAnalysisResult,
)


class FakeListingResearchClient(ListingResearchClient):
  async def get_sentiment_analysis(
    self,
    listing: Listing,
  ) -> SentimentAnalysisResult:
    raise AssertionError('Listing research should not run during this test.')

  async def get_salary_range(
    self,
    listing: Listing,
  ) -> SalaryRangeResult:
    raise AssertionError('Listing research should not run during this test.')

  async def get_market_context(
    self,
    listing: Listing,
  ) -> MarketContextResult:
    raise AssertionError('Listing research should not run during this test.')

  async def get_applicant_insights(
    self,
    listing: Listing,
    sentiment: SentimentAnalysisResult,
    salary: SalaryRangeResult,
    market: MarketContextResult,
  ) -> ApplicantInsightsResult:
    raise AssertionError('Listing research should not run during this test.')
