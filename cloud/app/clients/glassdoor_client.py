import httpx
from pydantic import BaseModel

from app.clients.base_client import ProviderClient, throttled
from app.utils.settings import settings


class GlassdoorReviews(BaseModel):
  company: str
  overall_rating: float
  reviews: list[str]


class GlassdoorClient(ProviderClient):
  provider_name = 'glassdoor'
  bucket_capacity = 100
  refill_rate = 1.0  # 1 token/s → 3600/hour

  def __init__(self, http_client: httpx.AsyncClient) -> None:
    super().__init__()
    self._http_client = http_client
    self._api_key = settings.glassdoor_api_key

  @throttled
  async def get_company_reviews(self, company: str, role: str) -> GlassdoorReviews:
    # TODO: replace with real Glassdoor API endpoint
    response = await self._http_client.get(
      'https://api.glassdoor.com/api/api.htm',
      params={
        't.k': self._api_key,
        'action': 'employers',
        'q': company,
        'format': 'json',
      },
    )
    response.raise_for_status()
    data = response.json()
    return GlassdoorReviews(
      company=company,
      overall_rating=data.get('overallRating', 0.0),
      reviews=[r.get('pros', '') for r in data.get('reviews', [])],
    )
