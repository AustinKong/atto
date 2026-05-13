from app.clients.cloud_api_client import CloudApiClient
from app.schemas.listing import (
  ApplicantInsightsResult,
  Listing,
  MarketContextResult,
  SalaryRangeResult,
  SentimentAnalysisResult,
)

from .base_client import ListingResearchClient


class CloudListingResearchClient(ListingResearchClient):
  def __init__(self, cloud_api_client: CloudApiClient) -> None:
    self.cloud_api_client = cloud_api_client

  async def get_sentiment_analysis(self, listing: Listing) -> SentimentAnalysisResult:
    result = await self.cloud_api_client.get(
      '/cloud/glassdoor-sentiment-analysis',
      params={'company': listing.company, 'role': listing.title},
    )
    return SentimentAnalysisResult.model_validate(result)

  async def get_salary_range(self, listing: Listing) -> SalaryRangeResult:
    result = await self.cloud_api_client.get(
      '/cloud/salary-range',
      params={'company': listing.company, 'role': listing.title, 'location': listing.location},
    )
    return SalaryRangeResult.model_validate(result)

  async def get_market_context(self, listing: Listing) -> MarketContextResult:
    result = await self.cloud_api_client.get(
      '/cloud/market-context',
      params={'company': listing.company, 'role': listing.title},
    )
    return MarketContextResult.model_validate(result)

  async def get_applicant_insights(
    self,
    listing: Listing,
    sentiment: SentimentAnalysisResult,
    salary: SalaryRangeResult,
    market: MarketContextResult,
  ) -> ApplicantInsightsResult:
    result = await self.cloud_api_client.post(
      '/cloud/applicant-insights',
      payload={
        'listing': listing.model_dump(mode='json', by_alias=True),
        'sentiment': sentiment.model_dump(mode='json', by_alias=True),
        'salary': salary.model_dump(mode='json', by_alias=True),
        'market': market.model_dump(mode='json', by_alias=True),
      },
    )
    return ApplicantInsightsResult.model_validate(result)
