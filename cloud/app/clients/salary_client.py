from typing import Annotated

import httpx
from fastapi import Depends
from pydantic import BaseModel

from app.clients.base_client import ProviderClient
from app.dependencies import get_http_client
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

  def __init__(self, http: Annotated[httpx.AsyncClient, Depends(get_http_client)]) -> None:
    self._api_key = settings.salary_api_key
    self._http = http

  async def get_salary_range(self, role: str, company: str, location: str | None) -> SalaryData:
    # TODO: replace with real salary data provider endpoint
    params: dict[str, str] = {'apiKey': self._api_key, 'jobTitle': role, 'employer': company}
    if location:
      params['location'] = location

    response = await self._http.get('https://api.salaryapi.com/v1/salary', params=params)
    response.raise_for_status()
    data = response.json()
    return SalaryData.model_validate(data)
