import httpx
from fastapi import Request
from pydantic import BaseModel

from app.clients.provider_client import ProviderClient, throttled
from app.utils.settings import settings


class SalaryData(BaseModel):
  industry_min: int
  industry_q1: int
  industry_median: int
  industry_q3: int
  industry_max: int
  currency: str = 'USD'


class SalaryClient(ProviderClient):
  provider_name = 'salary'
  bucket_capacity = 200
  refill_rate = 2.0

  def __init__(self, http_client: httpx.AsyncClient) -> None:
    super().__init__()
    self._http_client = http_client
    self._api_key = settings.providers.salary.api_key
    self._base_url = settings.providers.salary.base_url

  @throttled
  async def get_salary_range(self, role: str, company: str, location: str | None) -> SalaryData:
    # TODO: replace with real salary data provider endpoint
    params: dict[str, str] = {'apiKey': self._api_key, 'jobTitle': role, 'employer': company}
    if location:
      params['location'] = location

    response = await self._http_client.get(self._base_url, params=params)
    response.raise_for_status()
    data = response.json()
    return SalaryData.model_validate(data)


def get_salary_client(request: Request) -> SalaryClient:
  return request.app.state.salary_client
